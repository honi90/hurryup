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
app.use(express.session({secret:'secret key'});
app.use(express.bodyParser());
app.use(express.json());

app.post('/login', function(req,res){
  req.accepts('application/json');
  var json = req.body;
  var id = json.id;
  var pw = json.password;

  //console.log(id,pw);
  console.log('requested data: ');
  console.log(json);
  
  
  db.query('SELECT id, pw FROM member WHERE id=?;',[id], function(err,result,fields){
    if(err){
      console.log('Error in login part first sql query');
      res.send({
        "status": 'protocolError',
        "result": []
      });
    } else{
      if(result.length == 0){ // login fail by invalid id
        console.log("login failed : InvalidID");
        res.send({
          "status": "InvalidID",
          "result": []
        });
      }else{
        if(result[0].pw == pw){//로그인 성공
          //session 추가해야함. 
          db.query('SELECT meeting_id FROM meeting_members WHERE meeting_member=?',[id],function(err2,result2,field2){
            if(err2){
              console.log('Error in login part second sql query');
              res.send({
                "status": 'protocolError',
                "result": []
              });
            }else{
              console.log('login success');
              res.send({
                "status": "OK",
                "result": result2
              });
              req.session.logined = true;
            }
          });
        }else{//로그인 실패 by password mismatch
          console.log('login failed : invalidPassword');
          res.send({
            "status": "InvalidPassword",
            "result": []
          });
        }
      }
    }
  });
});

http.createServer(app).listen(80, function(){
  console.log('server running at (server ip):80');
});

