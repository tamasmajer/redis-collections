'use strict'

const Collection = require('../Collection')
const RedisMap = require('../collection/RedisMap')


class MockMap extends RedisMap {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists() {
        const {data}=this.context
        return !!data[this.toKey()]
    }

    has(field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey()]
        return object && object[field]
    }

    get(field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey()]
        return object && object[field]
    }

    getMap() {
        const {data}=this.context
        const o = (data[this.toKey()] || {})
        const list = []
        for (const k in o) list.push(k, o[k])
        return list
    }

    setAll(object) {
        const {data}=this.context
        data[this.toKey()] = object
    }

    set(field, value) {
        const {data}=this.context
        const object = data[this.toKey()]
        object[field] = value
    }

    remove(field) {
        const {data}=this.context
        const object = data[this.toKey()]
        if (object) delete object[field]
    }

    clear() {
        const {data}=this.context
        delete data[this.toKey()]
    }

}
module.exports = MockMap