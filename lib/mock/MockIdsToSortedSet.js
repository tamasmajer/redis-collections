const Collection = require('../Collection')
const RedisIdsToSortedSet = require('../collection/RedisIdsToSortedSet')

class MockIdPairToSortedSet extends RedisIdsToSortedSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    _sort(ids) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        arr.sort((a, b) => (b[1] - a[1]))
    }

    exists(ids) {
        const {data} = this.context
        const key = this.toKey(...ids)
        return data[key] || null
    }

    size(ids) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        return arr.length
    }

    put(ids, score, value) {
        const {data} = this.context
        const key = this.toKey(...ids)
        let arr = data[key] || []
        arr = data[key] = arr.filter(([v, s]) => v !== value)
        arr.unshift([value, score])
        this._sort(ids)
    }

    inc(ids, score, value) {
        const {data} = this.context
        const key = this.toKey(...ids)
        let arr = data[key]
        if (!arr) arr = data[key] = []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr[ix][1] += score
        else arr.push([value, score])
        this._sort(ids)
    }

    remove(ids, value) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear(ids) {
        const {data} = this.context
        const key = this.toKey(...ids)
        delete data[key]
    }

    getRank(ids, value) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        return ix < 0 ? null : arr.length - 1 - ix
    }

    getScore(ids, value) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        return ix < 0 ? null : arr[ix][1]
    }

    getRange(ids, from, count, withScores = false) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const singles = []
        arr.slice().reverse().slice(from, from + count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getTopOne(ids, withScores = false) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        return arr.length == 0 ? [] : withScores ? [arr[0][0], '' + arr[0][1]] : [arr[0][0]]
    }

    getTop(ids, count, withScores = false) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const singles = []
        arr.slice(0, count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getBottom(ids, count, withScores = false) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const singles = []
        arr.slice(-count).reverse().forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    getList(ids, withScores = false, minScore = '-inf', maxScore = '+inf') {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        const singles = []
        arr.slice().reverse()
            .filter(e => (minScore === '-inf' || parseFloat(e[1]) >= minScore)
                && (maxScore === '+inf' || parseFloat(e[1]) <= maxScore))
            .forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    removeBelow(ids, score) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        data[key] = arr.filter(e => e[1] > score)
    }

    removeBottom(ids, newSize) {
        const {data} = this.context
        const key = this.toKey(...ids)
        const arr = data[key] || []
        data[key] = arr.slice(0, newSize)
    }

    findKeys(...ids) {
        const {data} = this.context
        const idQuery = ids.slice()
        const idCount = this.idCount()
        while (idQuery.length < idCount) idQuery.push("(.*)")
        const template = '^' + this.toKey(...idQuery) + '$'
        const keys = Object.keys(data || {})
        return keys.filter(k => k.match(template))
    }

}

module.exports = MockIdPairToSortedSet