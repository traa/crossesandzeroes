
var table_name = 'turns';

function Turn() {}

Turn.prototype.addTurn = function(db, game_id, player, turn_id) {

	this.player = player;
	var result = 'failed';

	var turn_array = [];
	var game_turns = this.getGameTurns(db, game_id);

	//if this turn is not present in storage
	if (!this.turnIsPresent(game_turns, turn_id)) {

		//check if player can made this turn
		if(this.checkCorrectTurnQueue(game_turns)) {
			//check if game turns already exists
			if(game_turns) {
				if (game_turns[player]) {
					game_turns[player].push(turn_id);
				} else {
					game_turns[player] = [turn_id];
				}
				db.update(table_name, game_turns, {id: game_id});
			} 
			//it's a first turn
			else {
				//write turn of every player
				turn_array[player] = [turn_id];
				db.create(table_name, turn_array, {id: game_id});
			}

			result = 'success';
		}
	} else {
		result = 'turn_is_present';
	}

	return result;

};


Turn.prototype.getGameTurns = function(db, game_id) {
	var game_turns = db.get(table_name, {id: game_id});
	return game_turns;
};


Turn.prototype.turnIsPresent = function(game_turns, turn_id) {

	var present = false;
	var result_array = [];

	if (game_turns && game_turns.length) {
		//iterate over all game turns and check
		for(var i in game_turns) {
			console.log(game_turns[i]);
			result_array = result_array.concat(game_turns[i]);
		}

		if (result_array.indexOf(turn_id.toString()) != -1) {
			present = true;
			console.log('turnIsPresent2', result_array, turn_id, present);
		}
	}


	return present;

};


Turn.prototype.checkCorrectTurnQueue = function(game_turns) {


	var result = [];

	//if no turns were made, then first player's turn
	if (!game_turns && this.player == 1) {
		result[1] = true;
	}
	else if(game_turns) {
		//if player 2 still not made any turn
		if (!game_turns[2]) {
			result[2] = true;
		}
		//if player 1 made more turns
		else if (game_turns[1].length > game_turns[2].length) {
			result[2] = true;
		}
		//if player 2 made more turns
		else if(game_turns[1].length < game_turns[2].length) {
			result[1] = true;
		}
		//equal number of turns, then player 1 turn
		else {
			result[1] = true;
		}
	}


	return result[this.player];

};

Turn.prototype.turnAllowed = function(db, player, game_id) {

	this.player = player;
	var game_turns = this.getGameTurns(db, game_id);
	var allowed = this.checkCorrectTurnQueue(game_turns);

	return allowed;

};


Turn.prototype.nextPlayerNumber = function(player) {

	return player == 1 ? 2 : 1;
};



 module.exports = Turn;
