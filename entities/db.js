const pool=require('../config/database');
const { arrayToOrderList,arrayToOrderListWithQuote} = require('./helper/arrayToOrderList');
const constraintsToFilterFormula = require('./helper/constraintsObjectToFilterFormula');
const getSetCondition = require('./helper/getSetCondition');

//basic functionality of databases
const db = (model ) => {
    return {
        //saving to db
        save: async () => {
            const modelName = model.constructor.name;
            const keysArray = Object.keys(model);
            const valuesArray = Object.values(model);
        
            let query = `INSERT INTO ${modelName} ${arrayToOrderList(keysArray)} VALUES ${arrayToOrderListWithQuote(valuesArray)}  RETURNING *;`;
            try {
                const { rows } = await pool.query(query);
                return rows;
            }
            catch (err) {
                console.log(`[ERROR] while processing the query: ${query} \n`, err);
                return [];
            }
       
        },
        findOneWith: async (constraints) => {
            const tableName = model.constructor.name;
            let query = `SELECT * FROM ${tableName} where ${constraintsToFilterFormula(constraints)} LIMIT 1`;
            try {
                const { rows } = await pool.query(query);
                return rows;
            }
            catch (err) {
                console.log(`[ERROR] while processing the query: ${query} \n`, err);
                return [];
            }
        },
        findAllWith: async (constraints) => {
            const tableName = model.constructor.name;
            let query = `SELECT * FROM ${tableName} where ${constraintsToFilterFormula(constraints)}`;
            try {
                const { rows } = await pool.query(query);
                return rows;
            }
            catch (err) {
                console.log(`[ERROR] while processing the query: ${query} \n`, err);
                return [];
            }
        },
        deleteAllWith: async (constraints) => {
            const tableName = model.constructor.name;
            let query = `DELETE FROM ${tableName} where ${constraintsToFilterFormula(constraints)} RETURNING *`;
            try {
                const { rows } = await pool.query(query);
                return rows;
            }
            catch (err) {
                console.log(`[ERROR] while processing the query: ${query} \n`, err);
                return [];
            }

        },
        updateOneWith: async (filterConstraints, dataToUpdate ) => {
            const tableName = model.constructor.name;
            let query = `UPDATE ${tableName} SET ${getSetCondition(dataToUpdate)} where ${constraintsToFilterFormula(filterConstraints)} RETURNING *`;
            try {
                const { rows } = await pool.query(query);
                return rows;
            }
            catch (err) {
                console.log(`[ERROR] while processing the query: ${query} \n`, err);
                return [];
            }
        }

       
    }
}


module.exports={db}
