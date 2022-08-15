wordlist = ['Enter',
    'drone', 'chart', 'sword', 'shard', 'dream', 'crude', 'stomp', 'stamp', 'phase', 'quite', 'quiet', 'squad', 'north', 'south', 'bring', 'being', 'flask', 'plant', 'mental', 'reach', 'fling', 'sting', 'proud', 'shove', 'stove', 'clink', 'strip', 'pinch', 'hound', 'quote', 'fiend', 'curse', 'today', 'hover', 'owner', 'large', 'purse', 'black', 'white', 'chimp', 'zebra', 'smack', 'trike', 'space', 'drink', 'timer', 'plate', 'chime', 'heart', 'early', 'price', 'slope', 'cable', 'drake', 'clump', 'divot', 'silly', 'berry', 'elate', 'shell', 'taint', 'scone', 'lilac', 'sport', 'clean', 'bride', 'grown', 'glide', 'audit', 'print', 'lance', 'cheat', 'query', 'alert', 'puppy', 'chalk', 'smelt', 'juicy', 'green', 'sushi', 'bribe', 'villa', 'harsh', 'money', 'scrap', 'place', 'knife', 'fight', 'light', 'might', 'chunk', 'stink', 'shown', 'spike', 'crown', 'child', 'sleep', 'throw', 'crack', 'snack', 'crank', 'total', 'snoop', 'spoon', 'verse', 'grant', 'frown', 'angry', 'slave', 'power', 'great', 'brown', 'bread', 'skate', 'plane', 'plain', 'demon', 'stone', 'chick', 'dizzy', 'teeth', 'comma', 'colon', 'brook', 'trust', 'voice', 'Arise', 'drain', 'water', 'earth', 'shame', 'shade', 'shave', 'share', 'sharp', 'spank', 'shark', 'build', 'drama', 'error', 'slash', 'hello', 'Admit', 'Adopt', 'Agree', 'Allow', 'Alter', 'Apply', 'Argue', 'Avoid', 'Begin', 'Blame', 'Break', 'Burst', 'Carry', 'Catch', 'Above', 'Acute', 'Alive', 'Alone', 'Aware', 'Awful', 'Basic', 'Blind', 'Brave', 'Brief', 'Broad', 'Cheap', 'Chief', 'Civil', 'Clear', 'Close', 'Crazy', 'Daily', 'Dirty', 'Empty', 'Equal', 'Exact', 'Faint', 'Fifth', 'Final', 'First', 'Fresh', 'Front', 'Funny', 'Giant', 'Grand', 'Gross', 'Happy', 'Heavy', 'Human', 'Ideal', 'Inner', 'Joint', 'Legal', 'Level', 'Local', 'Loose', 'Lucky', 'Magic', 'Major', 'Minor', 'Moral', 'Naked', 'Nasty', 'Naval', 'Other', 'Outer', 'Prime', 'Prior', 'Quick', 'Rapid', 'Right', 'Roman', 'Rough', 'Round', 'Royal', 'Rural', 'Sheer', 'Short', 'Sixth', 'Small', 'Smart', 'Solid', 'Sorry', 'Spare', 'Steep', 'Still', 'Super', 'Sweet', 'Thick', 'Third', 'Tight', 'Tough', 'Upper', 'Upset', 'Urban', 'Usual', 'Vague', 'Valid', 'Vital', 'Whole', 'Wrong', 'Young', 'Cause', 'Check', 'Claim', 'Climb', 'Count', 'Cover', 'Cross', 'Dance', 'Doubt', 'Drive', 'Enjoy', 'Exist', 'Focus', 'Force', 'Imply', 'Issue', 'Judge', 'Laugh', 'Learn', 'Leave', 'Limit', 'Marry', 'Match', 'Occur', 'Offer', 'Order', 'Phone', 'Point', 'Press', 'Prove', 'Raise', 'Refer', 'Relax', 'Serve', 'Shall', 'Shift', 'Shoot', 'Solve', 'Sound', 'Speak', 'Spend', 'Split', 'Stand', 'Start', 'State', 'Stick', 'Study', 'Teach', 'Thank', 'Think', 'Touch', 'Train', 'Treat', 'Visit', 'Waste', 'Watch', 'Worry', 'Would', 'Write', 'tiger', 'horse', 'petal', 'nurse', 'steam', 'smoke', 'steak', 'juice', 'prank', 'plank', 'chore', 'stack', 'gauze', 'prize', 'pride', 'style', 'lotus', 'groan', 'rogue', 'choke', 'radio', 'pants'
];
incorrectList = [];
placedList = [];
correctList = [];
possibleList = ["q", "w", "e", "r", "t", "y"
    , "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b"
    , "n", "m"];
possibleList2 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d"
    , "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
secret = (wordlist[Math.floor(Math.random() * wordlist.length)].toLowerCase());
guess = "";
guessNumber = 0;
var def;

