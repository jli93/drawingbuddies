var myPath;
var otherPaths = {};
var myColor = 'black';
var mySize = '5';
var myTool = 'pen';

// used for when client draws a shape (triangle, rectangle, circle)
// (anchorX, anchorY) is the topLeft point of the shape
var anchorX;
var anchorY;
var myShape;
var myRadius; // default size is 50
// (myCenterX, myCenterY) is the center point of the shape
var myCenterX;
var myCenterY;

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

// sets the center point (myCenterX, myCenterY) of the shape
// depending on the radius and the anchor point.
function setCenterPoint() {
    var xOffset = Math.cos(Math.PI / 6) * myRadius;
    var yOffset = Math.sin(Math.PI / 6) * myRadius;

    myCenterY = anchorY + yOffset;
    myCenterX = anchorX + xOffset;
}

function onMouseDown(event) {
    onMouseDownHelper(event);
}

function onMouseDownHelper(event) {
    if (myTool == 'pen' || myTool == 'eraser') {
        myPath = new Path();
        myPath.strokeColor = myColor;
        myPath.strokeWidth = getSize(mySize); 
        var pageCoords = "( down," + event.point + " )";
        console.log(pageCoords);
        // console.log(event);
    } else if (myTool == 'circle' || myTool == 'triangle' || myTool == 'rectangle') {
        myRadius = 50;
        // store the x, y points as the lower right corner of the shape
        var initialX = event.point.x;
        var initialY = event.point.y;

        var xOffset = Math.cos(Math.PI / 6) * myRadius;
        var yOffset = Math.sin(Math.PI / 6) * myRadius;

        // (anchorX, anchorY) is the topLeft point of the shape
        anchorX = initialX - xOffset * 2;
        anchorY = initialY - yOffset * 2;

        setCenterPoint();

        myShape = drawSingleShape(myTool, myCenterX, myCenterY, myRadius, myColor);

    }
}

function onMouseDrag(event) {
    onMouseDragHelper(event);
}

function onMouseDragHelper(event) {
    if (myTool == 'pen' || myTool == 'eraser') {
        myPath.add(event.point);
        emitPath(event.point, myColor, mySize, myTool);
        var pageCoords = "( drag," + event.point + " )";
        console.log(pageCoords);
    } else if (myTool == 'circle' || myTool == 'triangle' || myTool == 'rectangle') {
        var finalX = event.point.x; // new x
        var finalY = event.point.y; // new y

        // draw the shape for the user to see
        myRadius = Math.sqrt(Math.pow(finalX - anchorX, 2) + Math.pow(finalY - anchorY, 2)) / 2;
        setCenterPoint();

        myShape.removeSegments();
        myShape = drawSingleShape(myTool, myCenterX, myCenterY, myRadius, myColor);

        view.draw();

    }
}

function onMouseUp(event) {
    onMouseUpHelper(event);
}

