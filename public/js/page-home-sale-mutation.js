const pageType = window.location.pathname.includes('/update') ? 'update' : 'create';
let homeImagesFiles = []; // Theo dõi các file mới được thêm vào cho homeImages
const homeMutationConstraints = {
  homeName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên nhà yến.' },
  },
  homeAddress: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập vị trí nhà yến.' },
    length: { minimum: 5, message: '^Tên nhà yến phải có ít nhất 5 ký tự.' },
  },
  latitude: {
    presence: { message: '^Vui lòng nhập vĩ độ.' },
    numericality: { message: '^Vĩ độ phải là số hợp lệ.' },
  },
  longitude: {
    presence: { message: '^Vui lòng nhập kinh độ.' },
    numericality: { message: '^Kinh độ phải là số hợp lệ.' },
  },
  homeDescription: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập mô tả.' },
  },
  homeImage: {
    filePresence: { message: '^Vui lòng chọn ảnh chính.' },
  },
  homeImages: {
    filePresence: { message: '^Vui lòng chọn ít nhất một ảnh phụ.' },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', () => {
  // cho trạng thái thêm
  initializeForm();
  if (pageType === 'update') {
    // cho trạng thái chỉnh sửa
    assignForm(homeData);
  }
});

function initializeForm() {
  const form = document.getElementById(pageType === 'create' ? 'home-create-form' : 'home-update-form');
  const homeImagePreview = form.querySelector('#homeImagePreview');
  const homeImagesPreview = form.querySelector('#homeImagesPreview');
  const homeImageInput = form.querySelector('#homeImage');
  const homeImagesInput = form.querySelector('#homeImages');

  // gắn event khi form submit
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // lấy từ quill editor
    const descriptionHTML = quillGlobal.root.innerHTML;
    const descriptionText = quillGlobal.getText().trim();
    const formData = {
      homeName: form.querySelector('#homeName').value,
      homeAddress: form.querySelector('#homeAddress').value,
      latitude: form.querySelector('#latitude').value,
      longitude: form.querySelector('#longitude').value,
      // homeDescription: form.querySelector('#homeDescription').value,
      homeDescription: descriptionHTML,
      homeImage: form.querySelector('#homeImage').files,
      homeImages: form.querySelector('#homeImages').files,
      homeCode: pageType === 'update' ? homeData.homeCode : undefined,
    };

    // kiểm tra validate input
    let errors = validate(formData, homeMutationConstraints);
    if (!descriptionText) {
      if (!errors) errors = {};
      errors.homeDescription = ['Vui lòng nhập mô tả.'];
    }
    // nếu có lỗi -> hiện lỗi
    if (errors) {
      displayErrors(errors);
      return;
    }

    // ko lỗi - clear lỗi
    clearErrors();
    // submit
    if (pageType === 'update') {
      await updateHome(formData);
    } else {
      await createHome(formData);
    }
  });

  //  gắn sự kiện tự động validate của các input real-time
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => validateField(homeMutationConstraints, input));
  });

  //  gắn sự kiện tự động validate của quill editor
  if (quillGlobal) {
    quillGlobal.on('text-change', () => {
      const errEl = form.querySelector('[data-error="homeDescription"]');
      const hasText = quillGlobal.getText().trim().length > 0;
      if (hasText) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      } else {
        errEl.textContent = 'Vui lòng nhập mô tả.';
        errEl.style.display = 'block';
      }
    });
  }
  // lắng nghe sự kiện thay đổi của homeImagesFiles
  homeImagesInput.addEventListener('change', () => {
    // thêm các file mới vào homeImagesFiles
    const addedFiles = Array.from(homeImagesInput.files);
    homeImagesFiles = homeImagesFiles.concat(addedFiles);

    // cập nhập lại FileList của homeImagesFiles
    const dataTransfer = new DataTransfer();
    homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
    homeImagesInput.files = dataTransfer.files;

    // Re-render các ảnh preview của homeImagesFiles
    homeImagesPreview.innerHTML = '';
    homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));

    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(homeMutationConstraints, homeImagesInput);
  });

  // lắng nghe sự kiện thay đổi của homeImageInput
  homeImageInput.addEventListener('change', () => {
    homeImagePreview.innerHTML = '';
    if (homeImageInput.files.length > 0) {
      // Re-render  ảnh preview của homeImageInput
      renderImagePreview(homeImageInput.files[0], 0, homeImageInput, homeImagePreview, 'homeImage');
    }
    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(homeMutationConstraints, homeImageInput);
  });
}
// TODO: FUNC
async function assignForm(homeData) {
  const form = document.getElementById('home-update-form');
  const homeImagePreview = form.querySelector('#homeImagePreview');
  const homeImagesPreview = form.querySelector('#homeImagesPreview');
  const homeImageInput = form.querySelector('#homeImage');
  const homeImagesInput = form.querySelector('#homeImages');

  // điền giá trị các input bằng dữ liệu từ API
  form.querySelector('#homeName').value = homeData.homeName || '';
  form.querySelector('#homeAddress').value = homeData.homeAddress || '';
  form.querySelector('#latitude').value = homeData.latitude || '';
  form.querySelector('#longitude').value = homeData.longitude || '';
  // form.querySelector('#homeDescription').value = homeData.homeDescription || '';

  // cập nhập editor bằng dữ liệu từ API
  if (quillGlobal && homeData.homeDescription) {
    quillGlobal.root.innerHTML = homeData.homeDescription;
  }
  // xóa các lỗi
  document.querySelectorAll('.error-message').forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });

  // reset các biến liên quan về ảnh, file
  homeImagesFiles = [];
  homeImageInput.value = '';
  homeImagesInput.value = '';

  // gán giá trị homeImage với dữ liệu từ API
  if (pageType === 'update' && homeData.homeImage) {
    // lấy đường dẫn từ filename -> trả ra file
    const file = await ChangeUrlToFile(homeData.homeImage.filename);
    if (file) {
      // cập nhập FileList cho homeImage
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      homeImageInput.files = dataTransfer.files;

      // Re-render ảnh preview của homeImageInput
      renderImagePreview(file, 0, homeImageInput, homeImagePreview, 'homeImage');

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(homeMutationConstraints, homeImageInput);
    }
  }

  // gán giá trị homeImageS với dữ liệu từ API
  if (pageType === 'update' && homeData.homeImages && Array.isArray(homeData.homeImages)) {
    // lấy đường dẫn từ filename -> trả ra file list
    const files = await Promise.all(homeData.homeImages.map((img) => ChangeUrlToFile(img.filename)));
    homeImagesFiles = files.filter((file) => file !== null);
    if (homeImagesFiles.length > 0) {
      // cập nhập FileList cho homeImages
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
      homeImagesInput.files = dataTransfer.files;
      homeImagesPreview.innerHTML = '';

      // Re-render TỪNG ảnh preview của homeImagesFiles
      homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(homeMutationConstraints, homeImagesInput);
    }
  }
}

