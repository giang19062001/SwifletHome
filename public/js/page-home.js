let page = 1;
let limit = 10;
let categoryQuestions = [];
let homeImages = [];
let homeImage = null;
const pageElement = 'page-home';
const homeFormConstraints = {
  homeName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên nhà yến.' },
  },
  homeAddress: {
    presence: {
      allowEmpty: false,
      message: '^Vui lòng nhập vị trí nhà yến.',
    },
    length: {
      minimum: 5,
      message: '^Tên nhà yến phải có ít nhất 5 ký tự.',
    },
  },
  latitude: {
    presence: { message: '^Vui lòng nhập vĩ độ.' },
    numericality: {
      message: '^Vĩ độ phải là số hợp lệ.',
    },
  },
  longitude: {
    presence: { message: '^Vui lòng nhập kinh độ.' },
    numericality: {
      message: '^Kinh độ phải là số hợp lệ.',
    },
  },
  homeDescription: {
    presence: {
      allowEmpty: false,
      message: '^Vui lòng nhập mô tả',
    },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHome(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllHome(page, limit);
}
function bootFile(input, error) {
  const hasMultiple = input.multiple;
  input.addEventListener('change', function (e) {
    const files = e.target.files;

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.match('image.*')) {
          alert('Vui lòng chỉ chọn file ảnh!');
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} vượt quá kích thước cho phép (10MB)!`);
          continue;
        }

        if (hasMultiple) {
          // add file to homeImages[]
          homeImages.push(file);

          // render preview  img
          renderImagePreview(file);
        } else {
          homeImage = file;
        }
      }
      if (hasMultiple) {
        // Reset input file
        input.value = '';
      }

      // clear file error
      error.innerHTML = '';
    }
  });
}
// TODO: RENDER
async function showHomeModal(type, homeData) {
  // init modal
  const modalSelector =
    type === 'create' ? '.home-create-modal' : '.home-update-modal';
  const formSelector =
    type === 'create' ? 'home-create-form' : 'home-update-form';
  const modalEl = document.querySelector(modalSelector);

  // init file input
  const homeImagesInput = document.getElementById('homeImages');
  const homeImagesError = homeImagesInput.parentElement.querySelector(
    `[data-error="${homeImagesInput.id}"]`,
  );
  bootFile(homeImagesInput, homeImagesError);

  const homeImageInput = document.getElementById('homeImage');
  const homeImageError = homeImageInput.parentElement.querySelector(
    `[data-error="${homeImageInput.id}"]`,
  );
  bootFile(homeImageInput, homeImageError);

  // render image available
  if (type === 'update') {
    homeImages = homeData.homeImages ?? [];
    homeImage = homeData.homeImage ?? '';
    for (const file of homeImages) {
      renderImagePreview(file);
    }
  }

  // boostrap validation
  const homeValidator = new FormValidator(formSelector, homeFormConstraints);

  // submit
  homeValidator.setSubmitHandler((formData) => {
    // handle file  error
    if (!homeImage) {
      homeImageError.innerHTML = 'Vui lòng ảnh chính';
      return;
    } else {
      homeImageError.innerHTML = '';
    }

    if (homeImages.length == 0) {
      homeImagesError.innerHTML = 'Vui lòng chọn ảnh phụ';
      return;
    } else {
      homeImagesError.innerHTML = '';
    }

    // data to post
    console.log('homeImage', homeImage);
    console.log('homeImages:', homeImages);
    console.log('Submit:', formData);

    // CALL API
    createHome(formData, homeImage, homeImages);
  });

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  // reset form
  modalEl.addEventListener('hidden.bs.modal', function (event) {
    homeValidator.resetForm();
    homeImages = [];
    homeImage = null;
  });
  modal.show();
}

function renderImagePreview(file) {
  console.log('file', file);
  const homeImagesPreview = document.getElementById('homeImagesPreview');
  const reader = new FileReader();

  reader.onload = function (e) {
    const previewHtml = `
      <div class="image-preview">
        <img src="${e.target.result}" alt="Preview">
        <button class="delete-btn" type="button">×</button>
      </div>
    `;

    // add previewHtml to 'homeImagesPreview'
    homeImagesPreview.insertAdjacentHTML('beforeend', previewHtml);

    const previewJustInserd = homeImagesPreview.lastElementChild;
    const deleteBtn = previewJustInserd.querySelector('.delete-btn');

    // delete action
    deleteBtn.addEventListener('click', function () {
      // remove img from homeImages
      const index = homeImages.indexOf(file);
      if (index !== -1) {
        homeImages.splice(index, 1);
      }

      // remove preview from DOM
      previewJustInserd.remove();
    });
  };

  reader.readAsDataURL(file);
}

function renderAllHome(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.homeName}</p></td>
            <td><p>${ele.homeAddress}</p></td>
            <td><p>${ele.latitude}</p></td>
            <td><p>${ele.longitude}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out" onclick="getDetailHome('${ele.homeCode}')">Cập nhập</button>
                <button class="btn-out-err" onclick="deleteHome('${ele.homeCode}')">Xóa</button>
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
async function createHome(formData, homeImage, homeImages) {
  const postData = new FormData();
  postData.append('homeName', formData.homeName);
  postData.append('homeAddress', formData.homeAddress);
  postData.append('homeDescription', formData.homeDescription)
  postData.append('latitude', formData.latitude);
  postData.append('longitude', formData.longitude);
  postData.append('source', 'home');
  postData.append('createdId', user.userId);
  postData.append('homeImage', homeImage); // obj
  for (const file of homeImages) {
    postData.append('homeImages', file); // []
  }

  try {
    const response = await axios.post(
      '/api/admin/home/createHome',
      postData,
      axiosAuth({
        'Content-Type': 'multipart/form-data',
      }),
    );

    if (response.data) {
      // reload file list
      toastOk('Thêm thành công');
      setTimeout(() => {
        location.reload();
      }, 1500);
      console.log('Upload thành công!');
    } else {
      console.log('Upload thất bại: ' + result.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}
async function getAllHome(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  await axios
    .post(
      currentUrl + '/api/admin/home/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllHome(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailHome(homeCode) {
  await axios
    .get(currentUrl + '/api/admin/home/getDetail/' + homeCode, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        showHomeModal('update', response.data);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
async function deleteHome(homeCode) {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa nhà yến này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(currentUrl + `/api/admin/home/deleteHome/${homeCode}`, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllHome(page, limit);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
