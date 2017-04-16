var express = require('express');
var fs = require('fs');
var app = express();

app.use('/static', express.static('static_pages'));

app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/html_pages/index.html');
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});
