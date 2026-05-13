const isDetailMode = typeof IS_DETAIL !== 'undefined' && IS_DETAIL;
const pageType = isDetailMode ? 'detail' : (window.location.pathname.includes('/update') ? 'update' : 'create');
const teamMutationConstraints = {
  teamName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên xưởng công xưởng.' },
  },
  teamUserName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên người đại diện.' },
  },
  teamAddress: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập địa chỉ.' },
    length: { minimum: 5, message: '^Địa chỉ phải có ít nhất 5 ký tự.' },
  },
  teamPhone: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập số điện thoại.' },
  },
  provinceCodes: {
    presence: { allowEmpty: false, message: '^Vui lòng chọn tỉnh thành.' },
  },
  userTypeCode: {
    presence: { allowEmpty: false, message: '^Vui lòng chọn loại công xưởng.' },
  },
  userCode: {
    presence: { allowEmpty: false, message: '^Vui lòng người dùng sở hữu công xưởng.' },
  },
  teamDescription: {
    quillPresence: { message: '^Vui lòng nhập mô tả.' },
  },
  teamImage: {
    filePresence: { message: '^Vui lòng chọn ảnh chính.' },
  },
};

// Lưu trữ thông tin metadata của các ảnh/video phụ theo từng loại (fileTypeCode)
let dynamicImagesFiles = {}; // { [typeCode]: File[] }
// Lưu trữ thông tin metadata của các ảnh/video theo từng dịch vụ (Service ID)
let serviceImagesFiles = {}; // { [serviceId]: File[] }
// số thứ tự dịch vụ
let serviceCounter = 0;

// ID duy nhất cho Team dùng để liên kết các tệp tin được upload bất đồng bộ
let teamUniqueId = typeof teamData !== 'undefined' && teamData.uniqueId ? teamData.uniqueId : generateUUID();
let isMainImageUploading = false;

document.addEventListener('DOMContentLoaded', () => {
  if (pageType === 'update' || pageType === 'detail') {
    initializeForm();
    assignForm(teamData);
    if (isDetailMode && typeof quillGlobal !== 'undefined') {
      quillGlobal.disable();
    }
  } else if (pageType === 'create') {
    initializeForm();
  }
});

