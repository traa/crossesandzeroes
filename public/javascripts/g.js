$(function() {

	var turns_enabled = false;
	var socket = io.connect('http://localhost');
	var player_number_el = $('#player_number');
	var turn_info = $('#turninfo');
	var finish_game_button = $('#finish_game');

	var game_id =  $('#game_id').val();
	var fieldsize = $('#fieldsize').val();

	var cross_img = $('#cross');
	var zero_img = $('#zero');

	//default value
	var player_number = 1;

	var player_shape = {
		1: cross_img,
		2: zero_img
	};


	function turn(enabled) {
		turns_enabled = enabled;

		if(enabled) {
			turn_info.html('Your turn!');
		} else {
			turn_info.html('Please wait for your turn');
		}

	}

	//registering player in database
	socket.emit('register_player', game_id, fieldsize);


	$('#field td').on('click', function() {

		var self = this;
		console.log($(this).attr('id'), turns_enabled);
		if (turns_enabled) {
			socket.emit('turn', $(this).attr('id'), function(msg) {
				var numberPassed = !isNaN(Number(msg));
				//if successfull turn or somebody won
				if (msg == 'success' || (numberPassed && Number(msg) > 0) ) {

					$(self).html(player_shape[player_number].clone().show());

				} 

				//if anything except already present turn
				if (msg != 'turn_is_present') {
					turn(false);
				}
				
			});
		}
	});


	finish_game_button.on('click', function() {
		socket.emit('finish_game', function(url) {
			turn_info.html('Removing game from database. Redirecting...');
			setTimeout(function() {
				window.location.href = url;
			}, 3000);
		});
	});


	socket.on('player_number', function(data) {
		if (!data) {
			window.location.href = '/';
		}

		player_number = data;
		player_number_el.html('Player #'+data);

		/**
		* first player always can make a move first
		**/
		if (player_number == 1) {
			turn(true);
		}


	});


	socket.on('start_turn', function(player, turns) {

		console.log(player, turns);

		//because of we have an empty 0 index, so we must exclude it from total amount of player turns
		var isTurnsPresent = turns ? (turns.length - 1) : 0;

		var turn_player,
			turn_number;

		if(isTurnsPresent) {

			/**
			* @TODO: rerender only changed fields
			**/
			for(var i = 1; i<= isTurnsPresent; i++) {
				turn_player = turns[i];
				if (turn_player.length) {
					for (var j = 0; j< turn_player.length; j++) {
						turn_number = turn_player[j];
						$('#'+turn_number).html(player_shape[i].clone().show());
					}
				}

			}

		}

		turn(true);

	});


	socket.on('player_won', function(player) {
		finish_game_button.hide();
		turn(false);
		turn_info.html('Player #'+player+' won! Use <a href="/">this link</a> to return on main page');
		socket.disconnect()
	});


	socket.on('end_game', function(url) {
		turn_info.html('Another player finished the game. Redirecting...');
		setTimeout(function() {
			window.location.href = url;
		}, 3000);
	});

});