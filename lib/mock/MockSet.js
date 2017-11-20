const Collection = require('../Collection')
const RedisSet = require('../collection/RedisSet')

class MockSet extends RedisSet {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    exists() {
        const {data}=this.context
        return Object.keys(data[this.toKey()] || {}).length > 0
    }

    getList() {
        const {data}=this.context
        return data[this.toKey()] || []
    }

    iterateList() {
        return this.getList()
    }

    add(value) {
        const {data}=this.context
        let arr = data[this.toKey()]
        if (!arr) arr = data[this.toKey()] = []
        if (!arr.includes(value)) arr.push(value)
    }

    addAll(values) {
        const {data}=this.context
        let arr = data[this.toKey()]
        if (!arr) arr = data[this.toKey()] = []
        values.forEach(v => {
            if (!arr.includes(v)) arr.push(v)
        })
    }

    contains(value) {
        const {data}=this.context
        return (data[this.toKey()] || []).includes(value) ? 1 : 0
    }

    remove(value) {
        const {data}=this.context
        const arr = (data[this.toKey()] || [])
        const ix = arr.indexOf(value)
        if (ix >= 0) arr.splice(ix, 1)
    }

    clear() {
        const {data}=this.context
        delete data[this.toKey()]
    }

}
module.exports = MockSet