function reset() {
    secret = (wordlist[Math.floor(Math.random() * wordlist.length)].toLowerCase())
    guess = ""
    guessNumber = 0
    incorrectList = []
    placedList = []
    correctList = []
    def = ""
}

window.onload = function () { 
    resetKeyboard(); 
    $('#userInput').focus();
    if(localStorage.getItem("revisit")=="true"){
        x=document.getElementById('welcome')
        x.style.display="none"
        $('#bottomPortion').css("display", "block"); 
    }

}



function enterSubmit(e) { if (e.which == 13) { gameAttempt() } }
function gameAttempt() {
    if (guess != secret && guessNumber < 5) {
        guess = $('#userInput').val().toLowerCase()
        if (guess.length == 5) {
            check(guess)
            if (guessNumber == 0) {
                $('#gameText').html("")
            } guessNumber += 1
            if (guess == secret) {
                //display the winning word (all green)
                for (var i = 0; i < guess.length; i++) {
                    $('#gameText').append('<div class= "letter green winning" style="animation-delay:' + (i / 10) + 's" > ' + guess[i] + '</div >')
                }
                $('#gameText').append("<div class='Winner'>Winner Winner</div > ")
                $('#gameText').append("<div>Game Over.... the word was '" + secret + "'</div><br><br>Play again by guessing the next word")


                reset()

            }
            else {
               
                //display guess with correct colours
                for (var i = 0; i < guess.length; i++) {

                    if (secret.includes(guess[i])) {
                        if (guess[i] == secret[i]) {
                            $('#gameText').append('<div class="letter green">' + guess[i] + '</div>')
                            correctList.push(guess[i])
                        }
                        else {
                            $('#gameText').append('<div class="letter blue">' + guess[i] + '</div>')
                            placedList.push(guess[i])
                        }
                    }
                    else {
                        $('#gameText').append('<div class="letter black" style="color:black;">' + guess[i] + '</div>')
                        incorrectList.push(guess[i])
                    }

                }
            }
            if (guessNumber == 5) {
                $('#gameText').append("<div>Game Over.... the word was '" + secret + "'</div><br><br>Play again by guessing the next word")
                reset()
            }
            //display updated keyboard - indexes in slices refer to the rows of a keyboard

            $('#possibleArea').html('')

            possibleList.forEach(i => {
                //4 states are unguesses, guessed and placed, guessed anf exact and guessed and wrong
                //placed
                if (placedList.includes(i) && !correctList.includes(i)) {

                    $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white; background:blue;">' + i
                        + '</kbd>')
                }
                //exact
                if (correctList.includes(i)) {

                    $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white; background:green;">' + i
                        + '</kbd>')
                }
                //guessed wrong
                if (incorrectList.includes(i)) {

                    $('#possibleArea').append('<kbd class="key" style="color:transparent; cursor:not-allowed">' + i
                        + '</kbd>')
                }
                //not guessed
                if (!incorrectList.includes(i) && !correctList.includes(i) && !placedList.includes(i)) {

                    $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white; ">' + i
                        + '</kbd>')
                }
                //break at the end of keyboard rows
                if (i == "l" | i == "p") {
                    $('#possibleArea').append('<br>')
                }
                if (i == "m") {
                    $('#possibleArea').append('<kbd class="key" style="width: auto" onclick="gameAttempt()">Guess</kbd><br>')
                }
            })

        } else {
            alert("Invalid guess length. Try again.")
        }
        $('#gameText').append('</br>')
        $('#gameText').append('</div>')
        $('#userInput').val('')
        $('#userInput').focus()
        $('#incorrectArea').html("Incorrect letters: " + incorrectList)

    }

}

function resetKeyboard() {
    $('#possibleArea').html('')
    possibleList.forEach(i => {
        $('#possibleArea').append('<kbd onclick="addKey(event)" class="key">' + i + '</kbd>')
        if (i == "p" | i == "l") {
            $('#possibleArea').append('<br>')
        }
        if (i == "m") {
            $('#possibleArea').append('<kbd class="key" style="width: auto" onclick="gameAttempt()">Guess</kbd><br>')
        }
    }
    )
}
function addKey(e) {
    if (guessNumber == 5) {
        $('#gameText').innerHTML = ""
    }
    if ($('#userInput').val().length == 5) {
        alert("max length reached - 5 letter words only")
    }
    else {
        current = $('#userInput').val()
        $('#userInput').val(current + e.target.innerHTML)
    }
    $('#userInput').focus()
}

function closeWelcome() {
    localStorage.setItem("revisit", "true")
    if ($('#welcome').css("display") == "none") {
        $('#welcome').css("display", "block"); $('#bottomPortion').css("display", "none");
        
    }
    else { $('#welcome').css("display", "none"); $('#bottomPortion').css("display", "block"); }
    $('#userInput').focus();
}


const check = (x) => {
    def = "";

    let checkResult = fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + x)
        .then(res => res.json())
        .then(data => { try { def = data[0]['origin'].toString() } catch { def = "" } })
        .then(() => $('#definition').html(def))

}
