let page = 1;
let limit = 10;
let pageElement = 'page-ads';

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.btn-add').addEventListener('click', () => {
    openModal('create', {});
  });

  loadAdsData(page, limit);

  const bannerUrlInput = document.getElementById('bannerUrlInput');
  if (bannerUrlInput) {
    bannerUrlInput.addEventListener('change', handleFileUpload);
  }
});

// TODO: FUNC
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  loadAdsData(page, limit);
}

function closeModal() {
  const modalEl = document.querySelector('.ads-modal');
  if (!modalEl) return;
  closeCommonModal(modalEl);
}

async function loadAdsData(currentPage, currentLimit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  showSkeleton(objElement, currentLimit, 10);

  const data = await apiGetAllAds(currentPage, currentLimit);
  if (data) {
    renderAllAds(data, objElement);
  } else {
    hideSkeleton(objElement);
    renderEmptyRowTable(objElement, 10);
  }
}

async function handleDetailAds(seq) {
  const data = await apiGetDetailAds(seq);
  if (data) {
    openModal('update', data);
  }
}

async function handleDeleteAds(seq) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa banner quảng cáo này không?`);
  if (!confirmed) return;

  const success = await apiDeleteAds(seq);
  if (success) {
    toastOk('Xóa thành công');
    page = 1;
    loadAdsData(page, limit);
  } else {
    toastErr('Xóa thất bại');
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      toastErr('Chỉ cho phép định dạng ảnh .png, .jpg, .jpeg');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('adsBanner', file);
    formData.append('uuid', document.getElementById('uuid').value);

    const url = await apiUploadAdsBanner(formData);
    if (url) {
      document.getElementById('bannerUrl').value = url;
      const preview = document.getElementById('bannerPreview');
      preview.src = '/' + url;
      preview.style.display = 'block';
      document.querySelector('.err-bannerUrl').style.display = 'none';
    } else {
      toastErr('Upload ảnh thất bại!');
    }
  }
}

async function handleSaveAds(type, btn) {
  const modalBody = document.querySelector('.ads-modal .modal-body form');

  const seq = modalBody.querySelector('#seq').value;
  const uuid = modalBody.querySelector('#uuid').value;
  const title = modalBody.querySelector('#title').value.trim();
  const bannerUrl = modalBody.querySelector('#bannerUrl').value.trim();
  const targetScreen = modalBody.querySelector('#targetScreen').value.trim();
  const position = modalBody.querySelector('#position').value.trim();
  const displayOrder = parseInt(modalBody.querySelector('#displayOrder').value) || 0;
  const startTime = modalBody.querySelector('#startTime').value;
  const endTime = modalBody.querySelector('#endTime').value;
  const actionType = modalBody.querySelector('#actionType').value;
  const actionValue = modalBody.querySelector('#actionValue').value.trim();

  let isValid = true;

  if (!title) {
    modalBody.querySelector('.err-title').style.display = 'block';
    isValid = false;
  } else {
    modalBody.querySelector('.err-title').style.display = 'none';
  }

  if (!bannerUrl) {
    modalBody.querySelector('.err-bannerUrl').style.display = 'block';
    isValid = false;
  } else {
    modalBody.querySelector('.err-bannerUrl').style.display = 'none';
  }

  if (!targetScreen) {
    modalBody.querySelector('.err-targetScreen').style.display = 'block';
    isValid = false;
  } else {
    modalBody.querySelector('.err-targetScreen').style.display = 'none';
  }

  if (displayOrder < 0) {
    modalBody.querySelector('.err-displayOrder').style.display = 'block';
    isValid = false;
  } else {
    modalBody.querySelector('.err-displayOrder').style.display = 'none';
  }

  if (!startTime) { modalBody.querySelector('.err-startTime').style.display = 'block'; isValid = false; }
  else { modalBody.querySelector('.err-startTime').style.display = 'none'; }
  
  if (!endTime) { 
    modalBody.querySelector('.err-endTime').innerText = 'Vui lòng chọn thời gian kết thúc.';
    modalBody.querySelector('.err-endTime').style.display = 'block'; 
    isValid = false; 
  } else { 
    if (startTime && new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      modalBody.querySelector('.err-endTime').innerText = 'Thời gian kết thúc phải sau thời gian bắt đầu.';
      modalBody.querySelector('.err-endTime').style.display = 'block';
      isValid = false;
    } else {
      modalBody.querySelector('.err-endTime').style.display = 'none'; 
    }
  }

  if (!actionValue) {
    modalBody.querySelector('.err-actionValue').style.display = 'block';
    isValid = false;
  } else {
    modalBody.querySelector('.err-actionValue').style.display = 'none';
  }

  if (!isValid) return;

  btn.disabled = true;

  const payload = {
    uuid,
    title,
    targetScreen,
    position,
    displayOrder,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    actionType,
    actionValue,
  };

  const success = await apiSaveAds(type, seq, payload);
  if (success) {
    toastOk(type === 'create' ? 'Thêm thành công' : 'Chỉnh sửa thành công');
    closeModal();
    page = 1;
    loadAdsData(page, limit);
  }
  btn.disabled = false;
}

// TODO: RENDER
function renderAllAds(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const bannerImg = ele.bannerUrl ? `<img src="/${ele.bannerUrl}" class="banner-list-img">` : '';
      const timeStr = `Từ: ${moment(ele.startTime).format('DD/MM/YYYY HH:mm')}<br>Đến: ${moment(ele.endTime).format('DD/MM/YYYY HH:mm')}`;

      const actionTypeName = VARIABLE_ENUM.ADS_ACTION_TYPE[ele.actionType] || ele.actionType;
      const actionStr = `${actionTypeName}: ${ele.actionValue}`;

      const screenName = VARIABLE_ENUM.ADS_TARGET_SCREEN[ele.targetScreen] || ele.targetScreen;

      const rowHtml = `
         <tr class="text-center align-middle">
            <td><p>${(page - 1) * limit + i++}</p></td>
            <td>${bannerImg}</td>
            <td><p>${ele.title || ''}</p></td>
            <td><p>${screenName}</p></td>
            <td class="d-none"><p>${ele.position || ''}</p></td>
            <td class="d-none"><p>${ele.displayOrder || 0}</p></td>
            <td><p style="font-size: 13px;">${timeStr}</p></td>
            <td><p style="font-size: 13px;">${actionStr}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm') : ''}</p></td>
            <td>
                <button class="btn-edit" onclick="handleDetailAds(${ele.seq})">Chỉnh sửa</button>
                <button class="btn-error" onclick="handleDeleteAds(${ele.seq})">Xóa</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    renderEmptyRowTable(objElement, 10);
  }
  hideSkeleton(objElement);
}

