const Collection = require('../Collection')
const RedisList = require('../collection/RedisList')

class MockList extends RedisList {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists() {
        const {data} = this.context
        return Object.keys(data[this.toKey()] || {}).length > 0
    }

    getList() {
        const {data} = this.context
        return data[this.toKey()] || []
    }

    setList(list) {
        const {data} = this.context
        if (!list || list.length === 0) delete data[this.toKey()]
        else data[this.toKey()] = list
    }

    getLength() {
        const list = this.getList()
        return list.length
    }

    getAll(from = 0, to = -1) {
        const list = this.getList()
        if (from < 0) from = list.length + from
        if (to < 0) to = list.length + to
        return list.slice(from, to + 1)
    }

    getLeft(to = -1) {
        return this.getAll(0, to)
    }

    getRight(from = 0) {
        return this.getAll(from, -1)
    }

    get(ix) {
        const list = this.getList()
        if (ix < 0) ix = list.length + ix
        const value = list[ix]
        return value === undefined ? null : value
    }

    set(ix, value) {
        const list = this.getList()
        if (ix < 0) ix = list.length + ix
        if (ix >= 0 && ix < list.length) list[ix] = "" + value
    }

    popLeft() {
        const list = this.getList()
        const value = list.shift()
        return value === undefined ? null : value
    }

    pushLeft(...values) {
        const list = this.getList()
        list.unshift(...values.reverse())
        this.setList(list)
    }

    popRight() {
        const list = this.getList()
        const value = list.pop()
        return value === undefined ? null : value
    }

    pushRight(...values) {
        const list = this.getList()
        list.push(...values)
        this.setList(list)
    }

    keep(from = 0, to = -1) {
        const list = this.getList()
        if (from < 0) from = list.length + from
        if (to < 0) to = list.length + to
        if (from > to) list.splice(0, list.length)
        list.splice(to + 1)
        list.splice(0, from)
        this.setList(list)
    }

    trimLeft(from = 0) {
        return this.keep(from, -1)
    }

    trimRight(to = 0) {
        return this.keep(0, -to - 1)
    }

    removeAll(value) {
        const list = this.getList()
        const list2 = list.filter(e => e != value)
        this.setList(list2)
    }

    removeFirst(value, count = 1) {
        const list = this.getList()
        const list2 = []
        let found = 0
        list.forEach(e => {
            const equals = (e == value)
            if (equals) found++
            if (!equals || found > count) list2.push(e)
        })
        this.setList(list2)
    }

    removeLast(value, count = 1) {
        const list = this.getList()
        const list2 = []
        let found = 0
        list.reverse().forEach(e => {
            const equals = (e == value)
            if (equals) found++
            if (!equals || found > count) list2.unshift(e)
        })
        this.setList(list2)
    }

    clear() {
        return this.keep(1, 0)
    }
}

module.exports = MockList