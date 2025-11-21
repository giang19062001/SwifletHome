let page = 1;
let limit = 10;
let pageElement = 'page-doctor';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllDoctor(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllDoctor(page, limit);
}

function closeDoctorModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'create' ? '.doctor-create-modal' : '.doctor-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // xóa lỗi input
  const modalBody = modalEl.querySelector('.modal-body');
  modalBody.querySelector('.err-noteAnswered').style.display = 'none';

  // đóng modal boostrap
  closeModal(modalEl);
}
// TODO: RENDER
async function showDoctorModal(doctorData) {
  // init modal
  const modalSelector = '.doctor-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  modalEl.querySelector('#seq').value = doctorData.seq;
  modalEl.querySelector('#userName').innerText = doctorData.userName;
  modalEl.querySelector('#userPhone').innerText = doctorData.userPhone;
  modalEl.querySelector('#note').innerText = doctorData.note ?? '';

  // theo dõi noteAnswered
  modalBody.querySelector('#noteAnswered').innerText = doctorData.noteAnswered;
  modalBody.querySelector('#noteAnswered')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-noteAnswered').style.display = String(e.target.value).trim() == '' ? 'block' : 'none';
  });

  // render danh sách img,video
  if (doctorData.doctorFiles?.length) {
    const imageContainer = modalBody.querySelector('#doctorFiles-images');
    const videoContainer = modalBody.querySelector('#doctorFiles-videos');

    // Lọc và render ảnh
    const imageHTML = doctorData.doctorFiles
      .filter((file) => file.mimetype.startsWith('image/'))
      .map((file) => {
        const fileUrl = `/uploads/images/doctors/${file.filename}`;
        return `
        <div class="file-item">
          <img src="${fileUrl}" alt="${file.filename}">
        </div>
      `;
      })
      .join('');

    // Lọc và render video
    const videoHTML = doctorData.doctorFiles
      .filter((file) => file.mimetype.startsWith('video/'))
      .map((file) => {
        const fileUrl = `/uploads/videos/doctors/${file.filename}`;
        return `
        <div class="file-item">
          <video controls>
            <source src="${fileUrl}" type="${file.mimetype}">
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      `;
      })
      .join('');

    imageContainer.innerHTML = imageHTML || '<p>Không có hình ảnh.</p>';
    videoContainer.innerHTML = videoHTML || '<p>Không có video.</p>';
  }

  // render danh sách status
  const selectStatus = modalEl.querySelector('#status');
  selectStatus.innerHTML = '';

  OPTIONS.DOCTOR_STATUS.forEach((ele) => {
    const option = document.createElement('option');
    option.value = ele.value;
    option.textContent = ele.text;
    // nếu đã là duyệt và hủy -> disable 'chờ'
    if (doctorData.statusKey !== 'WAITING' && ele.value == 'WAITING') {
      option.disabled = true;
    }
    // nếu match  -> tự selected
    if (ele.value === doctorData.status) {
      option.selected = true;
    }

    selectStatus.appendChild(option);
  });

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick = updateDoctor;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeDoctorModal()
  });
  modal.show();
}
function renderAllDoctor(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.userName}</p></td>
            <td><p>${ele.userPhone}</p></td>
            <td><p>${ele.note}</p></td>
            <td><b class="txt-status-${String(ele.status).toLocaleLowerCase()}">${OPTIONS.DOCTOR_STATUS.find((fi) => fi.value == ele.status)?.text ?? ''}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td>
                <button class="btn-main-out"  onclick="getDetailDoctor('${ele.seq}')">Chỉnh sửa</button>
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
    renderEmptyRowTable(objElement, 6);
  }

  // xóa skeleton
  hideSkeleton(objElement);
}
// TODO: API

async function getAllDoctor(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 6);
  await axios
    .post(
      CURRENT_URL + '/api/admin/doctor/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      if (response.status === 200 && response.data) {
        renderAllDoctor(response.data, objElement);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}

async function getDetailDoctor(seq) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/doctor/getDetail/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          showDoctorModal(response.data);
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
}

async function updateDoctor() {
  try {
    const modalBody = document.querySelector('.doctor-update-modal .modal-body form');
    const seq = modalBody.querySelector('#seq').value;
    const status = modalBody.querySelector('#status').value;
    const noteAnswered = modalBody.querySelector('#noteAnswered').value;
    if (String(noteAnswered).trim() == '') {
      modalBody.querySelector('.err-noteAnswered').style.display = 'block';
      return;
    }
    await axios
      .put(
        CURRENT_URL + '/api/admin/doctor/update/' + seq,
        {
          status: status,
          noteAnswered: noteAnswered,
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeDoctorModal();
          // refresh list
          page = 1;
          getAllDoctor(page, limit);
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
