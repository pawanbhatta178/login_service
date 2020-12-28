const jwt = require('jsonwebtoken')


const getJwtTokenContent= (completeDetail) => {
    return {
        id: completeDetail.id,
        username: completeDetail.username,
        displayName:completeDetail.displayname
    }
}
const generateAccessToken = (userDetail) => {
   const tokenContent= getJwtTokenContent(userDetail);
   return jwt.sign(tokenContent, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20s'});
}

const generateRefreshToken = (userDetail) => {
    const tokenContent=  getJwtTokenContent(userDetail);
    return jwt.sign(tokenContent, process.env.REFRESH_TOKEN_SECRET);
}


module.exports = {
    generateAccessToken,
    generateRefreshToken
}