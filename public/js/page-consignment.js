let page = 1;
let limit = 10;
let pageElement = 'page-consignment';
let categories = [];
let objects = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllRequestConsignment(page, limit);;
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllRequestConsignment(page, limit);
}

// TODO: RENDER
function renderConsignment(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.senderName} / ${ele.senderPhone}</p></td>
            <td><p>${ele.receiverName} / ${ele.senderPhone}</p></td>
            <td><p>${ele.deliveryAddress}</p></td>
            <td><p>${ele.nestQuantity}</p></td>
            <td><b class="txt-status-${String(ele.consignmentStatus).toLocaleLowerCase()}">${LIST_ENUM.CONSIGNMENT_STATUS.find((fi) => fi.value == ele.consignmentStatus)?.text ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-edit">Chi tiết</button>
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
async function getAllRequestConsignment(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);

  await axios
    .post(
      CURRENT_URL + '/api/admin/consignment/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      if (response.status === 200 && response.data) {
        renderConsignment(response.data, objElement);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}