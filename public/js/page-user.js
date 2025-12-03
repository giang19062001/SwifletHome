let page = 1;
let limit = 10;
const pageElement = 'page-user';
let packages = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllPackage(0, 0);
  getAllUser(page, limit);
});

// TODO: FUNC

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllUser(page, limit);
}

function closeModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'update' && '.user-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal boostrap
  closeCommonModal(modalEl);
}

// TODO: RENDER
async function openModal(type = 'update', userInfo) {
  const modalSelector = type === 'update' && '.user-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');
  const submitBtn = modalEl.querySelector('.modal-footer button');

  if (type == 'update') {
    // render form cập nhập gói
    const packageOptions = [
      `
    <option value="" ${!userInfo.packageCode ? 'selected' : ''}>
      Gói dùng thử
    </option>
  `,
      ...packages.map(
        (pak) => `
      <option value="${pak.packageCode}" 
        ${userInfo.packageCode === pak.packageCode ? 'selected' : ''}>
        ${pak.packageName} (${pak.packageDescription})
      </option>
    `,
      ),
    ].join('');

    // Fill form
    modalBody.querySelector('#userCode').value = userInfo.userCode || '';
    modalBody.querySelector('#userName').value = userInfo.userName || '';
    modalBody.querySelector('#userPhone').value = userInfo.userPhone || '';
    modalBody.querySelector('#packageCode').innerHTML = packageOptions;
  }

  // MỞ MODAL
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal(type);
  });
  modal.show();
  // Gắn sự kiện submit
  submitBtn.onclick = () => {
    if (type === 'update') {
      updatePackage(submitBtn, userInfo);
    }
  };
}
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
            <td><p>${ele.startDate ? formatDateTime(ele.startDate) : ''}</p></td>
            <td><p>${ele.endDate ? formatDateTime(ele.endDate) : ''}</p></td>
            <td>
              <p class="txt-not-ok">${ele.packageRemainDay ?  ele.packageRemainDay + ' ngày' : ""}</p>
            </td>
            <td><p>${ele.createdAt ? formatDateTime(ele.createdAt) : ''}</p></td>
           <td>
                <button class="btn-edit" onclick="getDetailUser('${ele.userCode}', 'update')">Cập nhập gói</button> 
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

async function getAllPackage(currentPage, limit) {
  await axios
    .post(
      CURRENT_URL + '/api/admin/package/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        packages = response.data.list ?? [];
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getHomesOfUser(userCode) {
  return await axios
    .post(
      CURRENT_URL + '/api/admin/user/getHomes',
      {
        page: 0,
        limit: 0,
        userCode,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        return response.data.list ?? [];
      }
    })
    .catch(function (error) {
      console.log('error', error);
      return [];
    });
}

async function getAllUser(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 8);

  await axios
    .post(
      CURRENT_URL + '/api/admin/user/getAllUser',
      {
        page: currentPage,
        limit: limit,
        type: 'APP',
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

async function getDetailUser(userCode, type) {
  const res = await loaderApiCall(
    // lấy thông tin user
    axios
      .post(CURRENT_URL + '/api/admin/user/getDetailUser/' + userCode, { type: 'APP' }, axiosAuth())
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
  if (res && type === 'update') {
    openModal(type, res.data);
  }
}

async function updatePackage(btn, userInfo) {
  const modalBody = document.querySelector('.user-update-modal .modal-body form');

  try {
    const packageCode = modalBody.querySelector('#packageCode').value;
    // gói cao cấp hiện tại còn hạn -> ko thể hạ xuống gói miễn phí
    if (!packageCode && userInfo.packageCode && userInfo.packageRemainDay > 0) {
      toastErr('Gói nâng cấp hiện tại đang còn hạn sử dụng, không thể hạ xuống gói miễn phí');
      return;
    }
    const userCode = modalBody.querySelector('#userCode').value;

    // disable nút summit
    btn.disabled = true;

    await axios
      .put(
        CURRENT_URL + '/api/admin/user/updatePackage/' + userCode,
        {
          packageCode: packageCode,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeModal('update');
          // refresh list
          page = 1;
          getAllUser(page, limit);
        } else {
          toastErr('Chỉnh sửa thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  } catch (err) {
    console.log(err);
  } finally {
    // bật lại nút
    btn.disabled = false;
  }
}
