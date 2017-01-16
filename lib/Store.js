const debug = require('debug')('redis-collections')

class Store {

    constructor(redisClient) {
        this.redisClient = redisClient;
        this.isIterableCommand = {'sscan': 1, 'zscan': 1};
    }

    injectInto(object) {
        const store = this
        object.promise = function (commands) {
            return store.promise(commands)
        }
    }

    promise(command) {
        if (command == null) throw new Error("Missing command")
        if (arguments.length > 1) throw new Error("Use array or object for multiple commands")
        if(this._isCommand(command)) {
            if(this._getCommand(command)==='iterate') return this._promiseIteration(command)
            else return this._promiseList([command.splice(1)]).then(list => list[0])
        }
        else if(typeof command !== 'object') return Promise.resolve(command)
        else return this._promiseStructure(command)
    }

    _isCommand(object) {
        return Array.isArray(object) && object.length && object[0] === 'redis'
    }
    _getCommand(object) {
        return object[1]
    }

    _promiseList(commands) {
        debug("promise: ", commands)
        const redisClient = this.redisClient
        return new Promise(function (resolve, reject) {
            redisClient.multi(commands).exec(function (err, data) {
                if (err) {
                    console.error("exception at running " + JSON.stringify(commands, null, 2), err)
                    return reject(err)
                }
                else return resolve(data)
            })
        })
    }


    _promiseStructure(structure) {
        if (structure == null) throw new Error("Missing command")
        if (arguments.length > 1) throw new Error("Expect a single command or command structure")

        const commandsWithPath = []
        this._findCommands(commandsWithPath, [], structure)
        const cloneStructure=this._cloneStructure(structure)
        if(commandsWithPath.length==0) return Promise.resolve(cloneStructure)
        const commandList = commandsWithPath.map(c => c[c.length - 1].slice(1))
        return this._promiseList(commandList).then((results) => {
            for(let i=0,listLen=commandsWithPath.length;i<listLen;i++) {
                let location=cloneStructure
                const path=commandsWithPath[i]
                for(let p=0,pathLen=path.length-2;p<pathLen;p++) location=location[path[p]]
                location[path[path.length-2]]=results[i]
            }
            return cloneStructure
        })
    }

    _findCommands(commands, path, structure) {
        if(this._isCommand(commands)) throw new Error("Not a structure.")
        else if (Array.isArray(structure)) {
            for (let k = 0; k < structure.length; k++) {
                const value = structure[k]
                if (this._isCommand(value)) {
                    if(this._getCommand(value)=='iterate') throw new Error("Cannot iterate in a structure.")
                    commands.push(path.concat([k, value]))
                }
                else this._findCommands(commands, path.concat(k), value)
            }
        }
        else if (typeof structure === 'object') {
            for (const k in structure) {
                const value = structure[k]
                if (this._isCommand(value)) {
                    if(this._getCommand(value)=='iterate') throw new Error("Cannot iterate in a structure.")
                    commands.push(path.concat([k, value]))
                }
                else this._findCommands(commands, path.concat(k), value)
            }
        }
    }

    _cloneStructure(structure) {
        if (this._isCommand(structure)) return null
        else if (Array.isArray(structure)) {
            const clone = []
            for (let k = 0, len = structure.length; k < len; k++)
                clone.push(this._cloneStructure(structure[k]))
            return clone
        }
        else if (typeof structure === 'object') {
            const clone = {}
            for (const k in structure) clone[k] = this._cloneStructure(structure[k])
            return clone
        }
        else return structure
    }


    _promiseIteration(command) {
        command=command.slice(2)
        if (command.length < 2 || !this.isIterableCommand[command[0].toLowerCase()])
            return Promise.reject(new Error("Not itererable command: " + command));
        const scanType = command[0];
        const key = command[1];
        const value = command[command.length - 1];
        const count = command[command.length - 2];
        const isCount = count.toLowerCase && (count.toLowerCase() === 'count') && !isNaN(value);
        const countValue = isCount ? +value : undefined;
        const client = this.redisClient
        const scanMethod = client[scanType]
        const args = [key, '0'].concat(countValue ? ['COUNT', countValue] : [])
        let results = []
        return new Promise(function (resolve, reject) {
            const repeat = function (fromCursor) {
                args[1] = fromCursor
                scanMethod.call(client, args, function (err, res) {
                    if (err) return reject(err)
                    const nextCursor = res[0]
                    const values = res[1]
                    if (values.length > 0) {
                        results = results.concat(values)
                    }
                    const done = nextCursor === '0'
                    if (done) {
                        const duplicated = {}
                        for (let i = 0; i < results.length; i++) {
                            const value = results[i]
                            if (!duplicated[value]) duplicated[value] = 1
                            else results.splice(i--, 1)
                        }
                        return resolve(results)
                    }
                    return repeat(nextCursor)
                })
            }
            repeat('0')
        })
    }

}

module.exports = Store