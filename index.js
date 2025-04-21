/* make modules/libraries available */
const express = require('express');
const session = require('express-session');
const mongo = require('mongodb');
const MongoDBStore = require('connect-mongodb-session')(session);
const child_process = require('child_process')
const fs = require('fs')

/* create global application variables */
const app = express();
const port = 8080;
const htmlPath = __dirname+'\\HTML\\'; /* __dirname resolves to project folder */
const mongodb_uri = "mongodb+srv://TimMongoUser:Euler6764@cluster0.qhbri.mongodb.net/portal?retryWrites=true&w=majority";
const MongoClient = mongo.MongoClient
const store = new MongoDBStore({  /* this is the session store written to MongoDB */
    uri: mongodb_uri,
    collection: 'sessions'
});

/* assign static JS, CSS, and pic directories */
app.use('/JS', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\JS'));
app.use('/CSS', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\CSS'));
app.use('/IMG', express.static('C:\\Users\\67tim\\OneDrive\\nodeTemplateW\\IMG'));

/* set session parameters */
const oneHour = 1000 * 60 * 60 * 1;
app.use(session({secret: 'accc2actdu',saveUninitialized: true,resave: false,cookie: { maxAge: oneHour },store: store}));

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
app.post('/LogIn', function (req, res) {
    MongoClient.connect(mongodb_uri, function(err, db) {
      if (err) throw err;
      var dbo = db.db("portal");
      const query = { "email": req.body.logonid, "wwwpw": req.body.password };
      dbo.collection("userauth").find(query).toArray(function(err, result) {
          if (err) throw err;
          if (result.length === 1) { /* valid login */
            req.session.email = result[0].email;
            req.session.internalid = result[0].internalid;
            req.session.usertype = result[0].usertype;
            res.redirect('/home')
          }
          else {
            res.send('No user found')
          }
          db.close()
      })
    })
})

/* load home page based on usertype */
app.get('/home', function (req, res) {
    if (req.session.usertype === 'admin') res.sendFile(htmlPath+'homeA.html')
    else if (req.session.usertype === 'basic') res.sendFile(htmlPath+'homeB.html')
    else res.sendFile(htmlPath+'loginPage.html')
})

/* get JSON data from MongoDB */
app.post('/callMongo', function (req, res) {
    if (req.session.usertype) {
        MongoClient.connect(mongodb_uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("portal");
            const query = { "usertype":"admin" }
            dbo.collection("userauth").find(query).toArray(function(err, result) {
                if (err) throw err
                else {
                    console.log(result)
                    res.send(result)
                }
            })
        })
    }
    else res.sendFile(htmlPath+'loginPage.html')
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
    else res.sendFile(htmlPath+'loginPage.html')
})

/* Logout */
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

const server = app.listen(port, function() {
    console.log('Node server is running on port: '+port);
})







// const http = require('http');
// const fs = require('fs');
// const todo = require('./todo');


// http.createServer(function(req, res) {
//     if (req.url === '/test') {
//         res.writeHead(200, {'Content-Type': 'application/json'});
//         return res.end(todo.test());
//     }
//     else {
//         fs.readFile('ACCC.html', function(err,data) {
//             if (err) {
//                 res.writeHead(404, {'Content-Type': 'text/html'})
//                 return res.end("404 Not Found")
//             }
//             res.writeHead(200, {'Content-Type': 'text/html'})
//             res.write(data)
//             res.end()
//         })
//     }
// }).listen(8080)

// var http = require('http');
// var formidable = require('formidable');
// var fs = require('fs');

// http.createServer(function (req, res) {
//   if (req.url == '/fileupload') {
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//       var oldpath = files.filetoupload.path;
//       var newpath = "C:\\Users\\67tim\\OneDrive\\node\\" + files.filetoupload.name;
//       console.log(oldpath);
//       console.log(newpath);
//       fs.rename(oldpath, newpath, function (err) {
//         if (err) throw err;
//         res.write('File uploaded and moved!');
//         res.end();
//       });
//  });
//   } else {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
//     res.write('<input type="file" name="filetoupload"><br>');
//     res.write('<input type="submit">');
//     res.write('</form>');
//     return res.end();
//   }
// }).listen(8080);




// const http = require('http');
// const dt = require('./dateTime');
// const url = require('url');
// const fs = require('fs');

// http.createServer(function (req, res) {
//     const q = url.parse(req.url, true);
//     const filename = "." + q.pathname;
//     fs.readFile(filename, function(err,data) {
//         if (err) {
//             res.writeHead(404, {'Content-Type': 'text/html'});
//             return res.end("404 Not Found");
//         }
//         res.writeHead(200, {'Content-Type': 'text/html'})
//         res.write(data);
//         return res.end();
//         // res.write('Hello World<br />');
//         // res.write("the date and time are currently: " + dt.myDateTime() + "<br />");
//         // const q = url.parse(req.url, true).query;
//         // const txt = q.year + " " + q.month;
//         // res.end(txt);
//     });
// }).listen(8080);