var fs=require('fs');
var	http=require('http');
var	express = require('express');
var  app = express();
var moment = require('moment-timezone'); //현재 시간 추가하려고
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
		response.send({
			"status": "outOfRegion",
			"result": []});


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

			db.end();

		}
});


http.createServer(app).listen(5000,function(){
		console.log('Server running at port http://54.238.212.130:5000/location');
});

