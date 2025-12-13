let page = 1;
let limit = 10;
let pageElement = 'page-todo-tasks';
document.addEventListener('DOMContentLoaded', async function () {
  await getAllTasks(page, limit);
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllTasks(page, limit);
}
// RENDER
const renderAllTasks = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    // render danh sách
    let i = 1;
    data.list.forEach((ele) => {
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

