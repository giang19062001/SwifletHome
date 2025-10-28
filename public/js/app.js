const currentPath = window.location.pathname;
const currentUrl = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
});

// === MAIN INIT ===
function initMenu() {
  const allLinks = document.querySelectorAll('#side-menu a');
  const topLinks = document.querySelectorAll('#side-menu > li > a');
  const partCut = currentPath.split('/');
  const partType = partCut[2]; // "question" or "answer"

  // ========  load => set active by URL ========
  allLinks.forEach((link) => {
    const href = link.getAttribute('href');
    console.log(href, partType);

    if (href.includes(`/${partType}/`)) {
      // find parent element has this class
      const subMenu = link.closest('.sub-menu');
      if (subMenu) {
        if (href === currentPath) {
          link.classList.add('active'); // parent,sub menu => add active
        }
        // open sub menu
        subMenu.classList.add('open');
        subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
        const parentLink = subMenu.previousElementSibling; // reviousElementSibling of '.sub-menu' => a 'waves-effect sidebar-title sb-horizontal'
        if (parentLink) {
          parentLink.classList.add('child-active'); // a 'waves-effect sidebar-title sb-horizontal' => a 'waves-effect sidebar-title sb-horizontal child-active'
        }
      } else {
        link.classList.add('active'); // parent menu => add active
      }
    }
  });

  // ======== Click => set active by href ========
  topLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const li = link.parentElement;
      const subMenu = li.querySelector('.sub-menu');

      // if there is .sub-menu
      if (subMenu) {
        e.preventDefault();

        const isOpen = subMenu.classList.contains('open');

        // close all another menu
        document.querySelectorAll('#side-menu .sub-menu.open').forEach((ul) => {
          if (ul !== subMenu) {
            ul.classList.remove('open');
            ul.style.maxHeight = null;
            ul.previousElementSibling?.classList.remove(
              'active',
              'child-active',
            );
          }
        });

        // Toggle
        if (!isOpen) {
          subMenu.classList.add('open');
          subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
          link.classList.add('active');

          // click frist child of this sub menu
          const firstChild = subMenu.querySelector('a');
          if (
            firstChild &&
            !firstChild.getAttribute('href').includes(`/${partType}/`)
          ) {
            window.location.href = firstChild.getAttribute('href');
          }
        } else {
          subMenu.classList.remove('open');
          subMenu.style.maxHeight = null;
          link.classList.remove('active');
        }
      } else {
        // dont has sub menu → redirect
        allLinks.forEach((a) => a.classList.remove('active', 'child-active'));
        link.classList.add('active');
        window.location.href = link.getAttribute('href');
      }
    });
  });
}



