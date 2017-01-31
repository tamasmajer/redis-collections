'use strict'

const Collection = require('../Collection')
const RedisIdPairToMap = require('../collection/RedisIdPairToMap')


class MockIdPairToMap extends RedisIdPairToMap {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists(id1, id2) {
        const {data}=this.context
        return data[this.toKey(id1, id2)]||null
    }

    has(id1, id2, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(id1, id2)]
        return object && object[field]
    }

    get(id1, id2, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(id1, id2)]
        return object && object[field]
    }

    getMap(id1, id2) {
        const {data}=this.context
        return data[this.toKey(id1, id2)]||null
    }

    setAll(id1, id2, object) {
        const {data}=this.context
        data[this.toKey(id1, id2)] = object
    }

    set(id1, id2, field, value) {
        const {data}=this.context
        let object = data[this.toKey(id1, id2)]
        if (!object) object = data[this.toKey(id1, id2)] = {}
        object[field] = value
    }

    remove(id1, id2, field) {
        const {data}=this.context
        const object = data[this.toKey(id1, id2)]
        if (object) {
            delete object[field]
            if(Object.keys(object).length===0)
                delete data[this.toKey(id1, id2)]
        }
    }

    clear(id1, id2) {
        const {data}=this.context
        delete data[this.toKey(id1, id2)]
    }

    getFields(id1,id2) {
        const {data}=this.context
        const object = data[this.toKey(id1,id2)]
        return Object.keys(object || {})
    }
}
module.exports = MockIdPairToMap