document.getElementById('userTypeCode').addEventListener('change', async function () {
  const userTypeCode = this.value;
  const selectedOption = this.options[this.selectedIndex];
  const userTypeKeyWord = selectedOption?.dataset?.keyword;
  const userSelect = document.getElementById('userCode');

  userSelect.value = '';
  userSelect.innerHTML = '<option value="">-- Chọn người đại diện --</option>';
  userSelect.disabled = true;

  // Reset các dịch vụ và ảnh phụ đã tải lên trước đó
  document.getElementById('servicesContainer').innerHTML = '';
  serviceImagesFiles = {};

  document.querySelectorAll('.dynamic-team-images').forEach((input) => {
    const typeCode = input.dataset.typecode;
    if (dynamicImagesFiles[typeCode]) {
      dynamicImagesFiles[typeCode] = [];
    }
    const preview = document.getElementById(`teamFilesPreview_${typeCode}`);
    if (preview) preview.innerHTML = '';
    input.value = '';
  });

  if (userTypeCode) {
    const userList = await getUsersForTeamByType(userTypeCode);
    if (userList && userList.length > 0) {
      userSelect.disabled = false;
      userList.forEach((user) => {
        const option = document.createElement('option');
        option.value = user.userCode;
        option.textContent = user.userName;
        userSelect.appendChild(option);
      });
    }
  }

  // Ẩn hiện các danh mục ảnh theo userTypeCode
  document.querySelectorAll('.img-type-block').forEach((block) => {
    if (block.dataset.usertypecode === userTypeCode) {
      block.classList.remove('d-none');
    } else {
      block.classList.add('d-none');
    }
  });

  // Cập nhật trạng thái nút Thêm dịch vụ
  const btnAddService = document.getElementById('btnAddService');
  if (userTypeCode) {
    btnAddService.disabled = false;
    btnAddService.style.opacity = '1';
    btnAddService.style.cursor = 'pointer';
  } else {
    btnAddService.disabled = true;
    btnAddService.style.opacity = '0.5';
    btnAddService.style.cursor = 'not-allowed';

    // Nếu người dùng bỏ chọn loại công xưởng, xóa hết dịch vụ đã thêm
    document.getElementById('servicesContainer').innerHTML = '';
    serviceImagesFiles = {};
  }

  // Cập nhật lại danh sách option cho các dịch vụ đã thêm (nếu có)
  const serviceSelects = document.querySelectorAll('.service-type-code');
  let currentOptions = [];
  if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.FACTORY) {
    currentOptions = serviceOptionsFactory;
    document.getElementById('factorySpecialFields').classList.remove('d-none');
    teamMutationConstraints.monthlyVolumn = {
      presence: { allowEmpty: false, message: '^Vui lòng nhập sản lượng trên 1 tháng.' },
    };
    teamMutationConstraints.minimunQuantity = {
      presence: { allowEmpty: false, message: '^Vui lòng nhập số lượng tối thiểu.' },
    };
  } else if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.TECHNICAL) {
    currentOptions = serviceOptionsTechnical;
    document.getElementById('factorySpecialFields').classList.add('d-none');
    delete teamMutationConstraints.monthlyVolumn;
    delete teamMutationConstraints.minimunQuantity;
  }

  serviceSelects.forEach((select) => {
    const currentValue = select.value;
    let optionsHtml = '<option value="">-- Chọn dịch vụ --</option>';
    currentOptions.forEach((opt) => {
      optionsHtml += `<option value="${opt.keyOption}" ${currentValue === opt.keyOption ? 'selected' : ''}>${opt.valueOption}</option>`;
    });
    select.innerHTML = optionsHtml;
  });
});

/**
 * API Upload ảnh chính cho xưởng
 */
async function uploadTeamMainImageApi(file, uniqueId) {
  const formData = new FormData();
  formData.append('teamImage', file);
  formData.append('uniqueId', uniqueId);

  try {
    const res = await axios.post('/api/admin/team/uploadTeamMainImage', formData, axiosAuth());
    return res.data; // { seq, url }
  } catch (e) {
    console.error(e);
    toastErr('Upload lỗi');
    return null;
  }
}

/**
 * API Upload các tệp tin phụ (ảnh/video) cho xưởng
 */
async function uploadTeamFilesApi(files, uniqueId, fileTypeCode) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('teamFiles', file);
  }
  formData.append('uniqueId', uniqueId);
  if (fileTypeCode) formData.append('fileTypeCode', fileTypeCode);

  try {
    const res = await axios.post('/api/admin/team/uploadTeamFiles', formData, axiosAuth());
    return res.data; // Array of results
  } catch (e) {
    console.error(e);
    toastErr('Upload lỗi');
    return null;
  }
}


/**
 * API Upload tệp tin cho từng dịch vụ của xưởng
 */
async function uploadServiceFilesApi(files, uniqueId) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('teamServiceFiles', file);
  }
  formData.append('uniqueId', uniqueId);

  try {
    const res = await axios.post('/api/admin/team/uploadServiceFiles', formData, axiosAuth());
    return res.data; // Array of results
  } catch (e) {
    console.error(e);
    toastErr('Upload lỗi');
    return null;
  }
}

/**
 * API Xóa tệp tin đã upload trên server
 * @param {number} seq - ID của file
 * @param {string} uploadType - Loại file để backend xác định bảng cần xóa
 */
async function deleteFileApi(seq, uploadType) {
  if (!seq) return;
  try {
    await axios.post('/api/admin/team/deleteFile', { seq, uploadType }, axiosAuth());
  } catch (e) {
    console.error(e);
  }
}

