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
  initSendEvent();
  initSubmitForm();
});

// TODO: FUNC
function initSendEvent() {
  document.querySelectorAll('input[name="isSendAll"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const isEach = document.getElementById('sendEach').checked;
      const box = document.getElementById('userCodesMuticastBox');

      if (isEach) {
        box.classList.remove('d-none');

        if (userList.length) {
          renderUserCheckbox();
        }
      } else {
        box.classList.add('d-none');
      }
    });
  });
}

// TODO: RENDER
function renderUserCheckbox() {
  const box = document.getElementById('userCodesMuticastList');
  box.innerHTML = '';

  if (!userList.length) {
    box.innerHTML = '<div class="text-muted">Không có người dùng</div>';
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

    console.log(div);
    box.appendChild(div);
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

    const isSendAll = form.querySelector('input[name="isSendAll"]:checked').value;
    const userCodesMuticast = [...form.querySelectorAll('input[name="userCode"]:checked')].map((cb) => cb.value);

    const formData = {
      title: form.title.value,
      body: form.body.value,
      isSendAll,
      userCodesMuticast,
    };

    // kiêm lỗi
    const errors = validate(formData, notificationConstraints);
    if (errors) return displayErrors(errors);

    if (isSendAll === 'N' && !userCodesMuticast.length) return toastErr('Vui lòng chọn ít nhất 1 người dùng');

    const payload = {
      ...formData,
      userCodesMuticast: isSendAll === 'N' ? userCodesMuticast : [],
    };

    console.log('SUBMIT DATA:', payload);

    // disable nút summit
    let btn = form.querySelector('button');
    btn.disabled = true;

    // gửi thông báo
    try {
      const response = await axios.post(CURRENT_URL + '/api/admin/notification/pushNotifycationByAdmin', payload, axiosAuth());
      if (response.data) {
        toastOk('Gửi thông báo thành công');
      }
    } catch (error) {
      console.error(`error:`, error);
      if (error.response.data) {
        toastErr(error.response.data.message);
      }
    } finally {
      // bật lại nút
      btn.disabled = false;
    }
  });
}
