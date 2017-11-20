const Collection = require('../Collection')
const RedisIdPairToValue = require('../collection/RedisIdPairToValue')

class MockIdPairToValue extends RedisIdPairToValue {

    constructor(context) {
        super(context)
        if (!this.context.data) this.context.data = {}
        Collection._throwFromUnimplementedParentMethods(this)
    }

    get(id1,id2) {
        const {data}=this.context
        return data[this.toKey(id1,id2)]
    }

    set(id1,id2, value) {
        const {data}=this.context
        return data[this.toKey(id1,id2)] = value
    }

    inc(id1,id2) {
        const {data}=this.context
        return data[this.toKey(id1,id2)] = parseInt(data[this.toKey(id1,id2)]||0)+1
    }

    remove(id1,id2) {
        const {data}=this.context
        delete data[this.toKey(id1,id2)]
    }

    exists(id1,id2) {
        const {data}=this.context
        return !!data[this.toKey(id1,id2)]
    }

    setTtl(id1,id2, seconds) {
    }

    getTtl(id1,id2) {
        return -1
    }

}
module.exports = MockIdPairToValue