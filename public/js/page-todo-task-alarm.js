const pageElement = 'page-task-alarm';
let userList = [];
const taskAlarmConstraints = {
  title: {
    presence: { allowEmpty: false, message: '^Vui lòng tiêu đề thông báo.' },
  },
  body: {
    presence: { allowEmpty: false, message: '^Vui lòng nội dung thông báo.' },
  },
  taskName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên công việc.' },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllUser(0, 0);
  initSendTypeEvent();
  initSubmitForm();
  initDate();
});

// TODO: FUNC
function initDate() {
  const input = document.getElementById('taskDate');
  if (!input) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  input.value = todayStr; // set value = hôm nay
  input.min = todayStr;   // set min = hôm nay
}

function resetForm() {
  const titleEl = document.getElementById('title');
  const bodyEl = document.getElementById('body');
  const taskNameEl = document.getElementById('taskName');

  if (titleEl) titleEl.value = '';
  if (bodyEl) bodyEl.value = '';
  if (taskNameEl) taskNameEl.value = '';

  const sendTypeAll = document.querySelector('input[name="sendType"][value="ALL"]');
  if (sendTypeAll) sendTypeAll.checked = true;

  document.querySelectorAll('input[name="provinceCode"]').forEach((cb) => {
    cb.checked = false;
  });

  document.querySelectorAll('input[name="userCode"]').forEach((cb) => {
    cb.checked = false;
  });

  const userBox = document.getElementById('user-box');
  const provinceBox = document.getElementById('province-box');
  if (provinceBox) provinceBox.classList.add('d-none');
  if (userBox) userBox.classList.add('d-none');
}

function initSendTypeEvent() {
  document.querySelectorAll('input[name="sendType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const sendType = document.querySelector('input[name="sendType"]:checked').value;
      const userBox = document.getElementById('user-box');
      const provinceBox = document.getElementById('province-box');

      if (sendType == 'ALL') {
        if (userBox) userBox.classList.add('d-none');
        if (provinceBox) provinceBox.classList.add('d-none');
      }
      if (sendType == 'USER') {
        if (provinceBox) provinceBox.classList.add('d-none');
        if (userBox) userBox.classList.remove('d-none');
        if (userList.length) renderUserCheckbox();
      }
      if (sendType == 'PROVINCE') {
        if (userBox) userBox.classList.add('d-none');
        if (provinceBox) provinceBox.classList.remove('d-none');
      }
    });
  });
}