/**
 * Khởi tạo các sự kiện và cấu hình cho Form
 */
function initializeForm() {
  const formId = pageType === 'create' ? 'team-create-form' : (pageType === 'update' ? 'team-update-form' : 'team-detail-form');
  const form = document.getElementById(formId);
  const teamImagePreview = form.querySelector('#teamImagePreview');
  const teamImageInput = form.querySelector('#teamImage');
  const provinceSelect = form.querySelector('#provinceCodes');
  const btnAddService = document.getElementById('btnAddService');

  if (typeof $ !== 'undefined' && $.fn.select2) {
    $(provinceSelect)
      .select2({
        placeholder: '-- Chọn tỉnh/thành --',
        allowClear: false,
        width: '100%',
      })
      .on('change', function () {
        const fieldName = 'provinceCodes';
        const errorElement = form.querySelector(`[data-error="${fieldName}"]`);
        if (errorElement) {
          const values = $(this).val();
          if (values && values.length > 0) {
            errorElement.textContent = '';
            errorElement.classList.add('d-none');
          } else {
            errorElement.textContent = teamMutationConstraints.provinceCodes.presence.message.replace('^', '');
            errorElement.classList.remove('d-none');
          }
        }
      });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      teamName: form.querySelector('#teamName').value,
      teamUserName: form.querySelector('#teamUserName').value,
      teamAddress: form.querySelector('#teamAddress').value,
      teamPhone: form.querySelector('#teamPhone').value,
      provinceCodes: Array.from(form.querySelector('#provinceCodes').selectedOptions).map((option) => option.value),
      userTypeCode: form.querySelector('#userTypeCode').value,
      userCode: form.querySelector('#userCode').value,
      teamDescription: quillGlobal.root.innerHTML,
      teamImage: form.querySelector('#teamImage').files,
      teamCode: pageType === 'update' ? teamData.teamCode : undefined,
    };

    const userTypeCodeSelect = form.querySelector('#userTypeCode');
    const userTypeKeyWord = userTypeCodeSelect.options[userTypeCodeSelect.selectedIndex]?.dataset?.keyword;

    if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.FACTORY) {
      formData.monthlyVolumn = form.querySelector('#monthlyVolumn').value;
      formData.minimunQuantity = form.querySelector('#minimunQuantity').value;
    }

    const isOk = checkingErrors(formData, teamMutationConstraints);
    if (!isOk) return;

    if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.FACTORY) {
      formData.teamDescriptionSpecial = {
        monthlyVolumn: Number(formData.monthlyVolumn),
        minimunQuantity: Number(formData.minimunQuantity),
      };
    } else {
      formData.teamDescriptionSpecial = null;
    }

    delete formData.monthlyVolumn;
    delete formData.minimunQuantity;

    if (pageType === 'update') {
      await updateTeam(formData);
    } else if (pageType === 'create') {
      await createTeam(formData);
    }
    });
  }

  if (form) {
    attachValidateForm(form, teamMutationConstraints);
    attachValidateEditor(form, 'teamDescription', teamMutationConstraints.teamDescription.quillPresence.message);
  }

  if (teamImageInput) {
    teamImageInput.addEventListener('change', async () => {
    if (isMainImageUploading) return;

    if (teamImageInput.files.length > 0) {
      isMainImageUploading = true;
      showPageLoader();

      const fileOrig = teamImageInput.files[0];
      const file = new File([await fileOrig.arrayBuffer()], fileOrig.name, { type: fileOrig.type });
      const res = await uploadTeamMainImageApi(file, teamUniqueId);

      isMainImageUploading = false;
      hidePageLoader();
      teamImagePreview.innerHTML = '';

      if (res) {
        // Thêm khoảng trễ nhỏ tương tự ảnh phụ để tránh lỗi 404
        setTimeout(() => {
          renderImagePreview(res, 0, teamImageInput, teamImagePreview, 'teamImage');
        }, 300);
      }
    } else {
      teamImagePreview.innerHTML = '';
    }
    validateField(teamMutationConstraints, teamImageInput);
  });
  }

  // Liên kết hình ảnh động
  document.querySelectorAll('.dynamic-team-files').forEach((input) => {
    const typeCode = input.dataset.typecode;
    dynamicImagesFiles[typeCode] = [];
    input.addEventListener('change', async () => {
      const addedFiles = Array.from(input.files);
      if (addedFiles.length === 0) return;

      const preview = document.getElementById(`teamFilesPreview_${typeCode}`);

      showPageLoader();
      const results = await uploadTeamFilesApi(addedFiles, teamUniqueId, typeCode);
      if (results && Array.isArray(results)) {
        for (const res of results) {
          const item = { seq: res.seq, url: res.url };
          dynamicImagesFiles[typeCode].push(item);
          const currentIndex = dynamicImagesFiles[typeCode].length - 1;
          // Thêm một khoảng trễ nhỏ để đảm bảo file đã sẵn sàng trên đĩa 
          setTimeout(() => {
            renderImagePreview(item, currentIndex, input, preview, `teamFiles_${typeCode}`);
          }, 300);
        }
      }
      hidePageLoader();
      input.value = ''; // reset input
    });
  });

  // Liên kết dịch vụ
  if (btnAddService) {
    // Trạng thái ban đầu của nút Thêm dịch vụ
    const userTypeCode = document.getElementById('userTypeCode').value;
    if (!userTypeCode) {
      btnAddService.disabled = true;
      btnAddService.style.opacity = '0.5';
      btnAddService.style.cursor = 'not-allowed';
    }

    btnAddService.addEventListener('click', () => {
      addServiceBlock();
    });
  }
}