// TODO: RENDER
function renderImagePreview(file, index, input, preview, field) {
  // tạo preview element
  const previewHtml = `
    <div class="image-preview" data-index="${index}">
      <img src="" alt="Preview ${index + 1}">
      <button class="delete-btn" type="button" data-index="${index}">x</button>
    </div>
  `;
  preview.insertAdjacentHTML('beforeend', previewHtml);

  const previewElement = preview.querySelector(`[data-index="${index}"]`);
  const imgElement = previewElement.querySelector('img');

  // hiện ảnh preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imgElement.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // tạo nút delete và gán trên ảnh preview
  const deleteBtn = previewElement.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    const idx = parseInt(previewElement.dataset.index);
    // nếu sự kiện xóa được nhấn  cho homeImages
    if (field === 'homeImages') {
      homeImagesFiles.splice(idx, 1); // nếu sự kiện xóa được nhấn -> xóa file ra khỏi homeImagesFiles dựa vào index
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file)); // cập nhập lại FileList cho 'homeImages'
      input.files = dataTransfer.files; // gán lại vào input của homeImages
    } else {
      // nếu sự kiện xóa được nhấn  cho homeImage
      input.value = ''; // chỉ cần reset input
    }

    // Re-render ảnh của  homeImages và homeImage
    preview.innerHTML = '';
    if (field === 'homeImages') {
      homeImagesFiles.forEach((file, i) => renderImagePreview(file, i, input, preview, field));
    } else if (field === 'homeImage' && input.files.length > 0) {
      renderImagePreview(input.files[0], 0, input, preview, field);
    }

    // kiểm tra lỗi nếu có thì hiện , ko có thì xóa lỗi
    const errors = validate.single(input.files, homeMutationConstraints[field]);
    const errorElement = document.querySelector(`[data-error="${field}"]`);
    if (errorElement) {
      errorElement.textContent = errors ? errors[0] : '';
      errorElement.style.display = errors ? 'block' : 'none';
    }
  });
}

// TODO: API
async function createHome(formData) {
  await submitHome(formData, '/api/admin/homeSale/create', 'post', 'Thêm thành công');
}

async function updateHome(formData) {
  await submitHome(formData, `/api/admin/homeSale/update/${formData.homeCode}`, 'put', 'Chỉnh sửa thành công');
}

async function submitHome(formData, url, method, successMessage) {
  // thêm dự liệu input vào formData
  const postData = new FormData();
  const fields = ['homeName', 'homeAddress', 'homeDescription', 'latitude', 'longitude'];
  fields.forEach((field) => postData.append(field, formData[field]));

  // nếu có cập nhập file của homeImage hoặc homeImages -> đẩy vào formData
  if (formData.homeImage?.length) {
    postData.append('homeImage', formData.homeImage[0]);
    Array.from(formData.homeImages).forEach((file) => {
      postData.append('homeImages', file);
    });
  }

  // disable button
  const submitBtn = document.querySelector('.btn-submit-lg');
  submitBtn.disabled = true;

  try {
    const response = await axios[method](url, postData, axiosAuth({ 'Content-Type': 'multipart/form-data' }));
    if (response.data) {
      toastOk(successMessage);
      // về trang danh sache
      reloadPage('/dashboard/home/sale');
    } 
  } catch (error) {
    console.error(`error:`, error);
    if (error.response.data) {
      toastErr(error.response.data.message);
    }
    submitBtn.disabled = false; // bật lại button
  } finally {
    // submitBtn.disabled = false; // bật lại button
  }
}
