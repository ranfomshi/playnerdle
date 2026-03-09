wordlist = ['Enter',
    'drone', 'chart', 'sword', 'shard', 'dream', 'crude', 'stomp', 'stamp', 'phase', 'quite', 'quiet', 'squad', 'north', 'south', 'bring', 'being', 'flask', 'plant', 'mental', 'reach', 'fling', 'sting', 'proud', 'shove', 'stove', 'clink', 'strip', 'pinch', 'hound', 'quote', 'fiend', 'curse', 'today', 'hover', 'owner', 'large', 'purse', 'black', 'white', 'chimp', 'zebra', 'smack', 'trike', 'space', 'drink', 'timer', 'plate', 'chime', 'heart', 'early', 'price', 'slope', 'cable', 'drake', 'clump', 'divot', 'silly', 'berry', 'elate', 'shell', 'taint', 'scone', 'lilac', 'sport', 'clean', 'bride', 'grown', 'glide', 'audit', 'print', 'lance', 'cheat', 'query', 'alert', 'puppy', 'chalk', 'smelt', 'juicy', 'green', 'sushi', 'bribe', 'villa', 'harsh', 'money', 'scrap', 'place', 'knife', 'fight', 'light', 'might', 'chunk', 'stink', 'shown', 'spike', 'crown', 'child', 'sleep', 'throw', 'crack', 'snack', 'crank', 'total', 'snoop', 'spoon', 'verse', 'grant', 'frown', 'angry', 'slave', 'power', 'great', 'brown', 'bread', 'skate', 'plane', 'plain', 'demon', 'stone', 'chick', 'dizzy', 'teeth', 'comma', 'colon', 'brook', 'trust', 'voice', 'Arise', 'drain', 'water', 'earth', 'shame', 'shade', 'shave', 'share', 'sharp', 'spank', 'shark', 'build', 'drama', 'error', 'slash', 'hello', 'Admit', 'Adopt', 'Agree', 'Allow', 'Alter', 'Apply', 'Argue', 'Avoid', 'Begin', 'Blame', 'Break', 'Burst', 'Carry', 'Catch', 'Above', 'Acute', 'Alive', 'Alone', 'Aware', 'Awful', 'Basic', 'Blind', 'Brave', 'Brief', 'Broad', 'Cheap', 'Chief', 'Civil', 'Clear', 'Close', 'Crazy', 'Daily', 'Dirty', 'Empty', 'Equal', 'Exact', 'Faint', 'Fifth', 'Final', 'First', 'Fresh', 'Front', 'Funny', 'Giant', 'Grand', 'Gross', 'Happy', 'Heavy', 'Human', 'Ideal', 'Inner', 'Joint', 'Legal', 'Level', 'Local', 'Loose', 'Lucky', 'Magic', 'Major', 'Minor', 'Moral', 'Naked', 'Nasty', 'Naval', 'Other', 'Outer', 'Prime', 'Prior', 'Quick', 'Rapid', 'Right', 'Roman', 'Rough', 'Round', 'Royal', 'Rural', 'Sheer', 'Short', 'Sixth', 'Small', 'Smart', 'Solid', 'Sorry', 'Spare', 'Steep', 'Still', 'Super', 'Sweet', 'Thick', 'Third', 'Tight', 'Tough', 'Upper', 'Upset', 'Urban', 'Usual', 'Vague', 'Valid', 'Vital', 'Whole', 'Wrong', 'Young', 'Cause', 'Check', 'Claim', 'Climb', 'Count', 'Cover', 'Cross', 'Dance', 'Doubt', 'Drive', 'Enjoy', 'Exist', 'Focus', 'Force', 'Imply', 'Issue', 'Judge', 'Laugh', 'Learn', 'Leave', 'Limit', 'Marry', 'Match', 'Occur', 'Offer', 'Order', 'Phone', 'Point', 'Press', 'Prove', 'Raise', 'Refer', 'Relax', 'Serve', 'Shall', 'Shift', 'Shoot', 'Solve', 'Sound', 'Speak', 'Spend', 'Split', 'Stand', 'Start', 'State', 'Stick', 'Study', 'Teach', 'Thank', 'Think', 'Touch', 'Train', 'Treat', 'Visit', 'Waste', 'Watch', 'Worry', 'Would', 'Write', 'tiger', 'horse', 'petal', 'nurse', 'steam', 'smoke', 'steak', 'juice', 'prank', 'plank', 'chore', 'stack', 'gauze', 'prize', 'pride', 'style', 'lotus', 'groan', 'rogue', 'choke', 'radio', 'pants'
];
incorrectList = [];
placedList = [];
correctList = [];
possibleList = ["q", "w", "e", "r", "t", "y"
    , "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b"
    , "n", "m"];
secret = (wordlist[Math.floor(Math.random() * wordlist.length)].toLowerCase());
guess = "";
guessNumber = 0;
currentStreak = Number(localStorage.getItem("werdleStreak") || 0);
bestStreak = Number(localStorage.getItem("werdleBestStreak") || 0);
var def;

function reset() {
    secret = (wordlist[Math.floor(Math.random() * wordlist.length)].toLowerCase());
    guess = "";
    guessNumber = 0;
    incorrectList = [];
    placedList = [];
    correctList = [];
    def = "";
    $('#definition').html('');
    $('#incorrectArea').html("Incorrect letters: none");
    renderAttempts();
    updateKeyboard();
    updateStats();
}

