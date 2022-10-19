const form = document.querySelector(".input_video_here");
const fileInput = document.querySelector(".file-input");
const uploadedArea = document.querySelector(".uploaded-area");
const file_input_text = document.querySelector(".input_type");
const show_video_btn = document.querySelectorAll(".field");
const ad_times = document.querySelector("#ad_times_shown");
const play_replay_btn = document.getElementById("play_button");

var main_video;
var ad_video;
var no_of_times_ads_to_play = 0;
var video_count = 0;
var play_ad_at = 0;
var string_of_ad_time = [];
var ad_played = 0;
var is_listener_enabled = false;
var is_last_ad_done = false;
var is_replayed_button = false;

function get_ad_positions(video_duration, no_ads) {
    var ads_positions = [];

    while (ads_positions.length < no_ads) {
        var random_number = Math.floor(Math.random()*video_duration);
        if (ads_positions.indexOf(random_number) == -1) { 
            ads_positions.push(random_number);
        }
    };
    return ads_positions;
};

function compare(a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
}

ad_times.addEventListener('input', function(e) {
    if (e.target.value == 0) {
        document.querySelector(".submit_btn").innerText = "Skip";
    } else if (e.target.value.length > 0) {
        document.querySelector(".submit_btn").innerText = "Continue";
    } else {
        document.querySelector(".submit_btn").innerText = "Skip";
    }
});

ad_times.addEventListener('keypress', function(e) {
    if (e.keyCode == 13) document.querySelector(".submit_btn").click();
});

form.addEventListener("click", () =>{
    fileInput.click();
});

fileInput.onchange = ({target})=>{
    let file = target.files[0];
    if(file){
        let fileName = file.name;
        if(fileName.length >= 12){
            let splitName = fileName.split('.');
            fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
        }
        video_count++;
        file_input_text.innerHTML = "Upload The Advertisement Video";
        if (video_count >= 2) {
            ad_video = URL.createObjectURL(target.files[0]);
            form.remove();
            show_video_btn[1].classList.remove("hide");
            play_replay_btn.classList.remove("hide");
            file_input_text.innerHTML = "Click on the Play Button to get the video.";
        } else if (video_count == 1) {
            main_video = URL.createObjectURL(target.files[0]);
        }
    }
}

document.querySelector(".submit_btn").addEventListener("click", function() {
    show_video_btn[0].classList.add("hide");
    show_video_btn[1].classList.add("hide");
    if (ad_times.value == null || ad_times.value == '') {
        no_of_times_ads_to_play = 0;
    } else if (ad_times.value < 0) {
        no_of_times_ads_to_play = 0;
    } else {
        no_of_times_ads_to_play = ad_times.value;
    }
    document.querySelector(".submit_btn").classList.add("hide");
    document.querySelector(".wrapper").classList.remove("hide");
    active_play_button();
});

function next_ad_time() {
    ad_played = ad_played+1;
    return string_of_ad_time[ad_played-1];
}

function previous_ad_time() {
    return string_of_ad_time[ad_played-1];
}

//var play_main_video = 
function play_main_video() {
    return new Promise(function(resolve,reject){
        document.getElementById("video_html5_api").src = main_video;
        videojs("video").currentTime(previous_ad_time());
        document.querySelector(".vjs-control-bar").style.display = "flex";
        var Z = setInterval(function(){
            if (document.getElementById("video_html5_api").readyState > 0) {
                clearInterval(Z);
                resolve("Ok");
            }
        }, 100);
    })
};

function play_ad_video (){
    return new Promise(function(resolve,reject){
        document.getElementById("video_html5_api").src = ad_video;
        document.querySelector(".vjs-control-bar").style.display = "none";
        var X = setInterval(function(){
            if (document.getElementById("video_html5_api").readyState > 0) {
                clearInterval(X);
                resolve("Ok");
            }
        }, 100);
    })
};

function enable_listener() {
    if (is_listener_enabled == false){
        document.getElementById("video_html5_api").addEventListener('ended', function() {
            if ((ad_played < parseInt(no_of_times_ads_to_play)) == true) {
                //console.log(ad_played,no_of_times_ads_to_play,(ad_played < parseInt(no_of_times_ads_to_play)));
                play_main_video().then(res => {
                    videojs("video").play();
                    file_input_text.innerHTML = `Main video is resumed.`;
                });
            } else {
                document.getElementById("video_html5_api").removeEventListener('ended', function() {
                    if ((ad_played < parseInt(no_of_times_ads_to_play)) == true) {
                        //console.log("ji",ad_played,no_of_times_ads_to_play,(ad_played < parseInt(no_of_times_ads_to_play)));
                        play_main_video().then(res => {
                            videojs("video").play();
                            file_input_text.innerHTML = `Main video is resumed.`;
                        });
                    }
                });
                if (is_last_ad_done == false) {
                    play_main_video().then(res => {
                        videojs("video").play();
                        file_input_text.innerHTML = `Main video is resumed.`;
                        is_last_ad_done = true;
                    });
                }
            }
        });
        is_listener_enabled = true;
    }
}

