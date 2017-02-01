var port = 2712;

var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cloudscraper = require('cloudscraper');
var AnimeUtils = require('anime-scraper').AnimeUtils;
var Anime = require('anime-scraper').Anime;
var io = require('socket.io')(http);
var currentAnime;
var messageColor = false;
var serverTime = 0.00;
var paused = false;

http.listen(port, function(){console.log('Listening on port '+port)});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

console.log("Retrieving CloudFlare cookie...");
cloudscraper.get('http://kissanime.com', function(err, resp, body) {
	var cookieString = resp.request.headers.cookie;
	AnimeUtils.setSessionCookie(cookieString);

	app.get('/api/', function(req, res) {
		res.type('text/plain');
		res.send('API is running.');
	});

	/*
	* Search on KissAnime with given :name string
	* :name (required) = search term
	* http://localhost/search/death note
	*/
	app.get('/api/search/:name', function(req, res) {
		var animeName = req.params.name;
		AnimeUtils.searchByName(animeName).then(function(results) {
		    res.type('json');
			for (var i in results) {
				results[i].shortUrl = results[i].url.replace("http://kissanime.com/Anime/", "");
			}
			console.log('/search/'+animeName);
			res.send(results);
		})
	});

	/*
	* Get Anime info and/or episodes by name
	* :name (required) 		= full anime name (Example: Naruto Shippuuden (Dub))
	* :filter (optional) 	= info, episodes
	* http://localhost/getAnimeByName/Death Note (Sub)/info
	*/	
	app.get('/api/getAnimeByName/:name/:filter*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter 		= req.params.filter;
		Anime.fromName(animeName).then(function(anime) {
			res.type('json');
		  	if (filter === "info") {
		  		console.log('/getAnimeByName/'+animeName+'/'+filter);
		  		return res.send(anime.info);
		  	}
		  	else if (filter === "episodes") {
		  		console.log('/getAnimeByName/'+animeName+'/'+filter);
				return res.send(anime.episodes);
		  	}
		  	else{
		  		console.log('/getAnimeByName/'+animeName);
		  		return res.send(anime);
		  	};
		})
	})

	/*
	* Get Anime info and/or episodes by shortUrl
	* :name (required) 		= shortUrl
	* :filter (optional) 	= info, episodes
	* http://localhost/getAnimeByUrl/Death-Note/info
	*/
	app.get('/api/getAnimeByUrl/:name/:filter*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter 		= req.params.filter;
		Anime.fromUrl('http://kissanime.com/Anime/'+animeName).then(function(anime) {
			res.type('json');
			if (filter === "info") {
				console.log('/getAnimeByUrl/'+animeName+'/'+filter);
		  		return res.send(anime.info);
		  	}
		  	else if (filter === "episodes") {
		  		console.log('/getAnimeByUrl/'+animeName+'/'+filter);
				return res.send(anime.episodes);
		  	}
		  	else{
		  		console.log('/getAnimeByUrl/'+animeName);
		  		return res.send(anime);
		  	};
		})
	})

	/*
	* Get Anime episode link by shortUrl
	* :name (required) 		= shortUrl
	* :filter (optional) 	= info, episode
	* :quality (optional)	= available episode quality (Example: 720p)
	* http://localhost/getVideoByUrl/Death-Note
	* http://localhost/getVideoByUrl/Death-Note/5
	* http://localhost/getVideoByUrl/Death-Note/5/720p (note: if given quality is not found, return all qualities)
	*/
	app.get('/api/getVideoByUrl/:name/:filter*?/:quality*?', function(req, res) {
		var animeName 	= req.params.name;
		var filter		= req.params.filter;
		var quality		= req.params.quality;
		Anime.fromUrl('http://kissanime.com/Anime/'+animeName).then(function(anime) {
			res.type('json');
			if (isNaN(filter) === false) {
				anime.episodes[filter].getVideoUrl().then(function (results) {
					if (quality != "") {
						for (var i in results) {
							if (quality == "/"+results[i]['name']) {
								console.log('/getVideoByUrl/'+animeName+'/'+filter+'/'+quality);
								return res.send(results[i]);
							};
						}
						console.log('/getVideoByUrl/'+animeName+'/'+filter+'/'+quality);
						return res.send(results);
					}
					else {
						console.log('/getVideoByUrl/'+animeName+'/'+filter);
						return res.send(results);
					};
				})
			}
			else{
				anime.getVideoUrls().then(function(results) {
					console.log('/getVideoByUrl/'+animeName);
					return res.send(results);
				})
			};
		})
	})
  console.log("Got cookie... API Running on port "+port);
});

/*
* Generate new CloudFlare cookie
* http://localhost/cookie
*/
app.get('/api/cookie', function(req, res) {
	cloudscraper.get('http://kissanime.com', function(err, body, resp) {
		var newString = resp.request.headers.cookie;
		var json = {"cookie": newString}
		res.type('json');
		console.log('/cookie/'+newString);
		res.send(json);
	});
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/info', function (req, res) {
  res.send('{"name":"'+currentAnime+'"}');
});

app.get('/:path', function (req, res) {
  res.sendFile(__dirname + '/client/' + req.params.path);
});

io.on('connection', function(socket){
  console.log('User connected');
  socket.on('disconnect', function(){
    console.log('User disconnected');
  });
  socket.on('chatMessage', function(msg){
    if(messageColor){
      io.emit('chatMessage', '<span class="m1">'+ msg +"</span>");
    }else{
      io.emit('chatMessage', '<span class="m2">'+ msg +"</span>");
    }
    messageColor = !messageColor;
  });
  socket.on('setAnime', function(anime){
    console.log('Setting anime to '+anime);
    currentAnime = anime;
    io.emit('animeUpdate', currentAnime);
  });
  /*
  var start = Date.now();
  setInterval(function() {
    var delta = Date.now() - start;
    socket.emit('serverTimeUpdate', delta/1000);
}, 100); */
});