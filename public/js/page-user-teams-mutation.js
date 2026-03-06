const pageType = window.location.pathname.includes('/update') ? 'update' : 'create';
const teamMutationConstraints = {
  teamName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên xưởng công xưởng.' },
  },
  teamAddress: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập địa chỉ.' },
    length: { minimum: 5, message: '^Địa chỉ phải có ít nhất 5 ký tự.' },
  },
  provinceCode: {
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
  teamImages: {
    filePresence: { message: '^Vui lòng chọn ít nhất một ảnh phụ.' },
  },
};
let teamImagesFiles = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', () => {
  if (pageType === 'update') {
    // cho trạng thái chỉnh sửa
    initializeForm();
    assignForm(teamData);
  } else if (pageType === 'create') {
    // cho trạng thái thêm
    initializeForm();
  }
});

document.getElementById('userTypeCode').addEventListener('change', async function () {
  const userTypeCode = this.value;
  const selectedOption = this.options[this.selectedIndex];
  const userTypeKeyWord = selectedOption.dataset.keyword;
  const userSelect = document.getElementById('userCode');

  userSelect.value = '';
  userSelect.innerHTML = '<option value="">-- Chọn khách hàng sở hữu --</option>';

  userSelect.disabled = true;
  if (userTypeCode) {
    // render danh sách người dùng theo type
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

  // ẩn/ hiện form thông tin chuyên môn cho type kỹ thuật
  const technicalDiv = document.querySelector('.last-box > div:first-child');
  const descriptionDiv = document.querySelector('.last-box > div:nth-child(2)');
  if (technicalDiv) {
    if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.TECHNICAL) {
      technicalDiv.style.display = 'block';
      if (descriptionDiv) descriptionDiv.className = 'col-lg-6';
    } else {
      technicalDiv.style.display = 'none';
      if (descriptionDiv) descriptionDiv.className = 'col-lg-12';
    }
  }
});
function initializeForm() {
  const form = document.getElementById(pageType === 'create' ? 'team-create-form' : 'team-update-form');
  const teamImagePreview = form.querySelector('#teamImagePreview');
  const teamImagesPreview = form.querySelector('#teamImagesPreview');
  const teamImageInput = form.querySelector('#teamImage');
  const teamImagesInput = form.querySelector('#teamImages');

  // gắn submit event cho form
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      teamName: form.querySelector('#teamName').value,
      teamAddress: form.querySelector('#teamAddress').value,
      provinceCode: form.querySelector('#provinceCode').value,
      userTypeCode: form.querySelector('#userTypeCode').value,
      userCode: form.querySelector('#userCode').value,
      teamDescription: quillGlobal.root.innerHTML,
      teamImage: form.querySelector('#teamImage').files,
      teamImages: form.querySelector('#teamImages').files,
      teamCode: pageType === 'update' ? teamData.teamCode : undefined,
    };

    // kiểm tra errors
    const isOk = checkingErrors(formData, teamMutationConstraints);
    if (!isOk) return;

    // submit
    if (pageType === 'update') {
      await updateTeam(formData);
    } else if (pageType === 'create') {
      await createTeam(formData);
    }
  });

  //  gắn validate event cho các input
  attachValidateForm(form, teamMutationConstraints);

  // gắn validate  cho các editor nếu có
  attachValidateEditor(form, 'teamDescription', teamMutationConstraints.teamDescription.quillPresence.message);

  teamImagesInput.addEventListener('change', () => {
    // thêm các file mới vào biến global 'teamImagesFiles'
    const addedFiles = Array.from(teamImagesInput.files);
    teamImagesFiles = teamImagesFiles.concat(addedFiles);

    // cập nhập lại FileList
    const dataTransfer = new DataTransfer();
    teamImagesFiles.forEach((file) => dataTransfer.items.add(file));
    teamImagesInput.files = dataTransfer.files;

    // re-render ảnh preview
    teamImagesPreview.innerHTML = '';
    teamImagesFiles.forEach((file, index) => renderImagePreview(file, index, teamImagesInput, teamImagesPreview, 'teamImages'));

    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(teamMutationConstraints, teamImagesInput);
  });

  teamImageInput.addEventListener('change', () => {
    // re-render ảnh preview
    teamImagePreview.innerHTML = '';
    if (teamImageInput.files.length > 0) {
      renderImagePreview(teamImageInput.files[0], 0, teamImageInput, teamImagePreview, 'teamImage');
    }
    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(teamMutationConstraints, teamImageInput);
  });
}

