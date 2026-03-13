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
function renderDeliveringAddressList(isEditable = false) {
  const listEl = document.getElementById('deliveringAddressList');
  if (!listEl) return;
  listEl.innerHTML = '';
  currentDeliveringAddressList.forEach((address, index) => {
    const item = document.createElement('div');
    item.className = 'd-flex justify-content-between align-items-center mb-1 p-2 border rounded bg-light';
    item.innerHTML = `
            <span class="text-dark">${address}</span>
            ${isEditable ? `
            <button type="button" class="btn btn-sm btn-link text-danger p-0 m-0" onclick="removeDeliveringAddress(${index})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>` : ''}
        `;
    listEl.appendChild(item);
  });
}

// ẩn/hiện vùng nhập địa chỉ tracking
function toggleDeliveringSection(status) {
  const deliveringAddressSection = document.querySelector('#deliveringAddressSection');
  const deliveringAddressInputGroup = document.querySelector('#deliveringAddressInputGroup');

  const hasData = currentDeliveringAddressList.length > 0;
  const isNotWaitingOrConfirmed = status !== 'WAITING' && status !== 'CONFIRMED';
  
  if (status === 'DELIVERING' || (hasData && isNotWaitingOrConfirmed)) {
    deliveringAddressSection.classList.remove('d-none');
  } else {
    deliveringAddressSection.classList.add('d-none');
  }

  // Chỉ DELIVERING mới hiện input thêm mới
  if (status === 'DELIVERING') {
    deliveringAddressInputGroup.classList.remove('d-none');
  } else {
    deliveringAddressInputGroup.classList.add('d-none');
  }

  // Ẩn noticeContent và nút cập nhật nếu là DELIVERED hoặc RETURN
  const noticeSection = document.querySelector('#noticeContent').closest('.row');
  const footerBtn = document.querySelector('.consignment-update-modal .modal-footer button');
  if (status === 'DELIVERED' || status === 'RETURN') {
    noticeSection.classList.add('d-none');
    footerBtn.classList.add('d-none');
  } else {
    noticeSection.classList.remove('d-none');
    footerBtn.classList.remove('d-none');
  }
}
// xóa input tracking địa chỉ
function removeDeliveringAddress(index) {
  currentDeliveringAddressList.splice(index, 1);
  const status = document.querySelector('#consignmentStatus').value;
  renderDeliveringAddressList(status === 'DELIVERING');
}

// thêm input tracking địa chỉ
function addDeliveringAddress() {
  const input = document.getElementById('newDeliveringAddress');
  const address = input.value.trim();
  if (address) {
    currentDeliveringAddressList.push(address);
    input.value = '';
    const status = document.querySelector('#consignmentStatus').value;
    renderDeliveringAddressList(status === 'DELIVERING');
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
  modalEl.querySelector('#userCode').value = consignmentData.userCode;
  modalEl.querySelector('#senderName').innerText = consignmentData.senderName;
  modalEl.querySelector('#senderPhone').innerText = consignmentData.senderPhone;
  modalEl.querySelector('#deliveryAddress').innerText = consignmentData.deliveryAddress;
  modalEl.querySelector('#nestTypeLabel').innerText = consignmentData.nestTypeLabel;
  modalEl.querySelector('#nestQuantity').innerText = consignmentData.nestQuantity + " (g)";

  // render danh sách status
  const selectStatus = modalEl.querySelector('#consignmentStatus');
  selectStatus.innerHTML = '';

  Object.entries(VARIABLE_ENUM.CONSIGNMENT_STATUS).forEach(([key, text]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = text;

    // chờ 'chỉ có thể thành' xác nhận
    if (consignmentData.consignmentStatus == 'WAITING' && key != 'CONFIRMED') {
      option.disabled = true;
    }
    //  xác nhận 'chỉ có thể thành' đang giao
    if (consignmentData.consignmentStatus == 'CONFIRMED' && key != 'DELIVERING') {
      option.disabled = true;
    }
    // đang giao 'chỉ có thể thành' đã giao/giao thất bại
    if (consignmentData.consignmentStatus == 'DELIVERING' && key != 'CANCEL' && key != 'DELIVERED') {
      option.disabled = true;
    }
    // giao thất bại 'chỉ có thể thành' đã hoàn trả
    if (consignmentData.consignmentStatus == 'CANCEL' && key != 'RETURN') {
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

    // nếu match  -> tự  selected, tự bỏ disabled chính nó
    if (key === consignmentData.consignmentStatus) {
      option.disabled = false;
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // Xử lý danh sách địa chỉ giao hàng
  currentDeliveringAddressList = consignmentData.deliveringAddressList || [];

  toggleDeliveringSection(consignmentData.consignmentStatus);
  renderDeliveringAddressList(consignmentData.consignmentStatus === 'DELIVERING');

  // Event listener cho việc thay đổi status
  selectStatus.onchange = (e) => {
    const newStatus = e.target.value;
    toggleDeliveringSection(newStatus);
    renderDeliveringAddressList(newStatus === 'DELIVERING');
  };

  // Event listener cho nút thêm tracking địa chỉ
  modalEl.querySelector('#btnAddDeliveringAddress').onclick = addDeliveringAddress;
  // Enter để thêm nhanh
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
  modalEl.querySelector('.modal-footer button').onclick = updateConsignment

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
            <td><p>${ele.nestTypeLabel}</p></td>
            <td><p>${ele.nestQuantity}(g)</p></td>
            <td><b class="txt-status-${String(ele.consignmentStatus).toLocaleLowerCase()}">${VARIABLE_ENUM.CONSIGNMENT_STATUS[ele.consignmentStatus] ?? ''}</b></td>
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
    const userCode = modalBody.querySelector('#userCode').value;
    const noticeContent = modalBody.querySelector('#noticeContent').value;
    const consignmentStatus = modalBody.querySelector('#consignmentStatus').value;

    if (String(noticeContent).trim() == '') {
      modalBody.querySelector('.err-noticeContent').style.display = 'block';
      return;
    }
    if (consignmentStatus === 'DELIVERING' && !currentDeliveringAddressList.length) {
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
