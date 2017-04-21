var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var bcrypt = require('bcrypt-nodejs');
var url = 'mongodb://localhost:27017/InternetProgramming';
var MongoClient = require('mongodb').MongoClient, assert = require('assert');

app.use('/static', express.static('static_pages'));

app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/html_pages/index.html');
});


app.post('/add_user', urlencodedParser, function(req,res)
{
  var hashed_password = bcrypt.hashSync(req.body.psw);
  var user =
  {
    username:req.body.username,
    email: req.body.email,
    password: hashed_password
  };
  var add_user = function(db, callback)
  {
    db.collection('users').insertOne(user,function(err, result)
    {
      assert.equal(err, null);
      console.log("Inserted a user into db");
      callback();
    });
  };
  MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to server");
    assert.equal(null, err);
    add_user(db, function() {
        db.close();
    });
  });
  console.log(user);
  res.end(JSON.stringify(user));
});

var server = app.listen(8089, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});
