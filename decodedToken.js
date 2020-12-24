const jwt = require('jsonwebtoken');
const decodedToken = (headers, requireAuth = true) => {
  const header =  headers.authorization;
    console.log(headers);
  if (header){
    const token = header.replace('Bearer ', '');
      const decoded = jwt.verify(token, 'supersecret');
      console.log(decoded);
    return decoded;
  }
  if (requireAuth) {
    throw new Error('Login in to access resource');
  } 
  return null
}
module.exports = { decodedToken }