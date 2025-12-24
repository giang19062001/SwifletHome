const pageElement = 'page-notification';
let userList = [];
const notificationConstraints = {
  title: {
    presence: { allowEmpty: false, message: '^Vui lòng tiêu đề thông báo.' },
  },
  body: {
    presence: { allowEmpty: false, message: '^Vui lòng nội dung thông báo.' },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllUser(0, 0);
  initSendTypeEvent();
  initSubmitForm();
});

// TODO: FUNC
function resetForm() {
  // Clear text inputs
  const titleEl = document.getElementById('title');
  const bodyEl = document.getElementById('body');

  if (titleEl) titleEl.value = '';
  if (bodyEl) bodyEl.value = '';

  // Set radio sendType = ALL
  const sendTypeAll = document.querySelector('input[name="sendType"][value="ALL"]');
  if (sendTypeAll) sendTypeAll.checked = true;

  // Uncheck all provinceCode checkboxes
  document.querySelectorAll('input[name="provinceCode"]').forEach((cb) => {
    cb.checked = false;
  });

  // Uncheck all userCode checkboxes
  document.querySelectorAll('input[name="userCode"]').forEach((cb) => {
    cb.checked = false;
  });

  // ẩn user, province box
  const userBox = document.getElementById('user-box');
  const provinceBox = document.getElementById('province-box');
  provinceBox.classList.add('d-none');
  userBox.classList.add('d-none');
}

function initSendTypeEvent() {
  document.querySelectorAll('input[name="sendType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const sendType = document.querySelector('input[name="sendType"]:checked').value;
      const userBox = document.getElementById('user-box');
      const provinceBox = document.getElementById('province-box');

      // GỬI TẤT CẢ
      if (sendType == 'ALL') {
        userBox.classList.add('d-none');
      }
      // GỬI 1 VÀI USER
      if (sendType == 'USER') {
        provinceBox.classList.add('d-none');
        userBox.classList.remove('d-none');

        if (userList.length) {
          renderUserCheckbox();
        }
      }
      // GỬI THEO TỈNH
      if (sendType == 'PROVINCE') {
        userBox.classList.add('d-none');
        provinceBox.classList.remove('d-none');
      }
    });
  });
}

// TODO: RENDER
function renderUserCheckbox() {
  const list = document.getElementById('user-codes-list');
  list.innerHTML = '';

  if (!userList.length) {
    list.innerHTML = '<div class="text-muted">Không có người dùng</div>';
    return;
  }

  userList.forEach((user) => {
    const div = document.createElement('div');
    div.className = 'form-check';

    div.innerHTML = `
        <input
          class="form-check-input"
          type="checkbox"
          name="userCode"
          value="${user.userCode}"
          id="user-${user.userCode}"
        />
        <label class="form-check-label" for="user-${user.userCode}">
          ${user.userName}
        </label>
      `;

    list.appendChild(div);
  });
}

// TODO: API
async function getAllUser(page, limit) {
  await axios
    .post(
      CURRENT_URL + '/api/admin/user/getAllUser',
      {
        page: page, // lấy tất cả ko paging
        limit: limit, // lấy tất cả ko paging
        type: 'APP',
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        userList = response.data?.list ?? [];
        console.log(userList);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

function initSubmitForm() {
  const form = document.getElementById('push-notification-form');

  // validate realtime
  form.querySelectorAll('input, textarea').forEach((el) => el.addEventListener('input', () => validateField(notificationConstraints, el)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sendType = form.querySelector('input[name="sendType"]:checked').value;
    const userCodesMuticast = [...form.querySelectorAll('input[name="userCode"]:checked')].map((cb) => cb.value);
    const provinceCodesMuticast = [...form.querySelectorAll('input[name="provinceCode"]:checked')].map((cb) => cb.value);

    const formData = {
      title: form.title.value,
      body: form.body.value,
      sendType,
      userCodesMuticast,
      provinceCodesMuticast,
    };

    // kiêm lỗi
    const errors = validate(formData, notificationConstraints);
    if (errors) return displayErrors(errors);

    if (sendType === 'USER' && !userCodesMuticast.length) return toastErr('Vui lòng chọn ít nhất 1 người dùng');
    if (sendType === 'PROVINCE' && !provinceCodesMuticast.length) return toastErr('Vui lòng chọn ít nhất 1 tỉnh thành');

    const payload = {
      ...formData,
      userCodesMuticast: sendType === 'USER' ? userCodesMuticast : [],
      provinceCodesMuticast: sendType === 'PROVINCE' ? provinceCodesMuticast : [],
    };

    console.log(payload);

    // disable nút summit
    let btn = form.querySelector('button');
    btn.disabled = true;

    // gửi thông báo
    try {
      const response = await axios.post(CURRENT_URL + '/api/admin/notification/pushNotifycationByAdmin', payload, axiosAuth());
      if (response.data && response.data.success) {
        toastOk(response.data.message);
      } else {
        toastErr(response.data.message);
      }
    } catch (error) {
      console.error(`error:`, error);
      if (error.response.data) {
        toastErr(error.response.data.message);
      }
    } finally {
      // bật lại nút
      btn.disabled = false;

      // reset form
      resetForm();
    }
  });
}
