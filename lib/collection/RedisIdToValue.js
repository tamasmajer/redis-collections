const Collection = require('../Collection')

class RedisIdToValue extends Collection {

    constructor(context) {
        super(context, 1)
    }

    get(id) {
        return ['redis', 'get', this.toKey(id)]
    }

    set(id, value) {
        return ['redis', 'set', this.toKey(id), value]
    }

    inc(id) {
        return ['redis', 'incr', this.toKey(id)]
    }

    remove(id) {
        return ['redis', 'del', this.toKey(id)]
    }

    exists(id) {
        return ['redis', 'exists', this.toKey(id)]
    }

    setTtl(id, seconds) {
        return ['redis', 'expire', this.toKey(id), seconds]
    }

    getTtl(id) {
        return ['redis', 'ttl', this.toKey(id)]
    }

    findKeys() {
        return ['redis', 'keys' , this.toKey('*')]
    }
}
module.exports = RedisIdToValue