# redis-collections

Collection based views for Redis.

* [Overview](#overview)
* [Collections](#collections)
* [Examples](#examples)

# Overview

This is an extra layer on top of [node_redis](https://www.npmjs.com/package/redis) simplifying it with simple collection views. You can sum up your whole database, or parts of it, into a simple schema like this:
```javascript 1.7
const users = {
    list: new RedisSet('users'),
    settings: new RedisIdToMap('user:${userId}:settings'),
    friends: new RedisIdToSet('user:${userId}:friends')
}
```
And run a batch query like this one:
```javascript 1.7
const loadAllUserInfo = userIds.map(userId => ({
    id: userId,
    settings: users.settings.getMap(userId),
    friends: users.friends.getList(userId)
}))
const userInfoList = await store.promise(loadAllUserInfo)
```

The methods of the collections are only producing redis commands. These commands are then executed at once by the multi command of node_redis wrapped into a promise. You don't need async/await support to use this package (only to run the tests), but it's looks much better with it.

# Collections

* [RedisSet](lib/RedisSet) - for [Sets](https://redis.io/topics/data-types#sets) with a fix key (like "users")
* [RedisMap](lib/RedisMap) - for [Hash maps](https://redis.io/topics/data-types#hashes) with a fix key (like "settings")
* [RedisSortedSet](lib/RedisSortedSet) - for [Sorted sets](https://redis.io/topics/data-types#sorted-sets) with a fix key (like "users-by-name")
* [RedisIdToValue](lib/RedisIdToValue) - for [String values](https://redis.io/topics/data-types-intro#redis-strings) with an ID in the key (like "user:${userId}:name")
* [RedisIdToSet](lib/RedisIdToSet) - for [Sets](https://redis.io/topics/data-types#sets) with an ID in the key (like "user:${userId}:friends") 
* [RedisIdToMap](lib/RedisIdToMap) - for [Hash maps](https://redis.io/topics/data-types#hashes) with an ID in the key (like "user:${userId}:settings")
* [RedisIdToSortedSet](lib/RedisIdToSortedSet) - for [Sorted sets](https://redis.io/topics/data-types#sorted-sets) with an ID in the key (like "user:${userId}:friends-by-distance")
* [RedisIdPairToMap](lib/RedisIdPairToMap) - for [Hash maps](https://redis.io/topics/data-types#hashes) with two IDs in the key (like "user:${userId}:friend:${userId}:relationship-details")


# Examples

## Single collection
simple-example.js:
```javascript 1.7
// const redis = require('redis')
const redis = require('fakeredis')
const {Store, RedisSet} = require("redis-collections")

async function test() {
    const store = new Store(redis.createClient())
    const numbers = new RedisSet('numbers')
    await store.promise(numbers.add('two'))
    await store.promise(numbers.add('one'))
    const list = await store.promise(numbers.getList())
    console.log("list=", list)
}
test()
```

Run with node 7.2.1
```bash
node --harmony-async-await simple-example.js
```

Should print
```bash
list= [ 'one', 'two' ]
```

## Multiple collections

see multi-example.js:
```javascript 1.8
const store = new Store(redis.createClient())
const users = {
    list: new RedisSet('users'),
    settings: new RedisIdToMap('user:${userId}:settings'),
    friends: new RedisIdToSet('user:${userId}:friends')
}

const createUsers = [
    users.list.addAll(["U1", "U2"]),
    users.settings.setAll("U1", {name: "USER1"}),
    users.settings.setAll("U2", {name: "USER2"}),
    users.friends.add("U1", "U2"),
    users.friends.add("U2", "U1")
]
await store.promise(createUsers)

const userIds = await store.promise(users.list.getList())
const loadList = userIds.map(userId => ({
    id: userId,
    settings: users.settings.getMap(userId),
    friends: users.friends.getList(userId)
}))
const userList = await store.promise(loadList)
```

will create:
```javascript 1.7
createUsers = [ 
    [ 'redis', 'sadd', 'users', 'U1', 'U2' ],
    [ 'redis', 'hmset', 'user:U1:settings', { name: 'USER1' } ],
    [ 'redis', 'hmset', 'user:U2:settings', { name: 'USER2' } ],
    [ 'redis', 'sadd', 'user:U1:friends', 'U2' ],
    [ 'redis', 'sadd', 'user:U2:friends', 'U1' ] 
]

userIds = [ 'U1', 'U2' ]

loadList= [ 
    { 
        id: 'U1',
        settings: [ 'redis', 'hgetall', 'user:U1:settings' ],
        friends: [ 'redis', 'smembers', 'user:U1:friends' ] 
    },
    { 
        id: 'U2',
        settings: [ 'redis', 'hgetall', 'user:U2:settings' ],
        friends: [ 'redis', 'smembers', 'user:U2:friends' ] 
    } 
]

userList = [
    {
        id: 'U1',
        settings: {name: 'USER1'},
        friends: ['U2']
    },
    {
        id: 'U2',
        settings: {name: 'USER2'},
        friends: ['U1']
    }
]
```

By using the mock implementation you can check the contents of the db:
```javascript 1.7
{
    "users": [
        "U1",
        "U2"
    ],
    "user:U1:settings": {
        "name": "USER1"
    },
    "user:U2:settings": {
        "name": "USER2"
    },
    "user:U1:friends": [
        "U2"
    ],
    "user:U2:friends": [
        "U1"
    ]
}
```

# Testing

Testing needs node v7.2.1

```bash
npm test
```