/**
 * Thêm một khối nhập liệu dịch vụ mới
 * @param {Object} svcData - Dữ liệu dịch vụ cũ (nếu có - dùng cho Update)
 */
function addServiceBlock(svcData = null) {
  const container = document.getElementById('servicesContainer');
  const serviceId = serviceCounter++;
  serviceImagesFiles[serviceId] = [];

  // Xác định bộ option dựa trên userTypeCode hiện tại
  const userTypeSelect = document.getElementById('userTypeCode');
  const userTypeKeyWord = userTypeSelect.options[userTypeSelect.selectedIndex]?.dataset?.keyword;

  let currentOptions = [];
  if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.FACTORY) {
    currentOptions = serviceOptionsFactory;
  } else if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.TECHNICAL) {
    currentOptions = serviceOptionsTechnical;
  }

  let optionsHtml = '<option value="">-- Chọn dịch vụ --</option>';
  currentOptions.forEach((opt) => {
    optionsHtml += `<option value="${opt.keyOption}" ${svcData && svcData.serviceTypeCode === opt.keyOption ? 'selected' : ''}>${opt.valueOption}</option>`;
  });

  const html = `
    <div class="card mb-3 service-block" data-uniqueid="${svcData && svcData.uniqueId ? svcData.uniqueId : generateUUID()}"  id="serviceBlock_${serviceId}" data-id="${serviceId}">
      <div class="card-body">
        <div class="d-flex justify-content-between mb-2">
          <label class="form-label font-weight-bold text-primary">Dịch vụ #${serviceId + 1}</label>
          <button type="button" class="btn btn-sm btn-danger btn-remove-service" data-id="${serviceId}">Xóa</button>
        </div>
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Chọn dịch vụ</label>
            <select class="form-select service-type-code" required>
              ${optionsHtml}
            </select>
          </div>
          <div class="col-md-8 mb-3">
            <label class="form-label">Mô tả dịch vụ</label>
            <textarea class="form-control service-text-input" rows="3">${svcData ? svcData.serviceTextInput : ''}</textarea>
          </div>
          <div class="col-md-12">
            <label class="form-label">Ảnh/Video mô tả dịch vụ</label><br/>
            <label for="serviceImages_${serviceId}" class="file-label">
                <span class="file-button">Chọn ảnh/video dịch vụ</span>
            </label>
            <input type="file" class="form-control service-images-input" id="serviceImages_${serviceId}"
                name="serviceImages_${serviceId}" multiple accept=".png, .jpg, .jpeg, .mp4, .mov, .avi"
                data-id="${serviceId}" />
            <div class="image-preview-container mt-2" id="serviceImagesPreview_${serviceId}"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);

  // Liên kết các sự kiện
  const block = document.getElementById(`serviceBlock_${serviceId}`);
  const btnRemove = block.querySelector('.btn-remove-service');
  if (btnRemove) {
    btnRemove.addEventListener('click', function () {
      delete serviceImagesFiles[serviceId];
      block.remove();
    });
  }

  if (isDetailMode) {
    const btnRem = block.querySelector('.btn-remove-service');
    if (btnRem) btnRem.remove();
    block.querySelector('.service-type-code').disabled = true;
    block.querySelector('.service-text-input').readOnly = true;
    const uploadLabel = block.querySelector('.file-label');
    if (uploadLabel) uploadLabel.remove();
    const uploadInput = block.querySelector('.service-images-input');
    if (uploadInput) uploadInput.remove();
  }

  const input = block.querySelector('.service-images-input');
  const preview = block.querySelector(`#serviceImagesPreview_${serviceId}`);

  if (input) {
    input.addEventListener('change', async () => {
    const addedFiles = Array.from(input.files);
    if (addedFiles.length === 0) return;

    const uniqueId = block.dataset.uniqueid;

    showPageLoader();
    const results = await uploadServiceFilesApi(addedFiles, uniqueId);
    if (results && Array.isArray(results)) {
      for (const res of results) {
        const item = { seq: res.seq, url: res.url };
        serviceImagesFiles[serviceId].push(item);
        const currentIndex = serviceImagesFiles[serviceId].length - 1;
        setTimeout(() => {
          renderImagePreview(item, currentIndex, input, preview, `serviceImages_${serviceId}`);
        }, 300);
      }
    }
    hidePageLoader();
    input.value = ''; // reset input
  });
  }

  return { input, preview, serviceId };
}

