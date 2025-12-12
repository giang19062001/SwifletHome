let page = 1;
let limit = 10;
let pageElement = 'page-todo-tasks';
let todoTaskList = [];
document.addEventListener('DOMContentLoaded', async function () {
  await getAllTasks(page, limit);
  await getBoxTasks();

  //gán event cho button
  document.getElementById('update-box-task-btn').addEventListener('click', function () {
    updateBoxTask();
  });
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllTasks(page, limit);
}
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

const renderAllTasks = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    // gán biến global để gán cho select
    todoTaskList = data.list ?? [];
    // render danh sách
    let i = 1;
    todoTaskList.forEach((ele) => {
      const rowHtml = `
                <tr class="text-center">
                    <td><p>${(page - 1) * limit + i++}</p></td>
                    <td><p>${ele.taskName}</p></td>
                    <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
                    <td><p>${ele.createdId ?? ''}</p></td>
                </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // phân trang
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    // dữ liệu trống
    renderEmptyRowTable(objElement, 3);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// TODO: API
async function getAllTasks(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);

  // Hiển thị skeleton
  showSkeleton(objElement, limit, 3);

  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/todo/getAllTasks', { page: currentPage, limit: limit }, axiosAuth());

    console.log('response', response);

    if (response.status === 200 && response.data) {
      renderAllTasks(response.data, objElement);
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
