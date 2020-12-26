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
const { User } = require('./entities/User');
const main = async () => {
    try {
        //making db connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("🚀  [Postgres] Executing: SELECT NOW() -> ", rows);

    
        app.post('/login', async (req, res) => {
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
           const userData=await  User({}).findOneWith({email:user.email})
            if (userData.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'email/username does not exist',
                });
            }
            if (!bcrypt.compareSync(user.password, userData[0].password)) {
                return res.status(400).json({
                    status: 'error',
                    error: 'password is incorrect',
                });
            }; 

            //returning token
            const token = jwt.sign({ id:userData[0].id }, process.env.ACCESS_TOKEN_SECRET);
            res.send({token})
        })

        app.post('/register', async (req, res) => {

            const newUserData = {
                username: req.body?.username,
                email: req.body?.email,
                password: req.body.password,
                country: req.body.country,
                displayname:req.body.displayName
            };

            if (emailExists(newUserData)) {  //not a good idea but works with high probabilty
                return res.status(400).json({
                    status: 'error',
                    error: 'email already registered',
                });
            }
            
            if (usernameExists(newUserData)) {
                return res.status(400).json({
                    status: 'error',
                    error: 'username already taken',
                });
            }



           //adding user to bloom filter if email and username are unique
            addUserToBF(newUserData);


           //hashing user password
           const hashedPW = bcrypt.hashSync(newUserData.password, salt);
           
            const userDataWithHashPW = {
                ...newUserData,
                password:hashedPW
            }
            //adding to db
            const createdUser =await User(userDataWithHashPW).save();
            if (createdUser.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'email/username must be unique',
                });
            }
            //returning token
            const token = jwt.sign({ id:createdUser[0].id }, process.env.ACCESS_TOKEN_SECRET);
             res.send({token})
        })


        //running server 
        const server = app.listen(port, console.log(`🚀  Server running on ${port}`))
        
        
    }
    catch (err) {
        console.log("[Main] ERROR: ", err);
    }
}
main();