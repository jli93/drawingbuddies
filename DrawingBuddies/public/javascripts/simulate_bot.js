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
    jQuery(el).mousedown();
}
function simulateClick(x, y) {
    
    var el = document.elementFromPoint(x, y);
    $(el).click();
    console.log("clicking " + x + " " + y + " ");
    console.log(el);
}
function simulateUp(x, y) {
    var el = document.elementFromPoint(x, y);
    jQuery(el).trigger("mouseup");
}
function simulateDrag(x, y) {
    var el = document.elementFromPoint(x, y);
    jQuery(el).mousemove();
}
var ready2 = function() {
    console.log("time to simulate");
    $("#eraser").click();
    simulateClick(100, 350);
    simulateClick(400, 350);
};
