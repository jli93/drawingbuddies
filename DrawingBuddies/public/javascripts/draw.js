var myPath;
var otherPaths = {};
var myColor = 'black';
var mySize = '5';
var myTool = 'pen';

// used for when client draws a shape (triangle, rectangle, circle)
var initialX;
var initialY;
var finalX;
var finalY;
var shape;
var radius = 50; // default size is 50

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
    if (myTool == 'pen' || myTool == 'eraser') {
        myPath = new Path();
        myPath.strokeColor = myColor;
        myPath.strokeWidth = getSize(mySize); 
    } else { // TODO: test that myTool is a shape
        // store the x, y points
        initialX = event.point.x;
        initialY = event.point.y;
        shape = new Path.RegularPolygon(new Point (initialX, initialY), 3, radius);
        shape.fillColor = myColor;

    }
}

function onMouseDrag(event) {
    if (myTool == 'pen' || myTool == 'eraser') {
    	myPath.add(event.point);
    	emitPath(event.point, myColor, mySize, myTool);
    } else { // TODO: test that myTool is a shape
        // shape.remove(); // TODO: Remove the previous shape
        finalX = event.point.x; // new x
        finalY = event.point.y; // new y
        // draw the shape for the user to see
        var newRadius = Math.sqrt(Math.pow(finalX - initialX, 2) + Math.pow(finalY - initialY, 2));
        shape.scale(1.0 * newRadius / radius, shape.bounds.center);
        view.update();
        radius = newRadius;
    }
    var pageCoords = "( drag," + event.point + " )";
    console.log(pageCoords);
}

function onMouseUp(event) {
    // if the tool selected was a sticker
    if (myTool == 'fbicon' || myTool == 'smiley') {
        var stickerSrc;
        var stickerId;
        var stickerScale;
        if (myTool == 'fbicon') {
            stickerSrc = "/images/fbicon.png";
            stickerId = "fbicon2";
            stickerScale = 0.02;
        } else if (myTool == 'smiley') {
            stickerSrc = "/images/smiley.png";
            stickerId = "smiley2";
            stickerScale = 0.35;
        }

        // create sticker data and draw the sticker
        var stickerData = {
            x: event.point.x,
            y: event.point.y,
            src: stickerSrc,
            id: stickerId,
            scale: stickerScale
        };
        console.log("( sticker, " + event.point + " )");

        drawSingleSticker(stickerData);
        // send sticker to server
        io.emit( 'drawSticker', stickerData );
    } else if (myTool == 'pen' || myTool == 'eraser') {
        //  the tool selected was the pen/eraser
     	myPath = null;
    	endPath();
    } else { 
        // the tool selected was a shape
        // TODO: store the shape, send it to the server
    }
}


// called for when other clients draw on the board and they
// don't have a path.
function initPath(clientnum, clientColor, clientSize){
	p = new Path();
	p.strokeColor = clientColor;
    p.strokeWidth = getSize(clientSize);
	otherPaths[clientnum] = p;
}

// This function sends the data for a path to the server
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

// helper method to draw a single sticker: to reduce redundancy
function drawSingleSticker(sticker) {
    var img = document.createElement("img");
    img.src = sticker.src;
    img.id = sticker.id;
    document.body.appendChild(img);
    $(img).css("display", "none");
    // add icon to mouse location
    var raster = new Raster(img.id);
    var point = new Point(sticker.x, sticker.y);
    raster.position = point;
    raster.scale(sticker.scale);
}

var ready = function() {
	$("#black").css("border", "solid black 3px");
	$("#pen").css("border", "solid black 3px");

	$("#tool div").click(function(){
		$("#tool div").css("border", "none");
		$(this).css("border", "solid black 3px");
		myTool = $(this).attr("id");

		console.log("( tool, " + myTool + " )");

		if (myTool == 'eraser') {
	        myColor = 'white';
	        $(".color").css("opacity","0.5");
	    } else if (myTool == 'pen' || myTool == 'circle' || myTool == 'triangle' || myTool == 'rectangle') {
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
			console.log("( color, " + myColor + " )");
		}
	});

	$(".size").click(function(){
		$(".size").css("border", "none");
		$(".size").css("background-color", "transparent");
		mySize = $(this).attr("id");
		$(this).css("border", "solid black 2px");
		$(this).css("background-color", "LightCyan");
		console.log("( size, " + mySize + " )");
	});

	io.on( 'drawPath', function( data , clientnum) {
	    drawPath(data, clientnum);
	});

	io.on( 'endPath', function( session ){
		otherPaths[session] = null;
	});

    // called when the server sends a sticker to the client
    io.on( 'drawSticker', function(stickerData) {
        console.log("drawing sticker");
        drawSingleSticker(stickerData);
    });

    // draw all the previous paths and stickers on the canvas
    // so a new user has the history from previous users
    io.on( 'drawHistory', function( allPaths, allStickers ) {
        console.log("inside drawHistory");
        // go through allPaths and allStickers and check for the
        // min key
        i = 0; // pointer for paths
        j = 0; // pointer for stickers
        while (i < allPaths.length || j < allStickers.length) {
            // check the keys: find the min key
            if (j == allStickers.length || allPaths[i].key < allStickers[j].key) {
                // either we have drawn all the stickers or the key of path < key of sticker
                // draw the path
                var currPath = allPaths[i].value; // grab the path
                if (currPath.length > 0) {
                    console.log("size of currPaths " + currPath.length);
                    var oldPath = new Path();
                    var data = currPath[0];
                    // set the width and the color of the path
                    oldPath.strokeWidth = getSize(data.size);
                    oldPath.strokeColor = data.color;
                    // draw each data point of the path
                    for (k = 0; k < currPath.length; k++) {
                        // get the data point
                        data = currPath[k];
                        var point = new Point(data.x, data.y);
                        oldPath.add(point);
                    }
                }
                i++; // update pointer for paths
            } else {
                // draw the sticker
                var currSticker = allStickers[j].value;
                drawSingleSticker(currSticker);
                j++; // update pointer for stickers
            }
            view.update();
        }

    });

};


$(document).ready(ready);
$(document).on('page:load', ready);
