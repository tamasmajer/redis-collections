'use strict'

const Collection=require('../Collection')
const RedisSortedSet=require('../RedisSortedSet')


class MockSortedSet extends RedisSortedSet {

    constructor(context) {
        super(context)
        if(!this.context.data) this.context.data={}
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
        let arr = data[this.toKey()]
        if (!arr) arr = data[this.toKey()] = []
        arr.push([value, score])
        this._sort()
    }

    remove(value) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const ix = arr.indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear() {
        const {data}=this.context
        data[this.toKey()] = []
    }

    getTopOne() {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        return [arr[0]]
    }

    getTop(count) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice(0, count).forEach(e => singles.push(e[0]))
        return singles
    }

    getBottom(count) {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.slice(-count).forEach(e => singles.push(e[0]))
        return singles
    }

    getList() {
        const {data}=this.context
        const arr = data[this.toKey()] || []
        const singles = []
        arr.forEach(e => singles.push(e[0]))
        return singles
    }

}
module.exports = MockSortedSet