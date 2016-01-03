var http = require('http')
var express = require('express');

var app = express();

app.use (function (request, response) {
   response.end("Hurry up"); 
});

http.createServer(app).listen(8888, function () {
    console.log('Server is running at 127.0.0.1:8888');
});