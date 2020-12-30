const { BloomFilter } = require("bloomfilter");
const {redisKeys}=require("../config/keys");

const { get, set, exists } = require("../config/redis");

const { authsKey, emailsKey,usernamesKey} = redisKeys;


let emailsBloomFilter = new BloomFilter(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
);
let usernamesBloomFilter = new BloomFilter(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
);
let authBloomFilter = new BloomFilter(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
);


const createBloomFilterFromJSON = (json) => {
    let typedArray = new Int32Array(json);
    const bf = new BloomFilter(typedArray, 16);
    return bf;
}


const getBfInstanceFromRedisData = async (redisKey) => {
    const data = await get(redisKey);
    const json = JSON.parse(data);
    return createBloomFilterFromJSON(json);
}



const init = async () => {
    if ((await exists(emailsKey))===1) {
        emailsBloomFilter = await getBfInstanceFromRedisData(emailsKey);
    }
    if ((await exists(usernamesKey)) === 1) {
        usernamesBloomFilter = await getBfInstanceFromRedisData(usernamesKey);
    }
    if ((await exists(authsKey)) === 1) {
        authBloomFilter = await getBfInstanceFromRedisData(authsKey);
    }
  }
init().then(res => {
    // console.log(emailsBloomFilter.buckets);
    // console.log(usernameExists({ username: "pawan" }));
    // console.log(userExists({email:"pawan@gmail.com",password:"pawan"}))
    // console.log(userExists({username:"pawan",password:"pawan"}))
 });


const reset = async () => {
    emailsBloomFilter = new BloomFilter(
        32 * 256, // number of bits to allocate.
        16        // number of hash functions.
    );
    usernamesBloomFilter = new BloomFilter(
        32 * 256, // number of bits to allocate.
        16        // number of hash functions.
    );
     authBloomFilter = new BloomFilter(
        32 * 256, // number of bits to allocate.
        16        // number of hash functions.
     );
    saveBfStatesToRedis();
}


const saveBfStatesToRedis = async () => {
    // Serialisation. Note that bloom.buckets may be a typed array,
    // so we convert to a normal array first.
    const emails = [].slice.call(emailsBloomFilter.buckets),
        stringJson1 = JSON.stringify(emails);
    const resEmail = await set(emailsKey, stringJson1);
    const usernames = [].slice.call(usernamesBloomFilter.buckets),
        stringJson2 = JSON.stringify(usernames);
    const resUsername = await set(usernamesKey, stringJson2);
    const auths = [].slice.call(authBloomFilter.buckets),
    stringJson3 = JSON.stringify(auths);
     const resAuths = await set(authsKey, stringJson3);
   
}


const addUsernameToBF = ({ username }) => {
    usernamesBloomFilter.add(username);
}

const addEmailToBF = ({ email }) => {
    emailsBloomFilter.add(email);
}

const addUserToBF = ({ username, email, password }) => {
    if (username) {
        addUsernameToBF({ username });
        authBloomFilter.add(username+password);
    }
    if (email) {
        addEmailToBF({ email });
        authBloomFilter.add(email+password);
    }
    saveBfStatesToRedis();
}

const usernameExists = ({username}) => {
    return usernamesBloomFilter.test(username);
}

const emailExists = ({email}) => {
    return emailsBloomFilter.test(email);
}

 
const userExists = ({ email, username, password }) => {
    if (email) {
        return authBloomFilter.test(email+password);
    }
    if (username) {
        return authBloomFilter.test(username+password);
    }
    return false;
}

module.exports = {
    addUserToBF,
    usernameExists,
    emailExists,
    userExists,
    reset
}
