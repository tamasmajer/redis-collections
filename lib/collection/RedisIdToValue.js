'use strict'

const Collection = require('./../Collection')


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

    remove(id) {
        return ['redis', 'del', this.toKey(id)]
    }

    exists(id) {
        return ['redis', 'exists', this.toKey(id)]
    }

    expire(id, seconds) {
        return ['redis', 'expire', this.toKey(id), seconds]
    }
}
module.exports = RedisIdToValue