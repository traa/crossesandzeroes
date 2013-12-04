var table_name = 'games';

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

	return game.fieldsize;
};

/**
* removing all related to this game stuff
**/
GameModel.prototype.removeGame = function(req, game_id) {
	req.db.delete(table_name, {id: game_id});
	req.db.delete('gameplayers', {id: game_id});
	req.db.delete('turns', {id: game_id});
}



 module.exports = GameModel;
