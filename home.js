var direction = 'down'
var x = 0


function sendEvent(category, action, label) {
    if ("ga" in window) {
        tracker = ga.getAll()[0];
        if (tracker)
            tracker.send("event", category, action, label);
    }

}

function nerdleClick(e) {
    sendEvent('homeSelection', 'Click', 'nerdle')
}
function reactionClick(e) {
    sendEvent('homeSelection', 'Click', 'reaction')
}
function colourMatchClick(e) {
    sendEvent('homeSelection', 'Click', 'colourMatch')
}
function bludleClick(e) {
    sendEvent('homeSelection', 'Click', 'bludle')
}
function codleClick(e) {
    sendEvent('homeSelection', 'Click', 'codle')
}
function huntClick(e) {
    sendEvent('homeSelection', 'Click', 'hunt')
}
function guessHueClick(e) {
    sendEvent('homeSelection', 'Click', 'guesshue')
}
function alternateClick(e) {
    sendEvent('homeSelection', 'Click', 'alternate')
}