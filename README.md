crossesandzeroes
================
Implementation of this truly legendary game for Innovation Group with Express.js and Socket.IO

Installation:
-------------

 * Switch to project directory
 * run `npm install`
 * to run server type `node app`
 
 Known issues:
 -------------
 * After page reloading in game, always player2 assigned, need to use sessions
 * Sockets broadcasting to all connected clients, needs to be only game room clients
 * All fields rerendered when user receives array of turns. Rerender only changed.
 *...and more :)