function renderUserCheckbox() {
  const list = document.getElementById('user-codes-list');
  if (!list) return;
  list.innerHTML = '';
  if (!userList.length) {
    list.innerHTML = '<div class="text-muted">Không có người dùng</div>';
    return;
  }
  userList.forEach((user) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
        <input class="form-check-input" type="checkbox" name="userCode" value="${user.userCode}" id="user-${user.userCode}"/>
        <label class="form-check-label" for="user-${user.userCode}">${user.userName}</label>
      `;
    list.appendChild(div);
  });
}

/**
 * Hiển thị Modal báo cáo kết quả gửi thông báo
 * @param {Object} data - Dữ liệu từ API trả về (MulticastResult)
 */
function showResultModal(data) {
  try {
    if (!data) return;

    const elTotal = document.getElementById('res-total');
    const elSuccess = document.getElementById('res-success');
    const elFailure = document.getElementById('res-failure');

    if (elTotal) elTotal.innerText = data.totalCount || 0;
    if (elSuccess) elSuccess.innerText = data.successCount || 0;
    if (elFailure) elFailure.innerText = data.failureCount || 0;

    const successUl = document.querySelector('#res-success-list ul');
    if (successUl) {
      successUl.innerHTML = '';
      if (data.successItems && data.successItems.length > 0) {
        data.successItems.forEach((userCode) => {
          const user = userList.find(u => u.userCode === userCode);
          const displayName = user ? user.userName : userCode;
          const li = document.createElement('li');
          li.className = 'list-group-item  py-1';
          li.innerHTML = `<i class="fas fa-check-circle me-2"></i><strong>${displayName}</strong>`;
          successUl.appendChild(li);
        });
      } else {
        successUl.innerHTML = '<li class="list-group-item text-muted text-center py-2">Trống</li>';
      }
    }

    const failureUl = document.querySelector('#res-failure-list ul');
    if (failureUl) {
      failureUl.innerHTML = '';
      if (data.failureItems && data.failureItems.length > 0) {
        data.failureItems.forEach((item) => {
          const user = userList.find(u => u.userCode === item.userCode);
          const displayName = user ? user.userName : item.userCode;
          const li = document.createElement('li');
          li.className = 'list-group-item  py-1';
          li.innerHTML = `
                <div class="fw-bold">${displayName}</div>
                <div class="text-wrap" style="word-break: break-all;">${item.error}</div>
            `;
          failureUl.appendChild(li);
        });
      } else {
        failureUl.innerHTML = '<li class="list-group-item text-muted text-center py-2">Trống</li>';
      }
    }

    const modalEl = document.getElementById('notificationResultModal');
    if (modalEl) {
      const myModal = new bootstrap.Modal(modalEl);
      myModal.show();
    }
  } catch (err) {
    console.error("Lỗi hiển thị Modal:", err);
  }
}

async function getAllUser(page, limit) {
  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/user/getAllUser', { page, limit, type: 'APP' }, axiosAuth());
    if (response.status === 200 && response.data) {
      userList = response.data?.list ?? [];
    }
  } catch (error) {
    console.log('error', error);
  }
}

function initSubmitForm() {
  const form = document.getElementById('push-task-alarm-form');
  if (!form) return;
  form.querySelectorAll('input, textarea, select').forEach((el) => el.addEventListener('input', () => validateField(taskAlarmConstraints, el)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sendType = form.querySelector('input[name="sendType"]:checked').value;
    const userCodesMuticast = [...form.querySelectorAll('input[name="userCode"]:checked')].map((cb) => cb.value);
    const provinceCodesMuticast = [...form.querySelectorAll('input[name="provinceCode"]:checked')].map((cb) => cb.value);

    const formData = {
      title: form.title.value,
      body: form.body.value,
      taskName: form.taskName.value,
      taskDate: form.taskDate.value,
      sendType,
      userCodesMuticast,
      provinceCodesMuticast,
    };

    const errors = validate(formData, taskAlarmConstraints);
    if (errors) return displayErrors(errors);

    if (sendType === 'USER' && !userCodesMuticast.length) return toastErr('Vui lòng chọn ít nhất 1 người dùng');
    if (sendType === 'PROVINCE' && !provinceCodesMuticast.length) return toastErr('Vui lòng chọn ít nhất 1 tỉnh thành');

    const payload = {
      ...formData,
      userCodesMuticast: sendType === 'USER' ? userCodesMuticast : [],
      provinceCodesMuticast: sendType === 'PROVINCE' ? provinceCodesMuticast : [],
    };

    let btn = form.querySelector('button');
    if (btn) btn.disabled = true;

    try {
      const response = await axios.post(CURRENT_URL + '/api/admin/todo/setTaskAlarmByAdmin', payload, axiosAuth());
      // Luôn hiển thị modal nếu có dữ liệu chi tiết
      if (response.data && response.data.data) {
        showResultModal(response.data.data);
      }
    } catch (error) {
      console.error(`Lỗi API đặt lịch nhắc:`, error);
      // Hiển thị lỗi hệ thống thông qua modal thay vì toast
      showResultModal({
        totalCount: 'Lỗi',
        successCount: 0,
        failureCount: 1,
        successItems: [],
        failureItems: [{ 
            userCode: 'Hệ thống', 
            error: error.response?.data?.message || 'Lỗi kết nối hoặc xử lý phía Server' 
        }]
      });
    } finally {
      if (btn) btn.disabled = false;
      resetForm();
    }
  });
}
