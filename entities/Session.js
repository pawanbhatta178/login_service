

class sessions{//schema must match table name in database
    constructor({ userId, token }) {
        this.user_id=userId;
        this.token = token;
    }
}

const Session=({userId, token})=>{
    const session = new sessions({ userId,token });
    
    return {
        ...db( session ),
    }
    
}

module.exports = { Session};
