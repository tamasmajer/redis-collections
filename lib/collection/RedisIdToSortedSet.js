'use strict'

const Collection = require('../Collection')


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

    inc(id, score, value) {
        return ['redis', 'zincrby', this.toKey(id), score, value]
    }

    remove(id, value) {
        return ['redis', 'zrem', this.toKey(id), value]
    }

    clear(id) {
        return ['redis', 'del', this.toKey(id)]
    }

    getTopOne(id, withScores) {
        const cmd=['redis', 'zrevrange', this.toKey(id), 0, 0]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getTop(id, size, withScores) {
        const cmd=['redis', 'zrevrange', this.toKey(id), 0, size - 1]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getBottom(id, size, withScores) {
        const cmd=['redis', 'zrange', this.toKey(id), 0, size - 1]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getList(id, withScores) {
        const cmd=['redis', 'zrangebyscore', this.toKey(id), '-inf', '+inf']
        if(withScores) cmd.push('withscores')
        return cmd
    }

    removeBelow(id, score) {
        return ['redis', 'zremrangebyscore', this.toKey(id), '-inf', score]
    }

    removeBottom(id, newSize) {
        return ['redis', 'zremrangebyrank', this.toKey(id), 0, -(newSize+1)]
    }

}
module.exports = RedisIdToSortedSet