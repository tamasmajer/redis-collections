const debug = require('debug')('redis-collections')

class MockStore {

    static get COLLECTIONS() {
        return {
            RedisIdToValue: require('./MockIdToValue'),
            RedisIdPairToMap: require('./MockIdPairToMap'),
            RedisIdToMap: require('./MockIdToMap'),
            RedisIdToSet: require('./MockIdToSet'),
            RedisIdToSortedSet: require('./MockIdToSortedSet'),
            RedisSortedSet: require('./MockSortedSet'),
            RedisSet: require('./MockSet'),
            RedisMap: require('./MockMap')
        }
    }

    constructor() {
    }

    injectInto(object) {
        const store = this
        object.promise = function (commands) {
            return store.promise(commands)
        }
    }

    promise(data) {
        return Promise.resolve(data)
    }

}

module.exports = MockStore