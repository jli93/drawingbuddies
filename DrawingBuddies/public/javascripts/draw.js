var myPath;

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = 'black';
}

function onMouseDrag(event) {
	myPath.add(event.point);
}

function onMouseUp(event) {

}