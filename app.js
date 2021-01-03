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
const baseUri = `http://localhost:${port}`;


const {addUserToBF,usernameExists,emailExists,userExists } = require('./bloomfilter/bloomFilter');
const { User } = require('./entities/User');
const { authenticateToken } = require('./middlewares/authenticateToken');
const { generateAccessToken, generateRefreshToken } = require('./getJwtTokenObject');
const { setHttpOnlyCookie } = require('./setHttpOnlyCookie');
const { SessionCache } = require('./entities/SessionCache');
const { RecoverAccount } = require('./entities/RecoverAccount');

const main = async () => {
    try {
        //making db connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("🚀  [Postgres] Executing: SELECT NOW() -> ", rows);
                
        app.get('/protected', authenticateToken, async (req, res) => {
            res.json(req.user);
            
        })

        app.post('/recover', async (req, res) => {
            const { email, username } = req.body;

            if (!email && !username) {
                return res.status(400);
            }
                const user = username ? await User({}).findOneWith({ username }) : await User({}).findOneWith({ email });
                if (user.length === 0) {
                    return res.json({
                        error:"Could not locate associated account",
                        message:"Could not find the username"
                    })
                }
               
                res.json({
                    message:"Please enter the 6 digit code sent to your email to recover your account",
                    success:true,
                });
                const recoveryKey =await  RecoverAccount({ id: user[0].id }).generateRecoverKey();
                RecoverAccount({ id: user[0].id }).sendRecoverLink({ email: user[0].email, url: `${baseUri}/recover?id=${user[0].id}&recoveryKey=${recoveryKey}` });
                return;
            
        })

        app.get('/recover', async (req, res) => {
            const { id, recoveryKey } = req.query;
            const recovered = await RecoverAccount({ id }).recover({ code: recoveryKey });
            if (!recovered) {
                return res.status(400).send("Bad req");
            }
                const user = await User({}).findOneWith({ id });
                if (user.length === 0) {
                    return res.json({error:"user does not exists"})
                }
                const accessToken = generateAccessToken(user[0]);
                 const refreshToken = generateRefreshToken(user[0]);
                 const added = await SessionCache({ userId: user[0].id }).add({ sessionCode: refreshToken });
                  if (!added) {
                  return res.json({
                    error:"Cannot create a new session because too many sessions are active"
                })
                 }
                setHttpOnlyCookie(res, { name: "refreshToken", value: refreshToken });
                res.json({ token: accessToken });
        })


        app.post('/changePassword', authenticateToken, async (req, res) => {
            const { id } = req.user;
            const { newPassword } = req.body;
            const hashedPW = bcrypt.hashSync(newPassword, salt);
            const user= await User({}).updateOneWith({id},{password:hashedPW})
            if (user.length==0) {
                return res.json({error:"Cannot change the password"})
            }
            res.json({success:"Password changed successfully."});
       })


        app.post('/token',  (req, res) => {
            const refreshToken = req.body.token;
            if (refreshToken == null) return res.sendStatus(401);
            // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
           
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
                if (err) return res.sendStatus(403);
                //DB Sessions
                // const sessions = await Session({}).findOneWith({ token: refreshToken });
                // if (sessions.length === 0) {
                // return res.sendStatus(403);
                // }

                //redis Sessions
                const sessionExists = await SessionCache({ userId: user.id }).exists({ sessionCode: refreshToken });
                if (!sessionExists) {
                 return res.sendStatus(403);
                }
                const accessToken = generateAccessToken(user);
                res.json({ token: accessToken });
            })
        })
        
        app.post('/logout', async(req, res) => {
            // refreshTokens=refreshTokens.filter(refreshToken => refreshToken !== req.body.token);
            const token = req.body?.token;
            const deleteAllSession = req.body?.deleteAllSession;
            if (!token) {
              return  res.sendStatus(400);
            }
            // const deletedSessions = await Session({}).deleteAllWith({ token: req.body.token });
            // if (deletedSessions.length === 0) {
            //    return res.sendStatus(400);
            // }
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
                if (err) return res.sendStatus(403);
                if (deleteAllSession) {
                    const deletedAll = await SessionCache({ userId: user.id }).deleteAll();
                    return res.json({deletedAll});
                }
                const deleted=await SessionCache({ userId:user.id}).delete({sessionCode:token})
                res.send({deleted});
            });
   
        })

        app.post('/login', async (req, res) => {

            const user = {
                email: req.body?.email,
                username: req.body?.username,
                password: req.body.password
            };

            // bloomFilterCheck
            // if (!userExists(user)) {
            //     return res.status(400).json({
            //         status: 'error',
            //         error: 'username/email or password incorrectly entered',
            //     });
            // };


            //dbCheck
            const userData = (user.email) ? await User({}).findOneWith({ email: user.email }) : await User({}).findOneWith({ username: user.username });
          
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
            const added = await SessionCache({ userId: userData[0].id }).add({ sessionCode: refreshToken });
            if (!added) {
               return res.json({
                    error:"Cannot create a new session because too many sessions are active"
                })
            }
            setHttpOnlyCookie(res, { name: "refreshToken", value: refreshToken });
            res.send({ token });
        })

        app.post('/exists', async (req, res) => {
            const { username, email } = req.body;
            const exists = username ? usernameExists({ username }) : emailExists({ email });
            return res.json({ exists })
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
            await SessionCache({ userId: createdUser[0].id }).add({ sessionCode: refreshToken });
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