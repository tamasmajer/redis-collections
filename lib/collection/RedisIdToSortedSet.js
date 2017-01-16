'use strict'

const Collection = require('./../Collection')


class RedisIdToSortedSet extends Collection {

    constructor(context) {
        super(context, 1)
    }

    size(id) {
        return ['redis', 'zcard', this.toKey(id)]
    }

    put(id, score, value) {
        return ['redis', 'zadd', this.toKey(id), score, value]
    }

    remove(id, value) {
        return ['redis', 'zrem', this.toKey(id), value]
    }

    clear(id) {
        return ['redis', 'del', this.toKey(id)]
    }

    getTopOne(id) {
        return ['redis', 'zrevrange', this.toKey(id), 0, 0]
    }

    getTop(id, size) {
        return ['redis', 'zrevrange', this.toKey(id), 0, size - 1]
    }

    getBottom(id, size) {
        return ['redis', 'zrange', this.toKey(id), 0, size - 1]
    }

    getList(id) {
        return ['redis', 'zrangebyscore', this.toKey(id), '-inf', '+inf']
    }


}
module.exports = RedisIdToSortedSet