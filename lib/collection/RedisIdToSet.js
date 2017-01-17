'use strict'

const Collection = require('../Collection')


class RedisIdToSet extends Collection {

    constructor(context) {
        super(context, 1)
    }

    exists(id) {
        return ['redis', 'exists', this.toKey(id)]
    }

    contains(id, value) {
        return ['redis', 'sismember', this.toKey(id), value]
    }

    getList(id) {
        return ['redis', 'smembers', this.toKey(id)]
    }

    iterateList(id) {
        return ['redis', 'iterate', 'sscan', this.toKey(id), 0, 'count', 100]
    }

    add(id, value) {
        return ['redis', 'sadd', this.toKey(id), value]
    }

    addAll(id, values) {
        return ['redis', 'sadd', this.toKey(id)].concat(values)
    }

    remove(id, value) {
        return ['redis', 'srem', this.toKey(id), value]
    }

    clear(id) {
        throw new Error('Not implemented.')
    }

}
module.exports = RedisIdToSet