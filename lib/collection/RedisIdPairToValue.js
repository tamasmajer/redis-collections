const Collection = require('../Collection')

class RedisIdPairToValue extends Collection {

    constructor(context) {
        super(context, 2)
    }

    get(id1,id2) {
        return ['redis', 'get', this.toKey(id1,id2)]
    }

    set(id1,id2, value) {
        return ['redis', 'set', this.toKey(id1,id2), value]
    }

    inc(id1,id2) {
        return ['redis', 'incr', this.toKey(id1,id2)]
    }

    remove(id1,id2) {
        return ['redis', 'del', this.toKey(id1,id2)]
    }

    exists(id1,id2) {
        return ['redis', 'exists', this.toKey(id1,id2)]
    }

    setTtl(id1,id2, seconds) {
        return ['redis', 'expire', this.toKey(id1,id2), seconds]
    }

    getTtl(id1,id2) {
        return ['redis', 'ttl', this.toKey(id1,id2)]
    }
}
module.exports = RedisIdPairToValue