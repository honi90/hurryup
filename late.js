var fs = require('fs'),
	http = require('http'),
	express = require('express'),
	mysql = require('mysql'),
	moment = require('moment-timezone'),
	dateFormat = require('dateformat');

var app = express();

var date = new Date();

var db = mysql.createConnection({
user: 'root',
password: 'sgen',
database: 'Hurryup'
});

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.json());

app.post('/noticeArrival', function(request, response){
		//part1] request 확인
		var json_parsed=request.body;
		var id = json_parsed.user_id;
		var meeting_id=json_parsed.meeting_id;
		var new_updated_time = moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss");

		console.log('id 		:' + id);
		console.log('meeting_id :' + meeting_id);


		//part2] DB update
		db.query('UPDATE meeting_members SET is_arrived= 1,arrived_time=? WHERE meeting_id =? AND meeting_member=?',[new_updated_time,meeting_id, id], function(err) {
			if(err)	{
					console.log(err);
					console.log("noticeArriaval DB error :1");
			}

			else{
				db.query('SELECT * FROM meeting_members where meeting_member =?  AND  meeting_id=?', [id,meeting_id],function(err,result,field){
					if(err)
					{
						console.log("Error in Update Meeting_member  Query error");
						response.send({"status":"Error","result":[]});
					}

					else{
						db.query('SELECT * FROM meeting where m_id =?', [meeting_id],function(err,result,field){
							console.log(result);

							var meet_time = moment(result[0].m_time).tz("Asia/Seoul");
							var arrive_time = moment().tz("Asia/Seoul");
							var diff = arrive_time.diff(meet_time,'minutes')
							console.log('약속'+meet_time.format("YYYY-MM-DD HH:mm:ss"));
							console.log('도착' + arrive_time.format("YYYY-MM-DD HH:mm:ss"));
							console.log(diff);
							if(diff>0)
							{
								console.log('지각');
								db.query('INSERT INTO member_lateness (member_id,late_time) VALUES (?,?)',[id,diff],function(err,result,field){
											if(err){
												console.log(err);
												console.log('noticeARRIVAL lATE DB update err!!!!');
											}
											else{
												console.log(result[0]);
												console.log(field);
											}
									});
								db.query('UPDATE member SET credit = credit + ? where id =?',[diff,id],function(err,result,fields)
										{
											if(err){
												console.log(err);
												console.log('지각 memberDB credit 오류');
											}
											else{
												console.log(result);
							          response.send({"status": "Success","arrival_time": new_updated_time});
											}
										}
										);

							}
						});
					}
				});
			 }
		});

});


http.createServer(app).listen(5000,function(){
		console.log('Server running at port http://54.238.212.130:5000/location');
});

