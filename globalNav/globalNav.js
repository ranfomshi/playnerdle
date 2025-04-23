import { navLinks } from './navLinks.js';

function sendEvent(eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
}

function createNavbarHTML() {
  const nav = document.createElement("nav");
  nav.className = "globalNav";

  // Brand section
  const brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML = `
    <a href="/" onclick="sendEvent('navSelection', { interaction_type: 'click', item_name: 'home' })">Bludle</a>
    <img src="https://www.bludle.com/images/icon.png" style="margin-left:10px; height:28px; width:28px; border-radius:5px;" />
  `;
  nav.appendChild(brand);

  // Dropdown button
  const dropdownToggle = document.createElement("button");
  dropdownToggle.className = "menu-toggle";
  dropdownToggle.id = "dropdown-toggle";
  dropdownToggle.innerHTML = `Menu &#x2630;`; // ☰
  nav.appendChild(dropdownToggle);

  // Dropdown menu
  const dropdownMenu = document.createElement("ul");
  dropdownMenu.className = "dropdown-menu";

  navLinks.forEach(link => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.name;
    a.addEventListener("click", () => {
      sendEvent('navSelection', { interaction_type: 'click', item_name: link.name });
      dropdownMenu.classList.remove("active");
    });
    li.appendChild(a);
    dropdownMenu.appendChild(li);
  });

  nav.appendChild(dropdownMenu);
  return nav;
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (container) {
    container.appendChild(createNavbarHTML());

    const toggle = document.getElementById("dropdown-toggle");
    const dropdown = document.querySelector(".dropdown-menu");

    toggle.addEventListener("click", () => {
      dropdown.classList.toggle("active");
    });

    // Optional: close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }
});
