const pageType = window.location.pathname.includes('/update') ? 'update' : 'create';
let homeImagesFiles = []; // Track newly added files for homeImages

const homeFormConstraints = {
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
  initializeForm();
  if (pageType === 'update') {
    assignForm(homeData);
  }
});

function initializeForm() {
  const form = document.getElementById(pageType === 'create' ? 'home-create-form' : 'home-update-form');
  const homeImagePreview = form.querySelector('#homeImagePreview');
  const homeImagesPreview = form.querySelector('#homeImagesPreview');
  const homeImageInput = form.querySelector('#homeImage');
  const homeImagesInput = form.querySelector('#homeImages');

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
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

    const errors = validate(formData, homeFormConstraints);
    if (!descriptionText) {
      if (!errors) errors = {};
      errors.homeDescription = ['Vui lòng nhập mô tả.']; // set error
    }
    if (errors) {
      displayErrors(errors);
      return;
    }

    clearErrors();
    if (pageType === 'update') {
      await updateHome(formData);
    } else {
      await createHome(formData);
    }
  });

  // Real-time validation for inputs
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => validateField(homeFormConstraints, input));
  });

  // validate for homeDescription
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
  // Preview home images 'CHANGE EVENT'
  homeImagesInput.addEventListener('change', () => {
    // Append new files to homeImagesFiles
    const addedFiles = Array.from(homeImagesInput.files);
    homeImagesFiles = homeImagesFiles.concat(addedFiles);

    // Update FileList
    const dataTransfer = new DataTransfer();
    homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
    homeImagesInput.files = dataTransfer.files;

    // Re-render all previews
    homeImagesPreview.innerHTML = '';
    homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));

    validateField(homeFormConstraints, homeImagesInput);
  });

  // Preview home image 'CHANGE EVENT'
  homeImageInput.addEventListener('change', () => {
    homeImagePreview.innerHTML = '';
    if (homeImageInput.files.length > 0) {
      renderImagePreview(homeImageInput.files[0], 0, homeImageInput, homeImagePreview, 'homeImage');
    }
    validateField(homeFormConstraints, homeImageInput);
  });
}
// TODO: FUNC
async function assignForm(homeData) {
  const form = document.getElementById('home-update-form');
  const homeImagePreview = form.querySelector('#homeImagePreview');
  const homeImagesPreview = form.querySelector('#homeImagesPreview');
  const homeImageInput = form.querySelector('#homeImage');
  const homeImagesInput = form.querySelector('#homeImages');

  // Populate text fields
  form.querySelector('#homeName').value = homeData.homeName || '';
  form.querySelector('#homeAddress').value = homeData.homeAddress || '';
  form.querySelector('#latitude').value = homeData.latitude || '';
  form.querySelector('#longitude').value = homeData.longitude || '';
  // form.querySelector('#homeDescription').value = homeData.homeDescription || '';

  // set homeDescription value
  if (quillGlobal && homeData.homeDescription) {
    quillGlobal.root.innerHTML = homeData.homeDescription;
  }
  // Clear existing error messages
  document.querySelectorAll('.error-message').forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });

  // Reset image-related state
  homeImagesFiles = [];
  homeImageInput.value = '';
  homeImagesInput.value = '';

  // Handle homeImage
  if (pageType === 'update' && homeData.homeImage) {
    const file = await ChangeUrlToFile(homeData.homeImage.filename, 'images/homes');
    if (file) {
      // Update FileList for homeImage
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      homeImageInput.files = dataTransfer.files;
      renderImagePreview(file, 0, homeImageInput, homeImagePreview, 'homeImage');
      validateField(homeFormConstraints, homeImageInput);
    }
  }

  // Handle homeImages
  if (pageType === 'update' && homeData.homeImages && Array.isArray(homeData.homeImages)) {
    // assign homeImagesFiles from 'homeData'
    const files = await Promise.all(homeData.homeImages.map((img) => ChangeUrlToFile(img.filename, 'images/homes')));
    homeImagesFiles = files.filter((file) => file !== null);
    if (homeImagesFiles.length > 0) {
      // Update FileList for  homeImages
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
      homeImagesInput.files = dataTransfer.files;
      homeImagesPreview.innerHTML = '';
      homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));
      validateField(homeFormConstraints, homeImagesInput);
    }
  }
}

// TODO: RENDER
function renderImagePreview(file, index, input, preview, field) {
  const previewHtml = `
    <div class="image-preview" data-index="${index}">
      <img src="" alt="Preview ${index + 1}">
      <button class="delete-btn" type="button" data-index="${index}">x</button>
    </div>
  `;
  preview.insertAdjacentHTML('beforeend', previewHtml);

  const previewElement = preview.querySelector(`[data-index="${index}"]`);
  const imgElement = previewElement.querySelector('img');

  // show file preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imgElement.src = e.target.result;
  };
  reader.readAsDataURL(file);

  const deleteBtn = previewElement.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    const idx = parseInt(previewElement.dataset.index);
    if (field === 'homeImages') {
      homeImagesFiles.splice(idx, 1); // remove file from homeImagesFiles
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file)); // update FileList for 'homeImages' again
      input.files = dataTransfer.files;
    } else {
      input.value = ''; // Clear "homeImage" input
    }

    // Re-render previews
    preview.innerHTML = '';
    if (field === 'homeImages') {
      homeImagesFiles.forEach((file, i) => renderImagePreview(file, i, input, preview, field));
    } else if (field === 'homeImage' && input.files.length > 0) {
      renderImagePreview(input.files[0], 0, input, preview, field);
    }

    // Validate field
    const errors = validate.single(input.files, homeFormConstraints[field]);
    const errorElement = document.querySelector(`[data-error="${field}"]`);
    if (errorElement) {
      errorElement.textContent = errors ? errors[0] : '';
      errorElement.style.display = errors ? 'block' : 'none';
    }
  });
}

// TODO: API
async function createHome(formData) {
  await submitHome(formData, '/api/admin/home/create', 'post', 'Thêm thành công');
}

async function updateHome(formData) {
  await submitHome(formData, `/api/admin/home/update/${formData.homeCode}`, 'put', 'Chỉnh sửa thành công');
}

async function submitHome(formData, url, method, successMessage) {
  console.log('formData', formData);
  const postData = new FormData();
  const fields = ['homeName', 'homeAddress', 'homeDescription', 'latitude', 'longitude'];
  fields.forEach((field) => postData.append(field, formData[field]));
  postData.append(method == 'post' ? 'createdId' : 'updatedId', user.userId);
  if (formData.homeImage?.length) {
    postData.append('homeImage', formData.homeImage[0]);
    Array.from(formData.homeImages).forEach((file) => {
      postData.append('homeImages', file);
    });
  }
  try {
    const response = await axios[method](url, postData, axiosAuth({ 'Content-Type': 'multipart/form-data' }));
    if (response.data) {
      toastOk(successMessage);
      reloadPage('/dashboard/home/list');
    } else {
      toastErr(`Lỗi khi ${method === 'post' ? 'tạo' : 'Chỉnh sửa'} nhà yến`);
    }
  } catch (error) {
    console.error(`error:`, error);
     if (error.response.data) {
      toastErr(error.response.data.message);
    }
  }
  
}
