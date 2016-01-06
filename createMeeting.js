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

function createMeeting(request, response) {

    var phoneNumber = request.body.phoneNumber;
    var meetName = request.body.meetName,
        location = request.body.location,
        meetTime = request.body.meetTime,
        hostName = request.bodyhostName;



    db.query('SELECT phoneNumber FROM member WHERE phoneNumber=?;', [phoneNumber], function (err, result, fields) {
        if (err) {
            console.log('Error when select PhoneNumber ');
            response.send({
                "status": 'InvalidPhoneNumber',
                "result": []
            })
        } else {
            db.query('INSERT INTO meeting (m_title, m_location, m_latitude, m_longitude, m_time, m_host) VALUES (?,?,?,?,?,?);', [meetName, "", location.latitude, location.longitude, meetTime, hostName], function (err, result, fields) {
                if (err) {
                    console.log(err);
                    console.log('Error in join part first sql query');
                    response.send({
                        "status": 'protocolError',
                        "result": []
                    });
                }
                else {
                    console.log("Insert into meeting table is suscces : " +result);
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
            } else {
                response.send({
                    "status": "invalidUser",
                    "result": []
                });
            }
        }
    });
    response.end("meetTime : " + meetTime + "," + "meetName : " + meetName);
}

app.post('/createMeeting', createMeeting, function (error, data) {
    console.log(error);
    console.log(data);
});

app.use(function (request, response) {

});


http.createServer(app).listen(8888, function () {
    console.log('Server running at http://127.0.0.1:8888');
});