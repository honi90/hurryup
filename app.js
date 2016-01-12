/// <reference path="typings/node/node.d.ts"/>

var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    mysql = require('mysql'),
    moment = require('moment-timezone'),
    dateFormat = require('dateformat'),
    async = require('async');

var app = express();

var date = new Date();

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
              db.query('SELECT * FROM (SELECT meeting_id FROM meeting_members WHERE meeting_member = ?)temp1 INNER JOIN (SELECT * FROM meeting_members, meeting, member WHERE meeting_members.meeting_member = member.id AND meeting.m_id = meeting_members.meeting_id)temp2 WHERE temp1.meeting_id = temp2.meeting_id;',[id],function(err,result,field){
                    if (err) {
                        console.log('error in login part 3rd sql query');
                        res.send({
                          'status': 'dbError',
                          'result': []
                        });
                    } else {
                        //console.log(result);
                        var result_json={
                            status:'Success',
                            result:[]    
                        };
                        var checkarr=[];
                        for(var i = 0; i<result.length;i++){
                            var checker = 0;
                            for(var j =0; j<checkarr.length;j++){
                                if(checkarr[j]==result[i].meeting_id) checker++;
                            }
                            if(checker!=0){
                                for(var j =0; j<checkarr.length;j++){
                                    if(checkarr[j]==result[i].meeting_id){
                                        result_json.result[j].meeting_members.push({
                                            id: result[i].id,
                                            name: result[i].name
                                        });
                                    }
                                }
                            } else { 
                                checkarr.push(result[i].meeting_id);
                                result_json.result.push({
                                    meeting_id: result[i].meeting_id,
                                    meeting_name: result[i].m_title,
                                    meeting_members: [{
                                        id: result[i].id,
                                        name: result[i].name
                                    }]
                                });
                            }
                        }
                        res.send(result_json);
                        req.session.logined = id;
                        req.session.save();
                    }
              });
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
          'status':'Success',
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
  var email = json.email;
  
  console.log('requested data: ');
  console.log(json);
  
  db.query('SELET * from phoneNumber where phoneNumber =?', [pNum], function (error, rows, field) {
    if (error) {
        console.log('error in join part first sql query');
        res.send({
            'status': 'dbError',
            'result': []
        });
    } else { 
        if (rows.length!=0){
          console.log("Already have phone number : " + pNum);
          res.send({
             "status": 'DuplicatedPhoneNumber',
             "result": []
          });
        } else {
          db.query('INSERT INTO member (id,pw,credit,member.name,phoneNumber,email) VALUES (?,?,?,?,?,?);',[id,pw,0,name,pNum,email], function(err,result,fields){
            if(err){
              console.log(err);
              console.log('Error in join part second sql query');
              res.send({
                "status": 'protocolError',
                "result": []
              });
            } else{
            db.query('INSERT INTO location (latitude,longitude,location.id,updated_time) VALUES (?,?,?,?);',[0,0,id,'1999-12-31 23:59:59'],function(err2,result2,fields2){
                if(err2){
                console.log('Error in join part 3rd sql query');
                res.send({
                    "status":'dbError',
                    "result":[]
                });
                } else{
                    res.send({
                        'status': 'Success',
                        'result': []
                    });
                }
            });
            }
          });  
        }
     }
  });
});

app.post('/checkArrival', function(req, res){
		var json_parsed=req.body;
		var meeting_id=json_parsed.meeting_id;
		var new_updated_time = moment(new Date()).tz('Asia/Tokyo').format("YYYY-MM-DD HH:mm:ss");
    
    db.query('SELECT * FROM meeting_members WHERE meeting_id = ? AND meeting_member = ?;',[meeting_id,req.session.logined],function(err,result,field){
        if (err) {
            console.log('error in check arrival part first query');
            console.log(err);
            res.send({
                'status': 'dbError',
                'result':[]
            });
        } else {
            if (result.length == 0) {
                console.log('invalid user want check arrival');
                res.send({
                    'status': 'invalidUser',
                    'result': []
                });
            } else{
                db.query('SELECT * FROM meeting_members WHERE meeting_id = ?;',[meeting_id],function(err,result,field){
                    if (err) {
                        console.log('error in check arrival part 2nd sql query');
                        res.send({
                            'status': 'dbError',
                            'result': []
                        });
                    } else {
                        var result_json ={
                            status: 'Success',
                            result: []
                        };
                        for(var i=0;i<result.length;i++){
                            result_json.result.push({
                                id: result[i].meeting_member,
                                is_arrived: result[i].is_arrived
                            }); 
                        }
                        res.send(result_json);
                    }
                });
            }
        }
    });
		
});

