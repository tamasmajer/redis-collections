'use strict'

const Collection = require('../Collection')


class RedisSortedSet extends Collection {

    constructor(context) {
        super(context, 0)
    }

    size() {
        return ['redis', 'zcard', this.toKey()]
    }

    put(score, value) {
        return ['redis', 'zadd', this.toKey(), score, value]
    }

    inc(score,value) {
        return ['redis', 'zincrby', this.toKey(), score, value]
    }

    remove(value) {
        return ['redis', 'zrem', this.toKey(), value]
    }

    clear() {
        return ['redis', 'del', this.toKey()]
    }

    getTopOne() {
        return ['redis', 'zrevrange', this.toKey(), 0, 0]
    }

    getTop(size) {
        return ['redis', 'zrevrange', this.toKey(), 0, size - 1]
    }

    getBottom(size) {
        return ['redis', 'zrange', this.toKey(), 0, size - 1]
    }

    getList() {
        return ['redis', 'zrangebyscore', this.toKey(), '-inf', '+inf']
    }

    removeBelow(score) {
        return ['redis', 'zremrangebyscore', this.toKey(), '-inf', score]
    }

    removeBottom(newSize) {
        return ['redis', 'zremrangebyrank', this.toKey(), 0, -(newSize+1)]
    }



}
module.exports = RedisSortedSet