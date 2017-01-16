// const redis = require('redis')
const redis = require('fakeredis')
const {Store, RedisSet, RedisIdToSet, RedisIdToMap} = require("../lib")

async function test() {
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

    console.log("createUsers=",createUsers)
    console.log("userIds=",userIds)
    console.log("loadList=",loadList)
    console.log("userList=",userList)
}
test()
