// Connect to the Node.js Server
io = io();

// (1): Send a ping event with 
// some data to the server
console.log( "socket: browser says ping (1)" );
io.emit('ping', { some: 'data' } );
io.on('connect', function() {
	io.emit('client_connected', 'hello');
	console.log( "client calls the client_connected function of the server" );
});

// (4): When the browser receives a pong event
// console log a message and the events data
io.on('pong', function (data) {
    console.log( 'socket: browser receives pong (4)', data );
});