const mongo = require('mongodb');

const mongodb_uri = "mongodb+srv://TimMongoUser:Euler6764@cluster0.qhbri.mongodb.net/portal?retryWrites=true&w=majority";
const MongoClient = mongo.MongoClient

console.log(MongoClient)

MongoClient.connect(mongodb_uri, function(err, db) {
      if (err) throw err;
      else console.log('connected to mongodb')
      db.close()
})

console.log('last line')

