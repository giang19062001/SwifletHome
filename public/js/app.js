const currentPath = window.location.pathname;
const currentUrl = window.location.origin;
const currentSearch = window.location.search;

let pathParts = currentPath.split('/').filter(Boolean);
let partType = pathParts[1] || '';

document.addEventListener('DOMContentLoaded', initMenu);

function initMenu() {
  const menu = document.getElementById('side-menu');
  if (!menu) return;

  const allLinks = menu.querySelectorAll('a');
  const topLinks = menu.querySelectorAll(':scope > li > a');

  // Set active dựa vào URL (chạy 1 lần khi load trang)
  setActiveMenuByUrl(allLinks);

  // Handle click
  topLinks.forEach(link => link.addEventListener('click', handleTopLinkClick));
}

function setActiveMenuByUrl(allLinks) {
  let bestMatch = null;
  let maxLength = 0;

  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '') return;

    console.log(currentPath, href);
    // Ưu tiên href dài nhất khớp currentPath (tránh trùng lặp kiểu /question/ và /question-detail/)
    if (currentPath.startsWith(href) && href.length > maxLength) {
      maxLength = href.length;
      bestMatch = link;
    }
  });

  if (!bestMatch) return;

  bestMatch.classList.add('active');

  const subMenu = bestMatch.closest('.sub-menu');
  if (subMenu) {
    subMenu.classList.add('open');
    requestAnimationFrame(() => {
      subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
    });

    const parentLink = subMenu.previousElementSibling;
    if (parentLink?.matches('a')) {
      parentLink.classList.add('child-active');
    }
  }
}

function handleTopLinkClick(e) {
  const link = e.currentTarget;
  const li = link.parentElement;
  const subMenu = li.querySelector(':scope > .sub-menu');

  // Không có submenu → navigate bình thường (leaf item)
  if (!subMenu) {
    closeAllSubMenus(); // đóng hết submenu + xóa child-active cũ
    document.querySelectorAll('#side-menu a').forEach(a => {
      a.classList.remove('active', 'child-active');
    });
    link.classList.add('active');
    return; // cho phép navigate
  }

  // Có submenu → accordion behaviour
  e.preventDefault();

  const isOpen = subMenu.classList.contains('open');

  // Đóng tất cả submenu khác
  closeAllSubMenus(subMenu);

  if (!isOpen) {
    // MỞ submenu hiện tại
    subMenu.classList.add('open');
    link.classList.add('child-active'); // chỉ dùng child-active, KHÔNG dùng active
    requestAnimationFrame(() => {
      subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
    });

    // Nếu first child hợp lệ với partType hiện tại → không redirect (chỉ mở để xem)
    // Nếu không hợp lệ → redirect vào child đầu tiên (giữ logic cũ của bạn)
    const firstChild = subMenu.querySelector('a[href]');
    if (firstChild) {
      const childHref = firstChild.getAttribute('href');
      if (childHref && !childHref.includes(`/${partType}/`)) {
        window.location.href = childHref;
      }
    }
  } else {
    // ĐÓNG submenu hiện tại
    subMenu.classList.remove('open');
    subMenu.style.maxHeight = null;
    link.classList.remove('child-active');
  }
}

function closeAllSubMenus(exclude = null) {
  document.querySelectorAll('#side-menu .sub-menu.open').forEach(ul => {
    if (ul === exclude) return;
    ul.classList.remove('open');
    ul.style.maxHeight = null;
    const parentLink = ul.previousElementSibling;
    if (parentLink?.matches('a')) {
      parentLink.classList.remove('child-active'); // chỉ xóa child-active, giữ active nếu là trang hiện tại
    }
  });
}