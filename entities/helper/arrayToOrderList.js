const arrayToOrderList = (array) => {
    let returnVal=`(`
    array.forEach((item,index) => {
        if (index === array.length - 1) {//last index
            returnVal = returnVal + `${item}`;
        }
        else {
            returnVal = returnVal + `${item},`;
        }
    });
    returnVal = returnVal + `)`;
    return returnVal;
}
const arrayToOrderListWithQuote = (array) => {
    let returnVal=`(`
    array.forEach((item,index) => {
        if (index === array.length - 1) {//last index
            returnVal = returnVal + `'${item}'`;
        }
        else {
            returnVal = returnVal + `'${item}',`;
        }
    });
    returnVal = returnVal + `)`;
    return returnVal;
}
module.exports = { arrayToOrderList, arrayToOrderListWithQuote };