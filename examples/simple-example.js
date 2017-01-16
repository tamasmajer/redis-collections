// const redis = require('redis')
const redis = require('fakeredis')
// const {Store, RedisSet} = require("redis-collections")
const {Store, RedisSet} = require("..")

const store = new Store(redis.createClient())
const numbers = new RedisSet('numbers')

async function test() {
    await store.promise(numbers.add('two'))
    await store.promise(numbers.add('one'))
    const list = await store.promise(numbers.getList())
    console.log("list=", list)
}
test()