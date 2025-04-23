/* make modules/libraries available */
const express = require('express')
const expressSession = require('express-session')
const { Sequelize, DataTypes } = require('sequelize')
const SessionStore = require('express-session-sequelize')(expressSession.Store)
const child_process = require('child_process')
const fs = require('fs')

/* create global application variables */
const app = express()
const port = 8080;
const dbhost = 'localhost'
const dbport = 3306
const dbuser = 'root'
const dbpassword = null
const dbname = 'node2sastemplate'
const dbdialect = 'mysql'  // mysql2 package must be install -- npm install mysql2
const htmlPath = __dirname+'\\HTML\\'; /* __dirname resolves to project folder */

/* assign static JS, CSS, and pic directories - more efficient to have these served by httpd like apache */
app.use('/JS', express.static(__dirname+'\\JS'))
app.use('/CSS', express.static(__dirname+'\\CSS'))
app.use('/IMG', express.static(__dirname+'\\IMG'))
app.use(express.urlencoded({extended:false}))

/* connect to database using Sequelize -- needed for sessions */
const sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhost,
    dialect: dbdialect,
    logging: false
})
async function checkconnection() {
    try {
      await sequelize.authenticate();
      console.log('Sequelize DB Connection to ' + dbdialect + ' has been established successfully');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
}
checkconnection()

/* create session store */
const sequelizeSessionStore = new SessionStore( {
    db: sequelize
} )
const oneHour = 1000 * 60 * 60 * 1
const oneMinute = oneHour / 60
app.use(expressSession(
    {
        secret: "node2SASsecret",
        store: sequelizeSessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true, maxAge: oneMinute },
        clearExpired: true
    })
)

/* create sequelize data models */
const User = sequelize.define('User', {

    userid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        }
    },

    pwd: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {            
        }
    },

    usertype: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "basic",
        validate: {
            //isIn: ['basic','admin']
        }
    },    

}, {

})
/* ***** ONLY RUN THIS WHEN YOU NEED TO CREATE OR CHANGE TABLE AND THEN COMMENT OUT ************* */
//User.sync({alter:true})
//User.create({ userid: '67timmyd@gmail.com', pwd: 'blXG0504', usertype: 'basic' })
//User.create({ userid: 'tim.danielsen@health-info-solutions.com', pwd: 'blXG0504', usertype: 'admin' })

function updateSASlog() {
    fs.readFile('index.log', function(err, data) {
        let logData = data
        fs.appendFile('cumSASlog.txt',"\r\r=====================================================================\r\r", function() {
            fs.appendFile('cumSASlog.txt',logData, function() {console.log('Cumulative SAS log updated')})
          })
    })
}


//ROUTING//

/* send root website get request to login page */
app.get('/', function (req, res) {
    if (req.session.usertype) res.redirect('/home') /* user already logged in and has active session */
    else res.sendFile(htmlPath+'loginPage.html')
})

/* Login request */
app.post('/LogIn', async function(req, res) {
    const user = await User.findByPk(req.body.userid)    
    if (!user) return res.status(401).json( { message: 'Incorrect email and/or password' })
    if (req.body.pwd === user.pwd) {
        //create session - valid login
        req.session.loggedIn = true
        req.session.userid = req.body.userid
        req.session.usertype = user.usertype
        res.redirect('/home')
    }
    else res.status(401).json( { message: 'Incorrect email and/or password' })      
})

/* load home page based on usertype */
app.get('/home', function (req, res) {
    if (req.session.usertype === 'admin') res.sendFile(htmlPath+'homeA.html')
    else if (req.session.usertype === 'basic') res.sendFile(htmlPath+'homeB.html')
    else res.sendFile(htmlPath+'loginPage.html')
})

/* get a list of all users (JSON) from MySQL database */
app.post('/callMySQL', async function (req, res) {
    if (req.session.usertype) {
        const users = await User.findAll()
        res.send(users)       
    }    
    else res.send('expired')
})

/* call SAS in batch mode */
app.post('/callSas', function (req, res) {
    if (req.session.usertype) {
        /* create SAS paramter string from request data */
        let keys = Object.keys(req.body)
        let parameters = ""
        keys.forEach( (key) => {parameters += "," + key + "=" + req.body[key]} )
        parameters = parameters.substr(1) //drop leading comma
        console.log(parameters)
        /* call SAS in batch mode and pass parameters. Synchronous execution (execSync) is needed to avoid SAS file locks */

        try {
        child_process.execSync("sas index.sas -sysparm '" + parameters + "'")
            fs.readFile('outfile.txt', (err,text) => {
                if (err) throw err
                else res.send(text)
            })
        }
        catch(err) {
            updateSASlog()
            console.log(err)
            res.send({"SASerror":"An error occurred in SAS child_process"})
        }
    }    
    else res.send('expired')
})

/* Logout */
app.get('/logout',(req,res) => {
    const thisUser = req.session.userid
    req.session.destroy( function(err) {        
    });
    res.redirect('/');
});

const server = app.listen(port, function() {
    console.log('Node server is running on port: '+port);
})
