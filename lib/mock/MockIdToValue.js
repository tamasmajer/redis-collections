'use strict'

const Collection = require('../Collection')
const RedisIdToValue = require('../collection/RedisIdToValue')


class MockIdToValue extends RedisIdToValue {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    get(id) {
        const {data}=this.context
        return data[this.toKey(id)]
    }

    set(id, value) {
        const {data}=this.context
        return data[this.toKey(id)] = value
    }

    remove(id) {
        const {data}=this.context
        delete data[this.toKey(id)]
    }

    exists(id) {
        const {data}=this.context
        return !!data[this.toKey(id)]
    }

    setTtl(id, seconds) {
    }

    getTtl(id) {
        return -1
    }

}
module.exports = MockIdToValue