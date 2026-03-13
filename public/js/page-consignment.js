let page = 1;
let limit = 10;
let pageElement = 'page-consignment';
let categories = [];
let objects = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllRequestConsignment(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllRequestConsignment(page, limit);
}

// TODO: RENDER
function closeModal() {
  const modalSelector = '.consignment-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // xóa lỗi input
  const modalBody = modalEl.querySelector('.modal-body');
  modalBody.querySelector('.err-noticeContent').style.display = 'none';

  // đóng modal boostrap
  closeCommonModal(modalEl);
}
async function openModal(consignmentData) {
  const modalSelector = '.consignment-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#consignmentCode').value = consignmentData.consignmentCode;
  modalEl.querySelector('#senderName').innerText = consignmentData.senderName;
  modalEl.querySelector('#senderPhone').innerText = consignmentData.senderPhone;
  modalEl.querySelector('#deliveryAddress').innerText = consignmentData.deliveryAddress;
  modalEl.querySelector('#nestQuantity').innerText = consignmentData.nestQuantity;
  // render danh sách status
  const selectStatus = modalEl.querySelector('#consignmentStatus');
  selectStatus.innerHTML = '';

  Object.entries(VARIABLE_ENUM.CONSIGNMENT_STATUS).forEach(([key, text]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = text;

    // chờ 'chỉ có thể thành' giao
    if (consignmentData.consignmentStatus == 'WAITING' && (key == 'CANCEL' || key == 'DELIVERED' || key == 'RETURN')) {
      option.disabled = true;
    }
    // giao 'chỉ có thể thành' đã giao/giao thất bại
    if (consignmentData.consignmentStatus == 'DELIVERING' && (key == 'WAITING' || key == 'RETURN')) {
      option.disabled = true;
    }
    // giao thất bại 'chỉ có thể thành' đã hoàn trả
    if (consignmentData.consignmentStatus == 'CANCEL' && key != 'CANCEL' && key != 'RETURN') {
      option.disabled = true;
    }
    // giao thành công 'không thể cập nhập nữa'
    if (consignmentData.consignmentStatus == 'DELIVERED' && key != 'DELIVERED') {
      option.disabled = true;
    }

    // đã hoàn trả 'không thể cập nhập nữa'
    if (consignmentData.consignmentStatus == 'RETURN' && key != 'RETURN') {
      option.disabled = true;
    }

    // nếu match  -> tự  selected
    if (key === consignmentData.consignmentStatus) {
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // theo dõi validate của nội dung thông báo
  modalBody.querySelector('#noticeContent').innerText = '';
  modalBody.querySelector('#noticeContent')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-noticeContent').style.display = String(e.target.value).trim() == '' ? 'block' : 'none';
  });

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick = updateConsignment;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal();
  });
  modal.show();
}
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
            <td><b class="txt-status-${String(ele.consignmentStatus).toLocaleLowerCase()}">${VARIABLE_ENUM.CONSIGNMENT_STATUS[ele.consignmentStatus] ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
               <!-- <button class="btn-edit" onclick="getDetailConsignment('${ele.consignmentCode}')">Thay đổi trạng thái</button> -->
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
async function getDetailConsignment(consignmentCode) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/consignment/getDetail/' + consignmentCode, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          openModal(response.data);
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
}

async function updateConsignment() {
  try {
    const modalBody = document.querySelector('.consignment-update-modal .modal-body form');
    const consignmentCode = modalBody.querySelector('#consignmentCode').value;
    const noticeContent = modalBody.querySelector('#noticeContent').value;

    const consignmentStatus = modalBody.querySelector('#consignmentStatus').value;
    await axios
      .put(
        CURRENT_URL + '/api/admin/consignment/update/' + consignmentCode,
        {
          consignmentStatus: consignmentStatus,
          noticeContent: noticeContent,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeModal();
          // refresh list
          page = 1;
          getAllRequestConsignment(page, limit);
        } else {
          toastErr('Chỉnh sửa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log(error);
  }
}
