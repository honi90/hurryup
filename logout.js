var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    mysql = require('mysql');

var app = express();

//DB 연결 
var db = mysql.createConnection({
  user: 'root',
  password: 'sgen',
  database: 'hurryup'
});

app.use(express.logger());
app.use(express.session({secret:'secret key'}));
app.use(express.bodyParser());
app.use(express.json());

app.post('/logout', function(req,res){
  if(req.session.logined){
    req.session.destroy(function(err){
      if(err){
        console.log(err);
      }else{
        console.log('destroyed');
      }
    });
    res.send({
      "status": "ok",
      "result":[]
    });
  }else{
    res.send({
      "status": "invalidUser",
      "result":[]
    });
  }
});

http.createServer(app).listen(80, function(){
  console.log('server running at (server ip):80');
});


