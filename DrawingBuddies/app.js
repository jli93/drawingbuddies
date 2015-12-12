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

// map session ID --> currPath
var sessionToCurrPath = [];

// stores all the stickers ever drawn (dictionary)
var allStickers = [];

// stores all the shapes every drawn (dictionary)
var allShapes = [];

var count = 0;

function checkMapElementsNull(value, key, map) {
  if (value != null && value != undefined) {
    allPaths.push({
      key: count,
      value: map[key]
    });
  }
  // TODO: set the currPath at sessionID to null?
  map[key] = null;
  count++;
}

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
    socket.on('client_connected', function(data) {
      // check for all sessionIDs inside sessionToCurrPath, if any of their currPaths are not null,
      // add currPath to allPaths
      sessionToCurrPath.forEach(checkMapElementsNull);
      socket.emit('drawHistory', allPaths, allStickers, allShapes );
    });

    socket.on( 'drawPath', function( data, session ) {
      //console.log( "session " + session + " drew:");
      //console.log( data );
      socket.broadcast.emit('drawPath', data, session);

      // if the session ID does not have a currentPath, then add a currPath to it
      if (sessionToCurrPath[session] == null) {
        sessionToCurrPath[session] = [];
      }
      // add the data point to currPath
      sessionToCurrPath[session].push(data);

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
    });

    socket.on('drawShape', function(shapeData) {
      // send the shape to all client
      socket.broadcast.emit('drawShape', shapeData);
      //console.log("shape sent to drawShape in server");
      // add the shape to allShapes
      allShapes.push({
        key: count,
        value: shapeData
      });
      count++;
    });

    // client calls endPath when it is done drawing a path
    // server lets all other clients know to null the path
    socket.on( 'endPath', function(session) {
      io.sockets.emit( 'endPath', session);

      // add the currPath to allPath and reset currPath to null
      allPaths.push({
        key: count,
        value: sessionToCurrPath[session]
      });
      sessionToCurrPath[session] = null;

      count++;
    });
});


// module.exports = app;
