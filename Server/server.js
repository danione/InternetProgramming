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

app.use(morgan('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: 'a4f8071f-c873-4447-8ee2' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set('view engine', 'ejs');


app.use('/static', express.static('static_pages'));

app.get('/', function(req, res)
{
  if(req.session.user_id)
    res.redirect('/homepage');
  res.render('index.ejs');
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

app.put('/add_user', urlencodedParser, function(req,res)
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
      res.redirect('/');
      res.end();
      callback();
    });
  };
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    add_user(db, function() {
        db.close();
    });
  });
});

function isLoggedIn(req,res,next)
{
  if(!req.session.user_id)
    res.redirect('/');
  else
    return next();
}


app.get('/homepage', isLoggedIn, function(req, res) {
  res.render('homepage.ejs', {user: req.session.username});
});

app.get('/logout', function(req,res)
{
  delete req.session.user_id;
  delete req.session.username;
  res.redirect('/');
});


app.post('/login',function(req, res) {
  var user = {"username": req.body.username_login, "password": req.body.psw_login};
  var findUser = function(db, callback) {
  var cursor = db.collection('users').find( { "username": String(user.username) });
  var tester = cursor.count(function(err, count){
    assert.equal(null, err);
    if(count == 0)
    {
      res.end("Error");
      return false;
    }

    cursor.each(function(err,obj) {
      var result = bcrypt.compareSync(user.password,obj.password);

      if(result == false)
        res.end("Error");
      else
      {
        req.session.user_id = obj._id;
        req.session.username = user.username;
        res.end('Success');
      }
      return false;
      });
    });
  };
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    findUser(db, function() {
        db.close();
      });
  });

});


var server = app.listen(8089, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});
