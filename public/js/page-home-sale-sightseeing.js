let page = 1;
let limit = 10;
const pageElement = 'page-home-sale-sightseeing';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHomeSightseeing(page, limit);
});

// TODO: FUNC

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllHomeSightseeing(page, limit);
}

function closeHomeSightseeingModal() {
  // Xác định modal theo loại
  const modalSelector = '.home-sightseeing-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal boostrap
  closeModal(modalEl);
}

// TODO: RENDER
async function showHomeSightseeingModal(homeData) {
  // init modal
  const modalSelector = '.home-sightseeing-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#seq').value = homeData.seq;
  modalBody.querySelector('.homeImage').src = CURRENT_URL + '/uploads/images/homes/' + homeData.homeImage;
  modalEl.querySelector('.homeName').innerText = homeData.homeName;
  modalEl.querySelector('.userName').innerText = homeData.userName;
  modalEl.querySelector('.userPhone').innerText = homeData.userPhone;
  modalEl.querySelector('.numberAttend').innerText = homeData.numberAttend;
  modalEl.querySelector('.note').innerText = homeData.note ?? '';

  const selectStatus = modalEl.querySelector('#status');
  selectStatus.innerHTML = '';

  OPTIONS.HOME_SUMIT.forEach((ele) => {
    const option = document.createElement('option');
    option.value = ele.value;
    option.textContent = ele.text;
    // nếu đã là duyệt và hủy -> disable 'chờ'
    if (homeData.status !== 'WAITING' && ele.value == 'WAITING') {
      option.disabled = true;
    }
    // nếu match  -> tự selected
    if (ele.value === homeData.status) {
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick = updateHomeSightseeing;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeHomeSightseeingModal();
  });
  modal.show();
}

function renderAllHomeSightseeing(data, objElement) {
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
            <td><b class="txt-status-${String(ele.status).toLocaleLowerCase()}">${OPTIONS.HOME_SUMIT.find((fi) => fi.value == ele.status)?.text ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-edit" onclick="getDetailHomeSightseeing('${ele.seq}')">Chỉnh sửa</button>
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
async function getAllHomeSightseeing(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);

  await axios
    .post(
      CURRENT_URL + '/api/admin/homeSale/getAllSightseeing',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllHomeSightseeing(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailHomeSightseeing(seq) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/homeSale/getDetailSightseeing/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          showHomeSightseeingModal(response.data);
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
}

async function updateHomeSightseeing() {
  try {
    const modalBody = document.querySelector('.home-sightseeing-update-modal .modal-body form');
    const seq = modalBody.querySelector('#seq').value;
    const status = modalBody.querySelector('#status').value;
    console.log(seq, status);

    await axios
      .put(
        CURRENT_URL + '/api/admin/homeSale/updateSightseeing/' + seq,
        {
          status: status,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeHomeSightseeingModal();
          // refresh list
          page = 1;
          getAllHomeSightseeing(page, limit);
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
