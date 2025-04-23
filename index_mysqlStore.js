
/* make modules/libraries available */
const express = require('express')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const mysql = require('mysql2')
const child_process = require('child_process')
const fs = require('fs')

/* create global application variables */
const app = express();
const port = 8080;
const htmlPath = __dirname+'\\HTML\\'; /* __dirname resolves to project folder */

/* connect to mysql local -- needed for login authentication and session store */
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',    
    database: 'node2sastemplate'
})
db.connect(function(err) {
  if (err) throw err
  console.log("Connected to MySQL")
})
const sessionStore = new MySQLStore( {}, db)
const oneHour = 1000 * 60 * 60 * 1
const oneMinute = oneHour /60
app.use(session( {
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: { httpOnly: true, maxAge: oneMinute},
    clearExpired: true
}))


/* assign static JS, CSS, and pic directories */
app.use('/JS', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\JS'));
app.use('/CSS', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\CSS'));
app.use('/IMG', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\IMG'));



/* what does this do? */
app.use(express.urlencoded({extended:false}));

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
app.post('/LogIn', function(req, res) {
    let queryString = 'SELECT * FROM `users` WHERE `userid` = ? AND `pwd` = ?'
    db.query(queryString, [req.body.userid, req.body.pwd], function (err, result) {
        if (err) throw err
        if (result.length === 1) { /* valid login */
            req.session.email = result[0].userid;            
            req.session.usertype = result[0].usertype;
            res.redirect('/home')
            
        }
        else res.send('No user found')
    })
})

/* load home page based on usertype */
app.get('/home', function (req, res) {
    if (req.session.usertype === 'admin') res.sendFile(htmlPath+'homeA.html')
    else if (req.session.usertype === 'basic') res.sendFile(htmlPath+'homeB.html')
    else res.sendFile(htmlPath+'loginPage.html')
})

/* get JSON data from MySQL */
app.post('/callMySQL', function (req, res) {
    if (req.session.usertype) {
        let queryString = 'SELECT * FROM `users`'
        db.query(queryString, function (err, result) {
            if (err) throw err
            else res.send(result)            
        })
    }
    //else res.sendFile(htmlPath+'loginPage.html')
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
    //else res.sendFile(htmlPath+'loginPage.html')
    else res.send('expired')
})

/* Logout */
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

const server = app.listen(port, function() {
    console.log('Node server is running on port: '+port);
})

