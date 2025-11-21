let page = 1;
let limit = 10;
let pageElement = 'page-category';
document.addEventListener('DOMContentLoaded', function () {
  getAllCategory(page, limit);
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllCategory(page, limit);
}
// RENDER
const renderAllCategory = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data.list.forEach((ele) => {
      const rowHtml = `
                <tr class="text-center">
                    <td><p>${(page - 1) * limit + i++}</p></td>
                    <td><p>${ele.categoryName}</p></td>
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
    renderEmptyRowTable(objElement, 3)
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// API
async function getAllCategory(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);

  // Hiển thị skeleton 
  showSkeleton(objElement, limit, 3);

  try {
    const response = await axios.post(CURRENT_URL + '/api/admin/category/getAll', { page: currentPage, limit: limit }, axiosAuth());

    console.log('response', response);

    if (response.status === 200 && response.data) {
      renderAllCategory(response.data, objElement);
    }
  } catch (error) {
    console.log('error', error);
  }
}