/**
 * Đổ dữ liệu từ TeamData vào Form khi ở trang Update
 */
async function assignForm(teamData) {
  const formId = pageType === 'create' ? 'team-create-form' : (pageType === 'update' ? 'team-update-form' : 'team-detail-form');
  const form = document.getElementById(formId);
  const teamImagePreview = form.querySelector('#teamImagePreview');
  const teamImageInput = form.querySelector('#teamImage');

  clearErrors();
  if (teamImageInput) teamImageInput.value = '';

  form.querySelector('#teamName').value = teamData.teamName || '';
  form.querySelector('#teamUserName').value = teamData.teamUserName || '';
  form.querySelector('#teamAddress').value = teamData.teamAddress || '';
  form.querySelector('#teamPhone').value = teamData.teamPhone || '';

  const provinceSelect = form.querySelector('#provinceCodes');
  if (teamData.provinceCodes) {
    const provinceCodes = typeof teamData.provinceCodes === 'string' ? JSON.parse(teamData.provinceCodes) : teamData.provinceCodes;
    if (Array.isArray(provinceCodes)) {
      Array.from(provinceSelect.options).forEach((option) => {
        option.selected = provinceCodes.includes(option.value);
      });
    } else {
      provinceSelect.value = provinceCodes;
    }
  } else {
    provinceSelect.value = '';
  }
  if (typeof $ !== 'undefined' && $(provinceSelect).data('select2')) {
    $(provinceSelect).trigger('change');
  }

  const userTypeCodeSelect = form.querySelector('#userTypeCode');
  userTypeCodeSelect.value = teamData.userTypeCode || '';
  userTypeCodeSelect.disabled = true;

  const selectedOption = userTypeCodeSelect.options[userTypeCodeSelect.selectedIndex];
  const userTypeKeyWord = selectedOption?.dataset?.keyword;

  if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.FACTORY) {
    document.getElementById('factorySpecialFields').classList.remove('d-none');
    if (teamData.teamDescriptionSpecial) {
      form.querySelector('#monthlyVolumn').value = teamData.teamDescriptionSpecial.monthlyVolumn || '';
      form.querySelector('#minimunQuantity').value = teamData.teamDescriptionSpecial.minimunQuantity || '';
    }
    teamMutationConstraints.monthlyVolumn = {
      presence: { allowEmpty: false, message: '^Vui lòng nhập sản lượng trên 1 tháng.' },
    };
    teamMutationConstraints.minimunQuantity = {
      presence: { allowEmpty: false, message: '^Vui lòng nhập số lượng tối thiểu.' },
    };
  }

  // Cập nhật trạng thái nút Thêm dịch vụ và hiển thị các khối ảnh phụ
  const btnAddService = document.getElementById('btnAddService');
  if (teamData.userTypeCode) {
    if (btnAddService) {
      btnAddService.disabled = false;
      btnAddService.style.opacity = '1';
      btnAddService.style.cursor = 'pointer';
    }

    // Hiển thị các danh mục ảnh theo userTypeCode
    document.querySelectorAll('.img-type-block').forEach((block) => {
      if (block.dataset.usertypecode === teamData.userTypeCode) {
        block.classList.remove('d-none');
      } else {
        block.classList.add('d-none');
      }
    });
  }

  if (teamData.userTypeCode) {
    const userSelect = form.querySelector('#userCode');
    userSelect.innerHTML = '<option value="">-- Chọn người đại diện --</option>';
    userSelect.disabled = true;

    const userList = await getUsersForTeamByType(teamData.userTypeCode);
    if (userList && userList.length > 0) {
      userList.forEach((user) => {
        const option = document.createElement('option');
        option.value = user.userCode;
        option.textContent = user.userName;
        userSelect.appendChild(option);
      });
      userSelect.value = teamData.userCode || '';
    }

    document.querySelectorAll('.img-type-block').forEach((block) => {
      if (block.dataset.usertypecode === teamData.userTypeCode) {
        block.classList.remove('d-none');
      } else {
        block.classList.add('d-none');
      }
    });
  }

  quillGlobal.root.innerHTML = quillGlobal && teamData.teamDescription ? teamData.teamDescription : '';

  if ((pageType === 'update' || pageType === 'detail') && teamData.teamImage) {
    const file = await ChangeUrlToFile(teamData.teamImage.filename);
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (teamImageInput) teamImageInput.files = dataTransfer.files;
      renderImagePreview({ seq: teamData.teamImage.seq, url: teamData.teamImage.filename }, 0, teamImageInput, teamImagePreview, 'teamImage');
      if (teamImageInput) validateField(teamMutationConstraints, teamImageInput);
    }
  }

  if ((pageType === 'update' || pageType === 'detail') && teamData.teamFiles && Array.isArray(teamData.teamFiles)) {
    for (const group of teamData.teamFiles) {
      if (!group.fileTypeCode) continue;
      const typeCode = group.fileTypeCode;

      if (group.images && Array.isArray(group.images)) {
        for (const img of group.images) {
          const file = await ChangeUrlToFile(img.filename);
          if (file) {
            if (!dynamicImagesFiles[typeCode]) dynamicImagesFiles[typeCode] = [];
            dynamicImagesFiles[typeCode].push({ seq: img.seq, url: img.filename, file: file });
          }
        }
      }
    }

    Object.keys(dynamicImagesFiles).forEach((typeCode) => {
      const input = document.getElementById(`teamFiles_${typeCode}`);
      const preview = document.getElementById(`teamFilesPreview_${typeCode}`);
      if (dynamicImagesFiles[typeCode].length > 0) {
        if (preview) preview.innerHTML = '';
        dynamicImagesFiles[typeCode].forEach((file, index) => renderImagePreview(file, index, input, preview, `teamFiles_${typeCode}`));
      }
    });
  }

  if ((pageType === 'update' || pageType === 'detail') && teamData.services && Array.isArray(teamData.services)) {
    for (const svc of teamData.services) {
      const { input, preview, serviceId } = addServiceBlock(svc);
      if (svc.images && Array.isArray(svc.images)) {
        for (const img of svc.images) {
          const file = await ChangeUrlToFile(img.filename);
          if (file) {
            serviceImagesFiles[serviceId].push({ seq: img.seq, url: img.filename, file: file });
          }
        }
        if (serviceImagesFiles[serviceId].length > 0) {
          preview.innerHTML = '';
          serviceImagesFiles[serviceId].forEach((file, index) => renderImagePreview(file, index, input, preview, `serviceImages_${serviceId}`));
        }
      }
    }
  }
}

