This directory contains a web application template using the following stack...
1) NodeJS - provides http web services (see index.js for node packages that are required - express is the key package)
2) MongoDB - contains authorization (login) database and session management database (use index.js)
or 2a) MySQL - contains authorization (login) datablase and session management database (use index_mysqlStore.js)
or 2b) MySQL + Sequelize ORM - contains authorization (login) datablase and session management database (use index_sequelize.js)
3) SAS - called in batch mode from NodeJS (SAS IntrNet is not used)

The application has an login page using email address as loginID.  Once logged in, the application loads a home page based on the user type (basic or admin).
The home page has the following functionality...
1) Call SAS to retrieve JSON or text (basic and admin user types)
2) Call MongoDB or MySQL to retrieve JSON (admin user type)
3) Logout

To run the template application, perform the following steps...
0) Install NodeJS on your system if you haven't already done so.
1) Open command prompt and go to the directory containing the template
2) Start the http web services by typing "node index.js" or "node index_mysqlStore.js" at the command prompt
3) Open the app in your browser -- http://localhost:8080
