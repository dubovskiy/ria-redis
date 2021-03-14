const config = require('config');
    const redis = require("redis");
    const util = require('util');

// Десь тут можна вказати параметри конекшина до redis-а
// config.redis.port
//const client = redis.createClient(config.redis.port);
const client = redis.createClient(config.redis.port);
client.on("error", function(error) {
    console.error(error);
  });


  client.get = util.promisify(client.get);
  client.mget = util.promisify(client.mget);
  client.keys = util.promisify(client.keys);
  client.del = util.promisify(client.del);
  client.incr = util.promisify(client.incr);


module.exports = {
    /**
     * Get all records from memory DB
     * @return {Promise}
     */
    getAll: async function getAllFromDb() {
        let  keys = await client.keys('*');
        keys = keys.filter(key => key !== 'max').sort((a, b) => b-a);
        const values = await client.mget(keys);
        return keys.map((key, index) => {
            const item = {};
            item[key] = values[index];
            return item;
        });
    },
    /**
     * Get record by id from memory DB
     * @param id
     * @return {Promise}
     */
    getById: async function getIdFromDb(id) {
        const item = {};
        item[id] = await client.get(id);
        return item;
    },
    /**
     * Add new record to memory DB
     * @param name
     * @return {Promise}
     */
    setNewId: async function setNewIdToDb(name) {
        const id = await client.get('max') || 0;
	if (!id) {
	    await client.set('max', '0');
	}
        await client.set(id, name);
        await client.incr('max');
        return await module.exports.getById(id);
    },
    /**
     * Update record into memory DB
     * @param id
     * @param name
     * @return {Promise}
     */
    updateId: async function updateIdToDb(id,name) {
        const isExist = await client.get(id);
        if (isExist) {
            await client.set(id, name);
            return await module.exports.getById(id);
        }
        return 'Client is not existed';
    },

    /**
     * Remove record from memory DB
     * @param id
     * @return {Promise}
     */
    removeId: async function removeIdInDb(id) {
        const result = await client.del(id);
        console.log(result === 1 ? 'Deleted' : 'Something went wrong');
    }
}