/**
 * Hiển thị hình ảnh hoặc video preview sau khi đã upload xong
 * @param {Object} item - Đối tượng chứa thông tin file ({seq, url, mimetype})
 */
function renderImagePreview(item, index, input, preview, field) {
  // Xác định xem file có phải là video hay không dựa trên URL hoặc mimetype
  const isVideo = (item.url && /\.(mp4|mov|avi)$/i.test(item.url)) || (item.mimetype && item.mimetype.startsWith('video/'));

  const mediaTag = isVideo ? `<video src="" controls></video>` : `<img src="" alt="Preview ${index + 1}">`;

  const previewHtml = `
    <div class="image-preview" data-index="${index}">
      ${mediaTag}
      ${isDetailMode ? '' : '<button class="delete-btn" type="button" data-index="${index}"></button>'}
    </div>
  `;
  preview.insertAdjacentHTML('beforeend', previewHtml);

  const previewElement = preview.querySelector(`[data-index="${index}"]`);
  const mediaElement = previewElement.querySelector(isVideo ? 'video' : 'img');

  // Xử lý URL hiển thị
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

    if (field === 'teamImage') {
      if (item && item.seq) await deleteFileApi(item.seq, 'teamImage');
      input.value = '';
    } else if (field.startsWith('teamFiles_')) {
      const typeCode = field.replace('teamFiles_', '');
      const delItem = dynamicImagesFiles[typeCode][idx];
      if (delItem && delItem.seq) await deleteFileApi(delItem.seq, 'teamFiles');
      dynamicImagesFiles[typeCode].splice(idx, 1);
    } else if (field.startsWith('serviceImages_')) {
      const sId = parseInt(field.replace('serviceImages_', ''));
      const delItem = serviceImagesFiles[sId][idx];
      if (delItem && delItem.seq) await deleteFileApi(delItem.seq, 'teamServiceFiles');
      serviceImagesFiles[sId].splice(idx, 1);
    }

    preview.innerHTML = '';
    if (field === 'teamImage') {
      // Sau khi xóa ảnh chính, không hiển thị gì
    } else if (field.startsWith('teamFiles_')) {
      const typeCode = field.replace('teamFiles_', '');
      dynamicImagesFiles[typeCode].forEach((f, i) => renderImagePreview(f, i, input, preview, field));
    } else if (field.startsWith('serviceImages_')) {
      const sId = parseInt(field.replace('serviceImages_', ''));
      serviceImagesFiles[sId].forEach((f, i) => renderImagePreview(f, i, input, preview, field));
    }

    if (field === 'teamImage') validateField(teamMutationConstraints, input);
  });
  }
}

