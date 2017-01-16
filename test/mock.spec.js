'use strict'

const chai = require('chai')
const expect = chai.expect

const redis = require('fakeredis')

const {Store, RedisSet, RedisSortedSet, RedisMap, RedisIdToValue, RedisIdToSet, RedisIdToSortedSet, RedisIdToMap, RedisIdPairToMap} = require("../lib/mock")


describe('mock:', () => {

    describe('collections:', () => {

        describe('RedisSet:', () => {

            it('add', async() => {
                const store = new Store(redis.createClient())

                const numbers = new RedisSet('numbers')
                await store.promise(numbers.add('two'))
                await store.promise(numbers.add('one'))

                const all = await store.promise(numbers.iterateList())
                expect(all.sort()).to.deep.equal(['one', 'two'].sort())
            })

            it('addAll', async() => {
                const store = new Store(redis.createClient())

                const numbers = new RedisSet('numbers')
                await store.promise(numbers.addAll(["one", "two", "three"]))

                const all = await store.promise(numbers.getList())
                expect(all.sort()).to.deep.equal(["one", "two", "three"].sort())
            })
        })
    })

    describe('multiple commands:', () => {

        it('save multiple', async() => {
            const store = new Store(redis.createClient())
            const numbers = new RedisSet('numbers')

            await store.promise([
                numbers.add('two'),
                numbers.add('one')
            ])

            const all = await store.promise(numbers.getList())
            expect(all.sort()).to.deep.equal(['one', 'two'].sort())
        })

        it('load multiple', async() => {
            const store = new Store(redis.createClient())
            const numbers = new RedisSet('numbers')

            await store.promise(numbers.addAll(['one', 'two']))

            const result = await store.promise([
                numbers.contains('one'),
                numbers.contains('two'),
                numbers.contains('three')
            ])

            expect(result).to.deep.equal([1, 1, 0])
        })

        it('load into map', async() => {
            const store = new Store(redis.createClient())
            const numbers = new RedisSet('numbers')

            await store.promise(numbers.addAll(['one', 'two']))

            const result = await store.promise({
                hasOne: numbers.contains('one'),
                hasTwo: numbers.contains('two'),
                hasThree: numbers.contains('three')
            })

            expect(result).to.deep.equal({
                hasOne: 1,
                hasTwo: 1,
                hasThree: 0
            })
        })

        it('load into structure', async() => {
            const store = new Store(redis.createClient())
            const numbers = new RedisSet('numbers')

            await store.promise(numbers.addAll(['one', 'two']))

            const result = await store.promise({
                hasOne: numbers.contains('one'),
                hasThree: numbers.contains('three'),
                allInAList: numbers.getList(),
                createAListHere: [
                    numbers.contains('one'),
                    numbers.contains('two'),
                    {
                        hasOne: numbers.contains('one'),
                        description: 'hello',
                    },
                ],
            })

            expect(result).to.deep.equal({
                hasOne: 1,
                hasThree: 0,
                allInAList: [ 'one', 'two' ],
                createAListHere: [ 1, 1, { hasOne: 1, description: 'hello' } ]
            })
        })

    })

    describe('multiple collections:', () => {
        const store = new Store(redis.createClient())
        const users = {
            list: new RedisSet('users'),
            settings: new RedisIdToMap('user:${userId}:settings'),
            friends: new RedisIdToSet('user:${userId}:friends')
        }

        before(async()=>{
            const createUsers = [
                users.list.addAll(["U1", "U2"]),
                users.settings.setAll("U1", {name: "USER1"}),
                users.settings.setAll("U2", {name: "USER2"}),
                users.friends.add("U1", "U2"),
                users.friends.add("U2", "U1")
            ]
            await store.promise(createUsers)
        })

        it('create a combined list', async() => {
            const userIds = await store.promise(users.list.getList())
            const loadList = userIds.map(userId => ({
                id: userId,
                settings: users.settings.getMap(userId),
                friends: users.friends.getList(userId)
            }))
            const userList = await store.promise(loadList)

            expect(userList).to.deep.equal([
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
            ])
        })
        it('create a combined map', async() => {
            const userIds = await store.promise(users.list.getList())
            const loadMap = {}
            userIds.forEach(userId => {
                loadMap[userId]={
                    settings: users.settings.getMap(userId),
                    friends: users.friends.getList(userId)
                }
            })
            const userMap = await store.promise(loadMap)

            expect(userMap).to.deep.equal({
                "U1": {
                    settings: { name: 'USER1' },
                    friends: [ 'U2' ]
                },
                "U2": {
                    settings: { name: 'USER2' },
                    friends: [ 'U1' ]
                }
            })
        })
    })


})

