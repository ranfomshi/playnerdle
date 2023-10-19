
var now = new Date();
var start = new Date(now.getFullYear(), 0, 0);
var diff = now - start;
var oneDay = 1000 * 60 * 60 * 24;
var day = Math.floor(diff / oneDay);
r = 0
g = 0
b = 0
oldSet = []
todayColor = null


function initialise() {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    let color = 'rgb(' + red + ',' + green + ',' + blue + ')';
    todayColor = color
    $('#content').css('background', todayColor);
    updateComparison(); 
}






function getDifference(a, b) {
    return Math.abs(a - b);
}

function submitClick() {
    $("#guessValue1").prop('disabled', true);
    $("#guessValue2").prop('disabled', true);
    $("#guessValue3").prop('disabled', true);
    $("#submitBtn").prop('disabled', true);

  


    answer = JSON.parse(todayColor.substring(3).replace('(', '[').replace(')', ']'))
    diffr = getDifference(answer[0], r)
    diffg = getDifference(answer[1], g)
    diffb = getDifference(answer[2], b)
    score = diffr + diffb + diffg
    sendEvent("colourMatch", "submit", score)
    emoji = ''
        //choose emoji based on score
    if (score == 0) {
        emoji = '&#x1F389;&#x1F947;&#x1F389;'
    }
    if (score > 0) {
        emoji = '&#x1F947;'
    }
    if (score > 10) {
        emoji = '&#x1F948;'
    }
    if (score > 50) {
        emoji = '&#x1F949;'
    }
    if (score > 100) {
        emoji = '&#x1F626;'
    }
    $('#guessRepresentation').html('<div style="display:flex; text-aligh:left; justify-content:space-around"><div class="answerValue">' +
        answer[0] + '</div><div class="answerValue">' + answer[1] + '</div><div class="answerValue">' + answer[2] + '</div></div>' +
        '<br><div class="answerValue overallAnswer">' + score + ' ' + emoji + '<br><small>Total Difference</small></div>' +
        '</div>')

        $('.adjusterUpHolder div[onclick], .adjusterDownHolder div[onclick]').off('click').css('pointer-events', 'none');
        $('.adjusterUpHolder div[onclick], .adjusterDownHolder div[onclick]').off('click').css('display', 'none');

}



function snackbar(x) {
    $('#snackbar').html(x)
        // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
}









 

 


function updateComparison() {
    $('#guessRepresentation').html('')
    r = $('#guessValue1').val()
    g = $('#guessValue2').val()
    b = $('#guessValue3').val()
    if (r == ("" || null)) { r = 0 }
    if (g == ("" || null)) { g = 0 }
    if (b == ("" || null)) { b = 0 }
    $('#guessRepresentation').css("background", 'rgb(' + r + ',' + g + ',' + b + ')')
}



function valueUp(x, y) {

            x.val(parseInt(x.val()) + y)
            if(x.val()>255){x.val(255)}
            updateComparison()
        }

function valueDown(x, y) {
   
            x.val(parseInt(x.val()) - y)
            if(x.val()<0){x.val(0)}
            updateComparison()
  

}

function sendEvent(category, action, label) {
    if ("ga" in window) {
        tracker = ga.getAll()[0];
        if (tracker)
            tracker.send("event", category, action, label);
    }

}