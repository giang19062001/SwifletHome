const isDetailMode = typeof IS_DETAIL !== 'undefined' && IS_DETAIL;
const pageType = isDetailMode ? 'detail' : (window.location.pathname.includes('/update') ? 'update' : 'create');

const saleHomeMutationConstraints = {
  hostName: { presence: { allowEmpty: false, message: '^Vui lòng nhập họ tên chủ nhà.' } },
  hostPhone: { presence: { allowEmpty: false, message: '^Vui lòng nhập SĐT chủ nhà.' } },
  hostRole: { presence: { allowEmpty: false, message: '^Vui lòng chọn vai trò.' } },
  homeName: { presence: { allowEmpty: false, message: '^Vui lòng nhập tên nhà yến.' } },
  homelocation: { presence: { allowEmpty: false, message: '^Vui lòng nhập khu vực.' } },
  homeAddress: { presence: { allowEmpty: false, message: '^Vui lòng nhập địa chỉ chi tiết.' } },
  homeAge: { presence: { allowEmpty: false, message: '^Vui lòng nhập số năm vận hành.' }, numericality: { greaterThan: 0, message: '^Năm vận hành phải lớn hơn 0' } },
  homeModel: { presence: { allowEmpty: false, message: '^Vui lòng chọn mô hình nhà yến.' } },
  latitude: { presence: { allowEmpty: false, message: '^Vui lòng nhập vĩ độ.' }, numericality: { message: '^Vĩ độ phải là số' } },
  longitude: { presence: { allowEmpty: false, message: '^Vui lòng nhập kinh độ.' }, numericality: { message: '^Kinh độ phải là số' } },
  currentNests: { presence: { allowEmpty: false, message: '^Vui lòng nhập số tổ.' }, numericality: { greaterThan: 0, message: '^Số tổ phải lớn hơn 0' } },
  averageYieldKg: { presence: { allowEmpty: false, message: '^Vui lòng nhập sản lượng.' }, numericality: { greaterThan: 0, message: '^Sản lượng phải lớn hơn 0' } },
  numberOfFloors: { presence: { allowEmpty: false, message: '^Vui lòng nhập số tầng.' }, numericality: { greaterThan: 0, message: '^Số tầng phải lớn hơn 0' } },
  numberOfRooms: { presence: { allowEmpty: false, message: '^Vui lòng nhập số phòng.' }, numericality: { greaterThan: 0, message: '^Số phòng phải lớn hơn 0' } },
  userCode: { presence: { allowEmpty: false, message: '^Vui lòng chọn người sở hữu.' } },
  shortDescription: { presence: { allowEmpty: false, message: '^Vui lòng nhập mô tả ngắn.' } },
  topicsShare: { presence: { allowEmpty: false, message: '^Vui lòng chọn ít nhất 1 chủ đề chia sẻ.' } },
  sightseeingAreas: { presence: { allowEmpty: false, message: '^Vui lòng chọn khu vực tham quan.' } },
  includedServices: { presence: { allowEmpty: false, message: '^Vui lòng chọn dịch vụ đi kèm.' } },
  serviceNotes: { presence: { allowEmpty: false, message: '^Vui lòng nhập ghi chú.' } },
  tourFee: { presence: { allowEmpty: false, message: '^Vui lòng nhập phí tham quan.' } },
  durationPerTourMinutes: { presence: { allowEmpty: false, message: '^Vui lòng nhập thời gian/lượt.' }, numericality: { greaterThan: 0, message: '^Thời gian phải lớn hơn 0' } },
  availableDays: { presence: { allowEmpty: false, message: '^Vui lòng chọn ngày mở cửa.' } },
  timeframes: { 
    presence: { allowEmpty: false, message: '^Vui lòng nhập khung giờ đón khách.' },
    format: { pattern: /^(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})(,\s*\d{2}:\d{2}\s*-\s*\d{2}:\d{2})*$/, message: '^Khung thời gian phải ở định dạng HH:mm - HH:mm, HH:mm - HH:mm' }
  },
  timeNoticeRequired: { presence: { allowEmpty: false, message: '^Vui lòng nhập thời gian báo trước.' } },
  commitments: { presence: { allowEmpty: false, message: '^Vui lòng chọn cam kết.' } }
};

let dynamicImagesFiles = {}; // { [typeCode]: File[] }

document.addEventListener('DOMContentLoaded', () => {
  if (pageType === 'update' || pageType === 'detail') {
    initializeForm();
    assignForm(homeData);
  } else if (pageType === 'create') {
    initializeForm();
    document.getElementById('userCode').disabled = false;
  }
});

