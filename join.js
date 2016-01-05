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
//app.use(express.session({secret:'secret key'}));
app.use(express.bodyParser());
app.use(express.json());

// above is same as login.js

app.post('/join', function(req,res){
  req.accepts('application/json');
  var json = req.body;
  var id = json.id;
  var pw = json.password;
  var name = json.name;
  var pNum = json.phoneNumber;
  
  console.log('requested data: ');
  console.log(json);
  
  db.query('INSERT INTO member (id,pw,credit,member.name,phoneNumber) VALUES (?,?,?,?,?);',[id,pw,0,name,pNum], function(err,result,fields){
    if(err){
      console.log(err);
      console.log('Error in join part first sql query');
      res.send({
        "status": 'protocolError',
        "result": []
      });
    } else{
      db.query('INSERT INTO location (latitude,longitude,location.id,updated_time) VALUES (?,?,?,?);',[0,0,id,'1999-12-31 23:59:59'],function(err2,result2,fields2){
        if(err2){
          console.log('Error in join part second sql query');
          res.send({
            "status":'dbError',
            "result":[]
          });
        }else{
          res.send({
            'status': 'OK',
            'result': []
          });
        }
      });
    }
  });
});

http.createServer(app).listen(80, function(){
  console.log('server running at (server ip):80');
});

