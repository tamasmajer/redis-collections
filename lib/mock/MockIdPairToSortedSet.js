const Collection = require('../Collection')
const RedisIdPairToSortedSet = require('../collection/RedisIdPairToSortedSet')

class MockIdPairToSortedSet extends RedisIdPairToSortedSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    _sort(id1, id2) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        arr.sort((a, b) => (b[1] - a[1]))
    }

    exists(id1, id2) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        return data[key] || null
    }

    size(id1, id2) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        return arr.length
    }

    put(id1, id2, score, value) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        let arr = data[key] || []
        arr = data[key] = arr.filter(([v, s]) => v !== value)
        arr.unshift([value, score])
        this._sort(id1, id2)
    }

    inc(id1, id2, score, value) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        let arr = data[key]
        if (!arr) arr = data[key] = []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr[ix][1] += score
        else arr.push([value, score])
        this._sort(id1, id2)
    }

    remove(id1, id2, value) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear(id1, id2) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        delete data[key]
    }

    getRank(id1, id2, value) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        return ix < 0 ? null : arr.length - 1 - ix
    }

    getScore(id1, id2, value) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        return ix < 0 ? null : arr[ix][1]
    }

    getRange(id1, id2, from, count, withScores) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const singles = []
        arr.slice().reverse().slice(from, from + count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getTopOne(id1, id2, withScores) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        return arr.length == 0 ? [] : withScores ? [arr[0][0], '' + arr[0][1]] : [arr[0][0]]
    }

    getTop(id1, id2, count, withScores) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const singles = []
        arr.slice(0, count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getBottom(id1, id2, count, withScores) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const singles = []
        arr.slice(-count).reverse().forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    getList(id1, id2, withScores, minScore = '-inf', maxScore = '+inf') {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        const singles = []
        arr.slice().reverse()
            .filter(e => (minScore === '-inf' || parseFloat(e[1]) >= minScore)
                && (maxScore === '+inf' || parseFloat(e[1]) <= maxScore))
            .forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    removeBelow(id1, id2, score) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        data[key] = arr.filter(e => e[1] > score)
    }

    removeBottom(id1, id2, newSize) {
        const {data} = this.context
        const key = this.toKey(id1, id2)
        const arr = data[key] || []
        data[key] = arr.slice(0, newSize)
    }

    findKeys(id1) {
        const {data} = this.context
        const template = '^' + this.toKey(id1 || '(.*)', '(.*)') + '$'
        const keys = Object.keys(data || {})
        return keys.filter(k => k.match(template))
    }

}

module.exports = MockIdPairToSortedSet