/**
 * API Upload các tệp tin (ảnh/video) cho nhà yến sale
 */
async function uploadSaleHomeFilesApi(files, uniqueId, fileTypeCode) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('saleHomeFiles', file);
  }
  formData.append('uniqueId', uniqueId);
  if (fileTypeCode) formData.append('fileTypeCode', fileTypeCode);

  try {
    const res = await axios.post('/api/admin/saleHome/uploadFiles', formData, axiosAuth());
    return res.data; // Array of results
  } catch (e) {
    console.error(e);
    toastErr('Upload lỗi');
    return null;
  }
}

/**
 * API Xóa tệp tin đã upload trên server
 */
async function deleteFileApi(seq) {
  if (!seq) return;
  try {
    await axios.delete('/api/admin/saleHome/deleteFile/' + seq, axiosAuth());
  } catch (e) {
    console.error(e);
  }
}

function initializeForm() {
  const formId = pageType === 'create' ? 'home-sale-create-form' : (pageType === 'update' ? 'home-sale-update-form' : 'home-sale-detail-form');
  const form = document.getElementById(formId);

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const getRadioValue = (name) => {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
      };
      const getCheckboxValues = (name) => {
        return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
      };

      const formData = {
        hostInfo: {
          hostName: form.querySelector('#hostName').value,
          hostPhone: form.querySelector('#hostPhone').value,
          socialContact: form.querySelector('#socialContact').value,
          hostRole: getRadioValue('hostRole'),
        },
        homeInfo: {
          homeName: form.querySelector('#homeName').value,
          homelocation: form.querySelector('#homelocation').value,
          homeAddress: form.querySelector('#homeAddress').value,
          homeAge: Number(form.querySelector('#homeAge').value),
          homeModel: form.querySelector('#homeModel').value,
          latitude: form.querySelector('#latitude').value ? Number(form.querySelector('#latitude').value) : '',
          longitude: form.querySelector('#longitude').value ? Number(form.querySelector('#longitude').value) : '',
        },
        nestInfo: {
          currentNests: Number(form.querySelector('#currentNests').value),
          averageYieldKg: Number(form.querySelector('#averageYieldKg').value),
          numberOfFloors: Number(form.querySelector('#numberOfFloors').value),
          numberOfRooms: Number(form.querySelector('#numberOfRooms').value),
        },
        tourInfo: {
          shortDescription: form.querySelector('#shortDescription').value,
          topicsShare: getCheckboxValues('topicsShare'),
          sightseeingAreas: getCheckboxValues('sightseeingAreas'),
          includedServices: getCheckboxValues('includedServices'),
          serviceNotes: form.querySelector('#serviceNotes').value,
          tourFee: form.querySelector('#tourFee').value,
          durationPerTourMinutes: Number(form.querySelector('#durationPerTourMinutes').value),
        },
        policyInfo: {
          availableDays: getCheckboxValues('availableDays'),
          timeframes: form.querySelector('#timeframes').value,
          timeNoticeRequired: form.querySelector('#timeNoticeRequired').value,
          commitments: getCheckboxValues('commitments'),
        },
        userCode: form.querySelector('#userCode').value,
        uniqueId: uniqueId,
        homeCode: pageType === 'update' ? homeData.homeCode : undefined,
      };

      const flatData = {
        ...formData.hostInfo,
        ...formData.homeInfo,
        ...formData.nestInfo,
        ...formData.tourInfo,
        ...formData.policyInfo,
        userCode: formData.userCode
      };

      const isOk = checkingErrors(flatData, saleHomeMutationConstraints);
      if (!isOk) return;

      if (!dynamicImagesFiles['FILE_OUTSIDE'] || dynamicImagesFiles['FILE_OUTSIDE'].length === 0) {
        toastErr('Vui lòng upload Ảnh/Video đại diện (Ảnh bên ngoài nhà yến)');
        return;
      }

      if (pageType === 'update') {
        await submitSaleHome(formData, `/api/admin/saleHome/update/${formData.homeCode}`, 'put', '#updateSaleHomeBtn', 'Chỉnh sửa thành công');
      } else if (pageType === 'create') {
        await submitSaleHome(formData, '/api/admin/saleHome/create', 'post', '#createSaleHomeBtn', 'Thêm thành công');
      }
    });
  }

  if (form) {
    attachValidateForm(form, saleHomeMutationConstraints);
  }

  document.querySelectorAll('.dynamic-sale-home-files').forEach((input) => {
    const typeCode = input.dataset.typecode;
    dynamicImagesFiles[typeCode] = [];
    input.addEventListener('change', async () => {
      const addedFiles = Array.from(input.files);
      if (addedFiles.length === 0) return;

      const preview = document.getElementById(`saleHomeFilesPreview_${typeCode}`);

      showPageLoader();
      const results = await uploadSaleHomeFilesApi(addedFiles, uniqueId, typeCode);
      if (results && Array.isArray(results)) {
        for (const res of results) {
          const item = { seq: res.seq, url: res.url };
          dynamicImagesFiles[typeCode].push(item);
          const currentIndex = dynamicImagesFiles[typeCode].length - 1;
          setTimeout(() => {
            renderImagePreview(item, currentIndex, input, preview, `saleHomeFiles_${typeCode}`);
          }, 300);
        }
      }
      hidePageLoader();
      input.value = ''; // reset input
    });
  });
}

