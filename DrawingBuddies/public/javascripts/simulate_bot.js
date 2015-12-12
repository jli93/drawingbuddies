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
function simulateDown(x, y) {
    var el = document.elementFromPoint(x, y);
    $(el).mousedown();
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
function simulateUp(x, y) {
    var el = document.elementFromPoint(x, y);
    $(el).trigger("mouseup");
}
function simulateDrag(x, y) {
    var el = document.elementFromPoint(x, y);
    jQuery(el).mousemove();
}
function simulateDraw(x,y){
    console.log("drawing " + x + " " + y + " ");
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
var ready2 = function() {
    console.log("time to simulate");
    $("#eraser").click();
    $("#pen").click();
    $("#simley").click();
    simulateClick(500, 500);
};
