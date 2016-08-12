
var appRouter = function (app, io) {

    // var videoFolder = "G:/SAVE/BARAPP/videos contreras";
    //FOLDER MUSIC VIDEO GENRES
    var videoFolder = "G:/SAVE/BARAPP/videos contreras/";
    var internacional = "G:/SAVE/BARAPP/videos contreras/internacional";
    var cumbias = "G:/SAVE/BARAPP/videos contreras/cumbias";
    var electronica = "G:/SAVE/BARAPP/videos contreras/electronica";
    var hiphop = "G:/SAVE/BARAPP/videos contreras/hiphop";
    var pop = "G:/SAVE/BARAPP/videos contreras/pop";
    var reggaeton = "G:/SAVE/BARAPP/videos contreras/reggaeton";
    var romanticas = "G:/SAVE/BARAPP/videos contreras/romanticas";

    var mysql = require("mysql");

    // First you need to create a connection to the db
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'thomasro_jukebox',
        password: 'war204',
        database: 'thomasro_jukeboxBar'
    });


    //Get *NOT APPROVED* current music video queue
    app.get("/getCurrentQueue", function (req, res) {

        con.query('SELECT * FROM cue WHERE approvado = 0 ', function (err, rows) {
            if (err) throw err;

            console.log('Data received from Db:\n');
            console.log(rows);
            var json = JSON.stringify(rows);
            res.end(json);
        });
    });

    //Get next *APPROVED* music video from queue
    app.get("/getNextVideo", function (req, res) {

        con.query('SELECT * FROM cue WHERE approvado = 1 AND tocado = 0 ORDER BY date ASC LIMIT 1 ', function (err, row) {
            if (err) throw err;
        
            var json = JSON.stringify(row);
            res.end(json); // return next video

            if (row[0] != null) {
                console.log(row[0].idcue);
                con.query('UPDATE cue SET tocado = 1 WHERE idcue = ' + row[0].idcue, function (err, row) {
                    if (err) throw err;
                });//end of update video
            }

        });//end of select next video
    });

    //Insert music video to queue
    app.post("/insertToQueue", function (req, res) {

        var user = req.body.userName;
        var video = req.body.videoName;
        var id = req.body.youtubeID;


        var data = { name: video, person: user, date: new Date(), youtubeid: id };
        con.query('INSERT INTO cue SET ?', data, function (err, res) {
            if (err) throw err;

            console.log('Last insert ID:', res.insertId);
            io.emit('insert', data, res.insertId); //Insert music video succesfull
        });
        res.end('success madafaka');
    });

    //Delete music video from queue
    app.post("/deleteVideoFromQueue", function (req, res) {

        var id = req.body.id;
        console.log("Delete " + id);
        con.query('DELETE from cue WHERE idcue =' + id, function (err, res) {
            if (err) throw err;
        });

        res.end('delete success madafaka');
    });


    //Approve Video from queue
    app.post("/approveVideoFromQueue", function (req, res) {

        var id = req.body.id;
        console.log("Approve " + id);
        con.query('UPDATE cue SET approvado = 1 WHERE idcue =' + id, function (err, res) {
            if (err) throw err;

            var data = { name: req.body.videoName, person: req.body.personName };
            io.emit('approve', data, res.insertId); //emit video after insert
        });

        res.end(' ');
    });


    //retrieve
    app.get("/retrieve", function (req, res) {
        res.sendFile(__dirname + '/retrieveVideos.html');
    });

    //player
    app.get("/player", function (req, res) {
        res.sendFile(__dirname + '/player.html');
    });

    //admin panel
    app.get("/admin", function (req, res) {
        res.sendFile(__dirname + '/admin.html');
    });


    //GET VIDEO LIST FROM PC DIRECTORY
    app.get("/get-videos", function (req, res) {

        var fs = require('fs');
        var category = req.query.category;

        //A category is selected then get videos from category
        if ((category != null) && (category != "todos")) {
            var data = fs.readdirSync(videoFolder + category);
           // console.log(data);

            data.forEach(function (part, index) {
                data[index] = category + "/" + data[index];
            });


            res.send(data);
        }

        else {
            //get all music videos
            var array1 = fs.readdirSync(internacional);
            var array2 = fs.readdirSync(pop);
            var array3 = fs.readdirSync(cumbias);
            var array4 = fs.readdirSync(electronica);
            var array5 = fs.readdirSync(hiphop);
            var array6 = fs.readdirSync(reggaeton);
            var array7 = fs.readdirSync(romanticas);

            array1.forEach(function (part, index) {
                array1[index] = "internacional/" + array1[index];
            });

            array2.forEach(function (part, index) {
                array2[index] = "pop/" + array2[index];
            });

            array3.forEach(function (part, index) {
                array3[index] = "cumbias/" + array3[index];
            });

            array4.forEach(function (part, index) {
                array4[index] = "electronica/" + array4[index];
            });

            array5.forEach(function (part, index) {
                array5[index] = "hiphop/" + array5[index];
            });

            array6.forEach(function (part, index) {
                array6[index] = "reggaeton/" + array6[index];
            });

            array7.forEach(function (part, index) {
                array7[index] = "romanticas/" + array7[index];
            });

            var videoFilenames = array1.concat(array2, array3, array4, array5, array6); //concat all videos into one big array
            res.send(videoFilenames.sort());
        }

    });


    //nothing
    app.post("/account", function (req, res) {

    });



}

module.exports = appRouter;