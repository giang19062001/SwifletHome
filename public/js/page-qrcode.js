let page = 1;
let limit = 10;
let pageElement = 'page-qrcode';
let categories = [];
let objects = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllRequestQrcode(page, limit);;
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllRequestQrcode(page, limit);
}


// TODO: RENDER
function renderRequestQrcode(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.userHomeName}</p></td>
            <td><p>${ele.taskMedicineCount}</p></td>
            <td><p>${ele.harvestPhase}</p></td>
            <td><b class="txt-status-${String(ele.requestStatus).toLocaleLowerCase()}">${LIST_ENUM.QR_REQUEST_STATUS.find((fi) => fi.value == ele.requestStatus)?.text ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-edit"  onclick="getDetailQuestion('${ele.questionCode}')">Chi tiết</button>
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
async function getAllRequestQrcode(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);

  await axios
    .post(
      CURRENT_URL + '/api/admin/qrcode/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      if (response.status === 200 && response.data) {
        renderRequestQrcode(response.data, objElement);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}