'use strict'

const debug = require('debug')('redis-collections')

class Collection {

    debug(...args) {
        debug(args)
    }

    constructor(context, idCount) {
        if (typeof context === 'string' || context instanceof String)
            context = {key: context}
        if (!context || !context.key)
            throw new Error("Need a redis key spec to create a collection")
        const splittedKeySpec = Collection._splitKeySpec(context.key)
        const idCountInKeySpec = (splittedKeySpec.length - 1) / 2
        if (idCountInKeySpec !== idCount)
            throw new Error("Need " + idCount + " IDs in the key spec, found " + idCountInKeySpec + ".")
        context.splittedKeySpec = splittedKeySpec
        this.context = context
    }

    static _splitKeySpec(keySpec) {
        const splittedKeySpec = []
        const FIND_IDS = /\$\{([^\}]*)\}/g
        let match, keySpecIndex = 0
        while (match = FIND_IDS.exec(keySpec)) {
            const partIndex = match.index
            const part = match[0]
            splittedKeySpec.push(keySpec.substring(keySpecIndex, partIndex))
            splittedKeySpec.push(part)
            keySpecIndex = partIndex + part.length
        }
        splittedKeySpec.push(keySpec.substring(keySpecIndex))
        return splittedKeySpec
    }

    toKey(...idsToInsert) {
        let {splittedKeySpec}=this.context
        const expectedIdCount = ((splittedKeySpec.length - 1) / 2)
        if (idsToInsert.length !== expectedIdCount) {
            throw new Error("Wrong number of IDs: " + idsToInsert.length + " instead of " + expectedIdCount + ".")
        }
        const keyWithIds = []
        for (let i = 0; i < splittedKeySpec.length; i++) {
            const replaceWithId = i % 2 === 1
            if (replaceWithId) {
                const idToInsert = idsToInsert[(i - 1) / 2]
                keyWithIds.push(idToInsert)
            }
            else {
                keyWithIds.push(splittedKeySpec[i])
            }
        }
        return keyWithIds.join("")
    }

    toIds(key) {
        const {splittedKeySpec}=this.context
        const ids = []
        let posOfVar = -1
        for (let i = 0; i < splittedKeySpec.length; i += 2) {
            const fixPart = splittedKeySpec[i]
            const posOfFixPart = i < splittedKeySpec.length - 1 ? key.indexOf(fixPart, posOfVar) : key.lastIndexOf(fixPart)
            if (posOfVar >= 0) {
                const varPart = key.substring(posOfVar, posOfFixPart)
                ids.push(varPart)
            }
            posOfVar = posOfFixPart + fixPart.length
        }
        return ids;
    }

    toId(key) {
        const ids = this.toIds(key)
        return ids[0]
    }

    static _throwFromUnimplementedParentMethods(mockObject) {
        const childClass = mockObject.constructor.prototype
        const parentClass = Object.getPrototypeOf(mockObject.constructor).prototype
        const parentMethods = Object.getOwnPropertyNames(parentClass)
        parentMethods
            .filter(f => f !== 'constructor' && !childClass.hasOwnProperty(f))
            .filter(f => {
                const isGetter = Object.getOwnPropertyDescriptor(parentClass, f)['get']
                return !isGetter
            })
            .forEach(f => {
                mockObject[f] = () => {
                    throw new Error('Function not mocked: ' + f)
                }
            })
    }

}

module.exports = Collection


