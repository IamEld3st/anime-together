var highQuality = true;
var syncStatus = 0;
var currentEpisode = 0;
var serverTime = 0;
var offset = 0;
var episodesLeft = 0;
var serverStatus = 0;
var nick = 'Nickname';
var player = videojs(document.getElementById('mainVideo'), { "controls": false, "autoplay": false, "preload": "auto" });
var socket = io();
var pl,
    hqSource,
    lqSource;

$.get( "/info").done(function( data ) {
    pl = data;
    hqSource = data.hq;
    lqSource = data.lq;
});

function setupPlayer(){
  player.src({ type: "video/mp4", src: "" });
  player.on('ready', function(){player.currentTime(serverTime)});
}
setupPlayer();
player.on('ready', function(){player.play()});

var ui = setInterval(updateInfo, 100);
function updateInfo(){
  serverTime = player.currentTime();
  // Name
  document.getElementById('currentAnime').innerHTML = pl.name;  
  // SyncStatus
  if (syncStatus === 1) {
    document.getElementById('syncStatus').innerHTML = 'Synced';
  }else if (syncStatus === 2) {
    document.getElementById('syncStatus').innerHTML = 'Unsynced';
  }else{
    document.getElementById('syncStatus').innerHTML = 'Unknown';
  }
  // CurrentQuality
  if (highQuality) {
    document.getElementById('currentQuality').innerHTML = 'High';
  }else{
    document.getElementById('currentQuality').innerHTML = 'Low';
  }
  // CurrentEpisode
  document.getElementById('currentEpisode').innerHTML = currentEpisode;
  // ServerTime
  document.getElementById('serverTime').innerHTML = serverTime;
  // YourTime
  document.getElementById('yourTime').innerHTML = player.currentTime();
  // TimeOffset
  document.getElementById('timeOffset').innerHTML = serverTime - player.currentTime();
  // ServerStatus
  if (serverStatus === 0){
    document.getElementById('serverStatus').innerHTML = 'Ready';
  }else if (serverStatus === 1) {
    document.getElementById('serverStatus').innerHTML = 'Playing';
  }else if (serverStatus === 2) {
    document.getElementById('serverStatus').innerHTML = 'Paused';
  }else{
    document.getElementById('serverStatus').innerHTML = 'Unknown';
  }
  // EpisodesLeft
  document.getElementById('episodesLeft').innerHTML = pl.totalEpisodes - currentEpisode;
  // ReadyState
  if (player.readyState() === 0) {
    document.getElementById('readyState').innerHTML = 'Nothing';
  }else if (player.readyState() === 1) {
    document.getElementById('readyState').innerHTML = 'Metadata';
  }else if (player.readyState() === 2) {
    document.getElementById('readyState').innerHTML = 'Current Data';
  }else if (player.readyState() === 3) {
    document.getElementById('readyState').innerHTML = 'Future Data';
  }else if (player.readyState() === 4) {
    document.getElementById('readyState').innerHTML = 'Enough Data';
  }else{
    document.getElementById('readyState').innerHTML = 'Unknown';
  }
}

socket.on('chatMessage', function (msg) {
  document.getElementById('messages').innerHTML += msg;
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

$('#sendMessage').on('click', function () {
  socket.emit('chatMessage', "<b>"+nick+"</b>: "+$('#messageContents').val());  
  $('#messageContents').val('');
})

$('#changeNickname').on('click', function () {
  socket.emit('chatMessage', "Nickname<b>Change</b> from "+nick+" to "+$('#nickname').val());
  nick = $('#nickname').val();
})

$('#syncPlayer').on('click', function () {
  player.currentTime(serverTime);
})

$('#reloadPlayer').on('click', function () {
  //TODO: reload player
})

$('#qualitySel').on('click', function () {
  highQuality = !highQuality;
  if(highQuality){
    document.getElementById('qualitySel').innerHTML = "Low<b>Quality</b>";
  }else{
    document.getElementById('qualitySel').innerHTML = "High<b>Quality</b>";
  }
})