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
//app.use(express.session({secret:'secret key'}));
app.use(express.bodyParser());
app.use(express.json());


//H.W. part
app.post('/location', function(request, response){
		//part1] request 확인
		var json_parsed=request.body;
		var id = json_parsed.id;
		var new_longitude=json_parsed.meetingLocation.longitude;
		var new_latitude=json_parsed.meetingLocation.latitude;
		var new_updated_time = moment(new Date()).tz('Asia/Tokyo').format("YYYY-MM-DD HH:mm:ss");

		console.log('id 		:' + id);
		console.log('longitude  :' + new_longitude);
		console.log('latitude   :' + new_latitude);

		//par2]region check 

		if(new_longitude > 180 || new_longitude <-180 || new_latitude <-90 || new_latitude >90)
				response.send({"status": "outOfRegion","result": []});

		//part3] DB update
		else{
			db.query('UPDATE location SET latitude=?, longitude =? ,updated_time=? WHERE id =? ',[new_latitude, new_longitude, new_updated_time, id]);

			db.query('SELECT * FROM location where id= ?', [id],function(err,result,field){
					if(err)
					{
					console.log("Error in UpdateLocation Query error");
					response.send({
						"status":"Error",
						"result":[]
						});
					}
					if(result.length ==0)
					{
					console.log("UpdateLocation failed : InvalidID");
					resonse.send({
						"status": "UserLocationDataIsNotExist",
						"result": []
						});
					}
					console.log(result);
					response.send(
						{
						"status": "Success",
						"result": "update location"
						});
			});
		}
});



app.post('/getMembersLocation', function(request, response){
		//part1] request 확인
		var json_parsed=request.body;
		var output =[];
		var u_id= json_parsed.id;//user id
		var id = json_parsed.meeting_id; //meetint id

		console.log('user id :' +u_id);
		console.log('약속 id :' + id);

		db.query('SELECT * FROM meeting_members where meeting_member= ?  AND meeting_id=?',[u_id,id],function(error, rows, field){
			if(error) return  console.log(error);
			else if(rows.length ==0){
				return	response.send({"status": "invalidUsersInMembers","result": []});
				console.log('invalid UserIn Members Error');
			}

			//part2] DB search
			else{
			db.query('SELECT meeting_members. *, location.* FROM meeting_members INNER JOIN location WHERE meeting_members.meeting_member=location.id AND meeting_members.meeting_id= ?', [id],function (error, rows, fields){
				if(error){ 
					return console.log(error);
				}
				else{
					output=[];
					for( var i in rows)
					{
						var tp_user_name=rows[i].meeting_member;
						output.push({
							name : tp_user_name,
							location: {longitude : rows[i].longitude,latitude : rows[i].latitude},
							updatedTime :dateFormat((rows[i].updated_time),"yyyy-mm-dd HH:MM:ss")});
					}
					response.send(JSON.stringify(output));
					console.log(JSON.stringify(output));

				}
			});
		 }

	});
});


app.post('/noticeArrival', function(request, response){
		//part1] request 확인
		var json_parsed=request.body;
		var id = json_parsed.user_id;
		var meeting_id=json_parsed.meeting_id;
		var new_updated_time = moment(new Date()).tz('Asia/Tokyo').format("YYYY-MM-DD HH:mm:ss");

		console.log('id 		:' + id);
		console.log('meeting_id :' + meeting_id);


		//part2] DB update
		db.query('UPDATE meeting_members SET is_arrived= 1,arrived_time=? WHERE meeting_id =? AND meeting_member=?',[new_updated_time,meeting_id, id], function(err) {
			if(err)	{
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
							var a = moment(result[0].m_time).tz("Asia/Seoul");
							var b = moment().tz("Asia/Seoul");
							var c = a.diff(b)
							console.log(c);
							response.send({"status": "Success","arrival_time": new_updated_time});
						});
					}
				});
			 }
		});

});


http.createServer(app).listen(5000,function(){
		console.log('Server running at port http://54.238.212.130:5000/location');
});

