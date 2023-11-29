// Function to insert the navbar HTML and CSS
function insertNavbar() {
    // Navbar HTML
    const navElement = `
      <div class="globalNav">
        <div class="brand"><a href="/" onClick="NAVhomeClick()">Bludle</a><img style="margin-left:20px; height:28px; width:28px; border-radius:5px" src='https://www.bludle.com/images/icon.png'/></div>
        <button class="menu-toggle" id="mobile-menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <ul class="nav-list">
          <li><a href="/werdle" onClick="NAVnerdleClick()">werdle</a></li>
          <li><a href="/reaction" onClick="NAVreactionClick()">reaction</a></li>
          <li><a href="/colourmatch" onClick="NAVcolourMatchClick()">colour match</a></li>
          <li><a href="/bludle" onClick="NAVbludleClick()">bludle</a></li>
          <li><a href="/codle" onClick="NAVcodleClick()">codle</a></li>
          <li><a href="/hunt" onClick="NAVhuntClick()">XY</a></li>
          <li><a href="/hue" onClick="NAVhueClick()">hue</a></li>
          <li><a href="/alternate" onClick="NAValternateClick()">alternate</a></li>
          <li><a href="/trak" onClick="NAVtrakClick()">trak</a></li>
          <li><a href="/tintuition" onClick="NAVtrakClick()">tintuition</a></li>
        </ul>
      </div>
    `;
  
    // Insert navbar HTML into the body
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = navElement;
  
    // Toggle mobile menu
    const mobileMenuButton = document.getElementById("mobile-menu");
    const navList = document.querySelector(".nav-list");
  
    mobileMenuButton.addEventListener("click", function() {
      navList.classList.toggle("active");
    });
  
    // Insert CSS into the head
    const head = document.head;
    const style = document.createElement('style');
    style.type = 'text/css';
    const css = `
    .globalNav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #333;
      color: white;
      padding: 0.5rem 1rem;
      margin: 0;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      z-index:9999999999999;
    }

    .brand {
      font-size: 1.5rem;
      font-weight: bold;
      display:flex
    }

    .brand a {
      color: white;
      text-decoration: none;
      transition: color 0.3s;
    }

    .brand a:hover {
      color: #00bcd4;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      z-index:999;
    }

    .nav-list li a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      transition: background-color 0.3s, color 0.3s;
      border-radius: 0.25rem;
      z-index:999;
    }

    .nav-list li a:hover {
      background-color: #00bcd4;
      color: #333;
      z-index:999;
    }

    .menu-toggle {
      border:none;
      display: none;
      cursor: pointer;
      background: transparent;
      z-index:999;
    }

    .bar {
      background-color: white;
      height: 0.2rem;
      margin: 0.2rem auto;
      width: 1.5rem;
      display: block;
      transition: background-color 0.3s;
      z-index:999;
    }

    @media screen and (max-width: 768px) {
      .menu-toggle {
        display: block;
      }

      .nav-list {
        display: none;
        width: 100%;
        text-align: center;
        position: absolute;
        top: 44px;
        left: 0;
        background-color: #333;
        flex-direction: column;
        z-index: 9999999999999999999999999;
      }

      .nav-list.active {
        display: flex;
      }

      .nav-list li {
        margin: 1rem 0;
      }
    }
  `;
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  }
  
  // Event listener to run the insertNavbar function after the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", insertNavbar);
  

  


  function sendEvent(eventName, params) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }
}

function NAVreactionClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'reaction' });
}

function NAVcolourMatchClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'colourMatch' });
}

function NAVbludleClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'bludle' });
}

function NAVcodleClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'codle' });
}

function NAVhomeClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'home' });
}

function NAVhueClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'hue' });
}

function NAValternateClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'alternate' });
}

function NAVtrakClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'trak' });
}

function NAVtintuitionClick(){
    sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'tintuition' });
}
