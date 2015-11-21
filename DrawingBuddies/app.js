// 1. Express requires these dependencies
var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/users')
  , http = require('http')
  , path = require('path');


var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

// 2. Configure our application
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 3. Configure error handling
  // app.use(express.errorHandler());


// // error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// 4. Setup Routes
// app.get('/', routes.index);
// app.get('/users', user.list);

app.use('/', routes);
app.use('/users', users);

// 5. Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen(server, function() {
  console.log("Express server listening on port " + app.get('port'));
});


///////////////// done with setup ///////////////////////

// store all the paths with the points, color, and size
var allPaths = [];

// stores the list of data objects for a given path
var currPath = [];


// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
    socket.emit('drawHistory', allPaths );

    // (2): The server recieves a ping event
    // from the browser on this socket
    socket.on('ping', function ( data ) {
      console.log('socket: server recieves ping (2)');

      // (3): Emit a pong event all listening browsers
      // with the data from the ping event
      io.sockets.emit( 'pong', data );   

      console.log('socket: server sends pong to all (3)');
    });

    socket.on( 'drawPath', function( data, session ) {
      console.log( "session " + session + " drew:");
      console.log( data );
      io.sockets.emit( 'drawPath', data, session );
      // add the data point to currPath
      currPath.push(data);
    });

    // client calls endPath when it is done drawing a path
    // server lets all other clients know to null the path
    socket.on( 'endPath', function(session) {
      io.sockets.emit( 'endPath', session);

      // add the currPath to allPath and reset currPath
      allPaths.push(currPath);
      currPath = [];
    });
});


// module.exports = app;