function openModal(type, data) {
  const modalEl = document.querySelector('.ads-modal');
  const modalBody = modalEl.querySelector('.modal-body');
  const submitBtn = modalEl.querySelector('.modal-footer button');

  // clear errors
  modalBody.querySelectorAll('.text-danger[class^="err-"]').forEach((el) => (el.style.display = 'none'));

  // render dropdowns from VARIABLE_ENUM
  const targetScreenSelect = modalBody.querySelector('#targetScreen');
  targetScreenSelect.innerHTML = '<option value="">Chọn màn hình đích</option>';
  for (const [key, value] of Object.entries(VARIABLE_ENUM.ADS_TARGET_SCREEN)) {
    targetScreenSelect.innerHTML += `<option value="${key}">${value}</option>`;
  }

  const actionTypeSelect = modalBody.querySelector('#actionType');
  actionTypeSelect.innerHTML = '';
  for (const [key, value] of Object.entries(VARIABLE_ENUM.ADS_ACTION_TYPE)) {
    actionTypeSelect.innerHTML += `<option value="${key}">${value}</option>`;
  }

  modalBody.querySelector('#seq').value = data.seq || '';
  modalBody.querySelector('#uuid').value = data.uniqueId || generateUUID();
  modalBody.querySelector('#title').value = data.title || '';
  modalBody.querySelector('#bannerUrl').value = data.bannerUrl || '';
  modalBody.querySelector('#targetScreen').value = data.targetScreen || '';
  modalBody.querySelector('#position').value = data.position || '';
  modalBody.querySelector('#displayOrder').value = data.displayOrder || 0;
  modalBody.querySelector('#actionType').value = data.actionType || 'LINK';
  modalBody.querySelector('#actionValue').value = data.actionValue || '';

  if (data.startTime) {
    modalBody.querySelector('#startTime').value = moment(data.startTime).format('YYYY-MM-DDTHH:mm');
  } else {
    modalBody.querySelector('#startTime').value = '';
  }

  if (data.endTime) {
    modalBody.querySelector('#endTime').value = moment(data.endTime).format('YYYY-MM-DDTHH:mm');
  } else {
    modalBody.querySelector('#endTime').value = '';
  }

  const now = moment().format('YYYY-MM-DDTHH:mm');
  if (type === 'create') {
    modalBody.querySelector('#startTime').min = now;
    modalBody.querySelector('#endTime').min = now;
  } else {
    modalBody.querySelector('#startTime').min = data.startTime && moment(data.startTime).isBefore(moment()) ? moment(data.startTime).format('YYYY-MM-DDTHH:mm') : now;
    modalBody.querySelector('#endTime').min = data.endTime && moment(data.endTime).isBefore(moment()) ? moment(data.endTime).format('YYYY-MM-DDTHH:mm') : now;
  }

  const preview = modalBody.querySelector('#bannerPreview');
  const inputImage = modalBody.querySelector('#bannerUrlInput');
  inputImage.value = '';
  if (data.bannerUrl) {
    preview.src = '/' + data.bannerUrl;
    preview.style.display = 'block';
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }

  modalBody.querySelector('#title')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-title').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#targetScreen')?.addEventListener('change', (e) => {
    modalBody.querySelector('.err-targetScreen').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#displayOrder')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-displayOrder').style.display = parseInt(e.target.value) < 0 ? 'block' : 'none';
  });
  modalBody.querySelector('#startTime')?.addEventListener('change', (e) => {
    const val = String(e.target.value).trim();
    modalBody.querySelector('.err-startTime').style.display = val === '' ? 'block' : 'none';
    if (val) {
      modalBody.querySelector('#endTime').min = val;
    }
  });
  modalBody.querySelector('#endTime')?.addEventListener('change', (e) => {
    modalBody.querySelector('.err-endTime').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#actionValue')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-actionValue').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });

  submitBtn.innerHTML = type === 'create' ? 'Thêm mới' : 'Cập nhật';
  submitBtn.onclick = () => handleSaveAds(type, submitBtn);

  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal();
  });
  modal.show();
}

