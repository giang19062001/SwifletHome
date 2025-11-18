let page = 1;
let limit = 10;
const pageElement = 'page-home-submit';
let statusOptions = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHomeSubmit(page, limit);
  getStatusCode();
});

// TODO: FUNC

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllHomeSubmit(page, limit);
}

function closeHomeSubmitModal() {
  // Xác định modal theo loại
  const modalSelector = '.home-submit-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal boostrap
  closeModal(modalEl);
}

// TODO: RENDER
async function showHomeSubmitModal(homeData) {
  // init modal
  const modalSelector = '.home-submit-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#seq').value = homeData.seq;
  modalBody.querySelector('.homeImage').src = currentUrl + '/uploads/images/homes/' + homeData.homeImage;
  modalEl.querySelector('.homeName').innerText = homeData.homeName;
  modalEl.querySelector('.userName').innerText = homeData.userName;
  modalEl.querySelector('.userPhone').innerText = homeData.userPhone;
  modalEl.querySelector('.numberAttend').innerText = homeData.numberAttend;
  modalEl.querySelector('.note').innerText = homeData.note ?? '';

  const selectStatus = modalEl.querySelector('#statusCode');
  selectStatus.innerHTML = '';

  statusOptions.forEach((ele) => {
    const option = document.createElement('option');
    option.value = ele.code;
    option.textContent = ele.valueCode;
    if (homeData.statusKey !== 'WAITING' && ele.keyCode == 'WAITING') {
      option.disabled = true;
    }
    if (ele.code === homeData.statusCode) {
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick = updateHomeSubmit;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function renderAllHomeSubmit(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td style="max-width: 150px;">
              <a target="_blank" href="/dashboard/home/sale/update/${ele.homeCode}">
                ${ele.homeName}
              </a>
            </td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.userPhone}</p></td>
            <td><p>${ele.numberAttend}</p></td>
            <td><b class="txt-status-${String(ele.statusKey).toLocaleLowerCase()}">${ele.statusValue}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-main-out" onclick="getDetailHomeSubmit('${ele.seq}')">Chỉnh sửa</button>
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
async function getAllHomeSubmit(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);

  await axios
    .post(
      currentUrl + '/api/admin/homeSubmit/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllHomeSubmit(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getStatusCode() {
  await axios
    .post(
      currentUrl + '/api/app/code/getAll',
      {
        mainCode: 'SUBMIT',
        subCode: 'STATUS',
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data.data) {
        statusOptions = response.data.data;
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getDetailHomeSubmit(seq) {
  await loaderApiCall(
    axios
      .get(currentUrl + '/api/admin/homeSubmit/getDetail/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          showHomeSubmitModal(response.data);
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
}

async function updateHomeSubmit() {
  try {
    const modalBody = document.querySelector('.home-submit-update-modal .modal-body form');
    const seq = modalBody.querySelector('#seq').value;
    const statusCode = modalBody.querySelector('#statusCode').value;
    console.log(seq, statusCode);

    await axios
      .put(
        currentUrl + '/api/admin/homeSubmit/update/' + seq,
        {
          statusCode: statusCode,
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeHomeSubmitModal();
          // refresh list
          page = 1;
          getAllHomeSubmit(page, limit);
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
