'use strict'

const chai = require('chai')
const expect = chai.expect

const redis = require('fakeredis')

const implementations = [
    {name: 'Redis implementation', implementation: require('..')},
    {name: 'Mock implementation', implementation: require('..').Mock}
]

implementations.forEach(function ({name, implementation}) {
    const {Store, RedisSet, RedisSortedSet, RedisMap, RedisIdToValue, RedisIdPairToValue, RedisIdToSet, RedisIdToSortedSet, RedisIdToMap, RedisIdPairToMap} = implementation

    describe(name + ":", function () {
        this.timeout(0)

        describe('collections:', () => {

            it('RedisSet should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const VALUE1 = 'one'
                const VALUE2 = 'two'
                const set = new RedisSet('numbers')

                expect(await store.promise(set.exists())).to.not.be.ok
                expect(await store.promise(set.contains(VALUE1))).to.not.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.not.be.ok

                await store.promise(set.add(VALUE2))
                await store.promise(set.add(VALUE1))
                await store.promise(set.add(VALUE1))
                expect(await store.promise(set.exists())).to.be.ok
                expect(await store.promise(set.contains(VALUE1))).to.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.be.ok
                expect((await store.promise(set.getList())).sort()).to.deep.equal([VALUE1, VALUE2].sort())
                expect((await store.promise(set.iterateList())).sort()).to.deep.equal([VALUE1, VALUE2].sort())

                await store.promise(set.clear())
                expect(await store.promise(set.exists())).to.not.be.ok
                expect(await store.promise(set.contains(VALUE1))).to.not.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.not.be.ok

                await store.promise(set.addAll([VALUE1, VALUE2]))
                expect(await store.promise(set.exists())).to.be.ok
                expect(await store.promise(set.contains(VALUE1))).to.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.be.ok
                expect((await store.promise(set.getList())).sort()).to.deep.equal([VALUE1, VALUE2].sort())
                expect((await store.promise(set.iterateList())).sort()).to.deep.equal([VALUE1, VALUE2].sort())

                await store.promise(set.remove(VALUE1))
                expect(await store.promise(set.contains(VALUE1))).to.not.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.be.ok

                await store.promise(set.remove(VALUE2))
                expect(await store.promise(set.exists())).to.not.be.ok
                expect(await store.promise(set.contains(VALUE1))).to.not.be.ok
                expect(await store.promise(set.contains(VALUE2))).to.not.be.ok
            })

            it('RedisIdToSet should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const USER1 = 'one'
                const USER2 = 'two'
                const USER3 = 'three'
                const idToSet = new RedisIdToSet({key: 'likes:${userId}', valueType: 'userId'})

                expect(await store.promise(idToSet.exists(USER1))).to.not.be.ok
                expect(await store.promise(idToSet.exists(USER2))).to.not.be.ok
                expect(await store.promise(idToSet.exists(USER3))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER3))).to.not.be.ok

                await store.promise(idToSet.add(USER1, USER2))
                await store.promise(idToSet.add(USER1, USER3))
                await store.promise(idToSet.add(USER2, USER3))
                await store.promise(idToSet.add(USER2, USER3))
                expect(await store.promise(idToSet.exists(USER1))).to.be.ok
                expect(await store.promise(idToSet.exists(USER2))).to.be.ok
                expect(await store.promise(idToSet.exists(USER3))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER3))).to.be.ok
                expect(await store.promise(idToSet.contains(USER2, USER3))).to.be.ok
                expect(await store.promise(idToSet.contains(USER3, USER1))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER2, USER1))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER3, USER2))).to.not.be.ok
                expect((await store.promise(idToSet.getList(USER1))).sort()).to.deep.equal([USER2, USER3].sort())
                expect((await store.promise(idToSet.getList(USER2))).sort()).to.deep.equal([USER3].sort())
                expect((await store.promise(idToSet.getList(USER3))).sort()).to.deep.equal([].sort())
                expect((await store.promise(idToSet.iterateList(USER1))).sort()).to.deep.equal([USER2, USER3].sort())
                expect((await store.promise(idToSet.iterateList(USER2))).sort()).to.deep.equal([USER3].sort())
                expect((await store.promise(idToSet.iterateList(USER3))).sort()).to.deep.equal([].sort())

                const keys = await store.promise(idToSet.findKeys())
                expect(keys.sort()).to.deep.equal(["likes:" + USER1, "likes:" + USER2].sort())
                for (const key of keys) {
                    const id = idToSet.toId(key)
                    expect(await store.promise(idToSet.exists(id)))
                }

                await store.promise(idToSet.clear(USER1))
                expect(await store.promise(idToSet.exists(USER1))).to.not.be.ok
                expect(await store.promise(idToSet.exists(USER2))).to.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER2, USER3))).to.be.ok

                await store.promise(idToSet.addAll(USER1, [USER2, USER3]))
                expect(await store.promise(idToSet.exists(USER1))).to.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER3))).to.be.ok
                expect((await store.promise(idToSet.getList(USER1))).sort()).to.deep.equal([USER2, USER3].sort())
                expect((await store.promise(idToSet.iterateList(USER1))).sort()).to.deep.equal([USER2, USER3].sort())

                await store.promise(idToSet.remove(USER1, USER2))
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER3))).to.be.ok

                await store.promise(idToSet.remove(USER1, USER3))
                expect(await store.promise(idToSet.exists(USER1))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER2))).to.not.be.ok
                expect(await store.promise(idToSet.contains(USER1, USER3))).to.not.be.ok
            })

            it('RedisMap should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const FIELD1 = '1'
                const FIELD2 = '2'
                const VALUE1 = 'one'
                const VALUE2 = 'two'
                const MAP = {}
                MAP[FIELD1] = VALUE1
                MAP[FIELD2] = VALUE2
                const map = new RedisMap('numbers')

                expect(await store.promise(map.exists())).to.not.be.ok
                expect(await store.promise(map.has(FIELD1))).to.not.be.ok
                expect(await store.promise(map.get(FIELD1))).to.not.be.ok
                expect(await store.promise(map.getMap())).to.equal(null)
                expect(await store.promise(map.getFields())).to.deep.equal([])

                await store.promise(map.set(FIELD1, VALUE1))
                await store.promise(map.set(FIELD2, VALUE2))
                expect(await store.promise(map.exists())).to.be.ok
                expect(await store.promise(map.has(FIELD1))).to.be.ok
                expect(await store.promise(map.has(FIELD2))).to.be.ok
                expect(await store.promise(map.get(FIELD1))).to.equal(VALUE1)
                expect(await store.promise(map.get(FIELD2))).to.equal(VALUE2)
                expect((await store.promise(map.getMap()))).to.deep.equal(MAP)
                expect((await store.promise(map.getFields())).sort()).to.deep.equal(Object.keys(MAP).sort())

                await store.promise(map.clear())
                expect(await store.promise(map.exists())).to.not.be.ok
                expect(await store.promise(map.has(FIELD1))).to.not.be.ok
                expect(await store.promise(map.has(FIELD2))).to.not.be.ok

                await store.promise(map.setAll(MAP))
                expect(await store.promise(map.exists())).to.be.ok
                expect(await store.promise(map.has(FIELD1))).to.be.ok
                expect((await store.promise(map.getMap()))).to.deep.equal(MAP)

                await store.promise(map.remove(FIELD1))
                expect(await store.promise(map.has(FIELD1))).to.not.be.ok
                expect(await store.promise(map.has(FIELD2))).to.be.ok

                await store.promise(map.remove(FIELD2))
                expect(await store.promise(map.exists())).to.not.be.ok
                expect(await store.promise(map.has(FIELD1))).to.not.be.ok
                expect(await store.promise(map.has(FIELD2))).to.not.be.ok
            })

            it('RedisIdToMap should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const EN_LANG_ID = 'en'
                const EN_FIELD1 = '1'
                const EN_FIELD2 = '2'
                const EN_VALUE1 = 'one'
                const EN_VALUE2 = 'two'
                const EN_MAP = {}
                EN_MAP[EN_FIELD1] = EN_VALUE1
                EN_MAP[EN_FIELD2] = EN_VALUE2
                const idToMap = new RedisIdToMap('translate.numbers:${languageId}')

                expect(await store.promise(idToMap.exists(EN_LANG_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.get(EN_LANG_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.getMap(EN_LANG_ID))).to.equal(null)
                expect(await store.promise(idToMap.getFields(EN_LANG_ID))).to.deep.equal([])

                await store.promise(idToMap.set(EN_LANG_ID, EN_FIELD1, EN_VALUE1))
                await store.promise(idToMap.set(EN_LANG_ID, EN_FIELD2, EN_VALUE2))
                expect(await store.promise(idToMap.exists(EN_LANG_ID))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD2))).to.be.ok
                expect(await store.promise(idToMap.get(EN_LANG_ID, EN_FIELD1))).to.equal(EN_VALUE1)
                expect(await store.promise(idToMap.get(EN_LANG_ID, EN_FIELD2))).to.equal(EN_VALUE2)
                expect((await store.promise(idToMap.getMap(EN_LANG_ID)))).to.deep.equal(EN_MAP)
                expect((await store.promise(idToMap.getFields(EN_LANG_ID))).sort()).to.deep.equal(Object.keys(EN_MAP).sort())
                const keys = await store.promise(idToMap.findKeys())
                expect(keys.sort()).to.deep.equal(["translate.numbers:" + EN_LANG_ID].sort())
                for (const key of keys) {
                    const id = idToMap.toId(key)
                    expect(await store.promise(idToMap.exists(id)))
                }

                await store.promise(idToMap.clear(EN_LANG_ID))
                expect(await store.promise(idToMap.exists(EN_LANG_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD2))).to.not.be.ok

                await store.promise(idToMap.setAll(EN_LANG_ID, EN_MAP))
                expect(await store.promise(idToMap.exists(EN_LANG_ID))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.be.ok
                expect((await store.promise(idToMap.getMap(EN_LANG_ID)))).to.deep.equal(EN_MAP)

                await store.promise(idToMap.remove(EN_LANG_ID, EN_FIELD1))
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD2))).to.be.ok

                await store.promise(idToMap.remove(EN_LANG_ID, EN_FIELD2))
                expect(await store.promise(idToMap.exists(EN_LANG_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, EN_FIELD2))).to.not.be.ok
            })

            it('RedisIdPairToMap should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const EN_LANG_ID = 'en'
                const NUMBERS_TOPIC_ID = 'numbers'
                const EN_FIELD1 = '1'
                const EN_FIELD2 = '2'
                const EN_VALUE1 = 'one'
                const EN_VALUE2 = 'two'
                const EN_MAP = {}
                EN_MAP[EN_FIELD1] = EN_VALUE1
                EN_MAP[EN_FIELD2] = EN_VALUE2
                const idToMap = new RedisIdPairToMap('translate:${languageId}:${topicId}')

                expect(await store.promise(idToMap.exists(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.get(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.getMap(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.equal(null)
                expect(await store.promise(idToMap.getFields(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.deep.equal([])

                await store.promise(idToMap.set(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1, EN_VALUE1))
                await store.promise(idToMap.set(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2, EN_VALUE2))
                expect(await store.promise(idToMap.exists(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))).to.be.ok
                expect(await store.promise(idToMap.get(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.equal(EN_VALUE1)
                expect(await store.promise(idToMap.get(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))).to.equal(EN_VALUE2)
                expect((await store.promise(idToMap.getMap(EN_LANG_ID, NUMBERS_TOPIC_ID)))).to.deep.equal(EN_MAP)
                expect((await store.promise(idToMap.getFields(EN_LANG_ID, NUMBERS_TOPIC_ID))).sort()).to.deep.equal(Object.keys(EN_MAP).sort())
                const keys = await store.promise(idToMap.findKeys(EN_LANG_ID))
                expect(keys.sort()).to.deep.equal(["translate:" + EN_LANG_ID + ":" + NUMBERS_TOPIC_ID].sort())
                for (const key of keys) {
                    const idPair = idToMap.toIds(key)
                    expect(await store.promise(idToMap.exists(...idPair)))
                }

                await store.promise(idToMap.clear(EN_LANG_ID, NUMBERS_TOPIC_ID))
                expect(await store.promise(idToMap.exists(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))).to.not.be.ok

                await store.promise(idToMap.setAll(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_MAP))
                expect(await store.promise(idToMap.exists(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.be.ok
                expect((await store.promise(idToMap.getMap(EN_LANG_ID, NUMBERS_TOPIC_ID)))).to.deep.equal(EN_MAP)

                await store.promise(idToMap.remove(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))).to.be.ok

                await store.promise(idToMap.remove(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))
                expect(await store.promise(idToMap.exists(EN_LANG_ID, NUMBERS_TOPIC_ID))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD1))).to.not.be.ok
                expect(await store.promise(idToMap.has(EN_LANG_ID, NUMBERS_TOPIC_ID, EN_FIELD2))).to.not.be.ok
            })

            it('RedisIdToValue should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const ID1 = '1'
                const ID2 = '2'
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const map = new RedisIdToValue({key: 'id.to.text:${id}', valueType: 'text'})

                expect(await store.promise(map.exists(ID1))).to.not.be.ok
                expect(await store.promise(map.get(ID1))).to.not.be.ok

                await store.promise(map.set(ID1, TEXT1))
                await store.promise(map.set(ID2, TEXT2))
                expect(await store.promise(map.exists(ID1))).to.be.ok
                expect(await store.promise(map.exists(ID2))).to.be.ok
                expect(await store.promise(map.get(ID1))).to.equal(TEXT1)
                expect(await store.promise(map.get(ID2))).to.equal(TEXT2)

                await store.promise(map.remove(ID1))
                expect(await store.promise(map.exists(ID1))).to.not.be.ok
                expect(await store.promise(map.exists(ID2))).to.be.ok

                await store.promise(map.remove(ID2))
                expect(await store.promise(map.exists(ID2))).to.not.be.ok

                await store.promise(map.inc('counter'))
                expect(await store.promise(map.get('counter'))).to.equal(1)
                await store.promise(map.inc('counter'))
                expect(await store.promise(map.get('counter'))).to.equal(2)
            })

            it('RedisIdPairToValue should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const LANG = 'hu'
                const ID1 = '1'
                const ID2 = '2'
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const map = new RedisIdPairToValue({key: 'id.to.text:${lang}:${id}', valueType: 'text'})

                expect(await store.promise(map.exists(LANG, ID1))).to.not.be.ok
                expect(await store.promise(map.get(LANG, ID1))).to.not.be.ok

                await store.promise(map.set(LANG, ID1, TEXT1))
                await store.promise(map.set(LANG, ID2, TEXT2))
                expect(await store.promise(map.exists(LANG, ID1))).to.be.ok
                expect(await store.promise(map.exists(LANG, ID2))).to.be.ok
                expect(await store.promise(map.get(LANG, ID1))).to.equal(TEXT1)
                expect(await store.promise(map.get(LANG, ID2))).to.equal(TEXT2)

                await store.promise(map.remove(LANG, ID1))
                expect(await store.promise(map.exists(LANG, ID1))).to.not.be.ok
                expect(await store.promise(map.exists(LANG, ID2))).to.be.ok

                await store.promise(map.remove(LANG, ID2))
                expect(await store.promise(map.exists(LANG, ID2))).to.not.be.ok

                await store.promise(map.inc(LANG, 'counter'))
                expect(await store.promise(map.get(LANG, 'counter'))).to.equal(1)
                await store.promise(map.inc(LANG, 'counter'))
                expect(await store.promise(map.get(LANG, 'counter'))).to.equal(2)
            })

            it('RedisSortedSet should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const SCORE1 = 1.1
                const SCORE2 = 2.1
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const sortedSet = new RedisSortedSet({key: 'sorted.text', valueType: 'text'})

                expect(await store.promise(sortedSet.size())).to.equal(0)
                expect(await store.promise(sortedSet.getList())).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(true))).to.deep.equal([])

                await store.promise(sortedSet.put(SCORE2, TEXT2))
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                expect(await store.promise(sortedSet.size())).to.equal(2)
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getList(true))).to.deep.equal([TEXT1, '1.1', TEXT2, '2.1'])
                expect(await store.promise(sortedSet.getTopOne())).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTopOne(true))).to.deep.equal([TEXT2, '2.1'])
                expect(await store.promise(sortedSet.getTop(1))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTop(1, true))).to.deep.equal([TEXT2, '2.1'])
                expect(await store.promise(sortedSet.getTop(2))).to.deep.equal([TEXT2, TEXT1])
                expect(await store.promise(sortedSet.getTop(2, true))).to.deep.equal([TEXT2, '2.1', TEXT1, '1.1'])
                expect(await store.promise(sortedSet.getBottom(1))).to.deep.equal([TEXT1])
                expect(await store.promise(sortedSet.getBottom(1, true))).to.deep.equal([TEXT1, '1.1'])
                expect(await store.promise(sortedSet.getBottom(2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getBottom(2, true))).to.deep.equal([TEXT1, '1.1', TEXT2, '2.1'])

                await store.promise(sortedSet.remove(TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT2])

                await store.promise(sortedSet.put(SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(SCORE2, TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([])

                await store.promise(sortedSet.put(SCORE2, TEXT2))
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                await store.promise(sortedSet.removeBottom(2))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.removeBottom(1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT2])
                await store.promise(sortedSet.removeBottom(0))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([])

                await store.promise(sortedSet.put(SCORE2, TEXT2))
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT2])

                await store.promise(sortedSet.clear())
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                await store.promise(sortedSet.put(SCORE2, TEXT2))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.inc(SCORE2, TEXT1))
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT2, TEXT1])


            })

            it('RedisIdToSortedSet should execute all functions as expected:', async() => {

                const store = new Store(redis.createClient())
                const NUMBERS = 'numbers'
                const SCORE1 = 1
                const SCORE2 = 2
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const sortedSet = new RedisIdToSortedSet('sorted:${setId}')

                expect(await store.promise(sortedSet.size(NUMBERS))).to.equal(0)
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(NUMBERS, true))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, SCORE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                expect(await store.promise(sortedSet.size(NUMBERS))).to.equal(2)
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getList(NUMBERS, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])
                expect(await store.promise(sortedSet.getTopOne(NUMBERS))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTopOne(NUMBERS, true))).to.deep.equal([TEXT2, '2'])
                expect(await store.promise(sortedSet.getTop(NUMBERS, 1))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTop(NUMBERS, 1, true))).to.deep.equal([TEXT2, '2'])
                expect(await store.promise(sortedSet.getTop(NUMBERS, 2))).to.deep.equal([TEXT2, TEXT1])
                expect(await store.promise(sortedSet.getTop(NUMBERS, 2, true))).to.deep.equal([TEXT2, '2', TEXT1, '1'])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, 1))).to.deep.equal([TEXT1])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, 1, true))).to.deep.equal([TEXT1, '1'])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, 2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, 2, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])

                await store.promise(sortedSet.remove(NUMBERS, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT2])

                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(NUMBERS, SCORE2, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, SCORE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                await store.promise(sortedSet.removeBottom(NUMBERS, 2))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.removeBottom(NUMBERS, 1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT2])
                await store.promise(sortedSet.removeBottom(NUMBERS, 0))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, SCORE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(NUMBERS, SCORE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT2])

                await store.promise(sortedSet.clear(NUMBERS))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                await store.promise(sortedSet.put(NUMBERS, SCORE2, TEXT2))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.inc(NUMBERS, SCORE2, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS))).to.deep.equal([TEXT2, TEXT1])
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
                    allInAList: ['one', 'two'],
                    createAListHere: [1, 1, {hasOne: 1, description: 'hello'}]
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

            before(async() => {
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
                    loadMap[userId] = {
                        settings: users.settings.getMap(userId),
                        friends: users.friends.getList(userId)
                    }
                })
                const userMap = await store.promise(loadMap)

                expect(userMap).to.deep.equal({
                    "U1": {
                        settings: {name: 'USER1'},
                        friends: ['U2']
                    },
                    "U2": {
                        settings: {name: 'USER2'},
                        friends: ['U1']
                    }
                })
            })
        })

    })

})

