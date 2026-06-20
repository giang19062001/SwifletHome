const pageElement = '#page-screen-mutation';
const params = new URLSearchParams(CURRENT_PARAMS);
const screenKeyword = params.get('screen-keyword');
const screenMutationConstraints = {
  screenName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên màn hình.' },
  },
  screenDescription: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập mô tả.' },
  },
};
let screenContent = {};
let keyActive = '';
let dynamicContentCenter = {};
let videosList = [];

document.addEventListener('DOMContentLoaded', function () {
  console.log('screenData', screenData);

  if (screenData.screenTeamplateKeyword === 'BANNER_VIDEOS_TEXT') {
    document.querySelectorAll('.ui-quill-group').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.ui-dynamic-group').forEach(el => el.classList.remove('d-none'));
    
    initDynamicUI();
  } else {
    document.querySelectorAll('.ui-quill-group').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.ui-dynamic-group').forEach(el => el.classList.add('d-none'));

    // map dữ liệu từ 3 cột riêng biệt
    mapContentFileds(screenData);

    // mark active key đầu tiên
    markFristKeyActive();

    // render danh sách content của keyword
    renderContentFileds();
  }

  // kiểm tra validation của các input real-time
  let form = document.querySelector(`${pageElement} .card .card-body`);
  if (form) {
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => validateField(screenMutationConstraints, input));
    });
  }
});

// ==========================================
// TODO: FUNC
// ==========================================

function showNameOfKey(key) {
  let name = '';
  switch (key) {
    case 'contentEnd':
      name = 'Nội dung cuối';
      break;
    case 'contentStart':
      name = 'Nội dung đầu';
      break;
    case 'contentCenter':
      name = 'Nội dung giữa';
      break;
    default:
      name = '';
  }
  return name;
}

function mapContentFileds(data) {
  switch (screenKeyword) {
    case 'SIGNUP_SERVICE':
      screenContent = {
        contentStart: data.contentStart ?? '',
        contentEnd: data.contentEnd ?? '',
      };
      break;
    case 'REQUEST_DOCTOR':
      screenContent = {
        contentCenter: data.contentCenter ?? '',
      };
      break;
    case 'REQUEST_QR_GUIDE':
      screenContent = {
        contentStart: data.contentStart ?? '',
      };
      break;
    case 'CONSIGNMENT_GUIDE':
       screenContent = {
        contentStart: data.contentStart ?? '',
      };
      break;
    case 'USER_TYPE_NOT_REGISTER':
       screenContent = {
        contentStart: data.contentStart ?? '',
      };
      break;
    default:
      screenContent = {};
  }
}

function markFristKeyActive() {
  const keys = Object.keys(screenContent);
  if (keys.length > 0) {
    const firstKey = keys[0];
    markKeyContent(firstKey);
  }
}

function markKeyContent(key) {
  if (keyActive) {
    screenContent[keyActive] = getEditorContent();
  }
  keyActive = String(key);
  const content = screenContent[keyActive];
  setEditorContent(content);
  renderContentFileds();
  renderContentHtml();
}

