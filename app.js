
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
var SocketModule = require('./modules/socket');


//Models
var gamePlayerModel = new(require('./models/gameplayer'));
var turnModel = new(require('./models/turn'));


// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, config.views_path));
app.set('view engine', config.view_engine);

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
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


socketModule = new SocketModule(io, db);

//adding models and controllers required for sockets module
socketModule.addModels({
  turn: turnModel,
  gameplayer: gamePlayerModel
})
.addControllers({
  game: gameController
})
.init();

