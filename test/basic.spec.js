const chai = require('chai')
const expect = chai.expect

const redis = require('fakeredis')

const implementations = [
    {name: 'Redis implementation', implementation: require('..')},
    {name: 'Mock implementation', implementation: require('..').Mock}
]

implementations.forEach(function ({name, implementation}) {
    const {Store, RedisSet, RedisSortedSet, RedisMap, RedisIdToValue, RedisIdPairToValue, RedisIdToSet, RedisIdToSortedSet, RedisIdPairToSortedSet, RedisIdsToSortedSet, RedisIdToMap, RedisIdPairToMap, RedisList} = implementation

    describe(name + ":", function () {
        this.timeout(0)

        describe('collections:', () => {

            it('RedisList should execute all functions as expected:', async () => {
                // if(!RedisList) return

                const store = new Store(redis.createClient())
                const VALUE1 = 'one'
                const VALUE2 = 'two'
                const VALUE3 = 'three'
                const list = new RedisList('numbers')


                expect(await store.promise(list.exists())).to.not.be.ok
                expect(await store.promise(list.getAll())).to.deep.equal([])
                expect(await store.promise(list.getLength())).to.equal(0)
                expect(await store.promise(list.getLeft())).to.deep.equal([])
                expect(await store.promise(list.getRight())).to.deep.equal([])
                expect(await store.promise(list.get(0))).to.equal(null)
                expect(await store.promise(list.popLeft())).to.equal(null)
                expect(await store.promise(list.popRight())).to.equal(null)


                await store.promise(list.pushLeft(VALUE1))
                await store.promise(list.pushLeft(VALUE2, VALUE3))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE3, VALUE2, VALUE1])
                await store.promise(list.set(0, VALUE1))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE1, VALUE2, VALUE1])
                await store.promise(list.keep(0, 1))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE1, VALUE2])
                await store.promise(list.trimRight(1))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE1])
                await store.promise(list.trimLeft(1))
                expect(await store.promise(list.getAll())).to.deep.equal([])

                await store.promise(list.pushRight(VALUE1, VALUE1, VALUE3))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE1, VALUE1, VALUE3])
                await store.promise(list.removeAll(VALUE1))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE3])
                await store.promise(list.removeLast(VALUE3))
                expect(await store.promise(list.getAll())).to.deep.equal([])
                await store.promise(list.set(2, VALUE3))
                expect(await store.promise(list.getAll())).to.deep.equal([])
                await store.promise(list.set(0, VALUE1))
                expect(await store.promise(list.getAll())).to.deep.equal([])
                await store.promise(list.pushLeft(VALUE1))
                await store.promise(list.set(0, VALUE3))
                expect(await store.promise(list.getAll())).to.deep.equal([VALUE3])
                expect(await store.promise(list.exists())).to.be.ok
                expect(await store.promise(list.getLength())).to.equal(1)
                await store.promise(list.clear())
                expect(await store.promise(list.getAll())).to.deep.equal([])
                expect(await store.promise(list.exists())).to.not.be.ok
            })

            it('RedisSet should execute all functions as expected:', async () => {

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

            it('RedisIdToSet should execute all functions as expected:', async () => {

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

            it('RedisMap should execute all functions as expected:', async () => {

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

            it('RedisIdToMap should execute all functions as expected:', async () => {

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

            it('RedisIdPairToMap should execute all functions as expected:', async () => {

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

                let keys = await store.promise(idToMap.findKeys(EN_LANG_ID))
                expect(keys.sort()).to.deep.equal(["translate:" + EN_LANG_ID + ":" + NUMBERS_TOPIC_ID].sort())
                for (const key of keys) {
                    const idPair = idToMap.toIds(key)
                    expect(await store.promise(idToMap.exists(...idPair)))
                }

                keys = await store.promise(idToMap.findKeys())
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

            it('RedisIdToValue should execute all functions as expected:', async () => {

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

                const keys = await store.promise(map.findKeys())
                expect(keys.sort()).to.deep.equal(["id.to.text:" + ID1, "id.to.text:" + ID2].sort())
                for (const key of keys) {
                    const id = map.toId(key)
                    expect(await store.promise(map.exists(id)))
                }

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

            it('RedisIdPairToValue should execute all functions as expected:', async () => {

                const store = new Store(redis.createClient())
                const LANG = 'en'
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

                let keys = await store.promise(map.findKeys(LANG))
                expect(keys.sort()).to.deep.equal([
                    "id.to.text:" + LANG + ":" + ID1,
                    "id.to.text:" + LANG + ":" + ID2
                ].sort())
                for (const key of keys) {
                    const idPair = map.toIds(key)
                    expect(await store.promise(map.exists(...idPair)))
                }

                keys = await store.promise(map.findKeys())
                expect(keys.sort()).to.deep.equal([
                    "id.to.text:" + LANG + ":" + ID1,
                    "id.to.text:" + LANG + ":" + ID2
                ].sort())
                for (const key of keys) {
                    const idPair = map.toIds(key)
                    expect(await store.promise(map.exists(...idPair)))
                }

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

            it('RedisSortedSet should execute all functions as expected:', async () => {

                const store = new Store(redis.createClient())
                const SCORE1 = 1.1
                const SCORE2 = 2.1
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const sortedSet = new RedisSortedSet({key: 'sorted.text', valueType: 'text'})

                expect(await store.promise(sortedSet.size())).to.equal(0)
                expect(await store.promise(sortedSet.getList())).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(false, 2))).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(true))).to.deep.equal([])

                await store.promise(sortedSet.put(SCORE1, TEXT2))
                await store.promise(sortedSet.put(SCORE2, TEXT2))
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                expect(await store.promise(sortedSet.size())).to.equal(2)
                expect(await store.promise(sortedSet.getList())).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getList(false, 2))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getList(false, 1, 2))).to.deep.equal([TEXT1])
                expect(await store.promise(sortedSet.getList(true))).to.deep.equal([TEXT1, '1.1', TEXT2, '2.1'])
                expect(await store.promise(sortedSet.getList(true, 2))).to.deep.equal([TEXT2, '2.1'])
                expect(await store.promise(sortedSet.getList(true, 1, 2))).to.deep.equal([TEXT1, '1.1'])
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
                expect(await store.promise(sortedSet.getRank(TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getScore(TEXT1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(TEXT2))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getRange(0, 2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getRange(0, 2, true))).to.deep.equal([TEXT1, '1.1', TEXT2, '2.1'])

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

                await store.promise(sortedSet.clear())
                await store.promise(sortedSet.put(SCORE1, TEXT1))
                await store.promise(sortedSet.put(SCORE1, TEXT2))
                await store.promise(sortedSet.put(SCORE2, 'x'))
                await store.promise(sortedSet.put(SCORE2, 'y'))
                expect(await store.promise(sortedSet.getRank(TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getRank('x'))).to.equal(2)
                expect(await store.promise(sortedSet.getRank('y'))).to.equal(3)
                expect(await store.promise(sortedSet.getRank('z'))).to.equal(null)
                expect(await store.promise(sortedSet.getScore(TEXT1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(TEXT2))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore('x'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore('y'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore('z'))).to.equal(null)
            })

            it('RedisIdToSortedSet should execute all functions as expected:', async () => {

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

                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT2))
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
                expect(await store.promise(sortedSet.getRank(NUMBERS, TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(NUMBERS, TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, TEXT1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, TEXT2))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getRange(NUMBERS, 0, 2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getRange(NUMBERS, 0, 2, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])

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

                await store.promise(sortedSet.clear(NUMBERS))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT1))
                await store.promise(sortedSet.put(NUMBERS, SCORE1, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, SCORE2, 'x'))
                await store.promise(sortedSet.put(NUMBERS, SCORE2, 'y'))
                expect(await store.promise(sortedSet.getRank(NUMBERS, TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(NUMBERS, TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getRank(NUMBERS, 'x'))).to.equal(2)
                expect(await store.promise(sortedSet.getRank(NUMBERS, 'y'))).to.equal(3)
                expect(await store.promise(sortedSet.getRank(NUMBERS, 'z'))).to.equal(null)
                expect(await store.promise(sortedSet.getScore(NUMBERS, TEXT1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, TEXT2))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, 'x'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore(NUMBERS, 'y'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore(NUMBERS, 'z'))).to.equal(null)

                const keys = await store.promise(sortedSet.findKeys())
                expect(keys.sort()).to.deep.equal(["sorted:" + NUMBERS].sort())
                for (const key of keys) {
                    const idPair = sortedSet.toIds(key)
                    expect(await store.promise(sortedSet.exists(...idPair)))
                }

            })

            it('RedisIdPairToSortedSet should execute all functions as expected:', async () => {

                const store = new Store(redis.createClient())
                const NUMBERS = 'numbers'
                const LANG = 'en'
                const VALUE1 = 1
                const VALUE2 = 2
                const TEXT1 = 'one'
                const TEXT2 = 'two'
                const sortedSet = new RedisIdPairToSortedSet('sorted:${groupId}:${typeId}')

                expect(await store.promise(sortedSet.size(NUMBERS, LANG))).to.equal(0)
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG, true))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                expect(await store.promise(sortedSet.size(NUMBERS, LANG))).to.equal(2)
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])
                expect(await store.promise(sortedSet.getTopOne(NUMBERS, LANG))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTopOne(NUMBERS, LANG, true))).to.deep.equal([TEXT2, '2'])
                expect(await store.promise(sortedSet.getTop(NUMBERS, LANG, 1))).to.deep.equal([TEXT2])
                expect(await store.promise(sortedSet.getTop(NUMBERS, LANG, 1, true))).to.deep.equal([TEXT2, '2'])
                expect(await store.promise(sortedSet.getTop(NUMBERS, LANG, 2))).to.deep.equal([TEXT2, TEXT1])
                expect(await store.promise(sortedSet.getTop(NUMBERS, LANG, 2, true))).to.deep.equal([TEXT2, '2', TEXT1, '1'])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, LANG, 1))).to.deep.equal([TEXT1])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, LANG, 1, true))).to.deep.equal([TEXT1, '1'])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, LANG, 2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getBottom(NUMBERS, LANG, 2, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, TEXT1))).to.equal(VALUE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, TEXT2))).to.equal(VALUE2)
                expect(await store.promise(sortedSet.getRange(NUMBERS, LANG, 0, 2))).to.deep.equal([TEXT1, TEXT2])
                expect(await store.promise(sortedSet.getRange(NUMBERS, LANG, 0, 2, true))).to.deep.equal([TEXT1, '1', TEXT2, '2'])

                let keys = await store.promise(sortedSet.findKeys(NUMBERS))
                expect(keys.sort()).to.deep.equal(["sorted:" + NUMBERS + ":" + LANG].sort())
                for (const key of keys) {
                    const idPair = sortedSet.toIds(key)
                    expect(await store.promise(sortedSet.exists(...idPair)))
                }

                keys = await store.promise(sortedSet.findKeys())
                expect(keys.sort()).to.deep.equal(["sorted:" + NUMBERS + ":" + LANG].sort())
                for (const key of keys) {
                    const idPair = sortedSet.toIds(key)
                    expect(await store.promise(sortedSet.exists(...idPair)))
                }


                await store.promise(sortedSet.remove(NUMBERS, LANG, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT2])

                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(NUMBERS, LANG, VALUE2, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                await store.promise(sortedSet.removeBottom(NUMBERS, LANG, 2))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.removeBottom(NUMBERS, LANG, 1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT2])
                await store.promise(sortedSet.removeBottom(NUMBERS, LANG, 0))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([])

                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT1, TEXT2])

                await store.promise(sortedSet.removeBelow(NUMBERS, LANG, VALUE1, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT2])

                await store.promise(sortedSet.clear(NUMBERS, LANG))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, TEXT2))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT1, TEXT2])
                await store.promise(sortedSet.inc(NUMBERS, LANG, VALUE2, TEXT1))
                expect(await store.promise(sortedSet.getList(NUMBERS, LANG))).to.deep.equal([TEXT2, TEXT1])

                await store.promise(sortedSet.clear(NUMBERS, LANG))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT1))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE1, TEXT2))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, 'x'))
                await store.promise(sortedSet.put(NUMBERS, LANG, VALUE2, 'y'))
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, TEXT1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, TEXT2))).to.equal(1)
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, 'x'))).to.equal(2)
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, 'y'))).to.equal(3)
                expect(await store.promise(sortedSet.getRank(NUMBERS, LANG, 'z'))).to.equal(null)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, TEXT1))).to.equal(VALUE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, TEXT2))).to.equal(VALUE1)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, 'x'))).to.equal(VALUE2)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, 'y'))).to.equal(VALUE2)
                expect(await store.promise(sortedSet.getScore(NUMBERS, LANG, 'z'))).to.equal(null)
            })

            it('RedisIdsToSortedSet should execute all functions as expected:', async () => {

                const store = new Store(redis.createClient())
                // const NUMBERS = 'numbers'
                // const LANG = 'en'
                const ids = ["A", "B", "C"]
                const SCORE1 = 1
                const SCORE2 = 2
                const VALUE1 = 'one'
                const VALUE2 = 'two'
                const sortedSet = new RedisIdsToSortedSet('sorted:${id1}:${id2}:${id3}')

                expect(await store.promise(sortedSet.size(ids))).to.equal(0)
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([])
                expect(await store.promise(sortedSet.getList(ids, true))).to.deep.equal([])

                await store.promise(sortedSet.put(ids,SCORE1,VALUE2))
                await store.promise(sortedSet.put(ids,SCORE2,VALUE2))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                expect(await store.promise(sortedSet.size(ids))).to.equal(2)
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE1, VALUE2])
                expect(await store.promise(sortedSet.getList(ids, true))).to.deep.equal([VALUE1, '1', VALUE2, '2'])
                expect(await store.promise(sortedSet.getTopOne(ids))).to.deep.equal([VALUE2])
                expect(await store.promise(sortedSet.getTopOne(ids, true))).to.deep.equal([VALUE2, '2'])
                expect(await store.promise(sortedSet.getTop(ids, 1))).to.deep.equal([VALUE2])
                expect(await store.promise(sortedSet.getTop(ids, 1, true))).to.deep.equal([VALUE2, '2'])
                expect(await store.promise(sortedSet.getTop(ids, 2))).to.deep.equal([VALUE2, VALUE1])
                expect(await store.promise(sortedSet.getTop(ids, 2, true))).to.deep.equal([VALUE2, '2', VALUE1, '1'])
                expect(await store.promise(sortedSet.getBottom(ids, 1))).to.deep.equal([VALUE1])
                expect(await store.promise(sortedSet.getBottom(ids, 1, true))).to.deep.equal([VALUE1, '1'])
                expect(await store.promise(sortedSet.getBottom(ids, 2))).to.deep.equal([VALUE1, VALUE2])
                expect(await store.promise(sortedSet.getBottom(ids, 2, true))).to.deep.equal([VALUE1, '1', VALUE2, '2'])
                expect(await store.promise(sortedSet.getRank(ids, VALUE1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(ids, VALUE2))).to.equal(1)
                expect(await store.promise(sortedSet.getScore(ids, VALUE1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(ids, VALUE2))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getRange(ids, 0, 2))).to.deep.equal([VALUE1, VALUE2])
                expect(await store.promise(sortedSet.getRange(ids, 0, 2, true))).to.deep.equal([VALUE1, '1', VALUE2, '2'])

                let keys = await store.promise(sortedSet.findKeys("A"))
                expect(keys.sort()).to.deep.equal(["sorted:A:B:C"].sort())
                for (const key of keys) {
                    const idList = sortedSet.toIds(key)
                    expect(await store.promise(sortedSet.exists(idList)))
                }

                keys = await store.promise(sortedSet.findKeys())
                expect(keys.sort()).to.deep.equal(["sorted:A:B:C"].sort())
                for (const key of keys) {
                    const idList = sortedSet.toIds(key)
                    expect(await store.promise(sortedSet.exists(idList)))
                }


                await store.promise(sortedSet.remove(ids, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE2])

                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE1, VALUE2])

                await store.promise(sortedSet.removeBelow(ids, SCORE2, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([])

                await store.promise(sortedSet.put(ids, SCORE2, VALUE2))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                await store.promise(sortedSet.removeBottom(ids, 2))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE1, VALUE2])
                await store.promise(sortedSet.removeBottom(ids, 1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE2])
                await store.promise(sortedSet.removeBottom(ids, 0))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([])

                await store.promise(sortedSet.put(ids, SCORE2, VALUE2))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE1, VALUE2])

                await store.promise(sortedSet.removeBelow(ids, SCORE1, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE2])

                await store.promise(sortedSet.clear(ids))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                await store.promise(sortedSet.put(ids, SCORE2, VALUE2))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE1, VALUE2])
                await store.promise(sortedSet.inc(ids, SCORE2, VALUE1))
                expect(await store.promise(sortedSet.getList(ids))).to.deep.equal([VALUE2, VALUE1])

                await store.promise(sortedSet.clear(ids))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE1))
                await store.promise(sortedSet.put(ids, SCORE1, VALUE2))
                await store.promise(sortedSet.put(ids, SCORE2, 'x'))
                await store.promise(sortedSet.put(ids, SCORE2, 'y'))
                expect(await store.promise(sortedSet.getRank(ids, VALUE1))).to.equal(0)
                expect(await store.promise(sortedSet.getRank(ids, VALUE2))).to.equal(1)
                expect(await store.promise(sortedSet.getRank(ids, 'x'))).to.equal(2)
                expect(await store.promise(sortedSet.getRank(ids, 'y'))).to.equal(3)
                expect(await store.promise(sortedSet.getRank(ids, 'z'))).to.equal(null)
                expect(await store.promise(sortedSet.getScore(ids, VALUE1))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(ids, VALUE2))).to.equal(SCORE1)
                expect(await store.promise(sortedSet.getScore(ids, 'x'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore(ids, 'y'))).to.equal(SCORE2)
                expect(await store.promise(sortedSet.getScore(ids, 'z'))).to.equal(null)
            })
        })

        describe('multiple commands:', () => {

            it('save multiple', async () => {
                const store = new Store(redis.createClient())
                const numbers = new RedisSet('numbers')

                await store.promise([
                    numbers.add('two'),
                    numbers.add('one')
                ])

                const all = await store.promise(numbers.getList())
                expect(all.sort()).to.deep.equal(['one', 'two'].sort())
            })

            it('load multiple', async () => {
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

            it('load into map', async () => {
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

            it('load into structure', async () => {
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

            before(async () => {
                const createUsers = [
                    users.list.addAll(["U1", "U2"]),
                    users.settings.setAll("U1", {name: "USER1"}),
                    users.settings.setAll("U2", {name: "USER2"}),
                    users.friends.add("U1", "U2"),
                    users.friends.add("U2", "U1")
                ]
                await store.promise(createUsers)
            })

            it('create a combined list', async () => {
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
            it('create a combined map', async () => {
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