// vjs-play-control vjs-control vjs-button vjs-paused vjs-ended

function show_ad(play_ad_at) {
    return new Promise(function(resolve,reject){
        var video = document.getElementById("video_html5_api");
        //console.log(play_ad_at);
        var played_video = setInterval(function(){
            if (videojs("video").currentTime() >= play_ad_at) {
                videojs("video").pause();
                file_input_text.innerHTML = `Advertisement video is being played`;
                play_ad_video().then(resp => {
                    videojs("video").play();
                });
                enable_listener();
                clearInterval(played_video);
                resolve("Ok");
            } else if ((play_ad_at - videojs("video").currentTime()) <= 10) {
                file_input_text.innerHTML = `Advertisement video will begin in ${Math.floor(play_ad_at - videojs("video").currentTime())}`
            }
        }, 500);
    });
}

function active_play_button() {
    play_replay_btn.addEventListener("click", function() {
        is_last_ad_done = false;
        play_replay_btn.innerText = "Replay";
        //show_video_btn[1].classList.remove("hide");
        show_video_btn[1].classList.add("hide");
        file_input_text.innerHTML = "Enjoy the Video.";
        var video = document.querySelector("source");
        video.src = main_video;
        var s = document.createElement('script');
        s.src = 'https://vjs.zencdn.net/7.18.1/video.min.js';
        document.body.appendChild(s);
        document.getElementById("video").style.display = "block";
        var k = setInterval(function(){
            var player = videojs('video');
            if (document.getElementById("video_html5_api").readyState > 0) {
                videojs("video").play();
                var main_video_length = document.getElementById("video_html5_api").duration;
                string_of_ad_time = get_ad_positions(main_video_length,no_of_times_ads_to_play);
                string_of_ad_time.sort(compare);
                //console.log(string_of_ad_time);
                clearInterval(k);
                videojs("video");
                string_of_ad_time.forEach(play_ad_at => {
                    show_ad(play_ad_at).then(res => {
                        //console.log("hh");
                        ad_played++;
                    });
                });
            };
        }, 200);
    });
}

var checking = setInterval(function(){
    if (document.querySelectorAll(".vjs-ended")[1] != null) {
        is_replayed_button = false;
        document.querySelectorAll(".vjs-ended")[1].addEventListener("click", function() {
            if (document.querySelectorAll(".vjs-ended")[1] != null && document.querySelectorAll(".vjs-ended")[1].title == 'Replay') {
                if (is_replayed_button == false) {
                    is_replayed_button = true;
                    is_last_ad_done = false;
                    ad_played = 0;
                    play_ad_at = 0;
                    string_of_ad_time = [];
                    is_listener_enabled = false;
                    play_replay_btn.innerText = "Replay";
                    //show_video_btn[1].classList.remove("hide");
                    show_video_btn[1].classList.add("hide");
                    file_input_text.innerHTML = "Video is replaying from the starting with new Ad timing.";
                    var video = document.querySelector("source");
                    video.src = main_video;
                    var s = document.createElement('script');
                    s.src = 'https://vjs.zencdn.net/7.18.1/video.min.js';
                    document.body.appendChild(s);
                    document.getElementById("video").style.display = "block";
                    var k = setInterval(function(){
                        var player = videojs('video');
                        if (document.getElementById("video_html5_api").readyState > 0) {
                            videojs("video").play();
                            var main_video_length = document.getElementById("video_html5_api").duration;
                            string_of_ad_time = get_ad_positions(main_video_length,no_of_times_ads_to_play);
                            string_of_ad_time.sort(compare);
                            //console.log(string_of_ad_time);
                            clearInterval(k);
                            videojs("video");
                            string_of_ad_time.forEach(play_ad_at => {
                                show_ad(play_ad_at).then(res => {
                                    //console.log("hh");
                                    ad_played++;
                                });
                            });
                        };
                    }, 200);
                }
            }
        })
    }
}, 1000)