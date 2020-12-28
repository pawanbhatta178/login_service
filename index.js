require('dotenv').config()
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const salt = bcrypt.genSaltSync(10);

app.use(express.json());
app.use(cookieParser());

const pool = require('./config/database');
const port = process.env.port || 3000;

const {addUserToBF,usernameExists,emailExists,userExists } = require('./bloomfilter/index');
const { User } = require('./entities/User');
const { Session } = require('./entities/Session');
const { authenticateToken } = require('./middlewares/authenticateToken');
const { generateAccessToken, generateRefreshToken } = require('./getJwtTokenObject');
const { setHttpOnlyCookie } = require('./setHttpOnlyCookie');


const main = async () => {
    try {
        //making db connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("🚀  [Postgres] Executing: SELECT NOW() -> ", rows);

        app.get('/protected', authenticateToken,async (req, res) => {
            res.json(req.user);
            
        })


        app.post('/token',  (req, res) => {
            const refreshToken = req.body.token;
            if (refreshToken == null) return res.sendStatus(401);
            // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
           
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
                if (err) return res.sendStatus(403);
                const sessions = await Session({}).findOneWith({ token: refreshToken });
                if (sessions.length === 0) {
                return res.sendStatus(403);
                }
                const accessToken = generateAccessToken(user);
               res.json({ token: accessToken })
            })
        })
        
        app.post('/logout', async(req, res) => {
            // refreshTokens=refreshTokens.filter(refreshToken => refreshToken !== req.body.token);
            if (!req.body.token) {
              return  res.sendStatus(400);
            }
            const deletedSessions = await Session({}).deleteAllWith({ token: req.body.token });
            if (deletedSessions.length === 0) {
               return res.sendStatus(400);
            }
            res.send({deleted:deletedSessions[0]});
        })

        app.post('/login', async (req, res) => {
            const user = {
                email: req.body?.email,
                username: req.body?.username,
                password: req.body.password
            };
            //bloomFilterCheck
            if (!userExists(user)) {
                return res.status(400).json({
                    status: 'error',
                    error: 'username/email or password incorrectly entered',
                });
            };


            //dbCheck
            const userData = await User({}).findOneWith({ email: user.email })
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
            const token = generateAccessToken(userData[0]);
            const refreshToken = generateRefreshToken(userData[0]);
            setHttpOnlyCookie(res, { name: "refreshToken", value: refreshToken });
            await Session({ userId: createdUser[0].id, token: refreshToken }).save();
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
            const token = generateAccessToken(createdUser[0]);
            const refreshToken = generateRefreshToken(createdUser[0]);
            setHttpOnlyCookie(res, { name: "refreshToken", value: refreshToken });
            await Session({ userId: createdUser[0].id, token: refreshToken }).save();
            res.send({ token });
        })


        //running server 
        const server = app.listen(port, console.log(`🚀  Server running on ${port}`))
        
        
    }
    catch (err) {
        console.log("[Main] ERROR: ", err);
    }
}
main();