
/*
 * Sockets module
 */



function Sockets(io, db) {
	this.io = io;
	this.db = db;
	this.model = {};
	this.controller = {};
}

/**
* HELPERS
**/
Sockets.prototype.addModels = function(models) {

	for (var i in models) {
		if (models.hasOwnProperty(i)) {
			this.model[i] = models[i];
		}
	}

	return this;
};

Sockets.prototype.addControllers = function(controllers) {

	for (var i in controllers) {
		if (controllers.hasOwnProperty(i)) {
			this.controller[i] = controllers[i];
		}
	}

	return this;
};

/**
* ENTRY POINT FOR SOCKETS
**/
Sockets.prototype.init = function() {

	var self = this;

	this.io.sockets.on('connection', function (socket) {

		self.socket = socket;

		self.listenRegisterPlayer();

		self.listenGameFinish();

		self.listenTurns();

	});
};

/**
* Listen for player, who just entered in game
**/
Sockets.prototype.listenRegisterPlayer = function() {

		var self = this;
		var socket = this.socket;

		socket.on('register_player', function(game_id, fieldsize) {

		  		/**
		  		* KNOWN BUG: when user refreshes page,always player2 set
		      * Need to use sessions to detect players
		  		**/
		  		

		  		socket.get('player', function(error, value) {

		  			var player_number = value;
		        	var game_turns;

		        	//if this is a new player
		  			if (!player_number) {
			  			socket.set('game', {id: game_id, fieldsize: fieldsize});
				  		
				  		player_number = self.model.gameplayer.addPlayer(self.db, game_id);
				  		socket.set('player', player_number);
		  			}

		  			//passing player number to player
		  			socket.emit('player_number', player_number);

		  			//checking if player can start turn
		  			//for example, if second player joined after first player made his turn 
		  			if(self.model.turn.turnAllowed(self.db, player_number, game_id)) {

		  				//sending game turns, that were made previously
		           		game_turns = self.model.turn.getGameTurns(self.db, game_id);
		  				socket.emit('start_turn', player_number, game_turns);

		  			}

		  		});


		  		
		});
};

/**
* Listening for forced finish of game (player clicked on button "finish the game")
**/
Sockets.prototype.listenGameFinish = function() {

	var self = this;
	var socket = this.socket;

	socket.on('finish_game', function(callback) {
	    socket.get('game', function(error, game) {

		      var redirect_url = '/';

		      if (game) {

		         self.controller.game.deleteGame({db: self.db}, game.id);
		         socket.broadcast.emit('end_game', redirect_url);
		         callback(redirect_url);
		         socket.disconnect();

		      }
	    });
	});

};

/**
* Listen for every turn that player made
**/
Sockets.prototype.listenTurns = function() {

	var self = this;
	var socket = this.socket;
	var io = this.io;

	socket.on('turn', function(turn_id, callback) {

	  	socket.get('game', function(error, game) {
	  		socket.get('player', function(error, player) {


	  			var successfullTurn = self.model.turn.addTurn(self.db, game.id, player, turn_id, game.fieldsize);
	        	var game_turns = self.model.turn.getGameTurns(self.db, game.id);

	  			callback(successfullTurn);

	  			//@TODO: broadcast to all room members only
	  			//sending to other client info, that it can start turn
		         socket.broadcast.emit('start_turn', self.model.turn.nextPlayerNumber(player), game_turns);
		        //if passed a number of player, who won
		        if (!isNaN(Number(successfullTurn))) {
		          //broadcast to all clients
		          
		           io.sockets.emit('player_won', successfullTurn);
		           //closing sockets and removing a game
		           socket.disconnect();
		           self.controller.game.deleteGame({db: self.db}, game.id);
		           
		        } 

	  			

	  		});
	  	});


	});

};

 module.exports = Sockets;
