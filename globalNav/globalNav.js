var navElement = '<div class="globalNav"><ul> <li><div class="brand"><a href = "http://www.playnerdle.com/">PlayNerdle</a></div></li>' +
    '<li><a href = "http://www.playnerdle.com/nerdle">nerdle</a></li>' +
    '<li><a href = "http://www.playnerdle.com/reaction/">reaction</a></li>' +
    '<li><a href = "http://www.playnerdle.com/colourmatch/">colour match</a></li>' +
    '<li><a href = "http://www.playnerdle.com/bludle/">bludle</a></li>' +
    '<li><a href = "http://www.playnerdle.com/codle/">codle</a></li></ul></div>' +
    '<div onload="initMobileNav()" class="globalMobileNav"><ul><li><div class="brand" onclick="toggleNav()">Menu</div></li> <li><div class="brand"><a href = "http://www.playnerdle.com/">PlayNerdle</a></div></li>' +
    '<li id="hideable0"><a href = "http://www.playnerdle.com">home</a></li>' +
    '<li id="hideable1"><a href = "http://www.playnerdle.com/nerdle">nerdle</a></li>' +
    '<li id="hideable2"><a href = "http://www.playnerdle.com/reaction/">reaction</a></li>' +
    '<li id="hideable3"><a href = "http://www.playnerdle.com/colourmatch/">colour match</a></li>' +
    '<li id="hideable4"><a href = "http://www.playnerdle.com/bludle/">bludle</a></li>' +
    '<li id="hideable5"><a href = "http://www.playnerdle.com/codle/">codle</a></li></ul></div>'




// ✅ Create element
const el = document.createElement('div');

// ✅ Set ID attribute on element
el.setAttribute('id', 'nav');

// ✅ Add html content to element
el.innerHTML = navElement;


// ✅ add element to DOM
document.body.appendChild(el)



function toggleNav() {
    if (document.getElementById('hideable1').style.display == 'block') {
        document.getElementById('hideable0').style.display = 'none'
        document.getElementById('hideable1').style.display = 'none'
        document.getElementById('hideable2').style.display = 'none'
        document.getElementById('hideable3').style.display = 'none'
        document.getElementById('hideable4').style.display = 'none'
        document.getElementById('hideable5').style.display = 'none'
    } else {
        document.getElementById('hideable0').style.display = 'block'
        document.getElementById('hideable1').style.display = 'block'
        document.getElementById('hideable2').style.display = 'block'
        document.getElementById('hideable3').style.display = 'block'
        document.getElementById('hideable4').style.display = 'block'
        document.getElementById('hideable5').style.display = 'block'
    }
}