// TODO: API
async function apiGetAllAds(currentPage, currentLimit) {
  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/ads/getAll', { page: currentPage, limit: currentLimit }, axiosAuth());
    if (response.status === 200 && response.data) {
      return response.data;
    }
  } catch (err) {
    console.error('err', err);
  }
  return null;
}

async function apiGetDetailAds(seq) {
  try {
    const response = await axios.get(CURRENT_URL + '/api/admin/ads/getDetail/' + seq, axiosAuth());
    if (response.status === 200 && response.data) {
      return response.data;
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function apiDeleteAds(seq) {
  try {
    const response = await axios.delete(CURRENT_URL + `/api/admin/ads/delete/${seq}`, axiosAuth());
    if (response.status === 200 && response.data) {
      return true;
    }
  } catch (err) {
    console.error('err', err);
  }
  return false;
}

async function apiUploadAdsBanner(formData) {
  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/ads/uploadAdsBanner', formData, {
      ...axiosAuth(),
      headers: { 'Content-Type': 'multipart/form-data', ...axiosAuth().headers },
    });
    if (response.data && response.data.url) {
      return response.data.url;
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function apiSaveAds(type, seq, payload) {
  try {
    let response;
    if (type === 'create') {
      response = await axios.post(CURRENT_URL + '/api/admin/ads/create', payload, axiosAuth());
    } else {
      response = await axios.put(CURRENT_URL + '/api/admin/ads/update/' + seq, payload, axiosAuth());
    }
    if (response.status === 200 && response.data) {
      return true;
    }
  } catch (err) {
    console.error(err);
    const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
    toastErr(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
  }
  return false;
}
