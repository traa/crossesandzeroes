
var table_name = 'turns';

/**
* Tweaking array for an additional method
* Solution from stackoverflow
* http://stackoverflow.com/a/14853974
**/

Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

function Turn() {}

Turn.prototype.addTurn = function(db, game_id, player, turn_id, fieldsize) {

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


			var winner = this.checkWinningCombo(fieldsize, game_turns);
			if (winner) {
				result  = winner;
			} else {
				result = 'success';
			}
			
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


/**
* example of field
* 
* 1 2 3 
* 4 5 6
* 7 8 9
* 
* return integer
* 0 - no winning combos
* 1, 2 - number of player who has won
**/
Turn.prototype.checkWinningCombo = function(side, turns) {

	this.turns = turns;
	this.side = side;

	var player_won = 0;
	var turns_total_array = [];

	/**
	* usual turns array looks like [null, array Player1Turns, array Player2Turns] to allow referencing
	* to values by index, which equals to player number.
	* So it's length must be 3. If less, then second player hasn't made any turn.
	**/
	if (!this.turns) {
		return player_won;
	}
	else if (this.turns.length < 3) {
		return player_won;
	} else {
		//counting total number of turns for both players
		for (var i = 1; i< this.turns.length; i++) {
			turns_total_array = turns_total_array.concat(this.turns[i]);
		}
		//minimum number of turns to win on field 3x3 is 5 (3 by player1 +2 by player2)
		if (turns_total_array.length < 5) {
			return player_won;
		}
	}

	var winning_combos = [];

	var maximium_number = this.side * this.side;
	var tmp_combo_h = [],
		tmp_combo_v = [],
		tmp_combo_d = [[], []],
		str_combo_h = [];



	for(var i = 1; i <= maximium_number; i++) {
		console.log('numver start', i);

		//vertical combo (number = number of sides)
		if (!tmp_combo_v[(i%this.side)]) {
			tmp_combo_v[(i%this.side)] = [];
		}
		
		if (player_won = this.checkCombo(tmp_combo_v[(i%this.side)], i)) {
			break;
		}
		
		
		
		//start of new row
		if(i%this.side == 1) {

			//diagonal combo (2 max)
			//find needed element for each of two diagonal lines
			//from start of row
			if (player_won = this.checkCombo(tmp_combo_d[0], (i + Math.floor(i/this.side)))) {
				break;
			}

			//from end of row

			if(player_won = this.checkCombo(tmp_combo_d[1], ((this.side * Math.ceil(i/this.side)) - Math.floor(i/this.side)))) {
				break;
			}

			//horizontal combo (number = number of sides)
			if (str_combo_h.length && (player_won = this.checkCombo(tmp_combo_h, str_combo_h))) {
				break;
			}
			str_combo_h = [];

		}

		str_combo_h.push(i);

		//pushing last column manually
		if (i == maximium_number && (player_won = this.checkCombo(tmp_combo_h, str_combo_h)))  {
			break;
		}
		console.log('numver end', i);
	}

	//returns 0 if nobody won, 1 or 2 if one of players won
	return player_won;

	//all list of winning combos
	// winning_combos = tmp_combo_h.concat(tmp_combo_v.concat(tmp_combo_d));

};

/**
* HELPER FUNCTIONS
**/
//using passing variables by reference
Turn.prototype.checkCombo = function(array, value) {

	var checking_data = [];
	array.push(value);


	if (Object.prototype.toString.call( value ) === '[object Array]' && value.length == this.side) {
		checking_data = value;
		
	} else if(array.length == this.side) {
		checking_data = array;
	}

	
	return this.compareTurns(checking_data);

};


Turn.prototype.compareTurns = function(array) {
	var winner_player = 0;

	for (var i = 1; i< this.turns.length; i++) {
		if (this.turns[i].compare(array) === true) {
			console.log('equal', array, this.turns[i]);
			winner_player = i;
			break;
		}
	}

	return winner_player;
};



 module.exports = Turn;
