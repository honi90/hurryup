var http = require('http'),
    express = require('express');

var app = express();

app.use(express.logger());
app.use(express.cookieParser());
app.use(express.session({secret:'secret key'}));
app.use(express.bodyParser());

app.get('/',function(req,res){
  var output={};
  output.cookies = req.cookies;
  output.session = req.session;

  req.session.now = (new Date()).toUTCString();
  
  res.send(output);
});
app.get('/login',function(req,res){
  req.session.logined = true;
  res.send('login page');
});
app.get('/logout',function(req,res){
  req.session.logined = false;
  res.send('logout page');
});

http.createServer(app).listen(80,function(){
  console.log('server running');    
});
