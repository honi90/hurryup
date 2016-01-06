/// <reference path="typings/node/node.d.ts"/>

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mysql = require('mysql');

var app = express();

var db = mysql.createConnection({
    user: 'root',
    password: 'sgen',
    database: 'hurryup'
});

app.use(express.session({ secret: 'secret key' }));
app.use(express.bodyParser());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

app.use(function (request, response) {

});


http.createServer(app).listen(8888, function () {
    console.log('Server running at http://127.0.0.1:8888');
});