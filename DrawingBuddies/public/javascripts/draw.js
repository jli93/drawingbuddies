var myPath;
var otherPaths = {};

var myColor = 'black';
var mySize = '5';
var myTool = 'pen';

window.onload = function () {
    document.getElementById("color").onclick = selectColor;
    document.getElementById("size").onclick = selectSize;
    document.getElementById("tool").onclick = selectTool;
};

// on click listener for color
function selectColor() {
    var color = document.getElementById("color");
    myColor = color.options[color.selectedIndex].value;
}

// on click listener for size
function selectSize() {
    var size = document.getElementById("size");
    mySize = size.options[size.selectedIndex].value;
}

// on click listener for tool
function selectTool() {
    // if tool is  eraser, then change color to white
    var tool = document.getElementById("tool");
    myTool = tool.options[tool.selectTool].value;
    if (myTool == 'eraser') {
        myColor = 'white';
    }
}

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = myColor;
    myPath.strokeWidth = mySize;
}

function onMouseDrag(event) {
	myPath.add(event.point);
	emitPath(event.point);
}

function onMouseUp(event) {
	myPath = null;
	endPath();
}

// called for when other clients draw on the board and they
// don't have a path.
function initPath(clientnum, clientColor, clientSize){
	p = new Path();
	myPath.strokeColor = clientColor;
    myPath.strokeWidth = clientSize;
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
        y: point.y,
        color: myColor,
        size: mySize
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

function drawPath(x, y, clientnum, clientColor, clientSize){
	if (!otherPaths[clientnum]){
		initPath(clientnum, clientColor, clientSize);
	}
	var p = new Point(x,y);
	otherPaths[clientnum].add(p);
	view.draw();
}

io.on( 'drawPath', function( data , clientnum ) {
	console.log("received:")
    console.log( data.x );
    console.log( data.y );
    drawPath(data.x, data.y, clientnum, data.color, data.size);
});

io.on( 'endPath', function( session ){
	otherPaths[session] = null;
});
