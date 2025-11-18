function axiosAuth(config) {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('swf-token='))
    ?.split('=')[1];

  return {
    headers: {
      ...config,
      Authorization: `Bearer ${token}`,
    },
  };
}
function getShortTextFromHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.slice(0, 50);
}

async function ChangeUrlToFile(filename, location) {
  try {
    const response = await fetch(`${currentUrl}/uploads/${location}/${filename}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    return null;
  }
}

// table
function renderEmptyRowTable(objElement, colspan) {
  return (objElement.innerHTML = `<tr><td colspan="${colspan + 1}" class="text-center">Không có dữ liệu</td></tr>`);
}
function showSkeleton(objElement, rows = 5, cols = 5) {
  // Xóa pager cũ
  document.getElementById('privacy-main-pager').innerHTML = '';
  // render skeleton
  let skeletonRow = '';
  let skeletonCol = '<td><p class="skeleton skeleton-stt"></p></td>';
  for (let i = 0; i < cols; i++) {
    skeletonCol += '<td><p class="skeleton skeleton-text"></p></td>';
  }
  for (let i = 0; i < rows; i++) {
    skeletonRow += `
            <tr class="text-center">
                ${skeletonCol}
            </tr>`;
  }
  objElement.innerHTML = skeletonRow;
  objElement.closest('table').classList.add('skeleton-loading');
}

function hideSkeleton(objElement) {
  objElement.closest('table').classList.remove('skeleton-loading');
}
function renderPager(totalCount, offset, currentPage, pageBlockCount, callBack) {
  if (totalCount > 0) {
    let totalPage = Math.floor(totalCount / offset);
    if (totalPage < 1) totalPage = 1;
    if (totalCount % offset > 0) totalPage++;
    if (totalCount < offset) totalPage--; //
    let startPage = pageBlockCount * Math.floor((currentPage - 1) / pageBlockCount) + 1;

    let callBacks = callBack.split(':');
    let callBacksArg = '';
    if (callBacks.length > 1) {
      for (let i = 1; i < callBacks.length; i++) {
        callBacksArg += `, '${callBacks[i]}' `;
      }
    }
    let pageHtml = '';

    if (currentPage > 1) {
      pageHtml += `<li class="page-item"><a class="page-link icon-prev" style="cursor: pointer" 
         onclick="${callBacks[0]}(${currentPage - 1},${offset}${callBacksArg != '' ? callBacksArg : ''})">❮</a></li>`;
    } else {
      pageHtml += `<li class="page-item disabled"><a class="page-link icon-prev">❮</a></li>`;
    }
    for (var pg = 0; pg < pageBlockCount; pg++) {
      if (startPage + pg > totalPage) break;
      var bpage = startPage + pg;
      if (currentPage == bpage) {
        pageHtml += `<li class="page-item active"><a class="page-link">${bpage}</a></li>`;
      } else {
        pageHtml += `<li class="page-item"><a class="page-link" style="cursor: pointer" 
            onclick="${callBacks[0]}(${bpage},${offset}${callBacksArg != '' ? callBacksArg : ''})">${bpage}</a></li>`;
      }
    }
    if (currentPage < totalPage) {
      pageHtml += `<li class="page-item"><a class="page-link icon-next" style="cursor: pointer" 
         onclick="${callBacks[0]}(${currentPage + 1},${offset}${callBacksArg != '' ? callBacksArg : ''})">❯</a></li>`;
    } else {
      pageHtml += `<li class="page-item disabled"><a class="page-link icon-next">❯</a></li>`;
    }

    return pageHtml;
  } else {
    return '';
  }
}
// modal
function closeModal(modalEl) {
  // Lấy instance modal hiện tại
  const modalInstance = bootstrap.Modal.getInstance(modalEl);

  if (modalInstance) {
    modalInstance.hide(); // Đóng modal
  } else {
    // Nếu chưa có instance (trường hợp modal chưa được show trước đó)
    const modal = new bootstrap.Modal(modalEl);
    modal.hide();
  }
}

// toast
function toastOk(text) {
  Toastify({
    text: text,
    duration: 3000,
    newWindow: true,
    close: false,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: '#449d48',
      color: '#fff',
      borderRadius: '0.25rem',
    },
  }).showToast();
}

function toastErr(text) {
  Toastify({
    text: text,
    duration: 3000,
    newWindow: true,
    close: false,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: '#f44336',
      color: '#fff',
    },
  }).showToast();
}

//loader
function showPageLoader() {
  document.getElementById('page-loader')?.classList.remove('hidden');
}

function hidePageLoader() {
  document.getElementById('page-loader')?.classList.add('hidden');
}

async function loaderApiCall(promise) {
  try {
    showPageLoader();
    const res = await promise;
    return res;
  } finally {
    hidePageLoader();
  }
}
// redirect
function reloadPage(url) {
  setTimeout(() => {
    if (url) {
      window.location.href = url;
    } else {
      location.reload();
    }
  }, 1500);
}

function gotoPage(url) {
  window.location.href = url;
}
