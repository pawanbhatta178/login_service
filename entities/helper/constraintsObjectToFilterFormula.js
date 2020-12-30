const constraintsToFilterFormula = (object) => {
    let filterFormula = ``;
    const keys = Object.keys(object);
    const values = Object.values(object);
    keys.forEach((key, index) => {
        if (index === keys.length-1) {//last constraint
            filterFormula=filterFormula+`${key}='${values[index]}'`
        }
        else {
            filterFormula=filterFormula+`${key}='${values[index]}' AND `
        }
       
    })
    return filterFormula;
}
module.exports = constraintsToFilterFormula;