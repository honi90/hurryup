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

//above is same as login.js

app.post('/checkId', function(req,res){
  req.accepts('application/json');
  var json = req.body;
  var id = json.id;

  console.log('requested data: ');
  console.log(json);
  console.log(id);
  
  if(id == null){
    console.log('Dont enter id!!!!!!!!!!!!!');
    res.send({
      'status':'protocolError',
      'result':[]
    });
  }

  db.query('SELECT id FROM member WHERE id=?;',[id], function(err,result,fields){
    if(err){
      console.log('err');
      console.log('Error in check id part first sql query');
      res.send({
        "status": 'protocolError',
        "result": []
      });
    }else{
      if(result.length != 0){ 
        console.log("duplicated ID");
        res.send({
          "status": "duplicatedId",
          "result": []
        });
      }else{
        console.log("ID accepted");
        res.send({
          'status':'OK',
          'result':[]
        });
      }
    }
  });
});

http.createServer(app).listen(80, function(){
  console.log('server running at (server ip):80');
});

