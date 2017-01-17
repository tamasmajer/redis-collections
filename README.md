# redis-collections

Collection based views for Redis inspired by clean code.


## Why
1. Structured database.
1. Collections instead of commands.
1. Working with IDs instead of keys.
1. Composite queries.
1. Promise based.

## Structure
 You can quickly define your whole database (or cover your existing one) using simple collections:

```javascript
const users = {
    list: new RedisSet('users'),
    settings: new RedisIdToMap('user:${userId}:settings'),
    friends: new RedisIdToSet('user:${userId}:friends')
}
```

## Composite queries

You can structure your query into the expected output format and run them in one step.
```javascript
const loadAllUserInfo = userIds.map(userId => ({
    id: userId,
    settings: users.settings.getMap(userId),
    friends: users.friends.getList(userId)
}))
const userInfoList = await store.promise(loadAllUserInfo)
```


## Collections


* [RedisSet](lib/collection/RedisSet.js) manages [redis sets](https://redis.io/topics/data-types#sets) with a fixed key (like "users") 
* [RedisMap](lib/collection/RedisMap.js) manages [redis hash maps](https://redis.io/topics/data-types#hashes) with a fixed key (like "settings")
* [RedisSortedSet](lib/collection/RedisSortedSet.js) manages [redis sorted sets](https://redis.io/topics/data-types#sorted-sets) with a fixed key (like "users-by-name")
* [RedisIdToValue](lib/collection/RedisIdToValue.js) manages [redis string values](https://redis.io/topics/data-types-intro#redis-strings) with an ID in the key (like "user:${userId}:name")
* [RedisIdToSet](lib/collection/RedisIdToSet.js) manages [redis sets](https://redis.io/topics/data-types#sets) with an ID in the key (like "user:${userId}:friends") 
* [RedisIdToMap](lib/collection/RedisIdToMap.js) manages [redis hash maps](https://redis.io/topics/data-types#hashes) with an ID in the key (like "user:${userId}:settings")
* [RedisIdToSortedSet](lib/collection/RedisIdToSortedSet.js) manages [redis sorted sets](https://redis.io/topics/data-types#sorted-sets) with an ID in the key (like "user:${userId}:friends-by-distance")
* [RedisIdPairToMap](lib/collection/RedisIdPairToMap.js) manages [redis hash maps](https://redis.io/topics/data-types#hashes) with two IDs in the key (like "user:${userId}:friend:${userId}:relationship-details")





## Simple example
[simple-example.js](examples/simple-example.js): ([Online version](https://runkit.com/tamasmajer/redis-collections--simple-example))
```javascript
// const redis = require('redis')
const redis = require('fakeredis')
const {Store, RedisSet} = require("redis-collections")

const store = new Store(redis.createClient())
const numbers = new RedisSet('numbers')

store.promise(numbers.add('two'))
    .then(() => store.promise(numbers.add('one')))
    .then(() => store.promise(numbers.getList()))
    .then(list => {
        console.log("list=", list)
    })
```


Should print
```bash
list= [ 'one', 'two' ]
```

## Better example

[better-example.js](examples/better-example.js): ([Online version](https://runkit.com/tamasmajer/redis-collections--better-example))
```javascript
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
```javascript
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

By using the mock implementation you can [check](examples/better-example-mock.js) the contents of the db: ([Online version](https://runkit.com/tamasmajer/redis-collections--better-example-mock))
```javascript
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

## Install

```bash
npm install redis-collections
```

## Testing

[Testing](test/basic.spec.js) needs node 7.2.1

```bash
npm test
```

## Status

Needs more tests.

## License
[MIT](LICENCE)