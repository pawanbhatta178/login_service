const setHttpOnlyCookie = (response, {name, value}) => {
    return response.cookie(name, value, {
        maxAge: 20*24*60*60*1000,//20 days
        httpOnly: true
        });
}

module.exports = {
    setHttpOnlyCookie
}