
/**
 * Module dependencies.
 */

var express = require('express');


var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var app = express();

var db = require('./config/db/sample');
var config = require('./config/config');


//Controllers
var gameController = new (require('./controllers/game'));


//Models
var gamePlayerModel = new(require('./models/gameplayer'));
var turnModel = new(require('./models/turn'));


// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, config.views_path));
app.set('view engine', config.view_engine);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookie_parser));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, config.public_dir)));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}





/**
* middleware callback function for passing db instance into every controller
**/
var passDB = function(req, res, next) {
	req.db = db;
	next();
};


/**
* ROUTING
**/
//db.create('games', {'id': 10, 'turns':['11es']});

app.post('/create', passDB, function(req, res, next) {
	gameController.create(req, res, next);
});

app.all('/', passDB, function(req, res, next) {
	gameController.list(req, res, next);
});

app.all('/games/:id', passDB, function(req, res, next) {
	gameController.load(req, res, next);
});




/**
* SERVER & SOCKETS START
**/
var server = http.createServer(app);
var io = socketio.listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server started and listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {



  socket.on('register_player', function(game_id, fieldsize) {

  		/**
  		* KNOWN BUG: when user refreshes page, he will be kicked from game
  		**/
  		

  		socket.get('player', function(error, value) {

  			var player_number = value;
        var game_turns;


  			if (!player_number) {
	  			socket.set('game', {id: game_id, fieldsize: fieldsize});
		  		player_number = gamePlayerModel.addPlayer(db, game_id);
		  		socket.set('player', player_number);
  			}

  			socket.emit('player_number', player_number);


  			if(turnModel.turnAllowed(db, player_number, game_id)) {

           game_turns = turnModel.getGameTurns(db, game_id);
  				 socket.emit('start_turn', player_number, game_turns);

  			}

  		});


  		
  });


  socket.on('finish_game', function(callback) {
    socket.get('game', function(error, game) {

      var redirect_url = '/';

      if (game) {

         gameController.deleteGame({db: db}, game.id);
         socket.broadcast.emit('end_game', redirect_url);
         callback(redirect_url);
         socket.disconnect();
         
      }
    });
  });


  socket.on('turn', function(turn_id, callback) {

  	socket.get('game', function(error, game) {
  		socket.get('player', function(error, player) {

  			var successfullTurn = turnModel.addTurn(db, game.id, player, turn_id, game.fieldsize);
        var game_turns = turnModel.getGameTurns(db, game.id);

  			callback(successfullTurn);

         socket.broadcast.emit('start_turn', turnModel.nextPlayerNumber(player), game_turns);
        //if passed a number of player, who won
        if (!isNaN(Number(successfullTurn))) {
          //broadcast to all clients
          //@TODO: broadcast to all room members only
           io.sockets.emit('player_won', successfullTurn);
           //closing sockets and removing a game
           socket.disconnect();

           gameController.deleteGame({db: db}, game.id);
        } 

  			

  		});
  	});



  	//check for winning combo

  });

});