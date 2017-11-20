const Collection = require('../Collection')
const RedisIdToMap = require('../collection/RedisIdToMap')

class MockIdToMap extends RedisIdToMap {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists(id) {
        const {data}=this.context
        return !!data[this.toKey(id)]
    }

    has(id, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(id)]
        return object && object[field]
    }

    get(id, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(id)]
        return object && object[field]
    }

    set(id, field, value) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        let object = data[this.toKey(id)]
        if (!object) object = data[this.toKey(id)] = {}
        object[field] = value
    }

    remove(id, field) {
        const {fields, data}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        const object = data[this.toKey(id)]
        if (object) {
            delete object[field]
            if(Object.keys(object).length==0)
                delete data[this.toKey(id)]
        }
    }

    getMap(id) {
        const {data}=this.context
        return data[this.toKey(id)]||null
    }

    setAll(id, object) {
        const {data}=this.context
        data[this.toKey(id)] = object
    }

    clear(id) {
        const {data}=this.context
        delete data[this.toKey(id)]
    }

    getFields(id) {
        const {data}=this.context
        const object = data[this.toKey(id)]
        return Object.keys(object || {})
    }

    findKeys() {
        const {data}=this.context
        const template = '^' + this.toKey('(.*)') + '$'
        const keys = Object.keys(data || {})
        return keys.filter(k => k.match(template))
    }

}
module.exports = MockIdToMap