async function assignForm(data) {
  const formId = pageType === 'create' ? 'home-sale-create-form' : (pageType === 'update' ? 'home-sale-update-form' : 'home-sale-detail-form');
  const form = document.getElementById(formId);

  clearErrors();

  if(data.hostInfo) {
    form.querySelector('#hostName').value = data.hostInfo.hostName || '';
    form.querySelector('#hostPhone').value = data.hostInfo.hostPhone || '';
    form.querySelector('#socialContact').value = data.hostInfo.socialContact || '';
    if(data.hostInfo.hostRole?.code) {
      const radio = form.querySelector(`input[name="hostRole"][value="${data.hostInfo.hostRole.code}"]`);
      if(radio) radio.checked = true;
    }
  }

  if(data.homeInfo) {
    form.querySelector('#homeName').value = data.homeInfo.homeName || '';
    form.querySelector('#homelocation').value = data.homeInfo.homelocation || '';
    form.querySelector('#homeAddress').value = data.homeInfo.homeAddress || '';
    form.querySelector('#homeAge').value = data.homeInfo.homeAge || '';
    if (form.querySelector('#homeModel')) form.querySelector('#homeModel').value = data.homeInfo.homeModel?.code || '';
    if (form.querySelector('#latitude')) form.querySelector('#latitude').value = data.homeInfo.latitude || '';
    if (form.querySelector('#longitude')) form.querySelector('#longitude').value = data.homeInfo.longitude || '';
  }

  if(data.nestInfo) {
    if (form.querySelector('#currentNests')) form.querySelector('#currentNests').value = data.nestInfo.currentNests || '';
    form.querySelector('#averageYieldKg').value = data.nestInfo.averageYieldKg || '';
    form.querySelector('#numberOfFloors').value = data.nestInfo.numberOfFloors || '';
    form.querySelector('#numberOfRooms').value = data.nestInfo.numberOfRooms || '';
  }

  if(data.tourInfo) {
    form.querySelector('#shortDescription').value = data.tourInfo.shortDescription || '';
    if (data.tourInfo.topicsShare) data.tourInfo.topicsShare.forEach(o => {
      const cb = form.querySelector(`input[name="topicsShare"][value="${o.code}"]`);
      if(cb) cb.checked = true;
    });
    if (data.tourInfo.sightseeingAreas) data.tourInfo.sightseeingAreas.forEach(o => {
      const cb = form.querySelector(`input[name="sightseeingAreas"][value="${o.code}"]`);
      if(cb) cb.checked = true;
    });
    if (data.tourInfo.includedServices) data.tourInfo.includedServices.forEach(o => {
      const cb = form.querySelector(`input[name="includedServices"][value="${o.code}"]`);
      if(cb) cb.checked = true;
    });
    form.querySelector('#serviceNotes').value = data.tourInfo.serviceNotes || '';
    form.querySelector('#tourFee').value = data.tourInfo.tourFee || '';
    form.querySelector('#durationPerTourMinutes').value = data.tourInfo.durationPerTourMinutes || '';
  }

  if(data.policyInfo) {
    if (data.policyInfo.availableDays) data.policyInfo.availableDays.forEach(o => {
      const cb = form.querySelector(`input[name="availableDays"][value="${o.code}"]`);
      if(cb) cb.checked = true;
    });
    form.querySelector('#timeframes').value = data.policyInfo.timeframes || '';
    form.querySelector('#timeNoticeRequired').value = data.policyInfo.timeNoticeRequired || '';
    if (data.policyInfo.commitments) data.policyInfo.commitments.forEach(o => {
      const cb = form.querySelector(`input[name="commitments"][value="${o.code}"]`);
      if(cb) cb.checked = true;
    });
  }

  if(data.userCode) {
    form.querySelector('#userCode').value = data.userCode;
  }

  if (data.files && Array.isArray(data.files)) {
    for (const img of data.files) {
      if (!img.fileTypeCode) continue;
      const typeCode = img.fileTypeCode;
      const file = await ChangeUrlToFile(img.filename);
      if (file) {
        if (!dynamicImagesFiles[typeCode]) dynamicImagesFiles[typeCode] = [];
        dynamicImagesFiles[typeCode].push({ seq: img.seq, url: img.filename, file: file });
      }
    }

    Object.keys(dynamicImagesFiles).forEach((typeCode) => {
      const input = document.getElementById(`saleHomeFiles_${typeCode}`);
      const preview = document.getElementById(`saleHomeFilesPreview_${typeCode}`);
      if (dynamicImagesFiles[typeCode].length > 0) {
        if (preview) preview.innerHTML = '';
        dynamicImagesFiles[typeCode].forEach((file, index) => renderImagePreview(file, index, input, preview, `saleHomeFiles_${typeCode}`));
      }
    });
  }
}

