function simulateClick(x, y) {
    jQuery(document.elementFromPoint(x, y)).click();
}
simulateClick(100, 250);
simulateClick(400, 250);