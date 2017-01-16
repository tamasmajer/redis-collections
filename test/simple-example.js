// const redis = require('redis')
const redis = require('fakeredis')
const {Store, RedisSet} = require("../lib")

async function test() {
    const store = new Store(redis.createClient())
    const numbers = new RedisSet('numbers')
    await store.promise(numbers.add('two'))
    await store.promise(numbers.add('one'))
    const list = await store.promise(numbers.getList())
    console.log("list=", list)
}
test()
