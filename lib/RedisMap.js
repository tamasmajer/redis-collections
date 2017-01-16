'use strict'

const Collection=require('./Collection')


class RedisMap extends Collection {

    constructor(context) {
        super(context,0)
    }

    exists() {
        return ['redis', 'exists', this.toKey()]
    }

    has(field) {
        const {fieldNames}=this.context
        if (!fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hexists', this.toKey(), field]
    }

    get(field) {
        const {fieldNames}=this.context
        if (!fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hget', this.toKey(), field]
    }

    getMap() {
        return ['redis', 'hgetall', this.toKey()]
    }

    setAll(object) {
        return ['redis', 'hmset', this.toKey(), object]
    }

    set(field, value) {
        const {fieldNames}=this.context
        if (!fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hset', this.toKey(), field, value]
    }

    remove(field) {
        const {fieldNames}=this.context
        if (!fieldNames[field]) throw new Error('Field not declared.')
        return ['redis', 'hdel', this.toKey(), field]
    }

    clear() {
        return ['redis', 'del', this.toKey()]
    }
}
module.exports = RedisMap