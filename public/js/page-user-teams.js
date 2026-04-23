let page = 1;
let limit = 10;
const pageElement = 'page-user-teams';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllTeam(page, limit);
});

// TODO: FUNC
function gotoTeamCreate() {
  gotoPage('/dashboard/user-teams/create');
}
function gotoTeamUpdate(teamCode) {
  gotoPage('/dashboard/user-teams/update/' + teamCode);
}
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllTeam(page, limit);
}

// TODO: RENDER

function renderAllTeam(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${(page - 1) * limit + i++}</p></td>
            <td class="p-3"><img class="team-img" src="${CURRENT_URL}/${ele.teamImage}"></img></td>
            <td><p>${ele.teamName}</p></td>
            <td><b>${ele.userTypeName}</b></td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.provinceName}</p></td>
            <td><p>${ele.teamAddress}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
               <button class="btn-edit" onclick="gotoTeamUpdate('${ele.teamCode}')">Chỉnh sửa</button> 
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

async function getAllTeam(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 8);

  await axios
    .post(
      CURRENT_URL + '/api/admin/team/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllTeam(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function deleteTeam(teamCode) {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa đội này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(CURRENT_URL + `/api/admin/team/delete/${teamCode}`, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllTeam(page, limit);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
