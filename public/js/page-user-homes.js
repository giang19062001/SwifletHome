let page = 1;
let limit = 10;
let pageElement = 'page-user-homes';
let filterValueDefault = {
  userName: '',
  userPhone: '',
  provinceCode: '',
};
const TriggerHomeConstraints = {
  macId: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập Mac Id của  bộ thiết bị cảm biến.' },
  },
  wifiId: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập Id wifi.' },
  },
  wifiPassword: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập mật khẩu wifi.' },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  //refresh
  refreshPage(filterValueDefault);
});

document.getElementById('btn-filter-reset').addEventListener('click', () => {
  document.getElementById('userName').value = '';
  document.getElementById('userPhone').value = '';
  document.getElementById('provinceCode').value = '';

  //refresh
  refreshPage(filterValueDefault);
});

document.getElementById('btn-filter-apply').addEventListener('click', () => {
  const filterValue = getFilterValue();

  //refresh
  refreshPage(filterValue);
});

// TODO: FUNC
function refreshPage(filterValue) {
  //refresh
  page = 1;
  getAllUserHomes(page, limit, filterValue);
}
function getFilterValue() {
  const userName = document.getElementById('userName').value;
  const userPhone = document.getElementById('userPhone').value;
  const provinceCode = document.getElementById('provinceCode').value;

  return { userName, userPhone, provinceCode };
}
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  //refresh
  const filterValue = getFilterValue();
  getAllUserHomes(page, limit, filterValue);
}

function closeModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'trigger' ? '.user-home-trigger-modal' : type === 'detail' ? '.user-home-detail-modal' : '.user-home-reset-modal';
  const modalEl = document.querySelector(modalSelector);
  if (!modalEl) return;

  // reset value
  modalEl.querySelectorAll('input').forEach((input) => {
    input.value = '';
  });
  // xóa lỗi
  clearErrors();

  // đóng modal boostrap
  closeCommonModal(modalEl);
}

// TODO: RENDER
async function openModal(userCode, userHomeCode, type, data = null) {
  const modalSelector = type === 'trigger' ? '.user-home-trigger-modal' : type === 'detail' ? '.user-home-detail-modal' : '.user-home-reset-modal';
  const modalEl = document.querySelector(modalSelector);
  if (!modalEl) return;

  const modalForm = modalEl.querySelector('.modal-body form');
  const submitBtn = modalEl.querySelector('.modal-footer button');

  if (type == 'trigger' || type == 'reset') {
    //  kiểm tra validation của các input real-time
    modalForm.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => validateField(TriggerHomeConstraints, input));
    });

    // gán value
    modalForm.querySelector('#macId').value = `MAC-${userCode}-${userHomeCode}`;
    modalForm.querySelector('#userCode').value = userCode;
    modalForm.querySelector('#userHomeCode').value = userHomeCode;
  }

  // hiện giá trị cho modal detail
  if ((type == 'detail' || type == 'reset') && data) {
    modalForm.querySelector('#macId').value = data.macId;
    modalForm.querySelector('#wifiId').value = data.wifiId;
    modalForm.querySelector('#wifiPassword').value = data.wifiPassword;
  }

  // chỉ mở modal nếu nó chưa mở
  if (!modalEl.classList.contains('show')) {
    // MỞ MODAL
    const modal = new bootstrap.Modal(modalEl);
    modalEl.addEventListener('hidden.bs.modal', () => {
      closeModal(type);
    });
    modal.show();
  }

  // Gắn sự kiện submit
  submitBtn.onclick = () => {
    if (type == 'trigger') {
      triggerHome(modalForm);
    } else if (type == 'reset') {
      resetTriggeringHome(modalForm);
    }
  };
}