// TODO: FUNC
async function assignForm(teamData) {
  const form = document.getElementById('team-update-form');
  const teamImagePreview = form.querySelector('#teamImagePreview');
  const teamImagesPreview = form.querySelector('#teamImagesPreview');
  const teamImageInput = form.querySelector('#teamImage');
  const teamImagesInput = form.querySelector('#teamImages');

  // reset các biến
  clearErrors();
  teamImagesFiles = [];
  teamImageInput.value = '';
  teamImagesInput.value = '';

  // điền giá trị các input bằng dữ liệu từ API
  form.querySelector('#teamName').value = teamData.teamName || '';
  form.querySelector('#teamAddress').value = teamData.teamAddress || '';
  form.querySelector('#provinceCode').value = teamData.provinceCode || '';

  // điền giá trị userTypeCode
  const userTypeCodeSelect = form.querySelector('#userTypeCode');
  userTypeCodeSelect.value = teamData.userTypeCode || '';
  userTypeCodeSelect.disabled = true;
  if (teamData.userTypeCode) {
    const userSelect = form.querySelector('#userCode');
    userSelect.innerHTML = '<option value="">-- Chọn khách hàng sở hữu --</option>';
    userSelect.disabled = true;

    // điền giá trị userCode
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

    // dựa giá trị userTypeKeyWord mà hiện/ ẩn component
    const userTypeCodeSelected = userTypeCodeSelect.options[userTypeCodeSelect.selectedIndex];
    if (userTypeCodeSelected) {
      const userTypeKeyWord = userTypeCodeSelected.dataset.keyword;
      const technicalDiv = document.querySelector('.last-box > div:first-child');
      const descriptionDiv = document.querySelector('.last-box > div:nth-child(2)');
      if (userTypeKeyWord === VARIABLE_ENUM.USER_TEAM_TYPE.TECHNICAL) {
        // hiện form chuyên môn cho xưởng kỹ thuật / chia đôi chiều rộng của editor
        technicalDiv.style.display = 'block';
        descriptionDiv.className = 'col-lg-6';

        // điền giá trị teamDescriptionSpecial vào từng Textarea
        if (teamData.teamDescriptionSpecial) {
          const specialData = typeof teamData.teamDescriptionSpecial === 'string' ? JSON.parse(teamData.teamDescriptionSpecial) : teamData.teamDescriptionSpecial;
          if (typeof technicalTypes !== 'undefined' && Array.isArray(technicalTypes)) {
            technicalTypes.forEach((item) => {
              const textareaElement = document.getElementById(item.keyOption);
              if (textareaElement && specialData[item.keyOption.toLowerCase()] !== undefined) {
                textareaElement.value = specialData[item.keyOption.toLowerCase()];
              }
            });
          }
        }
      } else {
        // ẩn form chuyên môn cho xưởng kỹ thuật / bật chiều rộng full cho editor
        technicalDiv.style.display = 'none';
        descriptionDiv.className = 'col-lg-12';
      }
    }
  }

  quillGlobal.root.innerHTML = quillGlobal && teamData.teamDescription ? teamData.teamDescription : '';

  // teamImage
  if (pageType === 'update' && teamData.teamImage) {
    const file = await ChangeUrlToFile(teamData.teamImage.filename);
    if (file) {
      // cập nhập FileList cho teamImage
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      teamImageInput.files = dataTransfer.files;

      // re-render ảnh preview
      renderImagePreview(file, 0, teamImageInput, teamImagePreview, 'teamImage');

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(teamMutationConstraints, teamImageInput);
    }
  }

  // teamImages
  if (pageType === 'update' && teamData.teamImages && Array.isArray(teamData.teamImages)) {
    const files = await Promise.all(teamData.teamImages.map((img) => ChangeUrlToFile(img.filename)));
    teamImagesFiles = files.filter((file) => file !== null);

    if (teamImagesFiles.length > 0) {
      // cập nhập FileList cho teamImages
      const dataTransfer = new DataTransfer();
      teamImagesFiles.forEach((file) => dataTransfer.items.add(file));
      teamImagesInput.files = dataTransfer.files;
      teamImagesPreview.innerHTML = '';

      // re-render ảnh preview
      teamImagesFiles.forEach((file, index) => renderImagePreview(file, index, teamImagesInput, teamImagesPreview, 'teamImages'));

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(teamMutationConstraints, teamImagesInput);
    }
  }
}

