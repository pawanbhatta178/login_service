const addPrefixToRedisKey = ({prefixName,key}) => {
    return `${prefixName}:${key}`;
}
module.exports={addPrefixToRedisKey}