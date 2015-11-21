var myPath;
var otherPaths = {};
var myColor = 'black';
var mySize = '5';
var myTool = 'pen';

io.on( 'drawHistory', function( allPaths ) {
    console.log("inside drawHistory");
    console.log("size of allPaths " + allPaths.length);
    for (i = 0; i < allPaths.length; i++) { 
        var currPath = allPaths[i];
        if (currPath.length > 0) {
            console.log("size of currPaths " + currPath.length);
            var oldPath = new Path();
            var data = currPath[0];
            oldPath.strokeWidth = getSize(data.size);
            oldPath.strokeColor = data.color;
            for (j = 0; j < currPath.length; j++) {
                // get the data point
                data = currPath[j];
                var point = new Point(data.x, data.y);
                oldPath.add(point);
            }
        }

    }
    view.draw();
});

// returns the integer size for the corresponding string size
function getSize(size) {
    if (size == 'sm') {
        return 2;
    } else if (size == 'md') {
        return 7;
    } else if (size == 'lg'){
        return 15;
    }
}

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = myColor;
    myPath.strokeWidth = getSize(mySize);
}

function onMouseDrag(event) {
    if (myTool != 'fbicon') {
    	myPath.add(event.point);
    	emitPath(event.point, myColor, mySize, myTool);
    }
}

function onMouseUp(event) {
    if (myTool == 'fbicon') {
        var img = document.createElement("img");
        img.src = "/images/fbicon.png";
        img.id = "fbicon2"
        document.body.appendChild(img);
        // add icon to mouse location
        var raster = new Raster('fbicon2');
        raster.position = event.point;
        raster.scale(0.02);
    }
 	myPath = null;
	endPath();
}


// called for when other clients draw on the board and they
// don't have a path.
function initPath(clientnum, clientColor, clientSize){
	p = new Path();
	p.strokeColor = clientColor;
    p.strokeWidth = getSize(clientSize);
	otherPaths[clientnum] = p;
}

// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitPath( point, color, size, tool) {
    // Each Socket.IO connection has a unique session id
    var sessionId = io.io.engine.id;
  
    // An object to describe the circle's draw data
    var data = {
        x: point.x,
        y: point.y,
        color: myColor,
        size: mySize,
        tool: myTool
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


function drawPath(data, clientnum){
	if (!otherPaths[clientnum]){
		initPath(clientnum, data.color, data.size);
	}
	var p = new Point(data.x, data.y);
	otherPaths[clientnum].add(p);
	view.draw();
}

var ready = function() {
	$("#black").css("border", "solid black 3px");
	$("#pen").css("border", "solid black 3px");

	$("#tool div").click(function(){
		$("#tool div").css("border", "none");
		$(this).css("border", "solid black 3px");
		myTool = $(this).attr("id");
		console.log(myTool);
		if (myTool == 'eraser') {
	        myColor = 'white';
	        $(".color").css("opacity","0.5");
	    } else if (myTool == 'pen') {
	    	$(".color").css("opacity","1");
	    	$(".color").each(function(){
	    		if($(this).css("border-style") == "solid"){
	    			myColor = $(this).attr("id");
	    		}
	    	});
	    } else {
            // TODO: fb sticker!
            $(".color").css("opacity","0.5");
        }
	});

	$(".color").click(function(){
		if (myTool != "eraser"){
			$(".color").css("border", "none");
			$(this).css("border", "solid black 3px");
			myColor = $(this).attr("id");
			console.log(myColor);
		}
	});

	$(".size").click(function(){
		$(".size").css("border", "none");
		$(".size").css("background-color", "transparent");
		mySize = $(this).attr("id");
		$(this).css("border", "solid black 2px");
		$(this).css("background-color", "LightCyan");
		console.log(mySize);
	});

	io.on( 'drawPath', function( data , clientnum) {
	    drawPath(data, clientnum);
	});

	io.on( 'endPath', function( session ){
		otherPaths[session] = null;
	});

};


$(document).ready(ready);
$(document).on('page:load', ready);
