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

document.addEventListener('DOMContentLoaded', function () {
  console.log('screenData', screenData);

  // kiểm tra danh sách fileds
  if ('screenContent' in screenData) {
    mapContentFileds(screenData.screenContent);
  }

  // mark active key đầu tiên
  markFristKeyActive();

  // render danh sách content của keyword
  renderContentFileds();

  //  kiểm tra validation của các input real-time
  let form = document.querySelector(`${pageElement} .card .card-body`);
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => validateField(screenMutationConstraints, input));
  });
});

// TODO: FUNC
function showNameOfKey(key) {
  let name = '';
  switch (key) {
    case 'contentEnd':
      name = 'Nội dung cuối';
      break;
    case 'contentStart':
      name = 'Nội dung đầu';
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
        contentStart: data.contentStart ?? '',
        contentEnd: data.contentEnd ?? '',
      };
      break;
    default:
      screenContent = {};
  }
}

function markFristKeyActive() {
  const keys = Object.keys(screenContent);
  if (keys.length > 0) {
    // key đầu tiên
    const firstKey = keys[0];
    markKeyContent(firstKey);
  }
}

function markKeyContent(key) {
  // gán giá trị đang hiển thị trong editor cho keyActive hiện tại trước khi đổi sang key khác
  if (keyActive) {
    screenContent[keyActive] = getEditorContent();
  }

  keyActive = String(key);

  // lấy content từ screenContent dựa key
  const content = screenContent[keyActive];
  console.log('content', content);

  // set giá trị cho quill editor
  setEditorContent(content);

  // render lại để cập nhật class .active
  renderContentFileds();

  // render ra bong bóng preview
  renderContentHtml();
}

function renderContentHtml() {
  // lấy content từ editor
  screenContent[keyActive] = getEditorContent();
  // set content cho bong bóng preview với tất cả fields hiện có
  document.getElementById('content-message').innerHTML = '';
  let HTML = ``;
  Object.entries(screenContent).forEach(([key, value]) => {
    HTML += value;
  });
  document.getElementById('content-message').innerHTML = HTML;
}

// TODO: RENDER
function renderContentFileds() {
  const selector = `${pageElement} .contents .space-box`;
  let parentBox = document.querySelector(selector);

  // Reset
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

  // thêm hiệu ứng click cho button
  parentBox.querySelectorAll('[data-set-key]').forEach((btn) => {
    btn.onclick = (e) => {
      const k = btn.getAttribute('data-set-key');
      markKeyContent(k);
    };
  });
}

// TODO: API
async function updateScreen() {
  renderContentHtml(); // cập nhập lại nội dung của từng key trong screenContent

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
          screenContent,
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
