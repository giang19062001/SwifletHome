let page = 1;
let limit = 10;
let pageElement = 'page-consignment';
let categories = [];
let objects = [];
let currentDeliveringAddressList = [];

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
function renderDeliveringAddressList() {
  const listEl = document.getElementById('deliveringAddressList');
  if (!listEl) return;
  listEl.innerHTML = '';
  currentDeliveringAddressList.forEach((item, index) => {
    const addressText = typeof item === 'string' ? item : item.address;
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-1 p-2 border rounded bg-light';
    div.innerHTML = `
      <span class="text-dark">${addressText}</span> `;
    listEl.appendChild(div);
  });
}

// ẩn/hiện vùng nhập địa chỉ tracking
function toggleDeliveringSection(status) {
  const deliveringAddressSection = document.querySelector('#deliveringAddressSection');
  const deliveringAddressInputGroup = document.querySelector('#deliveringAddressInputGroup');

  const hasData = currentDeliveringAddressList.length > 0;
  const isNotWaitingOrConfirmed = status !== VARIABLE_ENUM.CONSIGNMENT_STATUS.WAITING.VALUE && status !== VARIABLE_ENUM.CONSIGNMENT_STATUS.CONFIRMED.VALUE;

  if (status === VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE || (hasData && isNotWaitingOrConfirmed)) {
    deliveringAddressSection.classList.remove('d-none');
  } else {
    deliveringAddressSection.classList.add('d-none');
  }

  // Chỉ DELIVERING mới hiện input thêm mới
  if (status === VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE) {
    deliveringAddressInputGroup.classList.remove('d-none');
  } else {
    deliveringAddressInputGroup.classList.add('d-none');
  }
}

// thêm input tracking địa chỉ
function addDeliveringAddress() {
  const input = document.getElementById('newDeliveringAddress');
  const address = input.value.trim();
  if (address) {
    currentDeliveringAddressList.push({ address: address });
    input.value = '';
    renderDeliveringAddressList();
  }
}
function closeModal() {
  const modalSelector = '.consignment-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // xóa lỗi input
  const modalBody = modalEl.querySelector('.modal-body');
  modalBody.querySelector('.err-noticeContent').style.display = 'none';

  // reset form và dữ liệu tạm
  currentDeliveringAddressList = [];
  modalEl.querySelector('#noticeContent').value = '';
  const newAddressInput = modalEl.querySelector('#newDeliveringAddress');
  if (newAddressInput) newAddressInput.value = '';
  const listEl = modalEl.querySelector('#deliveringAddressList');
  if (listEl) listEl.innerHTML = '';

  // đóng modal boostrap
  closeCommonModal(modalEl);
}

