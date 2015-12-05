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
    jQuery(document.elementFromPoint(x, y)).mousedown();
}
function simulateUp(x, y) {
    jQuery(document.elementFromPoint(x, y)).trigger("click");
}
function simulateDrag(x, y) {
    jQuery(document.elementFromPoint(x, y)).mousemove();
}
simulateClick(100, 250);
simulateClick(400, 250);
simulateDrag(400,251);
simulateDrag(400,256);
simulateUp(400,270);

var e = jQuery.Event( "click", { pageX: 400, pageY: 250 } );
$('canvas').trigger(e);