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
function gotoCreateBlog() {
  gotoPage('/dashboard/blog/create');
}
function gotoDetailBlog(blogCode) {
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
            <td><b class="${ele.isFree == "Y" ? "txt-free" : "txt-pay"}">${ele.isFree == "Y" ? "Miễn phí" : "Tính phí"}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out" onClick="gotoDetailBlog('${ele.blogCode}')">Cập nhập</button>
                <button class="btn-out-err"  onclick="deleteBlog('${ele.blogCode}')">Xóa</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // render paging
    let pagerHTML = createPagerHTML(data.total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    //clear
    objElement.innerHTML = ``;
    document.getElementById('privacy-main-pager').innerHTML = ``;
  }
};
// API
async function getAllBlog(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);

  await axios
    .post(
      currentUrl + '/api/admin/blog/getAll',
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
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa bài viết này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(
      currentUrl + `/api/admin/blog/deleteBlog/${blogCode}`,
      axiosAuth(),
    )
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
