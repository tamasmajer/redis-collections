'use strict'

const Collection = require('../Collection')


class RedisIdToMap extends Collection {

    constructor(context) {
        super(context, 1)
    }

    exists(id) {
        return ['redis', 'exists', this.toKey(id)]
    }

    has(id, field) {
        const {fieldNames}=this.context
        if (fieldNames && !fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hexists', this.toKey(id), field]
    }

    get(id, field) {
        const {fieldNames}=this.context
        if (fieldNames && !fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hget', this.toKey(id), field]
    }

    set(id, field, value) {
        const {fieldNames}=this.context
        if (fieldNames && !fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hset', this.toKey(id), field, value]
    }

    remove(id, field) {
        const {fieldNames}=this.context
        if (fieldNames && !fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hdel', this.toKey(id), field]
    }

    getMap(id) {
        return ['redis', 'hgetall', this.toKey(id)]
    }

    setAll(id, object) {
        return ['redis', 'hmset', this.toKey(id), object]
    }

    clear(id) {
        return ['redis', 'del', this.toKey(id)]
    }

    getFields(id) {
        return ['redis', 'hkeys', this.toKey(id)]
    }
}
module.exports = RedisIdToMap