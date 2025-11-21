let page = 1;
let limit = 10;
let pageElement = 'page-blog';

document.addEventListener('DOMContentLoaded', function () {
  getAllBlog(page, limit);
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllBlog(page, limit);
}
function gotoBlogCreate() {
  gotoPage('/dashboard/blog/create');
}
function gotoBlogUpdate(blogCode) {
  gotoPage('/dashboard/blog/update/' + blogCode);
}
// RENDER
const renderAllBlog = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.categoryName}</p></td>
            <td><p>${ele.objectName}</p></td>
            <td><p>${getShortTextFromHtml(ele.blogContent)}</p></td>
            <td><b class="${ele.isFree == 'Y' ? 'txt-free' : 'txt-pay'}">${ele.isFree == 'Y' ? 'Miễn phí' : 'Tính phí'}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-main-out" onClick="gotoBlogUpdate('${ele.blogCode}')">Chỉnh sửa</button>
                <button class="btn-err-out"  onclick="deleteBlog('${ele.blogCode}')">Xóa</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // phân trang
    let pagerHTML = renderPager(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    // dữ liệu trống
    renderEmptyRowTable(objElement, 7);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// API
async function getAllBlog(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 7);
  
  await axios
    .post(
      CURRENT_URL + '/api/admin/blog/getAll',
      {
        page: currentPage,
        limit: limit,
        blogCategory: '',
        blogObject: '',
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllBlog(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function deleteBlog(blogCode) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa bài viết này không?`);
  if (!confirmed) {
    return;
  }
  await axios
    .delete(CURRENT_URL + `/api/admin/blog/delete/${blogCode}`, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllBlog(page, limit);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
