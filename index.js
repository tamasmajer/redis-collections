module.exports = {
    RedisIdPairToMap: require('./lib/collection/RedisIdPairToMap'),
    RedisIdToMap: require('./lib/collection/RedisIdToMap'),
    RedisIdToSet: require('./lib/collection/RedisIdToSet'),
    RedisIdToSortedSet: require('./lib/collection/RedisIdToSortedSet'),
    RedisIdToValue: require('./lib/collection/RedisIdToValue'),
    RedisMap: require('./lib/collection/RedisMap'),
    RedisSet: require('./lib/collection/RedisSet'),
    RedisSortedSet: require('./lib/collection/RedisSortedSet'),
    Store: require('./lib/Store'),
    Mock: {
        RedisIdPairToMap: require('./lib/mock/MockIdPairToMap'),
        RedisIdToMap: require('./lib/mock/MockIdToMap'),
        RedisIdToSet: require('./lib/mock/MockIdToSet'),
        RedisIdToSortedSet: require('./lib/mock/MockIdToSortedSet'),
        RedisIdToValue: require('./lib/mock/MockIdToValue'),
        RedisMap: require('./lib/mock/MockMap'),
        RedisSet: require('./lib/mock/MockSet'),
        RedisSortedSet: require('./lib/mock/MockSortedSet'),
        Store: require('./lib/mock/MockStore'),
    }
}