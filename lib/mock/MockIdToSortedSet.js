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
        let arr = data[this.toKey(id)]
        if (!arr) arr = data[this.toKey(id)] = []
        arr.push([value, score])
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

    getTopOne(id) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        return [arr[0]]
    }

    getTop(id, count) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.slice(0, count).forEach(e => singles.push(e[0]))
        return singles
    }

    getBottom(id, count) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.slice(-count).forEach(e => singles.push(e[0]))
        return singles
    }

    getList(id) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        const singles = []
        arr.forEach(e => singles.push(e[0]))
        return singles
    }

    removeBelow(id, score) {
        const {data}=this.context
        const arr = data[this.toKey(id)] || []
        data[this.toKey(id)] = arr.filter(e => e[1] > score)
    }

}
module.exports = MockIdToSortedSet