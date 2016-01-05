var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    mysql = require('mysql');

var app = express();

var db = mysql.createConnection({
  user: 'root',
  password: 'sgen',
  database: 'hurryup'
});

app.use(express.logger());
app.use(express.session({secret:'secret key'}));
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
              req.session.logined = id;
              req.session.save();
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

app.get('/',function(req,res){
  var output={};
  output.cookies = req.cookies;
  output.session = req.session;
  
  res.send(output);
});

http.createServer(app).listen(80, function(){
  console.log('server running at (server ip):80');
});

