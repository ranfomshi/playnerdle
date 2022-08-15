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
        'linear-gradient(to right, rgba(255, 0, 0,' + (x / 100).toFixed(2) + ' ), rgba(0,0,255,' + (x / 100).toFixed(2) +
        '))'
}