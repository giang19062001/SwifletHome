let page = 1;
let limit = 10;
const pageElement = 'page-home-sale';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllSaleHome(page, limit);
});

// TODO: FUNC
function gotoHomeSaleCreate() {
  gotoPage('/dashboard/home/sale/create');
}
function gotoHomeSaleUpdate(homeCode) {
  gotoPage('/dashboard/home/sale/update/' + homeCode);
}
function gotoHomeSaleDetail(homeCode) {
  gotoPage('/dashboard/home/sale/detail/' + homeCode);
}
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllSaleHome(page, limit);
}

// TODO: RENDER
function renderAllSaleHome(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      let actionBtn = '';
      if (ele.status === VARIABLE_ENUM.SALE_HOME_STATUS.WAITING.VALUE || ele.status === VARIABLE_ENUM.SALE_HOME_STATUS.REFUSE.VALUE) {
        actionBtn = `<button class="btn btn-info" onclick="gotoHomeSaleDetail('${ele.homeCode}')">Xem chi tiết</button>`;
      } else {
        actionBtn = `<button class="btn-edit" onclick="gotoHomeSaleUpdate('${ele.homeCode}')">Chỉnh sửa</button>`;
      }

      let statusBadge = '';
      if (ele.status === VARIABLE_ENUM.SALE_HOME_STATUS.APPROVED.VALUE) statusBadge = `<span class="badge bg-success">${VARIABLE_ENUM.SALE_HOME_STATUS.APPROVED.TEXT}</span>`;
      else if (ele.status === VARIABLE_ENUM.SALE_HOME_STATUS.REFUSE.VALUE) statusBadge = `<span class="badge bg-danger">${VARIABLE_ENUM.SALE_HOME_STATUS.REFUSE.TEXT}</span>`;
      else statusBadge = `<span class="badge bg-warning text-dark">${VARIABLE_ENUM.SALE_HOME_STATUS.WAITING.TEXT}</span>`;

      const rowHtml = `
         <tr class="text-center">
            <td><p>${(page - 1) * limit + i++}</p></td>
            <td class="p-3"><img class="home-img" src="${CURRENT_URL}/${ele.homeImage || ''}"></img></td>
            <td><p>${ele.homeName || ''}</p></td>
            <td><b>${ele.hostName || ''}</b></td>
            <td><p>${ele.hostRoleName || ''}</p></td>
            <td><p>${ele.homeLocation || ''}</p></td>
            <td><p>${statusBadge}</p></td>
            <td><p>${ele.hostPhone || ''}</p></td>
            <td><p>${ele.currentNests || ''}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
               ${actionBtn}
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // phân trang
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    // dữ liệu trống
    renderEmptyRowTable(objElement, 11);
  }

  // xóa skeleton
  hideSkeleton(objElement);
}

// TODO: API
async function getAllSaleHome(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 11);

  await axios
    .post(
      CURRENT_URL + '/api/admin/saleHome/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllSaleHome(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
