const { sismember,scard,sadd , srem} = require("../config/redis");
const { addPrefixToRedisKey } = require("./helper/addPrefixToRedisKey");
const SESSION_PREFIX = 'userSession';

const SessionCache =  ({userId}) => {
   const keyName= addPrefixToRedisKey({ prefixName: SESSION_PREFIX, key: userId });
    return {
        add: async ({ sessionCode } ) => {
            try {
                const num = await sadd(keyName, sessionCode);
                if (num === 1) {
                    return {
                        added: true,
                        openSessions:await scard(keyName)
                    };
                }
                return false;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        },
        exists: async ({ sessionCode }) => {
            try {
                const res = await sismember(keyName,sessionCode);
                if (res === 1) {
                    return true;
                }
                return false;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        },
        delete: async ({ sessionCode }) => {
            try {
                const res = await srem(keyName,sessionCode);
                if (res === 1) {
                    return true;
                }
                return false;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        }
       
    } 
  
}

//tests
// SessionCache({ userId: "1" }).add({ sessionCode:"sessionasas"}).then(res => console.log(res))
// SessionCache({ userId: "1" }).add({ sessionCode:"sessionsaas"}).then(res=>console.log(res))
// SessionCache({ userId: "1" }).exists({ sessionCode:"sessionasas"}).then(res=>console.log(res))
// SessionCache({ userId: "1" }).delete({ sessionCode: "sessionsaas" }).then(res=>console.log(res))

module.exports = {
    SessionCache
}