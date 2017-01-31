'use strict'

const Collection = require('../Collection')


class RedisIdPairToMap extends Collection {

    constructor(context) {
        super(context, 2)
    }

    exists(id1, id2) {
        return ['redis', 'exists', this.toKey(id1, id2)]
    }

    has(id1, id2, field) {
        const {fields}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        return ['redis', 'hexists', this.toKey(id1, id2), field]
    }

    get(id1, id2, field) {
        const {fields}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        return ['redis', 'hget', this.toKey(id1, id2), field]
    }

    getMap(id1, id2) {
        return ['redis', 'hgetall', this.toKey(id1, id2)]
    }

    setAll(id1, id2, object) {
        return ['redis', 'hmset', this.toKey(id1, id2), object]
    }

    set(id1, id2, field, value) {
        const {fields}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        return ['redis', 'hset', this.toKey(id1, id2), field, value]
    }

    remove(id1, id2, field) {
        const {fields}=this.context
        if (fields && !fields[field]) throw new Error('Field not declared.')
        return ['redis', 'hdel', this.toKey(id1, id2), field]
    }

    clear(id1, id2) {
        return ['redis', 'del', this.toKey(id1, id2)]
    }

    getFields(id1,id2) {
        return ['redis', 'hkeys', this.toKey(id1,id2)]
    }

}
module.exports = RedisIdPairToMap