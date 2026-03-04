const pageType = window.location.pathname.includes('/update') ? 'update' : 'create';
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
    quillPresence: { message: '^Vui lòng nhập mô tả.' },
  },
  homeImage: {
    filePresence: { message: '^Vui lòng chọn ảnh chính.' },
  },
  homeImages: {
    filePresence: { message: '^Vui lòng chọn ít nhất một ảnh phụ.' },
  },
};
let homeImagesFiles = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', () => {
  if (pageType === 'update') {
    // cho trạng thái chỉnh sửa
    initializeForm();
    assignForm(homeData);
  } else if (pageType === 'create') {
    // cho trạng thái thêm
    initializeForm();
  }
});

function initializeForm() {
  const form = document.getElementById(pageType === 'create' ? 'home-create-form' : 'home-update-form');
  const homeImagePreview = form.querySelector('#homeImagePreview');
  const homeImagesPreview = form.querySelector('#homeImagesPreview');
  const homeImageInput = form.querySelector('#homeImage');
  const homeImagesInput = form.querySelector('#homeImages');

  // gắn submit event cho form
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      homeName: form.querySelector('#homeName').value,
      homeAddress: form.querySelector('#homeAddress').value,
      latitude: form.querySelector('#latitude').value,
      longitude: form.querySelector('#longitude').value,
      homeDescription: quillGlobal.root.innerHTML,
      homeImage: form.querySelector('#homeImage').files,
      homeImages: form.querySelector('#homeImages').files,
      homeCode: pageType === 'update' ? homeData.homeCode : undefined,
    };

    // kiểm tra errors
    const isOk = checkingErrors(formData, homeMutationConstraints);
    if (!isOk) return;

    // submit
    if (pageType === 'update') {
      await updateHome(formData);
    } else if (pageType === 'create') {
      await createHome(formData);
    }
  });

  //  gắn validate event cho các input
  attachValidateForm(form, homeMutationConstraints);

  // gắn validate  cho các editor nếu có
  attachValidateEditor(form, 'homeDescription', homeMutationConstraints.homeDescription.quillPresence.message);

  homeImagesInput.addEventListener('change', () => {
    // thêm các file mới vào biến global 'homeImagesFiles'
    const addedFiles = Array.from(homeImagesInput.files);
    homeImagesFiles = homeImagesFiles.concat(addedFiles);

    // cập nhập lại FileList
    const dataTransfer = new DataTransfer();
    homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
    homeImagesInput.files = dataTransfer.files;

    // re-render ảnh preview
    homeImagesPreview.innerHTML = '';
    homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));

    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(homeMutationConstraints, homeImagesInput);
  });

  homeImageInput.addEventListener('change', () => {
    // re-render ảnh preview
    homeImagePreview.innerHTML = '';
    if (homeImageInput.files.length > 0) {
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

  // reset các biến
  clearErrors();
  homeImagesFiles = [];
  homeImageInput.value = '';
  homeImagesInput.value = '';

  // điền giá trị các input bằng dữ liệu từ API
  form.querySelector('#homeName').value = homeData.homeName || '';
  form.querySelector('#homeAddress').value = homeData.homeAddress || '';
  form.querySelector('#latitude').value = homeData.latitude || '';
  form.querySelector('#longitude').value = homeData.longitude || '';
  quillGlobal.root.innerHTML = quillGlobal && homeData.homeDescription ? homeData.homeDescription : '';

  // homeImage
  if (pageType === 'update' && homeData.homeImage) {
    const file = await ChangeUrlToFile(homeData.homeImage.filename);
    if (file) {
      // cập nhập FileList cho homeImage
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      homeImageInput.files = dataTransfer.files;

      // re-render ảnh preview
      renderImagePreview(file, 0, homeImageInput, homeImagePreview, 'homeImage');

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(homeMutationConstraints, homeImageInput);
    }
  }

  // homeImages
  if (pageType === 'update' && homeData.homeImages && Array.isArray(homeData.homeImages)) {
    const files = await Promise.all(homeData.homeImages.map((img) => ChangeUrlToFile(img.filename)));
    homeImagesFiles = files.filter((file) => file !== null);

    if (homeImagesFiles.length > 0) {
      // cập nhập FileList cho homeImages
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
      homeImagesInput.files = dataTransfer.files;
      homeImagesPreview.innerHTML = '';

      // re-render ảnh preview
      homeImagesFiles.forEach((file, index) => renderImagePreview(file, index, homeImagesInput, homeImagesPreview, 'homeImages'));

      // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
      validateField(homeMutationConstraints, homeImagesInput);
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

    if (field === 'homeImages') {
      // xóa file ra khỏi homeImagesFiles
      // cập nhập lại FileList cho 'homeImages'
      // gán dữ liệu  FileList mới vào 'homeImagesInput'

      homeImagesFiles.splice(idx, 1);
      const dataTransfer = new DataTransfer();
      homeImagesFiles.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
    } else if (field === 'homeImage') {
      input.value = '';
    }

    // re-render ảnh preview
    preview.innerHTML = '';
    if (field === 'homeImages') {
      homeImagesFiles.forEach((file, i) => renderImagePreview(file, i, input, preview, field));
    } else if (field === 'homeImage' && input.files.length > 0) {
      renderImagePreview(input.files[0], 0, input, preview, field);
    }

    // re-check lại validation -> nếu có file - xóa lỗi, ko có file - hiện lỗi
    validateField(homeMutationConstraints, input);
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
  // add dự liệu input vào formData
  const postData = new FormData();
  const fields = ['homeName', 'homeAddress', 'homeDescription', 'latitude', 'longitude'];
  fields.forEach((field) => postData.append(field, formData[field]));

  // đẩy homeImage, homeImages vào formData nếu có thay đổi
  if (formData.homeImage?.length) {
    postData.append('homeImage', formData.homeImage[0]);
  }
  if (formData.homeImages?.length) {
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
      reloadPage('/dashboard/home/sale');
    }
  } catch (error) {
    console.error(`error:`, error);
    if (error.response.data) {
      toastErr(error.response.data.message);
    }
    submitBtn.disabled = false;
  }
}