async function createTeam(formData) {
  await submitTeam(formData, '/api/admin/team/create', 'post', 'Thêm thành công');
}

async function updateTeam(formData) {
  await submitTeam(formData, `/api/admin/team/update/${formData.teamCode}`, 'put', 'Chỉnh sửa thành công');
}

/**
 * Xử lý gửi dữ liệu Form lên server (Create/Update)
 */
async function submitTeam(formData, url, method, successMessage) {
  const postData = new FormData();
  const fields = ['teamName', 'teamUserName', 'teamAddress', 'teamPhone', 'provinceCodes', 'userTypeCode', 'userCode', 'teamDescription', 'teamDescriptionSpecial'];
  postData.append('uniqueId', teamUniqueId);
  fields.forEach((field) => {
    let value = formData[field];
    if ((field === 'provinceCodes' || field === 'teamDescriptionSpecial') && value && typeof value === 'object') {
      value = JSON.stringify(value);
    }
    postData.append(field, value || '');
  });

  // Thu thập dịch vụ
  const servicesData = [];
  const serviceBlocks = document.querySelectorAll('.service-block');

  if (serviceBlocks.length === 0) {
    toastErr('Vui lòng đăng ký ít nhất một dịch vụ.');
    return;
  }

  const serviceTypes = new Set();
  let hasError = false;

  serviceBlocks.forEach((block, index) => {
    const sId = block.dataset.id;
    const sType = block.querySelector('.service-type-code').value;
    const sText = block.querySelector('.service-text-input').value;

    if (!sType) {
      toastErr(`Vui lòng chọn loại dịch vụ cho dịch vụ #${index + 1}.`);
      hasError = true;
      return;
    }

    if (serviceTypes.has(sType)) {
      toastErr(`Dịch vụ #${index + 1} bị trùng lặp. Mỗi loại dịch vụ chỉ được chọn một lần.`);
      hasError = true;
      return;
    }
    serviceTypes.add(sType);

    servicesData.push({
      serviceTypeCode: sType,
      serviceTextInput: sText,
      uniqueId: block.dataset.uniqueid || '',
    });
  });

  if (hasError) return;

  postData.append('servicesData', JSON.stringify(servicesData));

  const submitBtn = document.querySelector('.btn-submit-lg');
  submitBtn.disabled = true;

  try {
    const response = await axios[method](url, postData, axiosAuth());
    if (response.data) {
      toastOk(successMessage);
      reloadPage('/dashboard/user-teams');
    }
  } catch (error) {
    console.error(`error:`, error);
    if (error.response?.data) {
      toastErr(error.response.data.message);
    }
    submitBtn.disabled = false;
  }
}

