const Collection = require('../Collection')

class RedisList extends Collection {

    constructor(context) {
        super(context, 0)
    }

    exists() {
        return ['redis', 'exists', this.toKey()]
    }

    getLength() {
        return ['redis', 'llen', this.toKey()]
    }

    getAll(from = 0, to = -1) {
        return ['redis', 'lrange', this.toKey(), from, to]
    }

    getLeft(to = -1) {
        return this.getAll(0, to)
    }

    getRight(from = 0) {
        return this.getAll(from, -1)
    }

    get(ix) {
        return ['redis', 'lindex', this.toKey(), ix]
    }

    set(ix, value) {
        return ['redis', 'lset', this.toKey(), ix, value]
    }

    popLeft() {
        return ['redis', 'lpop', this.toKey()]
    }

    pushLeft(...values) {
        return ['redis', 'lpush', this.toKey(), ...values]
    }

    popRight() {
        return ['redis', 'rpop', this.toKey()]
    }

    pushRight(...values) {
        return ['redis', 'rpush', this.toKey(), ...values]
    }


    keep(from = 0, to = -1) {
        return ['redis', 'ltrim', this.toKey(), from, to]
    }

    trimLeft(from = 0) {
        return this.keep(from, -1)
    }

    trimRight(to = 0) {
        return this.keep(0, -to - 1)
    }


    removeAll(value) {
        return ['redis', 'lrem', this.toKey(), 0, value]
    }

    removeFirst(value, count = 1) {
        return ['redis', 'lrem', this.toKey(), count, value]
    }

    removeLast(value, count = 1) {
        return ['redis', 'lrem', this.toKey(), -count, value]
    }


    clear() {
        return this.keep(1, 0)
    }

}

module.exports = RedisList

