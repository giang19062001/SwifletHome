let page = 1;
let limit = 10;
const pageElement = 'page-guest';
const filterValueDefault = {
  keyword: '',
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  refreshPage(filterValueDefault);
});

// FILTER
document.getElementById('btn-filter-reset').addEventListener('click', () => {
  document.getElementById('filterName').value = '';
  document.getElementById('filterPhone').value = '';
  refreshPage(filterValueDefault);
});

document.getElementById('btn-filter-apply').addEventListener('click', () => {
  const filterValue = getFilterValue();
  refreshPage(filterValue);
});

// TODO: FUNC
function refreshPage(filterValue) {
  page = 1;
  getAllGuest(page, limit, filterValue);
}

function getFilterValue() {
  const name = document.getElementById('filterName').value.trim();
  const phone = document.getElementById('filterPhone').value.trim();
  // ưu tiên phone nếu có, không thì lấy name
  const keyword = phone || name;
  return { keyword };
}

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  const filterValue = getFilterValue();
  getAllGuest(page, limit, filterValue);
}

// TODO: RENDER
function renderAllGuest(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data.list.forEach((ele) => {
      const rowHtml = `
        <tr class="text-center">
          <td><p>${(page - 1) * limit + i++}</p></td>
          <td><p>${ele.name ?? ''}</p></td>
          <td><p>${ele.phone ?? ''}</p></td>
          <td><p>${ele.issueInterest ?? ''}</p></td>
          <td style="max-width: 250px; white-space: normal; text-align: left;"><p>${ele.issueDescription ?? ''}</p></td>
          <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm') : ''}</p></td>
        </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // phân trang
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    // dữ liệu trống
    renderEmptyRowTable(objElement, 6);
  }

  // xóa skeleton
  hideSkeleton(objElement);
}

// TODO: API
async function getAllGuest(currentPage, currentLimit, filterValue) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, currentLimit, 6);

  await axios
    .post(
      CURRENT_URL + '/api/admin/guest/getAll',
      {
        page: currentPage,
        limit: currentLimit,
        ...filterValue,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllGuest(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
