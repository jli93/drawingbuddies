var myPath;

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = 'black';
}

function onMouseDrag(event) {
	myPath.add(event.point);
	emitPath(event.point);
}

function onMouseUp(event) {

}

// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitPath( point ) {
    // Each Socket.IO connection has a unique session id
    var sessionId = io.io.engine.id;
  
    // An object to describe the circle's draw data
    var data = {
        x: point.x,
        y: point.y
    };

    // send a 'drawCircle' event with data and sessionId to the server
    io.emit( 'drawPath', data, sessionId )

    // Lets have a look at the data we're sending
    console.log("sending")
    console.log( data )
    console.log(sessionId)
}

io.on( 'drawPath', function( data ) {
	console.log("received:")
    console.log( data );
    otherPath = new Path();
    otherPath.strokeColor = 'black';
	otherPath.add(data);
});