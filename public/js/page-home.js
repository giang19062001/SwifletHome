let page = 1;
let limit = 10;
const pageElement = 'page-home';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHome(page, limit);
});

// TODO: FUNC
function gotoHomeCreate(){
  gotoPage('/dashboard/home/create');
}
function gotoHomeUpdate(homeCode){
  gotoPage('/dashboard/home/update/'+homeCode);
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
            <td><img class="home-img" src="${currentUrl}/uploads/home/${ele.homeImage}"></img></td>
            <td><p>${ele.homeName}</p></td>
            <td><p>${ele.homeAddress}</p></td>
            <td><p>${ele.latitude}</p></td>
            <td><p>${ele.longitude}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out" onclick="gotoHomeUpdate('${ele.homeCode}')">Cập nhập</button>
                <button class="btn-out-err" onclick="deleteHome('${ele.homeCode}')">Xóa</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // render paging
    let pagerHTML = createPagerHTML(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    //clear
    objElement.innerHTML = ``;
    document.getElementById('privacy-main-pager').innerHTML = ``;
  }
}
// TODO: API

async function getAllHome(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  await axios
    .post(
      currentUrl + '/api/admin/home/getAll',
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
    .delete(currentUrl + `/api/admin/home/deleteHome/${homeCode}`, axiosAuth())
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
