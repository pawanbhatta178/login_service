require('dotenv').config()

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

app.use(express.json());
const pool = require('./config/database');
const port = process.env.port || 3000;

const {addUserToBF,usernameExists,emailExists,userExists } = require('./bloomfilter/index');
    
const main = async () => {
    try {
        //making db connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("🚀  Pg running: Executing SELECT NOW() -> ", rows);

    
        app.post('/login', (req, res) => {
            const user = {
                email:req.body?.email,
                username: req.body?.username,
                password:req.body.password
            };
            //bloomFilterCheck
            if (!userExists(user)) {
                return res.status(400).json({
                    status: 'error',
                    error: 'username/email or password incorrectly entered',
                });
            };


            //dbCheck

            // bcrypt.compareSync("B4c0/\/", hash); // true

            //returning token
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({token})
          })

        app.post('/register', (req, res) => {

            const user = {
                username: req.body?.username,
                email: req.body?.email,
                password: req.body.password,
                country:req.body.country
            };

            if (emailExists(user)) {  //not a good idea but works with high probabilty
                return res.status(400).json({
                    status: 'error',
                    error: 'email already registered',
                });
            }
            
            if (usernameExists(user)) {
                return res.status(400).json({
                    status: 'error',
                    error: 'username already taken',
                });
            }



           //adding user to bloom filter if email and username are unique
            addUserToBF(user);


           //hashing user password
           const hashedPW = bcrypt.hashSync(user.password, salt);
            console.log(hashedPW);
            //adding to db



            //returning token
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
             res.send({token})
        })


        //running server 
      app.listen(port, console.log(`listening on ${port}`))
    }
    catch (err) {
        console.log("Sth wrong with db connection: ERROR: ", err);
    }
}
main();