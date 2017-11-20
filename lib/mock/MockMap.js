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
        return data[this.toKey()]
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
        return data[this.toKey()]||null// || {})
        // return o
        // const list = []
        // for (const k in o) list.push(k, o[k])
        // return list
    }

    setAll(object) {
        const {data}=this.context
        data[this.toKey()] = object
    }

    set(field, value) {
        const {data}=this.context
        let object = data[this.toKey()]
        if(!object) object=data[this.toKey()]={}
        object[field] = value
    }

    remove(field) {
        const {data}=this.context
        const object = data[this.toKey()]
        if (object) {
            delete object[field]
            if(Object.keys(object).length===0)
                delete data[this.toKey()]
        }
    }

    clear() {
        const {data}=this.context
        delete data[this.toKey()]
    }

    getFields() {
        const {data}=this.context
        const object = data[this.toKey()]
        return Object.keys(object || {})
    }

}
module.exports = MockMap