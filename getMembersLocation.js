var fs=require('fs');
var	http=require('http');
var	express = require('express');
var  app = express();
var moment = require('moment-timezone'); //현재 시간 추가하려고
var date= new Date();
var dateFormat=require('dateformat');
var mysql= require('mysql');



//DB연결
var db= mysql.createConnection({
		user : 'root',
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


app.post('/getMembersLocation', function(request, response){
//part1] request 확인
		var json_parsed=request.body;
		
		var output =[];
		var u_id= json_parsed.id;//user id
		var id = json_parsed.meeting_id; //meetint id


		console.log('user id :' +u_id);
		console.log('약속 id :' + id);

//part2] check valid user-meeting

		response.setHeader("Content-Type" , "application/json");
		db.query('SELECT * FROM meeting_members where meeting_member= ?  AND meeting_id=?',[u_id,id],function(error, rows, field)
			{

				if(error) return  console.log(error);

				if(rows.length ==0)
				{
					return	response.send({
							"status": "invalidUsersInMembers",
							"result": []
				});

				console.log('invalid UserIn Members Error');

				}

			});




//part2] DB search

		db.query('SELECT meeting_members. *, location.* FROM meeting_members INNER JOIN location WHERE meeting_members.meeting_member=location.id AND meeting_members.meeting_id= ?', [id],function (error, rows, fields){

				if(error)
				{ 
					return console.log(error);
				}

				output=[];
				for( var i in rows)
				{
					var tp_user_name=rows[i].meeting_member;

					output.push(
						{
							name : tp_user_name,
							location: {

										longitude : rows[i].longitude,
										latitude : rows[i].latitude

									    },
							 updatedTime :dateFormat((rows[i].updated_time),"yyyy-mm-dd HH:MM:ss")
						}
					);
				}

			response.end(JSON.stringify(output));
			console.log(JSON.stringify(output));
		});


});


http.createServer(app,function (request, response){}).listen(5000,function(){
			console.log('Server running at port http://54.238.212.130:5000/getMembersLocation');
});

