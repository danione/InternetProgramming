var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use('/static', express.static('static_pages'));

app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/html_pages/index.html');
});

app.post('/add_user', urlencodedParser, function(req,res)
{
  response =
  {
    username:req.body.username,
    email: req.body.email,
    password: req.body.psw
  };
  console.log(response);
  res.end(JSON.stringify(response));
});

var server = app.listen(8089, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});


var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/InternetProgramming';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

});
