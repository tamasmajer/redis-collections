// const redis = require('redis')
const redis = require('fakeredis')
// const {Store, RedisSet} = require("redis-collections")
const {Store, RedisSet} = require("..")

const store = new Store(redis.createClient())
const numbers = new RedisSet('numbers')

store.promise(numbers.add('two'))
    .then(() => store.promise(numbers.add('one')))
    .then(() => store.promise(numbers.getList()))
    .then(list => {
        console.log("list=", list)
    })
