function tplawesome(e, t) { res = e; for (var n = 0; n < t.length; n++) { res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) { return t[n][r] }) } return res }

//resolve URL
var myUrl = window.location.href
myUrl = myUrl.substring(0, myUrl.lastIndexOf("/"));

$(function () {

    var videoNameSubmit;
    var youtubeID;

    //******************************************************************************
    //onClick video name title open modal
    $(document).on('click', ".link", function (e) {
        $("#modalVideoName").html(this.name);
        $('#myModal').modal('show');
        videoNameSubmit = this.name;
        youtubeID = this.id;
    });

    //******************************************************************************
    //onClick video genre category (DEAD)
    $(document).on('click', ".nav-tabs li a", function (e) {

        $(".nav-tabs li a").removeClass("active");
        $(this).addClass("active");
    });

    //******************************************************************************
    //on submit video name POST to routes.js
    $('#videoForm').on('submit', function (e) {
        e.preventDefault();
        var name = $("#nombre").val();

        if (!name) {
            $("#nombre").closest('.form-group').addClass('has-error');
            $("#errorMsg").html("Porfavor ingresa tu nombre");
        }
        else {
            var data = {};
            data.videoName = videoNameSubmit;
            data.userName = name;
            data.youtubeID = youtubeID;

            $.ajax({
                type: 'POST',
                url: myUrl + '/insertToQueue',
                data: data,
                datatype: 'json',
                success: function (data) {
                    bootbox.alert(data);
                    videoNameSubmit = null;
                    $('#myModal').modal('hide');

                }
            });
        }
    });

    //******************************************************************************
    //On modal popup close
    $('#myModal').on('hidden.bs.modal', function () {
        $("#nombre").closest('.form-group').removeClass('has-error');
        $("#errorMsg").html("");
    });



    //******************************************************************************
    //Accordion (DEAD)
    $(document).on('click', ".accordionLink", function (e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        }
        else {
            $(this).addClass('active');
            $(this).next().find("video").remove();
            $(this).next().append('<video id="' + this.id + '" controls> <source src="' + this.id + '" type="video/mp4">Your browser does not support the video tag.</video>');
        }
        $(this).next().slideToggle();
    });

    //Search music video
    $("#searchVideo").on("submit", function (e) {
        e.preventDefault();

        var q = encodeURIComponent($("#search").val()).replace(/%20/g, "+");

        // prepare the request SEARCH
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            videoCategoryId: "10",
            q: q,
            maxResults: 25,
            order: "viewCount"
        });

        // execute the request
        request.execute(function (response) {
            var results = response.result;
            $("#results").html("");
            $.each(results.items, function (index, item) {
                $.get("item.html", function (data) {
                    $("#results").append(tplawesome(data, [{ "title": item.snippet.title, "videoid": item.id.videoId }]));
                });
            });
            resetVideoHeight();
        });
    }); //end search 

    $(window).on("resize", resetVideoHeight);
});

function resetVideoHeight() {
    $(".video").css("height", $("#results").width() * 9 / 16);
}


//Show Play List videos from category
function showPlaylistVideos(videoPlaylistArray) {
    $("#results").html("");
    $.each(videoPlaylistArray, function (index, item) {
        $.get("item.html", function (data) {
            $("#results").append(tplawesome(data, [{ "title": item.snippet.title, "videoid": item.snippet.resourceId.videoId }]));
        });
    });
    resetVideoHeight();
}


var pageToken = '';
var videoPlaylistArray = [];

function getMainPageVideos(PageToken, playlistid) {
    //$("#results").html('<img class="load" src="ajax-loader.gif" />');
    $("#results").html('  <div class="bubblingG"><span id="bubblingG_1"></span><span id="bubblingG_2"> </span> <span id="bubblingG_3"> </span></div>');

    var request = gapi.client.youtube.playlistItems.list({
        part: "snippet",
        playlistId: playlistid,
        maxResults: 50,
        pageToken: pageToken
    });

    request.execute(function (response) {

        pageToken = response.nextPageToken;
        videoPlaylistArray = videoPlaylistArray.concat(response.items);

        //Are we done? if not loop and grow video list array
        if ((pageToken != null) && (videoPlaylistArray.length > 100)) {
            getMainPageVideos(PageToken);
        }
        else { //Yes we are done
            videoPlaylistArray = videoPlaylistArray.sort(function () {
                return .5 - Math.random(); //sort array
            });

            videoPlaylistArray = videoPlaylistArray.slice(0, 25); // how many videos should we show? 
            showPlaylistVideos(videoPlaylistArray);
        }
    });
}


function regueton() {
    getMainPageVideos('', "PLS_oEMUyvA728OZPmF9WPKjsGtfC75LiN");
}

function home() {
    getMainPageVideos('', "PLFgquLnL59alGlH9iRJazkBabbzygCb7f"); //Home Top 40
}


function init() {
    gapi.client.setApiKey("AIzaSyCq51DgkrHETgZdRXifxrxGhUyzFoET3Jk"); //my api key
    gapi.client.load("youtube", "v3", function () {
        // yt api is ready
        getMainPageVideos('', "PLFgquLnL59alGlH9iRJazkBabbzygCb7f"); //Home Top 40

    });
}


