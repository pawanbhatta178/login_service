const fs = require('fs').promises;

const { BloomFilter } = require("bloomfilter");
const emails = require('./data/emails.json');
const usernames = require('./data/usernames.json');
const usernameOrEmailPW = require('./data/usernamepw.json');

let typedArrayEmails = new Int32Array(emails);
const BloomFilterEmails = new BloomFilter(typedArrayEmails, 16);

let typedArrayUsernames = new Int32Array(usernames);
const BloomFilterUsernames = new BloomFilter(typedArrayUsernames, 16);

let typedArrayUEPW = new Int32Array(usernameOrEmailPW);
const BloomFilterUsernameOrEmailPW = new BloomFilter(typedArrayUEPW, 16);


const addEmailToBF =  ({email}) => {
    BloomFilterEmails.add(email);
    // const emails = [].slice.call(BloomFilterEmails.buckets),
    //     updatedEmails = JSON.stringify(emails);
    // try {
    //     await fs.writeFile('./data/emails.json', updatedEmails);
    // }
    // catch (err) {
    //     console.log("Error writing to emails.json")
    // }
}

const addUsernameToBF = ({username}) => {
    BloomFilterUsernames.add(username);
    // const usernames = [].slice.call(BloomFilterUsernames.buckets),
    //     updatedUsernames = JSON.stringify(usernames);
    // try {
    //     await fs.writeFile('./data/usernames.json', updatedUsernames);
    // }
    // catch (err) {
        
    // }
}

const addUserToBF = ({ username, email, password }) => {
    if (username) {
        addUsernameToBF({ username });
        BloomFilterUsernameOrEmailPW.add(username+password);
    }
    if (email) {
        addEmailToBF({ email });
        BloomFilterUsernameOrEmailPW.add(email+password);
    }
    // const usernamePW = [].slice.call(BloomFilterUsernameOrEmailPW.buckets),
    //     updatedUsernamePW = JSON.stringify(usernamePW);
    // try {
    //     await fs.writeFile('./data/usernamepw.json', updatedUsernamePW);
    // }
    // catch (err) {
        
    // }
}

const usernameExists = ({username}) => {
    return BloomFilterUsernames.test(username);
}

const emailExists = ({email}) => {
    return BloomFilterEmails.test(email);
}

const userExists = ({ email, username, password }) => {
    if (email) {
        return BloomFilterUsernameOrEmailPW.test(email+password);
    }
    if (username) {
        return BloomFilterUsernameOrEmailPW.test(username+password);
    }
    return false;
}

const saveBfState = () => {
    const emails = [].slice.call(BloomFilterEmails.buckets),
    updatedEmails = JSON.stringify(emails);
    fs.writeFile('./data/emails.json', updatedEmails);
    const usernames = [].slice.call(BloomFilterUsernames.buckets),
    updatedUsernames = JSON.stringify(usernames);
    fs.writeFile('./data/usernames.json', updatedUsernames);
    const usernamePW = [].slice.call(BloomFilterUsernameOrEmailPW.buckets),
    updatedUsernamePW = JSON.stringify(usernamePW);
    fs.writeFile('./data/usernamepw.json', updatedUsernamePW);
}

module.exports = {
    addUserToBF,
    usernameExists,
    emailExists,
    userExists,
    saveBfState
}