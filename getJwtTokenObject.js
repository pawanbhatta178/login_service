const jwt = require('jsonwebtoken')


const filterJwtTokenContent= (completeDetail) => {
    return {
        id: completeDetail.id,
        username: completeDetail.username,
        displayName:completeDetail.displayname
    }
}
const generateAccessToken = (userDetail) => {
   const tokenContent= filterJwtTokenContent(userDetail);
   return jwt.sign(tokenContent, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'40s'});
}

const generateRefreshToken = (userDetail) => {
    const tokenContent=  filterJwtTokenContent(userDetail);
    return jwt.sign(tokenContent, process.env.REFRESH_TOKEN_SECRET);
}


module.exports = {
    generateAccessToken,
    generateRefreshToken
}