const renderAllUserHomes = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
        <tr class="text-center">
        <td class="py-3" style="min-width: 75px;"><p>${page * i++}</p></td>
        <td class="py-3"><img src="${CURRENT_URL}/${ele.userHomeImage}" alt="${ele.userHomeName}"></td>
        <td class="py-3">
            <p>${ele.userName}</p> 
            <p class="mt-2">${ele.userPhone}</p> 
        </td>
        <td class="py-3">
            <p>${ele.userHomeName} ${ele.isMain === 'Y' ? `<b>(Chính)</b>` : ''}</p>
            <p class="mt-2">${ele.userHomeAddress}, ${ele.userHomeProvince}</p>
        </td>
        <td class="py-3" style="min-width: 180px;">
            <p class="mt-2">Chiều dài: ${ele.userHomeLength} (m)</p>
            <p class="mt-2">Chiều rộng: ${ele.userHomeWidth} (m)</p>
            <p class="mt-2">Số tầng: ${ele.userHomeFloor}</p>
        </td>
        <td class="py-3"><p>${ele.isIntegateTempHum == 'Y' ? `<span class="txt-ok">Có</span>` : `<span class="txt-not-ok">Không</span>`}</p></td>
        <td class="py-3"><p>${ele.isIntegateCurrent == 'Y' ? `<span class="txt-ok">Có</span>` : `<span class="txt-not-ok">Không</span>`}</p></td>
        <td class="py-3"><p>${ele.isTriggered == 'Y' ? `<span class="txt-ok">Đã kích hoạt</span>` : `<span class="txt-not-ok">Chưa kích hoạt</span>`}</p></td>
        <td class="py-3" style="max-width: 125px;"><p>${ele.createdAt ? formatDateTime(ele.createdAt) : ''}</p></td>
        <td class="py-3" style="max-width: 125px;"><p>${ele.updatedAt ? formatDateTime(ele.updatedAt) : ''}</p></td>
        <td class="py-3">
          <div class="d-grid gap-2">
            ${
              ele.isIntegateTempHum == 'Y' || ele.isIntegateCurrent == 'Y'
                ? ele.isTriggered == 'N'
                  ? `<button class="btn-edit" onclick="openModal('${ele.userCode}', '${ele.userHomeCode}', 'trigger')">Kích hoạt</button>`
                  : `<button class="btn-info" onclick="getDetailHome('${ele.userCode}', '${ele.userHomeCode}', 'detail')">Thông tin cảm biến</button>
                    <button class="btn-edit" onclick="getDetailHome('${ele.userCode}', '${ele.userHomeCode}', 'reset')">Thiết lập lại</button>`
                : ''
            }
            </div>
        </td>
    </tr>
    `;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // phân trang
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    // dữ liệu trống
    renderEmptyRowTable(objElement, 9);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// API
async function getAllUserHomes(currentPage, limit, filterValue) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 9);

  await axios
    .post(
      CURRENT_URL + '/api/admin/userHome/getHomes',
      {
        page: currentPage,
        limit: limit,
        ...filterValue,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllUserHomes(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailHome(userCode, userHomeCode, type) {
  const data = await loaderApiCall(
    // lấy thông tin nhà
    axios
      .get(CURRENT_URL + '/api/admin/userHome/getDetailHome/' + userHomeCode, axiosAuth())
      .then(function (response) {
        if (response.status === 200 && response.data) {
          return response;
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
  // form cập nhập gói
  if ((type === 'detail' || type === 'reset') && data) {
    openModal(userCode, userHomeCode, type, data?.data);
  }
}

// kích hoạt nhà yến
async function triggerHome(modalForm) {
  const userHomeCode = modalForm.querySelector('#userHomeCode').value;

  const formData = {
    macId: modalForm.querySelector('#macId').value,
    wifiId: modalForm.querySelector('#wifiId').value,
    wifiPassword: modalForm.querySelector('#wifiPassword').value,
    userCode: modalForm.querySelector('#userCode').value,
  };

  const errors = validate(formData, TriggerHomeConstraints);
  console.log(errors);
  if (errors) {
    displayErrors(errors);
    return;
  }

  const txtConfirm = 'Bạn có chắc rằng đã thiết lập giá trị này cho thiết bị cảm biến nhà yến rồi?';
  if (window.confirm(txtConfirm)) {
    await axios
      .put(CURRENT_URL + '/api/admin/userHome/triggerHome/' + userHomeCode, formData, axiosAuth())
      .then(async function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');

          // close modal
          closeModal('trigger');

          // refresh data
          const filterValue = getFilterValue();
          refreshPage(filterValue);
        } else {
          toastErr('Chỉnh sửa thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  }
}

// reset kích hoạt nhà yến
async function resetTriggeringHome(modalForm) {
  const userHomeCode = modalForm.querySelector('#userHomeCode').value;

  const formData = {
    macId: modalForm.querySelector('#macId').value,
    wifiId: modalForm.querySelector('#wifiId').value,
    wifiPassword: modalForm.querySelector('#wifiPassword').value,
    userCode: modalForm.querySelector('#userCode').value,
  };

  const errors = validate(formData, TriggerHomeConstraints);
  console.log(errors);
  if (errors) {
    displayErrors(errors);
    return;
  }

  const txtConfirm = 'Bạn có chắc rằng đã thiết lập lại giá trị mới này cho thiết bị cảm biến nhà yến rồi?';
  if (window.confirm(txtConfirm)) {
    await axios
      .put(CURRENT_URL + '/api/admin/userHome/resetTriggeringHome/' + userHomeCode, formData, axiosAuth())
      .then(async function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');

          // close modal
          closeModal('reset');
          
          // refresh data
          const filterValue = getFilterValue();
          refreshPage(filterValue);
        } else {
          toastErr('Chỉnh sửa thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  }
}