function initDynamicUI() {
  const center = screenData.contentCenter || {};
  dynamicContentCenter = typeof center === 'string' ? JSON.parse(center) : center;
  
  // Banner
  if (dynamicContentCenter.banner) {
    const bannerUrl = dynamicContentCenter.banner;
    const finalBannerUrl = bannerUrl.startsWith('/') ? bannerUrl : '/' + bannerUrl;
    document.getElementById('bannerPreview').src = CURRENT_URL + finalBannerUrl;
    document.getElementById('bannerPreview').style.display = 'block';
    document.getElementById('bannerUrl').value = bannerUrl;
  }

  // Dynamic Fields
  const container = document.getElementById('dynamicFieldsContainer');
  container.innerHTML = '<h5 class="card-title">Thông tin</h5>';
  Object.keys(dynamicContentCenter).forEach(key => {
    if (key === 'banner' || key === 'listVideo') return;
    
    const value = dynamicContentCenter[key];
    const id = 'dyn_' + key;
    
    const html = `
      <div class="mb-3">
        <label for="${id}" class="form-label">${key}</label>
        <textarea id="${id}" class="form-control" rows="3" data-key="${key}">${value}</textarea>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });

  // Load Videos
  loadVideos();
}

function initSortable() {
  const container = document.getElementById('videoListContainer');
  if (typeof Sortable !== 'undefined' && container) {
    if (container.sortableInstance) {
      container.sortableInstance.destroy();
    }
    container.sortableInstance = Sortable.create(container, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: async function (evt) {
        const items = Array.from(container.querySelectorAll('.video-item'));
        const sortData = items.map((item, index) => ({
          seq: parseInt(item.getAttribute('data-seq')),
          sortOrder: index + 1
        }));

        await updateVideoSortOrderApi(sortData);
      }
    });
  }
}

function editVideo(v) {
  document.getElementById('videoSeq').value = v.seq;
  document.getElementById('videoName').value = v.name;
  document.getElementById('videoAddress').value = v.address;
  document.getElementById('videoTitle').value = v.videoTitle;
  document.getElementById('videoUrl').value = v.videoUrl;
}

function resetVideoForm() {
  document.getElementById('videoSeq').value = '';
  document.getElementById('videoName').value = '';
  document.getElementById('videoAddress').value = '';
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoUrl').value = '';
}

// ==========================================
// TODO: RENDER
// ==========================================

function renderContentHtml() {
  screenContent[keyActive] = getEditorContent();
  document.getElementById('content-message').innerHTML = '';
  let HTML = ``;
  Object.entries(screenContent).forEach(([key, value]) => {
    HTML += value;
  });
  document.getElementById('content-message').innerHTML = HTML;
}

function renderContentFileds() {
  const selector = `${pageElement} .contents .space-box`;
  let parentBox = document.querySelector(selector);
  parentBox.innerHTML = '';

  Object.entries(screenContent).forEach(([key, value]) => {
    const isKeyActive = String(keyActive) === String(key);
    const html = `
      <div class="file-box" data-key="${key}">
        <div class="file-card">
          <div class="file-icon">  
          <svg class="${isKeyActive ? 'active' : ''}" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="none" />
                  <g transform="matrix(0.5 0 0 0.5 12 12)">
                      <path transform="translate(-25, -25)" d="M 8 5 C 6.3550302 5 5 6.3550302 5 8 L 5 42 C 5 43.64497 6.3550302 45 8 45 L 42 45 C 43.64497 45 45 43.64497 45 42 L 45 8 C 45 6.3550302 43.64497 5 42 5 L 8 5 z 
                      M 8 7 L 42 7 C 42.56503 7 43 7.4349698 43 8 L 43 42 C 43 42.56503 42.56503 43 42 43 L 8 43 C 7.4349698 43 7 42.56503 7 42 L 7 8 C 7 7.4349698 7.4349698 7 8 7 z 
                      M 11 12 L 11 14 L 37 14 L 37 12 L 11 12 z 
                      M 11 18 L 11 20 L 28 20 L 28 18 L 11 18 z 
                      M 11 24 L 11 26 L 37 26 L 37 24 L 11 24 z 
                      M 11 30 L 11 32 L 28 32 L 28 30 L 11 30 z 
                      M 11 36 L 11 38 L 37 38 L 37 36 L 11 36 z" stroke-width="0.75"
                      stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
                    </g>
               </svg>
          </div>
          <div class="file-info">
            <div class="file-name ${isKeyActive ? 'active' : ''}">${showNameOfKey(key)}</div>
          </div>
          <div class="file-button">
            <button class="copy-btn btn-edit-out" data-set-key="${key}">Chỉnh sửa</button>
          </div>
        </div>
      </div>
    `;
    parentBox.insertAdjacentHTML('beforeend', html);
  });

  parentBox.querySelectorAll('[data-set-key]').forEach((btn) => {
    btn.onclick = (e) => {
      const k = btn.getAttribute('data-set-key');
      markKeyContent(k);
    };
  });
}

function renderVideoList() {
  const container = document.getElementById('videoListContainer');
  container.innerHTML = '';
  videosList.forEach((v, index) => {
    container.innerHTML += `
      <div class="card mb-2 border video-item" data-seq="${v.seq}" data-sort="${v.sortOrder}">
        <div class="card-body py-2 px-3 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span class="drag-handle me-3" style="cursor: grab; font-size: 1.2rem; color: #888;">☰</span>
            <div>
              <strong>${v.name}</strong> - ${v.address} <br>
              <small>${v.videoTitle}</small>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <a href="${v.videoUrl}" target="_blank" class="me-3 d-flex align-items-center" title="Xem video">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f75270" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 8.5s0-2.5-2-3.5c-1.5-1-8-1-8-1s-6.5 0-8 1C2 6.5 2 8.5 2 8.5v7s0 2.5 2 3.5c1.5 1 8 1 8 1s6.5 0 8-1c2-1 2-3.5 2-3.5v-7z"></path>
                <polygon points="10 15 15 12 10 9 10 15"></polygon>
              </svg>
            </a>
            <button class="btn btn-sm btn-edit me-2" onclick='editVideo(${JSON.stringify(v)})'>Sửa</button>
            <button class="btn btn-sm btn-error" onclick='deleteVideo(${v.seq})'>Xoá</button>
          </div>
        </div>
      </div>
    `;
  });

  initSortable();
}

// ==========================================
// TODO: API
// ==========================================

async function updateScreen() {
  renderContentHtml();
  try {
    const formData = {
      screenName: document.querySelector('#screenName').value,
      screenDescription: document.querySelector('#screenDescription').value,
    };

    const errors = validate(formData, screenMutationConstraints);
    if (errors) {
      displayErrors(errors);
      return;
    }
    await axios
      .put(
        CURRENT_URL + '/api/admin/screen/update/' + screenKeyword,
        {
          screenName: formData.screenName,
          screenDescription: formData.screenDescription,
          contentStart: screenContent.contentStart ?? null,
          contentCenter: screenContent.contentCenter ?? null,
          contentEnd: screenContent.contentEnd ?? null,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        toastOk('Chỉnh sửa thành công');
        reloadPage('/dashboard/config/screen');
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log('err', error);
  }
}

async function uploadBanner(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('screenImage', file);

  try {
    const config = axiosAuth();
    config.headers['Content-Type'] = 'multipart/form-data';
    const res = await axios.post(CURRENT_URL + '/api/admin/screen/uploadScreenImage/' + screenKeyword, formData, config);
    
    const responseData = res.data?.data || res.data;
    if (responseData && responseData.url) {
      const finalUrl = responseData.url.startsWith('/') ? responseData.url : '/' + responseData.url;
      document.getElementById('bannerUrl').value = responseData.url;
      document.getElementById('bannerPreview').src = CURRENT_URL + finalUrl;
      document.getElementById('bannerPreview').style.display = 'block';
      toastOk('Upload và lưu ảnh thành công!');
    } else {
      toastErr('Không nhận được đường dẫn ảnh');
    }
  } catch (error) {
    console.error(error);
    toastErr('Upload ảnh thất bại');
  }
}

async function updateScreenDynamic() {
  const formData = {
    screenName: document.querySelector('#screenName').value,
    screenDescription: document.querySelector('#screenDescription').value,
  };

  const errors = validate(formData, screenMutationConstraints);
  if (errors) {
    displayErrors(errors);
    return;
  }

  const newContentCenter = { ...dynamicContentCenter };
  newContentCenter.banner = document.getElementById('bannerUrl').value;
  
  document.querySelectorAll('#dynamicFieldsContainer textarea').forEach(ta => {
    newContentCenter[ta.getAttribute('data-key')] = ta.value;
  });

  try {
    await axios.put(
      CURRENT_URL + '/api/admin/screen/update/' + screenKeyword,
      {
        screenName: formData.screenName,
        screenDescription: formData.screenDescription,
        contentStart: null,
        contentCenter: newContentCenter,
        contentEnd: screenData.contentEnd ?? null,
      },
      axiosAuth(),
    );
    toastOk('Chỉnh sửa thành công');
    reloadPage('/dashboard/config/screen');
  } catch (error) {
    console.log('error', error);
  }
}

async function loadVideos() {
  try {
    const res = await axios.get(CURRENT_URL + '/api/admin/screen/' + screenKeyword + '/video/getAll', axiosAuth());
    videosList = res.data;
    renderVideoList();
  } catch (error) {
    console.error(error);
  }
}

async function saveVideo() {
  const seq = document.getElementById('videoSeq').value;
  const dto = {
    name: document.getElementById('videoName').value,
    address: document.getElementById('videoAddress').value,
    videoTitle: document.getElementById('videoTitle').value,
    videoUrl: document.getElementById('videoUrl').value,
  };

  try {
    if (seq) {
      await axios.put(CURRENT_URL + '/api/admin/screen/' + screenKeyword + '/video/update/' + seq, dto, axiosAuth());
      toastOk('Cập nhật video thành công');
    } else {
      await axios.post(CURRENT_URL + '/api/admin/screen/' + screenKeyword + '/video/create', dto, axiosAuth());
      toastOk('Thêm video thành công');
    }
    resetVideoForm();
    loadVideos();
  } catch (error) {
    console.error(error);
    toastErr('Lỗi khi lưu video');
  }
}

async function deleteVideo(seq) {
  if (!confirm('Bạn có chắc muốn xóa video này?')) return;
  try {
    await axios.delete(CURRENT_URL + '/api/admin/screen/' + screenKeyword + '/video/delete/' + seq, axiosAuth());
    toastOk('xóa thành công');
    loadVideos();
  } catch (error) {
    console.error(error);
    toastErr('Lỗi khi xóa video');
  }
}

async function updateVideoSortOrderApi(sortData) {
  try {
    await axios.put(CURRENT_URL + '/api/admin/screen/' + screenKeyword + '/video/updateSort', { items: sortData }, axiosAuth());
    toastOk('Cập nhật thứ tự thành công');
    videosList.forEach(v => {
      const found = sortData.find(s => s.seq === v.seq);
      if (found) v.sortOrder = found.sortOrder;
    });
    videosList.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error(error);
    toastErr('Cập nhật thứ tự thất bại');
  }
}