function onMouseUpHelper(event) {
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
        console.log("( up, " + event.point + " )");
    } else { 
        // the tool selected was a shape
        console.log("drew shape");
        var shapeData = {
            shape: myTool,
            color: myColor,
            centerX: myCenterX,
            centerY: myCenterY,
            radius: myRadius
        };
        io.emit( 'drawShape', shapeData);
        console.log("( shape, centerX: " + myCenterX + ", centerY: " + myCenterY + ", radius: " + myRadius + " )");
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

// helper method to draw a single shape
function drawSingleShape(shape, centerX, centerY, radius, color) {
    // console.log("drawShape in the client");
    var shapePath;
    if (shape == 'triangle') {
        shapePath = new Path.RegularPolygon(new Point (centerX, centerY), 3, radius);
    } else if (shape == 'rectangle') {
        shapePath = new Path.RegularPolygon(new Point (centerX, centerY), 4, radius);
    } else if (shape == 'circle') {
        shapePath = new Path.Circle(new Point(centerX, centerY), radius);
    }
    shapePath.fillColor = color;
    view.draw();
    return shapePath;
}

///BOT SIMULATION BEGINS
function click(x,y){
    var ev = document.createEvent("MouseEvent");
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        x, y, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}
function simulateClick(x, y) {
    var ev = { 
        point: {
            x: x,
            y: y
        }
    };
    onMouseDownHelper(ev);
    onMouseUpHelper(ev);
}
function simulateDown(x, y) {
    var ev = { 
        point: {
            x: x,
            y: y
        }
    };
    onMouseDownHelper(ev);
}
function simulateDrag(x, y) {
    var ev = { 
        point: {
            x: x,
            y: y
        }
    };
    onMouseDragHelper(ev);
}
function simulateUp(x,y){
    var ev = { 
        point: {
            x: x,
            y: y
        }
    };
    onMouseUpHelper(ev);
}

function getData(){
    var r = $("#alldata").text();
    return r;
}

function simulateDrawing(){
    var data = getData();
    var lines = data.split("\n");
    var choice = 1 + Math.floor(Math.random() * $(lines).length);
    var len = 1001 + Math.floor(Math.random() * 2000);

    for (var i = choice; i <= choice + len; i++) {
        if(i >= $(lines).length){
            break;
        }
        var n = lines[i].split(",");
        var command = jQuery.trim(n[0]);

        if (command == "tool" || command == "size" || command == "color"){
            $("#" + jQuery.trim(n[1])).click();
        } else if (command == "shape"){
            var x = parseFloat(n[1].split(" ")[2]);
            var y = parseFloat(n[2].split(" ")[2]);
            simulateDown(x,y);
            simulateUp(x,y);
            console.log(n);
        } else {
            var x = parseFloat(n[1].split(" ")[2]);
            var y = parseFloat(n[2].split(" ")[2]);
            if (command == "sticker"){
                simulateClick(x, y);
            } else if (command == "down"){
                simulateDown(x, y);
            } else if (command == "up"){
                simulateUp(x, y);
            } else if (command == "drag" && myPath){
                simulateDrag(x, y);
            }
        }
    };
}
///bots stuff ends

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
	    } else if (myTool == 'pen' || myTool == 'circle' || 
            myTool == 'triangle' || myTool == 'rectangle') {
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
        // console.log("drawing sticker");
        drawSingleSticker(stickerData);
    });

    io.on( 'drawShape', function(shapeData) {
        drawSingleShape(shapeData.shape, shapeData.centerX, shapeData.centerY, shapeData.radius, shapeData.color);
    });

    // TODO: add shapes to history
    // draw all the previous paths and stickers on the canvas
    // so a new user has the history from previous users
    io.on( 'drawHistory', function( allPaths, allStickers, allShapes ) {
        // console.log("inside drawHistory");
        // go through allPaths and allStickers and check for the min key
        var i = 0; // pointer for paths
        var j = 0; // pointer for stickers
        var k = 0; // pointer for shapes
        while (i < allPaths.length || j < allStickers.length || k < allShapes.length) {
            // assert: at least one pointer is within the range of their list indices (other pointers may not be)
            if (i < allPaths.length &&
                    ((j < allStickers.length && k < allShapes.length && allPaths[i].key < allStickers[j].key && allPaths[i].key < allShapes[k].key) ||
                    (j < allStickers.length && k == allShapes.length && allPaths[i].key < allStickers[j].key) ||
                    (k < allShapes.length && j == allStickers.length && allPaths[i].key < allShapes[k].key) ||
                    (j == allStickers.length && k == allShapes.length))) {
                // i is pointing to the smallest key so draw the path
                var currPath = allPaths[i].value; // grab the path
                if (currPath.length > 0) {
                    // console.log("size of currPaths " + currPath.length);
                    var oldPath = new Path();
                    var data = currPath[0];
                    // set the width and the color of the path
                    oldPath.strokeWidth = getSize(data.size);
                    oldPath.strokeColor = data.color;
                    // draw each data point of the path
                    for (index = 0; index < currPath.length; index++) {
                        // get the data point
                        data = currPath[index];
                        var point = new Point(data.x, data.y);
                        oldPath.add(point);
                    }
                }
                i++; // update pointer for paths
            } else if (j < allStickers.length &&
                    ((i < allPaths.length && k < allShapes.length && allStickers[j].key < allPaths[i].key && allStickers[j].key < allShapes[k].key) ||
                    (i < allPaths.length && k == allShapes.length && allStickers[j].key < allPaths[i].key) ||
                    (k < allShapes.length && i == allPaths.length && allStickers[j].key < allShapes[k].key) ||
                    (i == allPaths.length && k == allShapes.length))) {
                // j is pointing to the smallest key so draw the sticker
                var currSticker = allStickers[j].value;
                drawSingleSticker(currSticker);
                j++; // update pointer for stickers
            } else {
                // k is pointing to the smallest key so draw the shape
                var currShape = allShapes[k].value;
                drawSingleShape(currShape.shape, currShape.centerX, currShape.centerY, currShape.radius, currShape.color);
                k++; // update pointer for shapes
            }
            view.update();
        }
        // assert: all the lists are done

    });
    
    //simulation
    console.log("time to simulate");
    simulateDrawing();
};


$(document).ready(ready);
$(document).on('page:load', ready);
