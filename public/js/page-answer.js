let page = 1;
let limit = 10;
let pageElement = 'page-answer';

document.addEventListener('DOMContentLoaded', function () {
  getAllAnswer(page, limit);
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllAnswer(page, limit);
}
function gotoCreateAnswer() {
  gotoPage('/dashboard/answer/create');
}
function gotoDetailAnswer(answerCode) {
  gotoPage('/dashboard/answer/update/' + answerCode);
}
// RENDER
const renderAllAnswer = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.categoryName}</p></td>
            <td><p>${ele.objectName}</p></td>
            <td><p>${getShortTextFromHtml(ele.answerContent)}</p></td>
            <td><b class="${ele.isFree == "Y" ? "txt-free" : "txt-pay"}">${ele.isFree == "Y" ? "Miễn phí" : "Tính phí"}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out" onClick="gotoDetailAnswer('${ele.answerCode}')">Cập nhập</button>
                <button class="btn-out-err"  onclick="deleteAnswer('${ele.answerCode}')">Xóa</button>
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
async function getAllAnswer(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);

  await axios
    .post(
      currentUrl + '/api/admin/answer/getAll',
      {
        page: currentPage,
        limit: limit,
        answerCategory: '',
        answerObject: '',
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllAnswer(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function deleteAnswer(answerCode) {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa câu trả lời này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(
      currentUrl + `/api/admin/answer/deleteAnswer/${answerCode}`,
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllAnswer(page, limit);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
