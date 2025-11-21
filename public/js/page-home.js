let page = 1;
let limit = 10;
const pageElement = 'page-home';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHome(page, limit);
});

// TODO: FUNC
function gotoHomeCreate(){
  gotoPage('/dashboard/home/sale/create');
}
function gotoHomeUpdate(homeCode){
  gotoPage('/dashboard/home/sale/update/'+homeCode);
}
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllHome(page, limit);
}

// TODO: RENDER

function renderAllHome(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td class="p-3"><img class="home-img" src="${CURRENT_URL}/uploads/images/homes/${ele.homeImage}"></img></td>
            <td><p>${ele.homeName}</p></td>
            <td><p>${ele.homeAddress}</p></td>
            <td><p>${ele.latitude}</p></td>
            <td><p>${ele.longitude}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-main-out" onclick="gotoHomeUpdate('${ele.homeCode}')">Chỉnh sửa</button>
                <button class="btn-err-out" onclick="deleteHome('${ele.homeCode}')">Xóa</button>
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
    renderEmptyRowTable(objElement, 8);
  }

  // xóa skeleton
  hideSkeleton(objElement);
}
// TODO: API

async function getAllHome(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
    // Hiển thị skeleton
  showSkeleton(objElement, limit, 8);

  await axios
    .post(
      CURRENT_URL + '/api/admin/home/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllHome(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function deleteHome(homeCode) {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa nhà yến này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(CURRENT_URL + `/api/admin/home/delete/${homeCode}`, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllHome(page, limit);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
