'use strict'

const Collection = require('../Collection')
const RedisSortedSet = require('../collection/RedisSortedSet')


class MockSortedSet extends RedisSortedSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    _sort() {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        arr.sort((a, b) => (b[1] - a[1]))
    }

    size() {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        return arr.length
    }

    put(score, value) {
        const {data}=this.context
        let arr = data[this.toKey()] || []
        arr = data[this.toKey()] = arr.filter(([v, s]) => v !== value)
        arr.unshift([value, score])
        this._sort()
    }

    inc(score, value) {
        const {data}=this.context
        let arr = data[this.toKey()]
        if (!arr) arr = data[this.toKey()] = []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr[ix][1] += score
        else arr.push([value, score])
        this._sort()
    }

    remove(value) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear() {
        const {data}=this.context
        data[this.toKey()] = []
    }

    getRank(value) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        return arr.length - 1 - ix
    }

    getRange(from, count, withScores) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice().reverse().slice(from, from + count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getTopOne(withScores) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        return arr.length == 0 ? [] : withScores ? [arr[0][0], '' + arr[0][1]] : [arr[0][0]]
    }

    getTop(count, withScores) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice(0, count).forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles
    }

    getBottom(count, withScores) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice(-count).reverse().forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    getList(withScores) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice().reverse().forEach(e => withScores ? singles.push(e[0], '' + e[1]) : singles.push(e[0]))
        return singles//.reverse()
    }

    removeBelow(score) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        data[this.toKey()] = arr.filter(e => e[1] > score)
    }

    removeBottom(newSize) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        data[this.toKey()] = arr.slice(0, newSize)
    }

}
module.exports = MockSortedSet