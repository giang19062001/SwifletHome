let pageElement = 'page-todo-box-tasks';
let todoTaskList = [];
document.addEventListener('DOMContentLoaded', async function () {
  await getAllTasks(0, 0); // lấy tất cả
  await getBoxTasks();

  //gán event cho button
  document.getElementById('update-box-task-btn').addEventListener('click', function () {
    updateBoxTask();
  });
});
// FUNC

// RENDER
const renderSelectTasks = (boxTask) => {
  if (todoTaskList.length) {
    return todoTaskList
      .map((task) => {
        const isSelected = task.taskCode === boxTask.taskCode ? 'selected' : '';
        return `<option value="${task.taskCode}" ${isSelected}>${task.taskName}</option>`;
      })
      .join('');
  } else {
    return '';
  }
};

const renderBoxTasks = (boxTasks, objElement) => {
  console.log(objElement);
  if (boxTasks.length) {
    // clear
    for (const box of boxTasks) {
      document.getElementById(`box-${box.seq}`).innerHTML = '';
    }
    //add
    for (const box of boxTasks) {
      document.getElementById(`box-${box.seq}`).innerHTML += renderSelectTasks(box);
    }
    // hiện lại 3 box sau khi load xong dữ liệu
    objElement.style.display = 'block';
  }
};

// TODO: API
async function getAllTasks(currentPage, limit) {
  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/todo/getAllTasks', { page: currentPage, limit: limit }, axiosAuth());

    console.log('response', response);

    if (response.status === 200 && response.data) {
      // gán biến global để gán cho select
      todoTaskList = response.data.list ?? [];
    }
  } catch (error) {
    console.log('error', error);
  }
}
async function getBoxTasks() {
  const objElement = document.querySelector(`#${pageElement} #box-tasks`);

  try {
    const response = await axios.get(CURRENT_URL + '/api/admin/todo/getBoxTasks', axiosAuth());

    console.log('response', response);

    if (response.status === 200 && response.data) {
      renderBoxTasks(response.data, objElement);
    }
  } catch (error) {
    console.log('error', error);
  }
}
async function updateBoxTask() {
  const boxTaskCode1 = document.getElementById('box-1');
  const boxTaskCode2 = document.getElementById('box-2');
  const boxTaskCode3 = document.getElementById('box-3');

  const values = [boxTaskCode1.value, boxTaskCode2.value, boxTaskCode3.value];

  if (values.some((v) => v === '')) {
    toastErr('Gía trị các hộp thoại không thể để trống');
    return;
  }

  const uniqueLen = new Set(values).size;
  if (uniqueLen !== values.length) {
    toastErr('Gía trị các hộp thoại  không được trùng nhau.');
    return;
  }

  // dữ liệu cập nhập
  const boxTasksArray = [
    {
      seq: Number(boxTaskCode1.dataset.seq),
      taskCode: boxTaskCode1.value,
    },
    {
      seq: Number(boxTaskCode2.dataset.seq),
      taskCode: boxTaskCode2.value,
    },
    {
      seq: Number(boxTaskCode3.dataset.seq),
      taskCode: boxTaskCode3.value,
    },
  ];

  // disable nút summit
  let btn = document.getElementById('update-box-task-btn');
  btn.disabled = true;

  try {
    const response = await axios.put(CURRENT_URL + '/api/admin/todo/updateBoxTask', { boxTasksArray: boxTasksArray }, axiosAuth());
    if (response.data) {
      toastOk('Chỉnh sửa thành công');
      // refresh
      getBoxTasks();
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
}
