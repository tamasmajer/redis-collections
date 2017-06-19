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

    inc(score, value) {
        return ['redis', 'zincrby', this.toKey(), score, value]
    }

    remove(value) {
        return ['redis', 'zrem', this.toKey(), value]
    }

    clear() {
        return ['redis', 'del', this.toKey()]
    }

    getRank(value) {
        return ['redis', 'zrank', this.toKey(), value]
    }

    getRange(from, count, withScores) {
        const cmd = ['redis', 'zrange', this.toKey(), from, from + count - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getTopOne(withScores) {
        const cmd = ['redis', 'zrevrange', this.toKey(), 0, 0]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getTop(size, withScores) {
        const cmd = ['redis', 'zrevrange', this.toKey(), 0, size - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getBottom(size, withScores) {
        const cmd = ['redis', 'zrange', this.toKey(), 0, size - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getList(withScores) {
        const cmd = ['redis', 'zrangebyscore', this.toKey(), '-inf', '+inf']
        if (withScores) cmd.push('withscores')
        return cmd
    }

    removeBelow(score) {
        return ['redis', 'zremrangebyscore', this.toKey(), '-inf', score]
    }

    removeBottom(newSize) {
        return ['redis', 'zremrangebyrank', this.toKey(), 0, -(newSize + 1)]
    }


}
module.exports = RedisSortedSet