async function openModal(consignmentData) {
  const modalSelector = '.consignment-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#consignmentCode').value = consignmentData.consignmentCode;
  modalEl.querySelector('#consignmentStatusDb').value = consignmentData.consignmentStatus;
  modalEl.querySelector('#userCode').value = consignmentData.userCode;
  modalEl.querySelector('#senderName').innerText = consignmentData.senderName;
  modalEl.querySelector('#senderPhone').innerText = consignmentData.senderPhone;
  modalEl.querySelector('#deliveryAddress').innerText = consignmentData.deliveryAddress;
  modalEl.querySelector('#nestTypeLabel').innerText = consignmentData.nestTypeLabel;
  modalEl.querySelector('#nestQuantity').innerText = consignmentData.nestQuantity + ' (g)';

  // render danh sách status
  const selectStatus = modalEl.querySelector('#consignmentStatus');
  selectStatus.innerHTML = '';

  Object.entries(VARIABLE_ENUM.CONSIGNMENT_STATUS).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = value.VALUE;
    option.textContent = value.TEXT;

    // chờ 'chỉ có thể thành' xác nhận
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.WAITING.VALUE && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.CONFIRMED.VALUE) {
      option.disabled = true;
    }
    //  xác nhận 'chỉ có thể thành' đang giao
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.CONFIRMED.VALUE && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE) {
      option.disabled = true;
    }
    // đang giao 'chỉ có thể thành' đã giao/giao thất bại
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE 
      && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.CANCEL.VALUE 
      && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERED.VALUE) {
      option.disabled = true;
    }
    // giao thất bại 'chỉ có thể thành' đã hoàn trả
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.CANCEL.VALUE && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.RETURN.VALUE) {
      option.disabled = true;
    }
    // giao thành công 'không thể cập nhập nữa'
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERED.VALUE && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERED.VALUE) {
      option.disabled = true;
    }

    // đã hoàn trả 'không thể cập nhập nữa'
    if (consignmentData.consignmentStatus == VARIABLE_ENUM.CONSIGNMENT_STATUS.RETURN.VALUE && key != VARIABLE_ENUM.CONSIGNMENT_STATUS.RETURN.VALUE) {
      option.disabled = true;
    }

    // nếu match  -> tự  selected, tự bỏ disabled chính nó
    if (key === consignmentData.consignmentStatus) {
      option.disabled = false;
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // ẩn noticeContent và nút cập nhật 
  const noticeSection = document.querySelector('#noticeContent').closest('.row');
  const footerBtn = document.querySelector('.consignment-update-modal .modal-footer button');
  if (consignmentData.consignmentStatus === VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERED.VALUE 
    || consignmentData.consignmentStatus === VARIABLE_ENUM.CONSIGNMENT_STATUS.RETURN.VALUE) {
    noticeSection.classList.add('d-none');
    footerBtn.classList.add('d-none');
  } else {
    noticeSection.classList.remove('d-none');
    footerBtn.classList.remove('d-none');
  }

  // Xử lý danh sách địa chỉ giao hàng
  currentDeliveringAddressList = consignmentData.deliveringAddressList || [];

  toggleDeliveringSection(consignmentData.consignmentStatus);

  // render các input tracking address
  renderDeliveringAddressList();

  // Event listener cho việc thay đổi status
  selectStatus.onchange = (e) => {
    const newStatus = e.target.value;
    toggleDeliveringSection(newStatus);
    renderDeliveringAddressList();
  };

  // nút thêm tracking địa chỉ
  modalEl.querySelector('#btnAddDeliveringAddress').onclick = addDeliveringAddress;
  modalEl.querySelector('#newDeliveringAddress').onkeypress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDeliveringAddress();
    }
  };

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
            <td><p>${(page - 1) * limit + i++}</p></td>
            <td><p>${ele.senderName} / ${ele.senderPhone}</p></td>
            <td><p>${ele.receiverName} / ${ele.senderPhone}</p></td>
            <td><p>${ele.deliveryAddress}</p></td>
            <td><p>${ele.nestTypeLabel}</p></td>
            <td><p>${ele.nestQuantity}(g)</p></td>
            <td><b class="txt-status-${String(ele.consignmentStatus).toLocaleLowerCase()}">${VARIABLE_ENUM.CONSIGNMENT_STATUS[ele.consignmentStatus]?.TEXT ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-info" onclick="getDetailConsignment('${ele.consignmentCode}')">Chi tiết</button>
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
    const consignmentStatusDb = modalBody.querySelector('#consignmentStatusDb').value;
    const userCode = modalBody.querySelector('#userCode').value;
    const noticeContent = modalBody.querySelector('#noticeContent').value;
    const consignmentStatus = modalBody.querySelector('#consignmentStatus').value;

    if (String(noticeContent).trim() == '') {
      modalBody.querySelector('.err-noticeContent').style.display = 'block';
      return;
    }

    if((consignmentStatusDb == consignmentStatus) && (consignmentStatus !== VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE)){
      toastWar('Không có gì thay đổi');
      closeModal();
      return;
    }
    if (consignmentStatus === VARIABLE_ENUM.CONSIGNMENT_STATUS.DELIVERING.VALUE && !currentDeliveringAddressList.length) {
      alert('Ít nhất có 1 giá trị địa chỉ nếu trạng thái đang là đang vận chuyển');
      return;
    }
    await axios
      .put(
        CURRENT_URL + '/api/admin/consignment/update/' + consignmentCode,
        {
          consignmentStatus: consignmentStatus,
          userCode: userCode,
          noticeContent: noticeContent,
          deliveringAddressList: currentDeliveringAddressList,
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
