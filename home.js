var direction = 'down'
var x = 0
function scrollEffect() {


    if (x >= 80) {
        direction = 'down'
    }
    if (x <= 20) {
        direction = 'up'
    }
    if (direction == 'down') {
        x = x - 0.5
    } else {
        x = x + 0.5
    }

    


    document.getElementById('content').style.background =
        '#556677'
}

function sendEvent(category, action, label) {
    if ("ga" in window) {
        tracker = ga.getAll()[0];
        if (tracker)
            tracker.send("event", category, action, label);
    }

}

function nerdleClick(e){
    sendEvent('homeSelection', 'Click', 'nerdle')
}
function reactionClick(e){
    sendEvent('homeSelection', 'Click', 'reaction')
}
function colourMatchClick(e){
    sendEvent('homeSelection', 'Click', 'colourMatch')
}
function bludleClick(e){
    sendEvent('homeSelection', 'Click', 'bludle')
}
function codleClick(e){
    sendEvent('homeSelection', 'Click', 'codle')
}
function codleClick(e){
    sendEvent('homeSelection', 'Click', 'hunt')
}