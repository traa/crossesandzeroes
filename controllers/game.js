
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

GameController.prototype.create = function(fieldsize, req, res, next) {
	var game_id = this.model.createGame(req, fieldsize);
	res.redirect('/games/'+game_id);
};

GameController.prototype.load = function(req, res, next) {
	var game_id = Number(req.params.id);
	var fieldsize = this.model.getFieldSize(req, game_id);
	console.log(fieldsize);
	res.render('game', {fieldsize: fieldsize, game_id: game_id});
}

 module.exports = GameController;
