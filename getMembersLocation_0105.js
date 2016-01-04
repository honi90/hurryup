var fs=require('fs');
var	http=require('http');
var	express = require('express');
var  app = express();
var moment = require('moment-timezone'); //현재 시간 추가하려고
var date= new Date();
var mysql= require('mysql');



//DB연결
var db= mysql.createConnection({
	user : 'root',
	password: 	'sgen',
	database:'Hurryup'
});
db.connect(function(err){
			if(err){
				console.err('mysql 연결실패');
				throw err;
			}
		});




app.use(express.bodyParser());
app.use(express.json());


app.post('/getMembersLocation', function(request, response){
//part1] request 확인
		var json_parsed=request.body;

		var output =[];
		var id = json_parsed.id;
		console.log('약속 id :' + id);
			
//part2] DB search
		db.query('SELECT meeting_members. *, location.* FROM meeting_members INNER JOIN location WHERE meeting_members.meeting_member=location.id AND meeting_members.meeting_id= ?', [id],function (error, rows, fields){

				
					if(error) console.log(error);

					for( var i in rows)
					{
						console.log(rows[i]);
						var tp_user_name=rows[i].meeting_member;
			
						output.push(
								{
									name : tp_user_name,
									location: {
									
										longitude : rows[0].longitude,
										latitude : rows[0].latitude

									},
									updatedTime : rows[0].updated_time
								}
							);
					}

					
		response.writeHead(200,{'Content-Type': 'application/json'});
		response.end(JSON.stringify(output));
	
					
		
			});


		console.log(JSON.stringify(output));
//		db.end();

});






http.createServer(app,function (request, response){

		
		
	}).listen(5000,function(){
		console.log('Server running at port http://54.238.212.130:5000/getMembersLocation');
		});

