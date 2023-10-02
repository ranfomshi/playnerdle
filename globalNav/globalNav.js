var navElement = '<div class="globalNav"><ul>' +
    '<li><div class="brand"><a href="http://www.playnerdle.com/" onClick="NAVhomeClick()">PlayNerdle</a></div></li>' +
    '<li><a href="http://www.playnerdle.com/nerdle" onClick="NAVnerdleClick()">nerdle</a></li>' +
    '<li><a href="http://www.playnerdle.com/reaction/" onClick="NAVreactionClick()">reaction</a></li>' +
    '<li><a href="http://www.playnerdle.com/colourmatch/" onClick="NAVcolourMatchClick()">colour match</a></li>' +
    '<li><a href="http://www.playnerdle.com/bludle/" onClick="NAVbludleClick()">bludle</a></li>' +
    '<li><a href="http://www.playnerdle.com/codle/" onClick="NAVcodleClick()">codle</a></li>' +
    '<li><a href="http://www.playnerdle.com/hunt/" onClick="NAVhuntClick()">XY</a></li>' +
    '</ul></div>' +
    '<div onload="initMobileNav()" class="globalMobileNav"><ul>' +
    '<li><div class="brand" onclick="toggleNav()">Menu</div></li>' +
    '<li><div class="brand"><a href="http://www.playnerdle.com/">PlayNerdle</a></div></li>' +
    '<li id="hideable0"><a href="http://www.playnerdle.com" onClick="NAVhomeClick()">home</a></li>' +
    '<li id="hideable1"><a href="http://www.playnerdle.com/nerdle" onClick="NAVnerdleClick()">nerdle</a></li>' +
    '<li id="hideable2"><a href="http://www.playnerdle.com/reaction/" onClick="NAVreactionClick()">reaction</a></li>' +
    '<li id="hideable3"><a href="http://www.playnerdle.com/colourmatch/" onClick="NAVcolourMatchClick()">colour match</a></li>' +
    '<li id="hideable4"><a href="http://www.playnerdle.com/bludle/" onClick="NAVbludleClick()">bludle</a></li>' +
    '<li id="hideable5"><a href="http://www.playnerdle.com/codle/" onClick="NAVcodleClick()">codle</a></li>' +
    '<li id="hideable6"><a href="http://www.playnerdle.com/hunt/" onClick="NAVhuntClick()">XY</a></li>' +
    '</ul></div>';

const el = document.createElement('div');
el.setAttribute('id', 'nav');
el.innerHTML = navElement;
document.body.appendChild(el);

function toggleNav() {
    // Existing code
}

function sendEvent(category, action, label) {
    // Existing code
}

function NAVnerdleClick(){
    sendEvent('navSelection', 'Click', 'nerdle');
}

function NAVreactionClick(){
    sendEvent('navSelection', 'Click', 'reaction');
}

function NAVcolourMatchClick(){
    sendEvent('navSelection', 'Click', 'colourMatch');
}

function NAVbludleClick(){
    sendEvent('navSelection', 'Click', 'bludle');
}

function NAVcodleClick(){
    sendEvent('navSelection', 'Click', 'codle');
}

function NAVhomeClick(){
    sendEvent('navSelection', 'Click', 'home');
}

function NAVhuntClick(){
    sendEvent('navSelection', 'Click', 'hunt');
}
