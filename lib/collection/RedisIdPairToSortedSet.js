const Collection = require('../Collection')

class RedisIdPairToSortedSet extends Collection {

    constructor(context) {
        super(context, 2)
    }

    exists(id1, id2) {
        return ['redis', 'exists', this.toKey(id1, id2)]
    }

    size(id1, id2) {
        return ['redis', 'zcard', this.toKey(id1, id2)]
    }

    put(id1, id2, score, value) {
        return ['redis', 'zadd', this.toKey(id1, id2), score, value]
    }

    inc(id1, id2, score, value) {
        return ['redis', 'zincrby', this.toKey(id1, id2), score, value]
    }

    remove(id1, id2, value) {
        return ['redis', 'zrem', this.toKey(id1, id2), value]
    }

    clear(id1, id2) {
        return ['redis', 'del', this.toKey(id1, id2)]
    }

    getRank(id1, id2, value) {
        return ['redis', 'zrank', this.toKey(id1, id2), value]
    }

    getScore(id1, id2, value) {
        return ['redis', 'zscore', this.toKey(id1, id2), value]
    }

    getRange(id1, id2, from, count, withScores) {
        const cmd = ['redis', 'zrange', this.toKey(id1, id2), from, from + count - 1]
        if (withScores) cmd.push('withscores')
        return cmd
    }

    getTopOne(id1, id2, withScores) {
        const cmd=['redis', 'zrevrange', this.toKey(id1, id2), 0, 0]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getTop(id1, id2, size, withScores) {
        const cmd=['redis', 'zrevrange', this.toKey(id1, id2), 0, size - 1]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getBottom(id1, id2, size, withScores) {
        const cmd=['redis', 'zrange', this.toKey(id1, id2), 0, size - 1]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    getList(id1, id2, withScores, minScore='-inf', maxScore='+inf') {
        const cmd=['redis', 'zrangebyscore', this.toKey(id1, id2), minScore, maxScore]
        if(withScores) cmd.push('withscores')
        return cmd
    }

    removeBelow(id1, id2, score) {
        return ['redis', 'zremrangebyscore', this.toKey(id1, id2), '-inf', score]
    }

    removeBottom(id1, id2, newSize) {
        return ['redis', 'zremrangebyrank', this.toKey(id1, id2), 0, -(newSize+1)]
    }

    findKeys(id1) {
        return ['redis', 'keys', this.toKey(id1 || '*', '*')]
    }

}
module.exports = RedisIdPairToSortedSet