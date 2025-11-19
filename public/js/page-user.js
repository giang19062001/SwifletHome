let page = 1;
let limit = 10;
const pageElement = 'page-user';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllUser(page, limit);
});

// TODO: FUNC

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllUser(page, limit);
}

// TODO: RENDER
function renderAllUser(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.userPhone}</p></td>
            <td><p>${ele.packageName} ${ele.packageDescription ? `(${ele.packageDescription})` : ''}</p></td>
            <td><p>${ele.startDate ? moment(ele.startDate).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.endDate ? moment(ele.endDate).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
           <td>
                  <button class="btn-main-out">Chỉnh sửa</button> 
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
    renderEmptyRowTable(objElement, 7);
  }

  // xóa skeleton
  hideSkeleton(objElement);
}
// TODO: API

async function getAllUser(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);

  await axios
    .post(
      currentUrl + '/api/admin/user/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllUser(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