// TODO: RENDER
function renderImagePreview(file, index, input, preview, field) {
  // tạo preview hộp
  const previewHtml = `
    <div class="image-preview" data-index="${index}">
      <img src="" alt="Preview ${index + 1}">
      <button class="delete-btn" type="button" data-index="${index}">x</button>
    </div>
  `;
  preview.insertAdjacentHTML('beforeend', previewHtml);

  // gán src cho ảnh preview
  const previewElement = preview.querySelector(`[data-index="${index}"]`);
  const imgElement = previewElement.querySelector('img');
  const reader = new FileReader();
  reader.onload = (e) => {
    imgElement.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // tạo nút delete ảnh preview
  const deleteBtn = previewElement.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    const idx = parseInt(previewElement.dataset.index);

    if (field === 'teamImages') {
      // xóa file ra khỏi teamImagesFiles
      // cập nhập lại FileList cho 'teamImages'
      // gán dữ liệu  FileList mới vào 'teamImagesInput'

      teamImagesFiles.splice(idx, 1);
      const dataTransfer = new DataTransfer();
      teamImagesFiles.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
    } else if (field === 'teamImage') {
      input.value = '';
    }

    // re-render ảnh preview
    preview.innerHTML = '';
    if (field === 'teamImages') {
      teamImagesFiles.forEach((file, i) => renderImagePreview(file, i, input, preview, field));
    } else if (field === 'teamImage' && input.files.length > 0) {
      renderImagePreview(input.files[0], 0, input, preview, field);
    }

    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(teamMutationConstraints, input);
  });
}

// TODO: API
async function createTeam(formData) {
  await submitTeam(formData, '/api/admin/team/create', 'post', 'Thêm thành công');
}

async function updateTeam(formData) {
  await submitTeam(formData, `/api/admin/team/update/${formData.teamCode}`, 'put', 'Chỉnh sửa thành công');
}

async function submitTeam(formData, url, method, successMessage) {
  // add dự liệu input vào formData
  const postData = new FormData();
  const fields = ['teamName', 'teamAddress', 'provinceCode', 'userTypeCode', 'userCode', 'teamDescription'];
  fields.forEach((field) => postData.append(field, formData[field]));

  // add dữ liệu chuyên môn của xưởng kỹ thuật
  const userTypeKeyWord = document.querySelector('#userTypeCode option:checked')?.dataset.keyword;
  if (userTypeKeyWord == VARIABLE_ENUM.USER_TEAM_TYPE.TECHNICAL) {
    let teamDescriptionSpecial = {};
    if (typeof technicalTypes !== 'undefined' && Array.isArray(technicalTypes)) {
      technicalTypes.forEach(function (item) {
        const textareaElement = document.getElementById(item.keyOption);
        if (textareaElement) {
          teamDescriptionSpecial[item.keyOption.toLowerCase()] = textareaElement.value;
        }
      });
    }

    postData.append('teamDescriptionSpecial', JSON.stringify(teamDescriptionSpecial));
  } else {
    postData.append('teamDescriptionSpecial', null);
  }

  // đẩy teamImage, teamImages vào formData nếu có thay đổi
  if (formData.teamImage?.length) {
    postData.append('teamImage', formData.teamImage[0]);
  }
  if (formData.teamImages?.length) {
    Array.from(formData.teamImages).forEach((file) => {
      postData.append('teamImages', file);
    });
  }

  // disable button
  const submitBtn = document.querySelector('.btn-submit-lg');
  submitBtn.disabled = true;

  try {
    const response = await axios[method](url, postData, axiosAuth({ 'Content-Type': 'multipart/form-data' }));
    if (response.data) {
      toastOk(successMessage);
      reloadPage('/dashboard/user/teams');
    }
  } catch (error) {
    console.error(`error:`, error);
    if (error.response.data) {
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
      console.log('getUsersForTeamByType -- ', response);
      return response.data;
    })
    .catch(function (error) {
      console.error('getUsersForTeamByType --', error);
      return [];
    });
}
