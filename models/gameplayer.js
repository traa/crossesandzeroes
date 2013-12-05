
var table_name = 'gameplayers';

function GamePlayer() {}

GamePlayer.prototype.addPlayer = function(db, game_id) {

	var player_count = db.get(table_name, {id: game_id});
		
	//if player can join
	//if no players
	if (!player_count) {
		player_count = 1;
		db.create(table_name, 1, {id: game_id});
	} 
	//limit for players number with a little bit of hardcode
	else if (player_count < 2) {
		player_count = 2;
		db.update(table_name, 2, {id: game_id});
	}
	
	
	return player_count;

};



 module.exports = GamePlayer;