window.onload = function () {
    if (localStorage.getItem("revisit") == "true") {
        const x = document.getElementById('welcome');
        x.style.display = "none";
        $('#bottomPortion').css("display", "block");
    }
    reset();
    $('#userInput').focus();
    status('Warm up round. Type a 5-letter word.');
}

function enterSubmit(e) { if (e.which == 13) { gameAttempt() } }

function status(message, tone) {
    const el = $('#statusText');
    el.removeClass('success warning danger');
    if (tone) {
        el.addClass(tone);
    }
    el.text(message);
}

function renderAttempts() {
    $('#attemptsLeft').text(5 - guessNumber);
    const meter = $('#attemptMeter');
    meter.html('');
    for (let i = 0; i < 5; i++) {
        meter.append('<div class="attemptDot ' + (i < guessNumber ? 'used' : '') + '"></div>');
    }
}

function updateStats() {
    $('#streakCount').text(currentStreak);
    $('#bestStreakCount').text(bestStreak);
}

function celebrate() {
    const colours = ['#9fffcb', '#85d5ff', '#f8ff99', '#ffc6ea', '#ffd3a1'];
    const root = $('#effects');
    for (let i = 0; i < 24; i++) {
        const left = Math.floor(Math.random() * 100);
        const c = colours[Math.floor(Math.random() * colours.length)];
        const delay = Math.random() * 0.3;
        const size = 6 + Math.random() * 8;
        root.append('<div class="confetti" style="left:' + left + '%;background:' + c + ';animation-delay:' + delay + 's;width:' + size + 'px;height:' + size + 'px;"></div>');
    }
    setTimeout(() => root.html(''), 2200);
    if (navigator.vibrate) {
        navigator.vibrate([80, 60, 120]);
    }
}

function addInputPulse() {
    const input = $('#userInput');
    input.addClass('inputPulse');
    setTimeout(() => input.removeClass('inputPulse'), 450);
}

function gameAttempt() {
    if (guess == secret || guessNumber >= 5) {
        return;
    }

    guess = $('#userInput').val().toLowerCase().trim();

    if (guess.length != 5) {
        status('Need exactly 5 letters.', 'warning');
        addInputPulse();
        return;
    }

    check(guess);
    if (guessNumber == 0) {
        $('#gameText').html("");
    }

    let exactMatches = 0;
    for (var i = 0; i < guess.length; i++) {
        if (secret.includes(guess[i])) {
            if (guess[i] == secret[i]) {
                $('#gameText').append('<div class="letter green">' + guess[i] + '</div>');
                correctList.push(guess[i]);
                exactMatches += 1;
            }
            else {
                $('#gameText').append('<div class="letter blue">' + guess[i] + '</div>');
                placedList.push(guess[i]);
            }
        }
        else {
            $('#gameText').append('<div class="letter black" style="color:black;">' + guess[i] + '</div>');
            incorrectList.push(guess[i]);
        }
    }

    guessNumber += 1;
    renderAttempts();
    updateKeyboard();

    if (guess == secret) {
        currentStreak += 1;
        bestStreak = Math.max(bestStreak, currentStreak);
        localStorage.setItem("werdleStreak", String(currentStreak));
        localStorage.setItem("werdleBestStreak", String(bestStreak));
        updateStats();
        celebrate();
        status('Huge win! +' + currentStreak + ' streak. New word loaded.', 'success');
        $('#gameText').append("<div class='Winner'>Winner Winner</div>");
        $('#gameText').append("<div>Game Over.... the word was '" + secret + "'</div><br><br>Play again by guessing the next word");
        reset();
    } else if (guessNumber == 5) {
        currentStreak = 0;
        localStorage.setItem("werdleStreak", "0");
        updateStats();
        status("Close one. Streak reset — next word is live.", 'danger');
        $('#gameText').append("<div>Game Over.... the word was '" + secret + "'</div><br><br>Play again by guessing the next word");
        reset();
    } else if (exactMatches >= 4) {
        status('So close. One letter away 🔥', 'warning');
    } else {
        status('Good probe. Keep the momentum going.');
    }

    $('#gameText').append('</br>');
    $('#gameText').append('</div>');
    $('#userInput').val('');
    $('#userInput').focus();
    $('#incorrectArea').html("Incorrect letters: " + [...new Set(incorrectList)].join(', '));
}

function updateKeyboard() {
    $('#possibleArea').html('');
    possibleList.forEach(i => {
        if (placedList.includes(i) && !correctList.includes(i)) {
            $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white; background:blue;">' + i + '</kbd>');
        }
        if (correctList.includes(i)) {
            $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white; background:green;">' + i + '</kbd>');
        }
        if (incorrectList.includes(i)) {
            $('#possibleArea').append('<kbd class="key" style="color:transparent; cursor:not-allowed">' + i + '</kbd>');
        }
        if (!incorrectList.includes(i) && !correctList.includes(i) && !placedList.includes(i)) {
            $('#possibleArea').append('<kbd onclick="addKey(event)" class="key" style="color:white;">' + i + '</kbd>');
        }
        if (i == "l" || i == "p") {
            $('#possibleArea').append('<br>');
        }
        if (i == "m") {
            $('#possibleArea').append('<kbd class="key" style="width: auto" onclick="gameAttempt()">Guess</kbd><br>');
        }
    })
}

function addKey(e) {
    if ($('#userInput').val().length == 5) {
        status('Max length reached (5). Hit Guess.', 'warning');
        addInputPulse();
    }
    else {
        const current = $('#userInput').val();
        $('#userInput').val(current + e.target.innerHTML);
    }
    $('#userInput').focus();
}

function closeWelcome() {
    localStorage.setItem("revisit", "true");
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