var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var bcrypt = require('bcrypt-nodejs');
var url = 'mongodb://localhost:27017/InternetProgramming';
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');


app.use('/static', express.static('static_pages'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/html_pages/index.html');
});


app.post('/username_validate', urlencodedParser, function(req,res)
{
  var username = req.body.username;
  var response = {'valid': false, 'message': 'Username is already in use'};
  var findUser = function(db, callback) {
   var cursor = db.collection('users').find( { "username": String(username) } ).count(function(err, count) {
        assert.equal(null, err);
        if(count == 0)
          response.valid = 'true';
        res.end(JSON.stringify(response));
        });
  };
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    findUser(db, function() {
        db.close();
      });
  });
});

app.post('/email_validate', urlencodedParser, function(req,res)
{
  var email = req.body.email;
  var response = {'valid': false, 'message': 'E-mail is already in use'};
  var findUser = function(db, callback) {
   var cursor = db.collection('users').find( { "email": String(email) } ).count(function(err, count) {
     assert.equal(null, err);
     if(count == 0)
       response.valid = 'true';
     res.end(JSON.stringify(response));
    });

  };
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    findUser(db, function() {
        db.close();
      });
  });
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
  response.writeHead(200,
    {Location: 'http://localhost:8089/'}
  );
  res.end();
});

var server = app.listen(8089, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});
