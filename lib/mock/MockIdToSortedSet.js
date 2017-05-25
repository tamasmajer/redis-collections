'use strict'

const Collection = require('../Collection')
const RedisIdToSortedSet = require('../collection/RedisIdToSortedSet')


class MockIdToSortedSet extends RedisIdToSortedSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    _sort(id) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        arr.sort((a, b) => (b[1] - a[1]))
    }

    size(id) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        return arr.length
    }

    put(id, score, value) {
        const {data}=this.context
        let arr = data[this.toKey(id)] || []
        arr = data[this.toKey(id)] = arr.filter(([v, s]) => v !== value)
        arr.push([value, score])
        this._sort(id)
    }

    inc(id, score, value) {
        const {data}=this.context
        let arr = data[this.toKey(id)]
        if (!arr) arr = data[this.toKey(id)] = []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr[ix][1] += score
        else arr.push([value, score])
        this._sort(id)
    }

    remove(id, value) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const ix = arr.map(e => e[0]).indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear(id) {
        const {data}=this.context
        delete data[this.toKey(id)]
    }

    getTopOne(id,withScores) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        return arr.length == 0 ? [] : withScores?[arr[0][0],''+arr[0][1]]:[arr[0][0]]
    }

    getTop(id, count,withScores) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.slice(0, count).forEach(e => withScores?singles.push(e[0],''+e[1]):singles.push(e[0]))
        return singles
    }

    getBottom(id, count,withScores) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.slice(-count).reverse().forEach(e => withScores?singles.push(e[0],''+e[1]):singles.push(e[0]))
        return singles//.reverse()
    }

    getList(id,withScores) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.slice().reverse().forEach(e => withScores?singles.push(e[0],''+e[1]):singles.push(e[0]))
        return singles//.reverse()
    }

    removeBelow(id, score) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        data[this.toKey(id)] = arr.filter(e => e[1] > score)
    }

    removeBottom(id, newSize) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        data[this.toKey(id)] = arr.slice(0,newSize)
    }

}
module.exports = MockIdToSortedSet