app.post('/checklateness', function(req,res){
    if(req.session.logined){
        console.log('Not logined user want to check lateness');
        res.send({
            'status': 'invalidUser',
            'result': []
        });
    } else {
        //TODO 최근 일주일의 날짜별 지각 시간 전송. 
        db.query('',[],function(err,result,field){
            if(err){
                console.log('error in check lateness part first sql query');
                res.send({
                    'status':'dbError',
                    'result':[]
                });
            } else {
                ////////////////////////////////////
            }
        });
    }
});

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

//J.H. part
function joinMeeting(request, response) {
    var meetingID = request.body.meeting_id;
    var isAccepted = request.body.isAccepted;
    var userID = request.body.user_id;

    if (isAccepted == false || isAccepted === undefined) {
        //TODO : Set meeting id to user denied access
        response.send({
            "status": "Userdenied",
            "result": []
        });
    } else {
        db.query('INSERT INTO meeting_members (meeting_id, meeting_member) VALUES (?,?);',
            [meetingID, userID],
            function (err, result, fields) {
                if (err) {
                    console.log("Error : " + err);
                    response.send({
                        "status": 'protocolError',
                        "result": []
                    });
                } else {
                    console.log("Insert into meeting mebers success");
                }
            });

        if (request.session.logined) {
            request.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('destroyed');
                }
            });
            response.send({
                "status": "ok",
                "result": []
            });
        }
    }
    response.end("meetingID : " + meetingID + "    isAccepted : " + isAccepted);
}

app.post('/joinMeeting', joinMeeting, function (error, data) {
    console.log("Error : " + error);
    console.log("Data : " + data);
});

function createMeeting(request, response) {
    var invalidPhoneNumbers = [];

    var phoneNumbers = request.body.phoneNumber;
    var meetName = request.body.meetName,
        location = request.body.location,
        meetTime = request.body.meetTime;

    async.each(phoneNumbers, function (phoneNumber, next) {
        db.query('SELECT phoneNumber FROM member WHERE phoneNumber=?;', [phoneNumber], function (err, result, fields) {
            if (err) {
                console.log("Select phone number query makes error.");
                next(err);
            } else if (result.length === 0) {
                invalidPhoneNumbers.push(phoneNumber);
                next();
            } else {
                db.query('INSERT INTO meeting (m_title, m_location, m_latitude, m_longitude, m_time, m_host) VALUES (?,?,?,?,?,?);',
                    [meetName, "", location.latitude, location.longitude, meetTime, request.session.logined],
                    function (err, result, fields) {
                        if (err) {
                            next(err);
                        }
                        else {
                            console.log(phoneNumber + " Insert into meeting table is suscces : " + result);
                            next();
                        }
                    });
            }
        });
    }, function (error) {

        if (error) {
            console.log("Error is occured : " + error);

            response.send({
                "status": 'protocolError',
                "result": []
            });

        } else {
            if (invalidPhoneNumbers.length > 0) {
                    response.send({
                        "status": "InvalidPhoneNumber",
                        "result": invalidPhoneNumbers
                    });
                } else if (request.session.logined) {
                    response.send({
                        "status": "ok",
                        "result": []
                    });
                } else {
                    response.send({
                        "status": "InvalidUser",
                        "result": []
                    });
                }
            }
        });
}

app.post('/createMeeting', createMeeting, function (error, data) {
    console.log(error);
    console.log(data);
});

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
            console.log('second querys result');
            console.log(result);
						db.query('SELECT * FROM meeting WHERE m_id =?', [meeting_id],function(err,result,field){
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
								        db.query('UPDATE member SET credit = credit + ? where id =?',[diff,id],function(err,result,fields)
								        { 
											    if(err){
												    console.log(err);
												    console.log('지각 memberDB credit 오류');
											    }else{
												    console.log(result);
							              response.send({"status": "Success","arrival_time": new_updated_time});
										      }
								        });
											}
									});

							}
						});
					}
				});
			 }
		});

});


http.createServer(app).listen(10000, function(){
  console.log('server running at (server ip):80');
});