function renderImagePreview(item, index, input, preview, field) {
  const isVideo = (item.url && /\.(mp4|mov|avi)$/i.test(item.url)) || (item.mimetype && item.mimetype.startsWith('video/'));

  const mediaTag = isVideo ? `<video src="" controls class="normal"></video>` : `<img src="" alt="Preview ${index + 1}" class="normal">`;

  const previewHtml = `
    <div class="image-preview" data-index="${index}">
      ${mediaTag}
      ${isDetailMode ? '' : `<button class="delete-btn" type="button" data-index="${index}">x</button>`}
    </div>
  `;
  preview.insertAdjacentHTML('beforeend', previewHtml);

  const previewElement = preview.querySelector(`[data-index="${index}"]`);
  const mediaElement = previewElement.querySelector(isVideo ? 'video' : 'img');

  let displayUrl = item.url || '';
  if (displayUrl) {
    if (!displayUrl.startsWith('blob:') && !displayUrl.startsWith('http') && !displayUrl.startsWith('uploads/')) {
      displayUrl = 'uploads/' + displayUrl;
    }
    mediaElement.src = displayUrl.startsWith('blob:') || displayUrl.startsWith('http') ? displayUrl : CURRENT_URL + '/' + displayUrl;
  }

  const deleteBtn = previewElement.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const idx = parseInt(previewElement.dataset.index);

      if (field.startsWith('saleHomeFiles_')) {
        const typeCode = field.replace('saleHomeFiles_', '');
        const delItem = dynamicImagesFiles[typeCode][idx];
        if (delItem && delItem.seq) await deleteFileApi(delItem.seq);
        dynamicImagesFiles[typeCode].splice(idx, 1);
        
        preview.innerHTML = '';
        dynamicImagesFiles[typeCode].forEach((f, i) => renderImagePreview(f, i, input, preview, field));
      }
    });
  }
}

async function submitSaleHome(formData, url, method, idSubmitBtn, successMessage) {
  const submitBtn = document.querySelector(idSubmitBtn);
  submitBtn.disabled = true;

  try {
    const response = await axios[method](url, formData, axiosAuth());
    if (response.data) {
      toastOk(successMessage);
      reloadPage('/dashboard/home/sale');
    }
  } catch (error) {
    console.error(`error:`, error);
    if (error.response?.data) {
      let msg = error.response.data.message;
      if (Array.isArray(msg)) msg = msg[0];
      if (typeof msg === 'string') {
        msg = msg.replace(/^[a-zA-Z]+\./, ''); // remove object prefix like policyInfo.
      }
      toastErr(msg);
    }
    submitBtn.disabled = false;
  }
}

async function updateSaleHomeStatus(homeCode, status) {
  const statusText = status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
  const confirmed = window.confirm(`Bạn có chắc chắn muốn ${statusText} nhà yến này không?`);
  if (!confirmed) return;

  const buttons = document.querySelectorAll('.btn-add, .btn-danger');
  buttons.forEach(b => b.disabled = true);

  try {
    const response = await axios.put(`/api/admin/saleHome/updateStatus/${homeCode}`, { status }, axiosAuth());
    if (response.data) {
      toastOk('Cập nhật trạng thái thành công');
      reloadPage('/dashboard/home/sale');
    }
  } catch (error) {
    console.error(error);
    toastErr('Cập nhật trạng thái thất bại');
    buttons.forEach(b => b.disabled = false);
  }
}
