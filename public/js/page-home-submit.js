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
  modalEl.querySelector('.modal-footer button').onclick = updateStatusHomeSubmit;

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
            <td><a target="_blank" href="/dashboard/home/update/${ele.homeCode}">${ele.homeName}</a></td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.userPhone}</p></td>
            <td><p>${ele.numberAttend}</p></td>
            <td><p class="txt-status-${String(ele.statusKey).toLocaleLowerCase()}">${ele.status}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-common-out" onclick="getDetailHomeSubmit('${ele.seq}')">Cập nhập</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // render paging
    let pagerHTML = createPagerHTML(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    //clear
    objElement.innerHTML = ``;
    document.getElementById('privacy-main-pager').innerHTML = ``;
  }
}
// TODO: API

async function getAllHomeSubmit(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
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
  await axios
    .get(currentUrl + '/api/admin/homeSubmit/getDetail/' + seq, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        showHomeSubmitModal(response.data);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}

async function updateStatusHomeSubmit() {
  try {
    const modalBody = document.querySelector('.home-submit-update-modal .modal-body form');
    const seq = modalBody.querySelector('#seq').value;
    const statusCode = modalBody.querySelector('#statusCode').value;
    console.log(seq, statusCode);

    await axios
      .put(
        currentUrl + '/api/admin/homeSubmit/updateStatus/' + seq,
        {
          statusCode: statusCode,
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Cập nhập thành công');
          reloadPage();
        } else {
          toastErr('Cập nhập thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log(error);
  }
}
