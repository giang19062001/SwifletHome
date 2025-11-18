let page = 1;
let limit = 10;
let pageElement = 'page-screen';
document.addEventListener('DOMContentLoaded', function () {
  getAllScreen(page, limit);
});


// TODO: FUNC
function gotoScreenUpdate(screenKeyword) {
  gotoPage('/dashboard/config/screen/update?screen-keyword=' + screenKeyword);
}
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllScreen(page, limit);
}

// TODO: RENDER
const renderAllScreen = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.screenName}</p></td>
            <td><p>${ele.screenDescription}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-main-out"  onClick="gotoScreenUpdate('${ele.screenKeyword}')">Chỉnh sửa</button>
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
    renderEmptyRowTable(objElement, 5);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// TODO: API
async function getAllScreen(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 5);

  await axios
    .post(
      currentUrl + '/api/admin/screen/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllScreen(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
