var fs=require('fs');
var	http=require('http');
var	express = require('express');
var  app = express();
var moment = require('moment-timezone'); //
var date= new Date();
var mysql= require('mysql');




//DB연결
var db= mysql.createConnection({
		user :'root',
		password:'sgen',
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


app.post('/noticeArrival', function(request, response){
//part1] request 확인
		var json_parsed=request.body;
	
		var id = json_parsed.user_id;
		var meeting_id=json_parsed.meeting_id;
		var new_updated_time = moment(new Date()).tz('Asia/Tokyo').format("YYYY-MM-DD HH:mm:ss");

		console.log('id 		:' + id);
		console.log('meeting_id :' + meeting_id);


//part2] DB update
		db.query('UPDATE meeting_members SET is_arrived= 1,arrived_time=? WHERE meeting_id =? AND meeting_member=?',[new_updated_time,meeting_id, id]);

		db.query('SELECT * FROM meeting_members where meeting_member =?  AND  meeting_id', [id,meeting_id],function(err,result,field){
					if(err)
					{
						console.log("Error in Update Meeting_member  Query error");
						response.send({
							"status":"Error",
							"result":[]
						});
					}

					if(result.length ==0)
					{
						console.log("Update Arrival  failed : InvalidID");
						response.send({
							"status": "InvalidMember",
							"result": []
							});
					}

					console.log(result);
					response.send(
						{
						"status": "Success",
						"arrival_time": new_updated_time
						});
				});


		
});


http.createServer(app).listen(5000,function(){
		console.log('Server running at port http://54.238.212.130:5000/noticeArrival');
});

