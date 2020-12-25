
const {
    addUserToBF,
    usernameExists,
    emailExists,
    userExists }= require('./bloomfilter/index');

const user1 = { email: "pawan@gmail.com", password: "pawan" };
const user2 = { username: "pawan123", password: "123" };
addUserToBF(user1);
addUserToBF(user2);
console.log(userExists(user1));
console.log(emailExists({ email: "pawan@gmail.com" }));
console.log(usernameExists({ username: "pawan123" }));
console.log(userExists(user2));
console.log(emailExists({ email: "pawan@gmail.co" }));
console.log(usernameExists({ username: "pawan12" }));


