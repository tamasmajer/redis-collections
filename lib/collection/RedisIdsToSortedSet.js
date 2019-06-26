const Collection = require('../Collection')

class RedisIdsToSortedSet extends Collection {

    constructor(context) {
        super(context)
    }

    exists(ids) {
        return ['redis', 'exists', this.toKey(...ids)]
    }

    size(ids) {
        return ['redis', 'zcard', this.toKey(...ids)]
    }

    put(ids, score, value) {
        return ['redis', 'zadd', this.toKey(...ids), score, value]
    }

    inc(ids, score, value) {
        return ['redis', 'zincrby', this.toKey(...ids), score, value]
    }

    remove(ids, value) {
        return ['redis', 'zrem', this.toKey(...ids), value]
    }

    clear(ids) {
        return ['redis', 'del', this.toKey(...ids)]
    }

    getRank(ids, value) {
        return ['redis', 'zrank', this.toKey(...ids), value]
    }

    getScore(ids, value) {
        return ['redis', 'zscore', this.toKey(...ids), value]
    }

    getRange(ids, from, count, withScores = false) {
        const cmd = ['redis', 'zrange', this.toKey(...ids), from, from + count - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getTopOne(ids, withScores = false) {
        const cmd = ['redis', 'zrevrange', this.toKey(...ids), 0, 0]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getTop(ids, size, withScores = false) {
        const cmd = ['redis', 'zrevrange', this.toKey(...ids), 0, size - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getBottom(ids, size, withScores = false) {
        const cmd = ['redis', 'zrange', this.toKey(...ids), 0, size - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getList(ids, withScores = false, minScore = '-inf', maxScore = '+inf') {
        const cmd = ['redis', 'zrangebyscore', this.toKey(...ids), minScore, maxScore]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    removeBelow(ids, score) {
        return ['redis', 'zremrangebyscore', this.toKey(...ids), '-inf', score]
    }

    removeBottom(ids, newSize) {
        return ['redis', 'zremrangebyrank', this.toKey(...ids), 0, -(newSize + 1)]
    }

    findKeys(...ids) {
        const idCount = this.idCount()
        const query = ids.slice()
        while (query.length < idCount) query.push("*")
        return ['redis', 'keys', this.toKey(...query)]
    }

}

module.exports = RedisIdsToSortedSet