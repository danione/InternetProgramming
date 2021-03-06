var express = require('express');
    http = require('http');
var fs = require('fs');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var bcrypt = require('bcrypt-nodejs');
var url = 'mongodb://localhost:27017/InternetProgramming';
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var uuid = require('uuid');

app.use(cors())

var guest_id = 1;
var myuuid = '0123456789abcdeffedcba9876543210'

var jsdom = require('jsdom');
var html = '<html><body></body></html>';

app.use(morgan('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: 'a4f8071f-c873-4447-8ee2' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set('view engine', 'ejs');


app.use('/static', express.static('static_pages'));
app.use('/node_modules', express.static('./node_modules'));



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

app.post('/add_user', urlencodedParser, function(req,res)
{
  var hashed_password = bcrypt.hashSync(req.body.psw);
  var user =
  {
    username:req.body.username,
    email: req.body.email,
    password: hashed_password,
    points: 0
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


app.get('/guest_session', function(req,res)
{
  var random_guest = "guest: " + uuid.v1();
  var user =
  {
    username:random_guest,
  };
  var add_user = function(db, callback)
  {
    db.collection('users').insertOne(user)
  };


  var findUser = function(db, callback) {
  var cursor = db.collection('users').find( { "username": random_guest });
  var tester = cursor.count(function(err, count){
    assert.equal(null, err);
    if(count == 0)
    {
      res.end("Error");
      return false;
    }

    cursor.each(function(err,obj) {

        req.session.user_id = obj._id;
        req.session.username = user.username;
        res.end('Success');

      return false;
      });
    });
  };
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    add_user(db, function() {
        db.close();
    });

    findUser(db, function() {
        db.close();
      });
  });
  console.log(random_guest);
})


app.get('/homepage', isLoggedIn, function(req, res) {
  res.render('homepage.ejs', {user: req.session.username, points: req.session.user_points});
});

app.get('/logout', function(req,res)
{
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('users').remove({ "username": req.session.username });
  });

  delete req.session.user_id;
  delete req.session.username;
  delete req.session.user_points;
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
        req.session.user_points = obj.points;
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


function random_letter()
{
  var possible_letters = 'abcdefghijklmnopqrstuvwxyz';
  return possible_letters.charAt(Math.floor(Math.random() * possible_letters.length));7
}



var server = app.listen(8089, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});

var io = require('socket.io').listen(server);
var queue = {};
var rooms = {};


io.on('connection', function(socket){
  socket.on('person join', function(user)
  {
    socket.username = user;
    console.log(socket.username + " connected");
    queue[socket.username] = socket;
    socket.in_queue = true;
  })

  socket.on('button click', function()
  {
    socket.in_queue = false;
    if(Object.keys(rooms).length < 1)
    {
      console.log("no other rooms");
      socket.join(socket.id);
      console.log("Socket joined: " + socket.id);
      rooms[socket.id] = 1;
    }
    else
    {
        console.log("we have other rooms");
        var connected = false;
        for (key in rooms)
        {
          if(rooms[key] == 1)
          {
            connected = true;
            socket.join(key);
            console.log("Socket joined: " + key);
            rooms[key] = 2;
            //io.sockets.in(key).emit("start game");
            var result = random_letter();
            io.sockets.connected[key].emit('first', result);


            break;
          }
        }
        if(connected == false)
        {
          socket.join(socket.id);
          rooms[socket.id] = 1;
        }
    }
  })



  /*function pingOpponent(socket, socket_id, msg){
    var socketRoom = Object.keys(socket.rooms);
    console.log(socketRoom);
    if(Object.keys(socketRoom).length == 1){
      console.log("length 1");
      socket.broadcast.to(socketRoom[0]).emit(msg);
      console.log(socketRoom[0]);
    } else {
    //console.log(socket_id);
    console.log("length 2");
      socketRoom.filter(item => item!=socket.id);
      if (io.sockets.connected[socketRoom[1]]) {

      }
    }
  }*/

  socket.on('ping opponent', function(data){
    var socket_id = data.id;
    var msg = data.message;
    var letter = data.letter;
    var socketRoom = Object.keys(socket.rooms);
    console.log(socketRoom);
    if(Object.keys(socketRoom).length == 1){
      if(letter == null)
      socket.broadcast.to(socketRoom[0]).emit(msg);
      else
      socket.broadcast.to(socketRoom[0]).emit(msg,letter);
      console.log(socketRoom[0]);
    } else {

      socketRoom.filter(item => item!=socket.id);
      if (io.sockets.connected[socketRoom[1]]) {
        if(letter == null)
        io.sockets.connected[socketRoom[1]].emit(msg);
        else
        io.sockets.connected[socketRoom[1]].emit(msg,letter);
      }
    }
    /*console.log("socket name: " + socket);
    console.log(io.sockets.manager.roomClients[socket]);*/

  })


//The url we want is `www.nodejitsu.com:1337/`

//This is the data we are posting, it needs to be a string or a buffer



  socket.on('get result', function(result){

    console.log("got result");
    var socket_id = result.id;
    var word = result.word;
    var points = result.points;
    var letter = result.letter;
    var checkWord = require('check-word'),
    words     = checkWord('en');
    console.log(words.check(word));
    var receivePoints = sumPoints(letter, word, points);
    if(receivePoints != -1){
      if (io.sockets.connected[socket_id]) {
          io.sockets.connected[socket_id].emit('correct word', {pointsGiven:receivePoints, word:word});
      }
    }
  });

  socket.on('disconnect', function()
  {
    if(socket.in_queue)
      delete queue[socket.username];

    var func = function()
    {
      if(!(socket.username in queue))
        console.log(socket.username  + ' disconnected');
    };
    setTimeout(func,4000);
  })

});



function sumPoints(letter,word, points)
{
  if(word.charAt(0) != letter)
  {
    return points = -1;
  } else {
    points += word.length;
  }
  return points;
}
