/// <reference path="typings/node/node.d.ts"/>

var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    mysql = require('mysql'),
    moment = require('moment-timezone'),
    dateFormat = require('dateformat'),
	async = require('async');


//var TMClient = require('textmagic-rest-client');
var twilio =require('twilio'),
	client = twilio('AC03306d578862c299b446eaa6e76eb0e9','1cba81914b63bbfc9ea0d35090eb24f9'),	cronJob = require('cron').CronJob;



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

//app.use(twilioNotifications.notifyOnError);

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
      console.log(err);
      res.send({
        "status": 'Error (login) protocol',
        "result": []
      });
    } else{
      if(result.length == 0){ // login fail by invalid id
        console.log("login failed : InvalidID");
        res.send({
          "status": "Error (login) InvalidID",
          "result": []
        });
      }else{
        if(result[0].pw == pw){//로그인 성공
          db.query('SELECT meeting_id FROM meeting_members WHERE meeting_member=?',[id],function(err2,result2,field2){
            if(err2){
              console.log('Error in login part second sql query');
              res.send({
                "status": 'Error (login) protocol 2',
                "result": []
              });
            }else{
              console.log('login success');
              db.query('SELECT * FROM (SELECT meeting_id FROM meeting_members WHERE meeting_member = ?)temp1 INNER JOIN (SELECT * FROM meeting_members, meeting, member WHERE meeting_members.meeting_member = member.id AND meeting.m_id = meeting_members.meeting_id)temp2 WHERE temp1.meeting_id = temp2.meeting_id;',[id],function(err,result,field){
                    if (err) {
                        console.log('error in login part 3rd sql query');
                        res.send({
                          'status': 'Error (login) DB 3',
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
            "status": "Error (login) InvalidPassword",
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
      "status": "Success",
      "result":[]
    });
  }else{
    res.send({
      "status": "Error (logout) invalidUser",
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
      'status':'Error (checkId) NULL',
      'result':[]
    });
  }

  db.query('SELECT id FROM member WHERE id=?;',[id], function(err,result,fields){
    if(err){
      console.log('err');
      console.log('Error in check id part first sql query');
      res.send({
        "status": 'Error (checkID) DB1',
        "result": []
      });
    }else{
      if(result.length != 0){ 
        console.log("duplicated ID");
        res.send({
          "status": "Error (check) DuplicatedId",
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
  
  db.query('SELECT * from member where phoneNumber =?', [pNum], function (error, rows, field) {
    if (error) {
        console.log('error in join part first sql query');
        console.log(error);
		res.send({
            'status': 'Error (join) DB ',
            'result': []
        });
    } else { 
        if (rows.length!=0){
          console.log("Already have phone number : " + pNum);
          res.send({
             "status": 'Error (join ) DuplicatedPhoneNumber',
             "result": []
          });
        } else {
          db.query('INSERT INTO member (id,pw,credit,member.name,phoneNumber,email) VALUES (?,?,?,?,?,?);',[id,pw,0,name,pNum,email], function(err,result,fields){
            if(err){
              console.log(err);
              console.log('Error in join part second sql query');
              res.send({
                "status": 'Error (join) DB2 ',
                "result": []
              });
            } else{
            db.query('INSERT INTO location (latitude,longitude,location.id,updated_time) VALUES (?,?,?,?);',[0,0,id,'1999-12-31 23:59:59'],function(err2,result2,fields2){
                if(err2){
                console.log('Error in join part 3rd sql query');
                res.send({
                    "status":'Error (join) DB3',
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
		var member_id=json_parsed.user_id;
		var new_updated_time = moment(new Date()).tz('Asia/Tokyo').format("YYYY-MM-DD HH:mm:ss");
    
    db.query('SELECT * FROM meeting_members WHERE meeting_id = ? AND meeting_member = ?;',[meeting_id,member_id],function(err,result,field){
        if (err) {
            console.log('error in check arrival part first query');
            console.log(err);
            res.send({
                'status': 'Error (checkArrival) DB',
                'result':[]
            });
        } else {
            if (result.length == 0) {
                console.log('invalid user want check arrival');
                res.send({
                    'status': 'Error (checkArrival) invalidUser',
                    'result': []
                });
            } else{
                db.query('SELECT * FROM meeting_members WHERE meeting_id = ?;',[meeting_id],function(err,result,field){
                    if (err) {
                        console.log('error in check arrival part 2nd sql query');
                        res.send({
                            'status': 'Error (checkArrival) DB2',
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

app.post('/getlateness', function(req,res){
    //console.log(req.session.logined);
   	  var id = req.body.user_id;
 //   var id = req.session.logined;
    if(!id){
        console.log('Not logined user want to check lateness');
        res.send({
            'status': 'Error (getlateness) invalidUser',
            'result': []
        });
    } else {
        //TODO 최근 일주일의 날짜별 지각 시간 전송. 
        db.query('SELECT * FROM member_lateness WHERE member_lateness.member_id = ?;',[id],function(err,result,field){
            if(err){
                console.log('error in check lateness part first sql query');
                res.send({
                    'status':'Error (getlateness) DB1',
                    'result':[]
                });
            } else {
                var json={status:'Success',result:[]};
                var now = moment().tz("Asia/Seoul");
                for(var i = 0; i<7; i++){
                    json.result.push(0);
                }
                for(var i = 0; i<result.length; i++){
                    var late_date = moment(result[i].date).tz("Asia/Seoul");
                    var diff = now.diff(late_date,'day');
                    console.log(diff);
                    json.result[diff-1]+=result[i].late_time;
                }
                res.send(json);
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
			"status": "Error (location) outOfRegion",
			"result": []});

		//part3] DB update
		else{
			db.query('UPDATE location SET latitude=?, longitude =? ,updated_time=? WHERE id =? ',[new_latitude, new_longitude, new_updated_time, id]);

			db.query('SELECT * FROM location where id= ?', [id],function(err,result,field){
					if(err)
					{
						console.log("Error (location) DB1  UpdateLocation");
						response.send({
							"status":"Error",
							"result":[]
						});
					}
					if(result.length ==0)
					{
						console.log("UpdateLocation failed : InvalidID");
						resonse.send({
							"status": "Error (location ) DB2 UserLocationDataIsNotExist",
							"result": []
							});
					}
					console.log(result);
					response.send(
						{
						"status": "Success",
						"result": []
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





app.post('/writeComment', function(request, response){
//part1] request 확인
		var json_parsed=request.body;
	
		var user_id= json_parsed.user_id;
		var meeting_id=json_parsed.meeting_id;
		var comment=json_parsed.comment;

		console.log(' 사용자		:' + user_id);
		console.log('약속 생성 :' + meeting_id);
		console.log('코멘트 내용  :' + comment);


		console.log(comment.length);
		if(comment.length == 0){
						
				db.query('SELECT board FROM meeting where m_id= ?', [meeting_id],function(err,result,field){
					if(err)
					{
						console.log("Error in Board Query error");
						response.send({
							"status":"Error (writeComment)  DB Error",
							"result":[]
						});
					}

					else if(result.length ==0)
					{
						console.log("Error in Board Query2 ");
						resonse.send({
							"status": "Error (WriteComment) No History",
							"result": ""
							});
					}
					else{
						console.log("결과 >>" +result[0].board);
						response.send(
						{
							"status": "Success",
							"result": result[0].board
						});
					}
				});
		}


		//part3] DB update
		else{
			db.query('UPDATE meeting SET board=CONCAT(board,"/",?)  WHERE m_id =? ',[user_id+"@"+comment,meeting_id],function(err,result,field){
					
					db.query('SELECT board FROM meeting where m_id= ?', [meeting_id],function(err,result,field){
					if(err)
					{
						console.log("Error in Board Query error");
						response.send({
							"status":"NO meeiting",
							"result":[]
						});
					}

					else if(result.length ==0)
					{
						console.log("Error in Board Querye2 ");
						resonse.send({
							"status": "Error (writeComment) No HIstory",
							"result": []
							});
					}
					else{
						console.log("결과 >>" +result[0].board);
						response.send(
						{
							"status": "Success",
							"result": result[0].board
						});
					}
				});


					
			});

		}
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
                    if (request.session.logined) {
                        response.send({
                            "status": "ok",
                            "result": []
                        });
                    }
                }
            });


    }
    //response.end("meetingID : " + meetingID + "    isAccepted : " + isAccepted);
}

app.post('/joinMeeting', joinMeeting, function (error, data) {
    console.log("Error : " + error);
    console.log("Data : " + data);
});







function createMeeting(request, response) {

//	console.log("request>>");
//	console.log(request);

    var meetName = request.body.meetName,
        location = request.body.location,
        locationName = request.body.locationName,
      	meetTime = request.body.meetTime;

    var phoneNumbers = request.body.phoneNumber;

	console.log(">>>\n" + phoneNumbers);

//	sendSMSToUser(phoneNumbers);


    async.each(phoneNumbers, function (phoneNumber, next) {
        db.query('SELECT phoneNumber FROM member WHERE phoneNumber=?;', [phoneNumber], function (err, result, fields) {
            if (err) {
                console.log("Select phone number query makes error.");
                next(err);
            } else if (result.length === 0) {
             	console.log("비회원 문자전송시도!!");
				sendSMSToUser(phoneNumber, function (err) {
					console.log("전송 to >>" + phoneNumber);
                    console.log(err);
                    next(err);
                });
                next();
            } else {

				console.log("회원 문자전송시도!!");
				sendSMSToUser2(phoneNumber, function (err) {
					console.log("전송 to >>" + phoneNumber);
                    console.log(err);
                    next(err);
                });

				
                db.query('INSERT INTO meeting (m_title, m_location, m_latitude, m_longitude, m_time, m_host) VALUES (?,?,?,?,?,?);',
                    [meetName, "", location.latitude, location.longitude, meetTime, phoneNumber],
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
            response.send({
                "status": "invalidUser",
                "result": []
            });
        }

    });

}











function sendSMSToUser(phoneNumber) {




console.log("in function >> "+ '82'+ phoneNumber);


phoneNumber= (phoneNumber+"").substr(1);
phoneNumber='+82'+phoneNumber;
console.log(phoneNumber +"<<");
client.sendMessage( 
			  { 
				to:phoneNumber+"", 
				from:'+12569800027', 
				body:'[HurryUp]을 다운받아 약속을 확인하세요 '},
				function( err, data ) {
								if(err)	console.log(err);
								else{
							      console.log( "문자전송 시도"+ phoneNumber );
								  }
				});


 }




function sendSMSToUser2(phoneNumber) {




console.log("in function >> "+ '82'+ phoneNumber);


phoneNumber= (phoneNumber+"").substr(1);
phoneNumber='+82'+phoneNumber;
console.log(phoneNumber +"<<");
client.sendMessage( 
			  { 
				to:phoneNumber+"", 
				from:'+12569800027', 
				body:'[HurryUp] 새로운 모임을 확인하세요 '},
				function( err, data ) {
								if(err)	console.log(err);
								else{
							      console.log( "문자전송 시도"+ phoneNumber );
								  }
				});


 }

app.post('/createMeeting', createMeeting, function (error, data) {
    console.log(error);
    console.log(data);
});

app.post('/createMeeting2',function(req,res){
    var meetName = req.body.meetName,
        location = req.body.location,
        locationName = req.body.locationName,
        phoneNumbers = req.body.phoneNumbers,
        hostName = req.body.hostName,
      	meetTime = req.body.meetTime;
    console.log(hostName); 
    db.query('INSERT meeting (m_title,m_location,m_latitude,m_longitude,m_time,m_host) VALUES (?,?,?,?,?,?);',[meetName,locationName,location.latitude,location.longitude,meetTime,hostName],function(err,result,fields){
        if(err){
            console.log(err);
            console.log('err in createMeeting2 first sql query');
            res.send({'status':'dbError',result:[]});
        } else {
            db.query('SELECT m_id FROM meeting WHERE m_title = ? AND m_host =?;',[meetName,hostName],function(err,result,fields){
                if(err){
                  console.log(err);
                  res.send({status:'dbError'});
                } else {
                  var m_id = result[result.length-1].m_id;
                  db.query('INSERT meeting_members (meeting_id,meeting_member) VALUES (?,?);',[m_id,hostName],function(err,result,fields){
                    if(err){
                      console.log(err);
                      console.log('err in create meeting 3rd query');
                      res.send({status:'dbError',result:[]});
                    } else {
                      async.each(phoneNumbers,function(phoneNumber,next){
                        db.query('INSERT invitation (phoneNumber,m_id) VALUES (?,?);',[phoneNumber,m_id],function(err,result2,fields){
                          if(err) {
                            next(err);
                          } else {
                            console.log(phoneNumber + " insert into invitaion table");
                            next();
                          }
                        });
                      }, function(error) {
                        if(error) {
                          console.log(error);
                          console.log('error in create meeting async part');
                          res.send({status:'dbError'});
                        } else {
                          res.send({status:'Success',result:[]});
                        }
                      });
                    }
                  });
                }
            });
        }
    });
});

app.post('/checkInvitation',function(req,res){
    var id = req.body.id;
    db.query('SELECT temp1.*, temp2.name FROM (SELECT meeting.m_id, meeting.m_title, meeting_members.meeting_member FROM meeting,meeting_members, invitation, member WHERE meeting.m_id = invitation.m_id AND meeting.m_id = meeting_members.meeting_id AND member.phoneNumber = invitation.phoneNumber AND member.id = ? AND is_accepted = 0)temp1 INNER JOIN (SELECT member.name, id from member)temp2 WHERE temp1.meeting_member = temp2.id;',[id],function(err,result,fields){
        if(err) {
            console.log(err);
            console.log('err in check invitation first sql');
            res.send({status:'dbError'});
        } else {
            json = {status:'Success',result:[]};
            var checkarr = [];
            for(var i = 0;i <result.length;i++) {
                var checker = 0;
                for(var j =0;j<checkarr.length;j++){
                    if(checkarr[j]==result[i].m_title) checker++;
                }
                if(checker!=0){
                    for(var j = 0; j<checkarr.length;j++){
                        if(checkarr[j]==result[i].m_title){
                            json.result[j].meeting_members.push({
                                id: result[i].meeting_member,
                                name: result[i].name
                            });
                        } 
                    }
                } else {
                     checkarr.push(result[i].m_title);
                     json.result.push({
                         meeting_name: result[i].m_title,
                         meeting_id: result[i].m_id,
                         meeting_members:[{
                             name: result[i].name,
                             id: result[i].meeting_member
                         }]
                     });
                 }
              }
              console.log(id);
              console.log(json);
              res.send(json);
        }
    });
});

app.post('/acceptInvitation', function(req,res){
    var m_id = req.body.meeting_id;
    var id = req.body.id;

    db.query('INSERT meeting_members (meeting_id,meeting_member) VALUES (?,?);',[m_id,id],function(err,result,fields){
        if(err){
            console.log('err in accept invitation first query '+err);
            res.send({status:'dbError'});
        } else {
            db.query('SELECT * FROM member, meeting WHERE meeting.m_id = ? AND member.id = ?;',[m_id,id],function(err,result,fields){
                if(err) { 
                    console.log('err in accept invitation 2nd query');
                    console.log(err);
                    res.send({status:'dbError'});
                } else {
                    db.query('UPDATE invitation SET is_accepted = 1 WHERE phoneNumber = ? AND m_id = ?;',[result[0].phoneNumber,result[0].m_id],function(err,result,fields){
                        if(err) {
                            console.log(err);
                            console.log('err in accept invitation 3rd query');
                            res.send({status:'dbError'});
                        } else {
                            res.send({status:'Success'});
                        }
                    });
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
		var new_updated_time = moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss");

		console.log('id 		:' + id);
		console.log('meeting_id :' + meeting_id);

		//part2] DB update
		db.query('UPDATE meeting_members SET is_arrived= 1,arrived_time=? WHERE meeting_id =? AND meeting_member=?',[new_updated_time,meeting_id, id], function(err) {
			if(err)	{
					console.log(err);
					console.log("noticeArriaval DB error :1");
          response.send({
            'status':'protocolError',
            'result':[]
          });
			}
			else{
				db.query('SELECT * FROM meeting_members where meeting_member =?  AND  meeting_id=?', [id,meeting_id],function(err,result,field){
					if(err)
					{
						console.log("Error in Update Meeting_member  Query error");
						response.send({"status":"dbError","result":[]});
					}
					else{
						db.query('SELECT * FROM meeting WHERE m_id =?', [meeting_id],function(err,result,field){
							var meet_time = moment(result[0].m_time).tz("Asia/Seoul");
							var arrive_time = moment().tz("Asia/Seoul");
							var diff = arrive_time.diff(meet_time,'minutes')
							console.log('약속' + meet_time.format("YYYY-MM-DD HH:mm:ss"));
							console.log('도착' + arrive_time.format("YYYY-MM-DD HH:mm:ss"));
							console.log(diff);
							if(diff>0)
							{
								console.log('지각');
								db.query('INSERT INTO member_lateness (member_id,late_time) VALUES (?,?)',[id,diff],function(err,result,field){
											if(err){
												console.log(err);
												console.log('noticeARRIVAL lATE DB update err!!!!');
											  response.send({'status':'dbError','result':[]});
                      }
											else{
								        db.query('UPDATE member SET credit = credit + ? where id =?',[diff,id],function(err,result,fields)
								        { 
											    if(err){
												    console.log(err);
												    console.log('지각 memberDB credit 오류');
											      response.send({'status':'dbError','result':[]});
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
  console.log('server running at 54.238.241.139:10000');
});

