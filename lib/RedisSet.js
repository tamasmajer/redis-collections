'use strict'

const Collection=require('./Collection')


class RedisSet extends Collection {

    constructor(context) {
        super(context,0)
    }

    exists() {
        return ['redis', 'exists',  this.toKey()]
    }

    contains(value) {
        return ['redis', 'sismember',  this.toKey(), value]
    }

    getList() {
        return ['redis', 'smembers', this.toKey()]
    }

    iterateList() {
        return ['redis', 'iterate', 'sscan', this.toKey(), 0, 'count', 100]
    }

    add(value) {
        return ['redis', 'sadd', this.toKey(), value]
    }

    addAll(values) {
        return ['redis', 'sadd', this.toKey() ].concat(values)
    }

    remove(value) {
        return ['redis', 'srem', this.toKey(), value]
    }

    clear() {
        return ['redis', 'del', this.toKey()]
    }

}
module.exports=RedisSet

