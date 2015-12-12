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

// error handlers

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
app.use('/', routes);
app.use('/users', users);

// 5. Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen(server, function() {
  console.log("Express server listening on port " + app.get('port'));
});


///////////////// done with setup ///////////////////////

// store all the paths with the points, color, and size (dictonary)
var allPaths = [];

// stores the list of data objects for a given path
var currPath = [];

// stores all the stickers ever drawn (dictionary)
var allStickers = [];

// stores all the shapes every drawn (dictionary)
var allShapes = [];

// true if in the process of creating a path
var creatingPath = false;

var count = 0;

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
    if (creatingPath) {
      allPaths.push({
        key: count,
        value: currPath
      });
      count++;
    }
    socket.on('client_connected', function(data) {
      socket.emit('drawHistory', allPaths, allStickers, allShapes );
    });

    socket.on( 'drawPath', function( data, session ) {
      //console.log( "session " + session + " drew:");
      //console.log( data );
      // io.sockets.emit( 'drawPath', data, session );
      socket.broadcast.emit('drawPath', data, session);
      // add the data point to currPath
      currPath.push(data);
      creatingPath = true;
      console.log("path point");
    });

    socket.on( 'drawSticker', function(stickerData) {
      // io.sockets.emit( 'drawSticker', stickerData);
      socket.broadcast.emit('drawSticker', stickerData);
      // add the sticker to allStickers
      allStickers.push({
        key: count,
        value: stickerData
      });
      count++;
      console.log("sticker");
    });

    socket.on('drawShape', function(shapeData) {
      // send the shape to all client
      // io.sockets.emit('drawShape', shapeData);
      socket.broadcast.emit('drawShape', shapeData);
      //console.log("shape sent to drawShape in server");
      // add the shape to allShapes
      allShapes.push({
        key: count,
        value: shapeData
      });
      count++;
      console.log("shape");
    });

    // client calls endPath when it is done drawing a path
    // server lets all other clients know to null the path
    socket.on( 'endPath', function(session) {
      io.sockets.emit( 'endPath', session);

      // add the currPath to allPath and reset currPath
      allPaths.push({
        key: count,
        value: currPath
      });
      count++;
      currPath = [];
      creatingPath = false;
    });
});


// module.exports = app;
