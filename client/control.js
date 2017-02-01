var socket = io();
var playing = true;
var animeResult;
var currentAnime;

socket.on('animeUpdate', function(anime) {
  currentAnime = anime;
  document.getElementById('currentAnime').innerHTML = currentAnime;
});

function selectAnime(number){
  console.log('Selecting anime: '+animeResult[number].name);
  socket.emit('setAnime', animeResult[number].name);
}

$('#mainContainer').hide();

$('#auth').on('click', function() {
  console.log('Accessing with token: '+$('#token').val());
  if($('#token').val() === "a"){
    console.log('Access granted!');
    $('#authForm').hide();
    $('#mainContainer').show();
  }else{
    console.log('Access rovoked!');
    $('#token').val('');
  }
});

$('#play').on('click', function () {
  playing = !playing;
  if(playing){
    document.getElementById('play').innerHTML = "Pause";
  }else{
    document.getElementById('play').innerHTML = "Play";
  }
});

$('#stop').on('click', function () {
  //TODO: Stop emit
});

$('#startFrom').on('click', function () {
  //TODO: Start from n episode
});

$('#search').on('click', function () {
  document.getElementById('animeResults').innerHTML = '<p>Searching...</p>';
  console.log('Searchng for anime with the term: '+$('#searchTerm').val());
  $.getJSON('/api/search/'+$('#searchTerm').val()).done(function(data){
    document.getElementById('animeResults').innerHTML = '';
    animeResult = data;
    console.log('Response:');
    console.log(data);
    var animeResultCount = -1;
    data.forEach(function(entry){
      animeResultCount += 1;
      document.getElementById('animeResults').innerHTML += '<a href="#" onclick="selectAnime('+animeResultCount+')">'+entry.name+'</a><br>';
    });
  });
});

