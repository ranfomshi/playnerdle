import { navLinks } from './navLinks.js';

function sendEvent(eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
}

function createNavbarHTML() {
  const nav = document.createElement("div");
  nav.className = "globalNav";

  // Brand
  const brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML = `<a href="/" onclick="sendEvent('navSelection', { interaction_type: 'click', item_name: 'home' })">Bludle</a>
                     <img src="https://www.bludle.com/images/icon.png" style="margin-left:20px; height:28px; width:28px; border-radius:5px;" />`;
  nav.appendChild(brand);

  // Mobile toggle
  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.id = "mobile-menu";
  toggle.innerHTML = `<span class="bar"></span><span class="bar"></span><span class="bar"></span>`;
  nav.appendChild(toggle);

  // Navigation list
  const ul = document.createElement("ul");
  ul.className = "nav-list";

  navLinks.forEach(link => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.name;
    a.addEventListener("click", () => sendEvent('navSelection', {
      interaction_type: 'click',
      item_name: link.name
    }));
    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  return nav;
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (container) {
    container.appendChild(createNavbarHTML());

    // Toggle mobile menu
    const toggle = document.getElementById("mobile-menu");
    const navList = document.querySelector(".nav-list");
    toggle.addEventListener("click", () => {
      navList.classList.toggle("active");
    });
  }
});
