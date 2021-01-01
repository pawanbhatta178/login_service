const { UserInputError } = require("apollo-server");
const { Mailer } = require("../config/Mailer");
const { setex, get} = require("../config/redis");
const { User } = require("./User");
const { addPrefixToRedisKey } = require("./helper/addPrefixToRedisKey");
const {  randomNumGenerator } = require("./helper/randomNumGenerator");
const prefixName = "confirmEmail";
const expiryTime = 60 * 10;//10 minutes
const numLength = 6;

const Email = ({ userId }) => {
    const keyName = addPrefixToRedisKey({ prefixName, key: userId });
    return {
        setVerificationCode: async () => {
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
        sendVerificationCode: async ({ email, code }) => {
            try {
               const sent= Mailer({ receiver: email, code });
                return sent;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        },
        verifyCode: async ({ code }) => {
            try {
                const rightCode = await get(keyName);
                if (rightCode === code) {//if code matches
                const updatedRow= await User({}).updateOneWith({id:userId},{isverified:true})
                    if (updatedRow.length === 0) {
                        return false;
                     }
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
// Email({ userId: "4591ce9d-40bb-4e18-a9cf-5142dfba0d9b" }).setVerificationCode().then(code => {
//     if (!code) {
//         console.log("Failed to set");
//         return;
//     }
//     Email({userId:"4591ce9d-40bb-4e18-a9cf-5142dfba0d9b"}).sendVerificationCode({code,email:"pawanbhatta179@gmail.com"}).then(res=>console.log(res))
// } );
// Email({ userId: "4591ce9d-40bb-4e18-a9cf-5142dfba0d9b" }).verifyCode({ code: "837945" }).then(res => {
//     console.log(res);
// })

module.exports = { Email }