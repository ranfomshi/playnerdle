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
          <li><a href="/shiftyfades" onClick="NAVshiftyFadesClick()">shifty fades</a></li>
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

  mobileMenuButton.addEventListener("click", function () {
    navList.classList.toggle("active");
  });

  // Insert CSS into the head
  const head = document.head;
  const style = document.createElement('style');
  style.type = 'text/css';
  const css = `
    .globalNav {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      background-color: #333 !important;
      color: white !important;
      padding: 0.5rem 1rem !important;
      margin: 0 !important;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2) !important;
      width: 100% !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      box-sizing: border-box !important;
      z-index:9999999999999 !important;
    }

    .brand {
      font-size: 1.5rem !important;
      font-weight: bold !important;
      display:flex !important
    }

    .brand a {
      color: white !important;
      text-decoration: none !important;
      transition: color 0.3s !important;
    }

    .brand a:hover {
      color: #00bcd4 !important;
    }

    .nav-list {
      list-style: none !important;
      padding: 0 !important;
      margin: 0 !important;
      display: flex !important;
      z-index:999 !important;
    }

    .nav-list li a {
      color: white !important;
      text-decoration: none !important;
      padding: 0.5rem 1rem !important;
      transition: background-color 0.3s, color 0.3s !important;
      border-radius: 0.25rem !important;
      z-index:999 !important;
    }

    .nav-list li a:hover {
      background-color: #00bcd4 !important;
      color: #333 !important;
      z-index:999 !important;
    }

    .menu-toggle {
      border:none !important;
      display: none !important;
      cursor: pointer !important;
      background: transparent !important;
      z-index:999 !important;
    }

    .bar {
      background-color: white !important;
      height: 0.2rem !important;
      margin: 0.2rem auto !important;
      width: 1.5rem !important;
      display: block !important;
      transition: background-color 0.3s !important;
      z-index:999 !important;
    }

    @media screen and (max-width: 768px) {
      .menu-toggle {
        display: block !important;
      }

      .nav-list {
        display: none !important;
        width: 100% !important;
        text-align: center !important;
        position: absolute !important;
        top: 44px !important;
        left: 0 !important;
        background-color: #333 !important;
        flex-direction: column !important;
        z-index: 9999999999999999999999999 !important;
      }

      .nav-list.active {
        display: flex !important;
      }

      .nav-list li {
        margin: 1rem 0 !important;
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

function NAVreactionClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'reaction' });
}

function NAVshiftFadesClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'shiftyFades' });
}

function NAVcolourMatchClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'colourMatch' });
}

function NAVbludleClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'bludle' });
}

function NAVcodleClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'codle' });
}

function NAVhomeClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'home' });
}

function NAVhueClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'hue' });
}

function NAValternateClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'alternate' });
}

function NAVtrakClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'trak' });
}

function NAVtintuitionClick() {
  sendEvent('navSelection', { 'interaction_type': 'click', 'item_name': 'tintuition' });
}
