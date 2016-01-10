/// <reference path="typings/node/node.d.ts"/>

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    async = require('async');

var app = express();

var db = mysql.createConnection({
    user: 'root',
    password: 'sgen',
    database: 'hurryup'
});

// app.use(express.session({ secret: 'secret key' }));
app.use(express.bodyParser());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
            if (invalidPhoneNumbers.length > 0) {
                    response.send({
                        "status": "InvalidPhoneNumber",
                        "result": invalidPhoneNumbers
                    });
                } else if (true) {
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