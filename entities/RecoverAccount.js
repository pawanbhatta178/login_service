const { setex, get} = require("../config/redis");
const { Mailer } = require("../config/Mailer");
const { addPrefixToRedisKey } = require("./helper/addPrefixToRedisKey");
const {  randomNumGenerator } = require("./helper/randomNumGenerator");
const prefixName = "recoverAccount";
const expiryTime = 60 * 10;//10 minutes
const numLength = 6;

const RecoverAccount = ({ id }) => {
    const keyName = addPrefixToRedisKey({ prefixName, key: id });
    return {
        generateRecoverKey: async () => {
            try {
                const setCode = await setex(keyName, expiryTime, randomNumGenerator({ length: numLength }).get());
                if (setCode === "OK") {
                    return await get(keyName);
                }
                return false;
            }
            catch (err) {
                console.log(res);
                return false;
            }
        },
        sendRecoverLink: async ({ email, url }) => {
            try {
               const sent= Mailer({ receiver: email, url });
                return sent;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        },
        recover: async ({ code }) => {
            try {
                const recoveryKey = await get(keyName);
                if (recoveryKey === code) {
                    return true;
                }
                return false;
            }
            catch (err) {
                return false;
            }
        }

    }
}

module.exports={RecoverAccount}