const navLinks = [
    { name: "werdle", href: "/werdle" },
    { name: "reaction", href: "/reaction" },
    { name: "shifty fades", href: "/shiftyfades" },
    { name: "colour match", href: "/colourmatch" },
    { name: "bludle", href: "/bludle" },
    { name: "heardle", href: "/heardle" },
    { name: "codle", href: "/codle" },
    { name: "XY", href: "/hunt" },
    { name: "guess hue", href: "/guesshue" },
    { name: "alternate", href: "/alternate" },
    { name: "trak", href: "/trak" },
    { name: "tintuition", href: "/tintuition" },
    { name: "connex", href: "/connex" },
];

function setupNavbar() {
    const ul = document.createElement('ul');
    ul.className = 'nav-list';

    navLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.name;
        a.onclick = () => sendEvent('navSelection', { interaction_type: 'click', item_name: link.name });
        li.appendChild(a);
        ul.appendChild(li);
    });

    document.querySelector('.globalNav').appendChild(ul);
}
