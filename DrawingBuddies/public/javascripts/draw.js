var myPath;
var otherPaths = {};

var color = 'black';
var size = '5';
var tool = 'pen';

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = 'black';
}

function onMouseDrag(event) {
	myPath.add(event.point);
	emitPath(event.point);
}

function onMouseUp(event) {
	myPath = null;
	endPath();
}

function initPath(clientnum){
	p = new Path();
	p.strokeColor = 'black';
	otherPaths[clientnum] = p;
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

function endPath(){
	io.emit('endPath', io.io.engine.id);
}

function drawPath(x, y, clientnum){
	if (!otherPaths[clientnum]){
		initPath(clientnum);
	}
	var p = new Point(x,y);
	otherPaths[clientnum].add(p);
	view.draw();
}

io.on( 'drawPath', function( data , clientnum) {
	console.log("received:")
    console.log( data.x );
    console.log( data.y );
    drawPath(data.x, data.y, clientnum);
});

io.on( 'endPath', function( session ){
	otherPaths[session] = null;
});
