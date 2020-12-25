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



const addEmailToBF = ({email}) => {
    BloomFilterEmails.add(email);
}

const addUsernameToBF = ({username}) => {
    BloomFilterUsernames.add(username);
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

module.exports = {
    addUserToBF,
    usernameExists,
    emailExists,
    userExists
}