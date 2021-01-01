const getSetCondition = (object) => {
    let setCondition = ``;
    const keys = Object.keys(object);
    const values = Object.values(object);
    keys.forEach((key, index) => {
        if (index === keys.length-1) {//last constraint
            setCondition=setCondition+`${key}='${values[index]}'`
        }
        else {
            setCondition=setCondition+`${key}='${values[index]}', `
        }
       
    })
    return setCondition;
}
// console.log(getSetCondition({ isValid: true, name:"pawan" }));
module.exports = getSetCondition;