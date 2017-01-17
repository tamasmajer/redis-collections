'use strict'

const Collection = require('../Collection')
const RedisIdPairToMap = require('../collection/RedisIdPairToMap')


class MockIdPairToMap extends RedisIdPairToMap {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists(key1, key2) {
        const {data}=this.context
        return !!data[this.toKey(key1, key2)]
    }

    has(key1, key2, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(key1, key2)]
        return object && object[field]
    }

    get(key1, key2, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(key1, key2)]
        return object && object[field]
    }

    getMap(key1, key2) {
        const {data}=this.context
        return data[this.toKey(key1, key2)]
    }

    setAll(key1, key2, object) {
        const {data}=this.context
        data[this.toKey(key1, key2)] = object
    }

    set(key1, key2, field, value) {
        const {data}=this.context
        let object = data[this.toKey(key1, key2)]
        if (!object) object = data[this.toKey(key1, key2)] = {}
        object[field] = value
    }

    remove(key1, key2, field) {
        const {data}=this.context
        const object = data[this.toKey(key1, key2)]
        if (object) delete object[field]
    }

    clear(key1, key2) {
        const {data}=this.context
        delete data[this.toKey(key1, key2)]
    }

}
module.exports = MockIdPairToMap