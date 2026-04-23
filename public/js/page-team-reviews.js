let page = 1;
let limit = 10;
const pageElement = 'page-team-reviews';
let reviewImagesCurent = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllTeamReview(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllTeamReview(page, limit);
}
function closeModal() {
  const modalSelector = '.team-review-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal
  closeCommonModal(modalEl);
}
// TODO: RENDER
async function openModal(teamData) {
  // init modal
  const modalSelector = '.team-review-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#teamName').innerText = teamData.teamName;
  modalEl.querySelector('#ownerName').innerText = teamData.ownerName;
  modalEl.querySelector('#reviewByName').innerText = teamData.reviewByName;
  modalEl.querySelector('#review').innerText = teamData.review;

  // rate star
  const elStar = modalEl.querySelector('#star');
  elStar.innerHTML = '';
  raterJs({
    element: elStar,
    readOnly: true,
    rating: teamData.star || 0,
    max: 5,
    starSize: 18,
  });
  // render danh sách img
  if (teamData.reviewImages?.length) {
    const imageContainer = modalBody.querySelector('#reviewImages-images');

    // Lọc và render ảnh
    const imageHTML = teamData.reviewImages
      .filter((file) => file.mimetype.startsWith('image/'))
      .map((file) => {
        const fileUrl = `/${file.filename}`;
        return `
        <div class="file-item">
          <img src="${fileUrl}" alt="${file.filename}">
        </div>
      `;
      })
      .join('');

    imageContainer.innerHTML = imageHTML || '<p>Không có hình ảnh.</p>';
  }

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal();
  });
  modal.show();
}
function renderAllTeamReview(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${(page - 1) * limit + i++}</p></td>
            <td><p>${ele.teamName}</p></td> 
            <td><p>${ele.ownerName}</p></td>
            <td><p>${ele.reviewByName}</p></td>
            <td><p class="col-7 star-rating" data-rating="${ele.star}"></p></td>
            <td><p>${ele.review}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td class="text-center align-middle">
              <div class="form-check form-switch d-flex justify-content-center align-items-center">
                <input class="form-check-input"
                  type="checkbox"
                  role="switch"
                  data-seq="${ele.seq}"
                  onChange="changeDisplay(this)"
                    ${ele.isDisplay === 'Y' ? 'checked' : ''}>
              </div>
            </td>
            <td>
               <button class="btn-info"  onclick="getDetailTeamReview('${ele.seq}')">Ảnh đính kèm</button> 
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // rate star
    document.querySelectorAll('.star-rating').forEach((el) => {
      raterJs({
        element: el,
        readOnly: true,
        rating: Number(el.dataset.rating || 0),
        max: 5,
        starSize: 18,
      });
    });

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

async function getAllTeamReview(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 8);

  await axios
    .post(
      CURRENT_URL + '/api/admin/team/getAllReview',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllTeamReview(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailTeamReview(seq) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/team/getDetailReview/' + seq, axiosAuth())
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

async function changeDisplay(el) {
  const seq = el.dataset.seq;
  await axios
    .put(CURRENT_URL + `/api/admin/team/changeDisplay/${seq}`, { isDisplay:  el.checked ? 'Y' : 'N' }, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        toastOk('Cập nhập đánh giá thành công');
        // refresh
        page = 1;
        getAllTeamReview(page, limit);
      }
    })
    .catch(function (error) {
      toastErr(error.message);
      console.log('error', error);
    });
}
