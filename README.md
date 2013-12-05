crossesandzeroes
================
Implementation of this truly legendary game for Innovation Group with Express.js and Socket.IO

Installation:
-------------

 1) Switch to project directory
 2) run `npm install`
 3) to run server type `node app`
 
 Known issues:
 -------------
 1) After page reloading in game, always player2 assigned, need to use sessions
 2) Sockets broadcasting to all connected clients, needs to be only game room clients
 3) All fields rerendered when user receives array of turns. Rerender only changed.
 4)...and more :)