async function getUsersForTeamByType(userTypeCode) {
  return await axios
    .post(
      CURRENT_URL + '/api/admin/user/getUsersForTeamByType',
      {
        userTypeCode: userTypeCode,
        pageType: pageType,
      },
      axiosAuth(),
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error('getUsersForTeamByType --', error);
      return [];
    });
}

async function updateTeamStatus(status) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn ${status === VARIABLE_ENUM.TEAM_STATUS.APPROVE ? 'Duyệt' : 'Từ chối'} đội này không?`);
  if (!confirmed) return;

  // Disable buttons
  const approveBtn = document.querySelector(`button[onclick="updateTeamStatus('${VARIABLE_ENUM.TEAM_STATUS.APPROVE}')"]`);
  const refuseBtn = document.querySelector(`button[onclick="updateTeamStatus('${VARIABLE_ENUM.TEAM_STATUS.REFUSE}')"]`);
  if (approveBtn) approveBtn.disabled = true;
  if (refuseBtn) refuseBtn.disabled = true;

  try {
    const response = await axios.put(`/api/admin/team/updateStatus/${teamData.teamCode}`, { status }, axiosAuth());
    if (response.data) {
      toastOk('Cập nhật trạng thái thành công');
      reloadPage('/dashboard/user-teams');
    }
  } catch (error) {
    console.error(error);
    toastErr('Cập nhật trạng thái thất bại');
    // Re-enable buttons if failed
    if (approveBtn) approveBtn.disabled = false;
    if (refuseBtn) refuseBtn.disabled = false;
  }
}
