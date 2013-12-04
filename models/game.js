var table_name = 'games';



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


/*
 * Games model
 */


function GameModel() {}

GameModel.prototype.getGames = function(req) {
	var games = req.db.get(table_name);
	return games;
};

GameModel.prototype.createGame = function(req, fieldsize) {

	var game_id = req.db.create(table_name, {fieldsize: fieldsize});

	return game_id;
};

GameModel.prototype.getFieldSize = function(req, game_id) {
	var game = req.db.get(table_name, {id: game_id});
	console.log(game);
	return game.fieldsize;
};

/**
* example of field
* 
* 1 2 3 
* 4 5 6
* 7 8 9
* 
* return array
**/
GameModel.prototype.calculateCombos = function(side, delimiter) {
	var winning_combos = [];

	var maximium_number = side * side;
	var tmp_combo_h = [],
		tmp_combo_v = [],
		tmp_combo_d = ['', ''],
		str_combo_h = '';

	for(var i = 1; i <= maximium_number; i++) {
		

		//vertical combo (number = number of sides)
		if (!tmp_combo_v[(i%side)]) {
			tmp_combo_v[(i%side)] = i;
		} else {
			tmp_combo_v[(i%side)] += delimiter + i;
		}
		
		
		//start of new row
		if(i%side == 1) {

			//diagonal combo (2 max)
			//find needed element for each of two diagonal lines
			//from start of row
			tmp_combo_d[0] += (tmp_combo_d[0] != '' ? delimiter : '') + (i + Math.floor(i/side));
			//from end of row
			tmp_combo_d[1] += (tmp_combo_d[1] != '' ? delimiter : '') + ((side * Math.ceil(i/side)) - Math.floor(i/side));

			//horizontal combo (number = number of sides)
			str_combo_h != '' ? tmp_combo_h.push(str_combo_h) : null;
			str_combo_h = '';

		}

		str_combo_h += (str_combo_h != '' ? delimiter : '' ) + i;

		//pushing last column manually
		if (i == maximium_number) tmp_combo_h.push(str_combo_h);
	}

	winning_combos = tmp_combo_h.concat(tmp_combo_v.concat(tmp_combo_d));

	return winning_combos;
};

 module.exports = GameModel;
