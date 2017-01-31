'use strict'

const Collection = require('../Collection')
const RedisIdToSet = require('../collection/RedisIdToSet')


class MockIdToSet extends RedisIdToSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists(id) {
        const {data}=this.context
        return Object.keys(data[this.toKey(id)]||{}).length>0
    }

    getList(id) {
        const {data}=this.context
        return data[this.toKey(id)]||[]
    }

    iterateList(id) {
        return this.getList(id)
    }

    add(id, value) {
        const {data}=this.context
        if (!data[this.toKey(id)]) data[this.toKey(id)] = []
        data[this.toKey(id)].push(value)
    }

    addAll(id, values) {
        const {data}=this.context
        let arr = data[this.toKey(id)]
        if (!arr) arr = data[this.toKey(id)] = []
        values.forEach(v => arr.push(v))
    }

    contains(id, value) {
        const {data}=this.context
        return (data[this.toKey(id)] || []).includes(value) ? 1 : 0
    }

    remove(id, value) {
        const {data}=this.context
        const arr = (data[this.toKey(id)] || [])
        const ix = arr.indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear(id) {
        const {data}=this.context
        const arr = (data[this.toKey(id)] || [])
        delete data[this.toKey(id)]
    }

}
module.exports = MockIdToSet