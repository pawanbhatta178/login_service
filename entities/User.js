const { v4: uuidv4 } = require('uuid');
const {db} =require("./db");

class users{//schema must match table name in database
    constructor({ username, email, password, country, displayname }) {
    this.id=uuidv4();
    this.username = username;
    this.email = email;
    this.password = password;
    this.country = country;
    this.displayname = displayname;
}
}

const User=({username,password,email,country,displayname})=>{
    const user = new users({ username, email, password, country, displayname });
    
    return {
        ...db( user ),
    }
    
}
// User({}).findAllWith({country:"nepal"}).then(res=>console.log(res));

module.exports = { User };
