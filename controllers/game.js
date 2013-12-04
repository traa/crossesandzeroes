
/*
 * Games controller
 */


var GameModel = require('../models/game');

function GameController() {
	this.model = new GameModel();
}

GameController.prototype.list = function(req, res) {
	var games = this.model.getGames(req);
	res.render('index', {games: games});
};

GameController.prototype.create = function(req, res, next) {

	var fieldsize = Number(req.body.fieldsize);
	//minimum size is 3
	//@TODO: add warning message to user
	fieldsize = fieldsize < 3 ? 3 : fieldsize;

	var game_id = this.model.createGame(req, fieldsize);
	res.redirect('/games/'+game_id);
};

GameController.prototype.load = function(req, res, next) {
	var game_id = Number(req.params.id);
	var fieldsize = this.model.getFieldSize(req, game_id);

	res.render('game', {fieldsize: fieldsize, game_id: game_id});
}

/**
* wiping all game info
**/
GameController.prototype.deleteGame = function(req, game_id) {
	this.model.removeGame(req, game_id);
};

 module.exports = GameController;
