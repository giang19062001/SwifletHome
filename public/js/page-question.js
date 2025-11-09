let page = 1;
let limit = 10;
let pageElement = 'page-question';
let categories = [];

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllQuestion(page, limit);
  getAllCategory(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllQuestion(page, limit);
}

function closeQuestionModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'create' ? '.question-create-modal' : '.question-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // Lấy instance modal hiện tại
  const modalInstance = bootstrap.Modal.getInstance(modalEl);

  if (modalInstance) {
    modalInstance.hide(); // Đóng modal
  } else {
    // Nếu chưa có instance (trường hợp modal chưa được show trước đó)
    const modal = new bootstrap.Modal(modalEl);
    modal.hide();
  }
}

// TODO: RENDER
async function showQuestionModal(type, questionData) {
  // init modal
  const modalSelector = type === 'create' ? '.question-create-modal' : '.question-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  // render <option> category
  const categoryOptions = categories
    .map(
      (cate) => `
      <option value="${cate.categoryCode}" 
        ${questionData.questionCategory === cate.categoryCode ? 'selected' : ''}>
        ${cate.categoryName}
      </option>
    `,
    )
    .join('');

  // form
  modalBody.querySelector('#questionCode').value = questionData.questionCode || '';
  modalBody.querySelector('#questionContent').value = questionData.questionContent || '';
  modalBody.querySelector('#questionCategory').innerHTML = categoryOptions;

  // render answer list
  await renderAllAnswer(modalBody, questionData ? questionData.answerCode : '', modalBody.querySelector('#questionCategory').value);
  // validate
  modalBody.querySelector('#questionContent')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-questionContent').style.display = String(e.target.value).trim() == '' ? 'block' : 'none';
  });

  // assign event show link "Xem chi tiết"
  const answerSelect = modalBody.querySelector('#answerCode');
  const answerDetailLink = modalBody.querySelector('#answerDetailLink');

  answerSelect.addEventListener('change', function () {
    const selected = this.options[this.selectedIndex];
    const code = selected.getAttribute('data-answer-code');
    if (code) {
      answerDetailLink.href = `/dashboard/answer/update/${code}`;
      answerDetailLink.style.display = 'inline-block';
    } else {
      answerDetailLink.style.display = 'none';
    }
  });

  // trigger event immediately
  setTimeout(() => answerSelect.dispatchEvent(new Event('change')), 0);

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick = type === 'create' ? createQuestion : updateQuestion;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function renderAllAnswer(modalBody, answerCode, questionCategory) {
  // sub function
  async function renderAnswer(currentCategoryCode) {
    const answers = await getAllAnswer(0, 0, currentCategoryCode, 'YEN');
    const answerOptions = answers
      ?.map(
        (ans) => `
          <option value="${ans.answerCode}" data-answer-code="${ans.answerCode}"
            ${answerCode === ans.answerCode ? 'selected' : ''}>
            ${getShortTextFromHtml(ans.answerContent)}
          </option>
        `,
      )
      .join('');
    modalBody.querySelector('#answerCode').innerHTML = `
      <option value="">Chọn câu trả lời</option>
      ${answerOptions}
    `;
  }

  // render frist
  await renderAnswer(questionCategory);

  // render when category change
  modalBody.querySelector('#questionCategory').addEventListener('change', async (e) => {
    await renderAnswer(e.target.value);
  });
}

function renderAllQuestion(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.categoryName}</p></td>
            <td><p>${ele.objectName}</p></td>
            <td><p>${ele.questionContent}</p></td>
            <td><b class="txt-${ele.answerCode ? 'ok' : 'not-ok'}">${ele.answerCode ? 'Đã trả lời' : 'Chưa trả lời'}</b></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-main-out"  onclick="getDetailQuestion('${ele.questionCode}')">Cập nhập</button>
                <button class="btn-err-out"  onclick="deleteQuestion('${ele.questionCode}')">Xóa</button>
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
}
// TODO: API
async function getAllQuestion(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  await axios
    .post(
      currentUrl + '/api/admin/question/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllQuestion(response.data, objElement);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
async function getAllCategory(currentPage, limit) {
  await axios
    .post(
      currentUrl + '/api/admin/category/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        categories = response.data.list;
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
async function getDetailQuestion(questionCode) {
  await axios
    .get(currentUrl + '/api/admin/question/getDetail/' + questionCode, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        showQuestionModal('update', response.data);
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}

async function getAllAnswer(currentPage, limit, answerCategory, answerObject) {
  return await axios
    .post(
      currentUrl + '/api/admin/answer/getAll',
      {
        page: currentPage,
        limit: limit,
        answerCategory: answerCategory,
        answerObject: answerObject,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        console.log('response.data.list', response.data.list);
        return response.data.list;
      } else {
        return [];
      }
    })
    .catch(function (err) {
      console.log('err', err);
    });
}
async function deleteQuestion(questionCode) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi này không?`);
  if (!confirmed) {
    return;
  }
  await axios
    .delete(currentUrl + `/api/admin/question/deleteQuestion/${questionCode}`, axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        toastOk('Xóa thành công');
        // refresh list
        page = 1;
        getAllQuestion(page, limit);
      }
    })
    .catch(function (err) {
      console.log('err', err);
      toastOk('Xóa thất bại');
    });
}
async function createQuestion() {
  try {
    const modalBody = document.querySelector('.question-create-modal .modal-body form');
    const questionContent = modalBody.querySelector('#questionContent').value;
    const questionCategory = modalBody.querySelector('#questionCategory').value;
    const questionObject = modalBody.querySelector('#questionObject').value;
    const answerCode = modalBody.querySelector('#answerCode').value;
    if (String(questionContent).trim() == '') {
      modalBody.querySelector('.err-questionContent').style.display = 'block';
      return;
    }
    await axios
      .post(
        currentUrl + '/api/admin/question/createQuestion',
        {
          questionContent: questionContent,
          questionCategory: questionCategory,
          questionObject: questionObject,
          answerCode: answerCode,
          createdId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Thêm thành công');
          // đóng modal
          closeQuestionModal('create');
          // refresh list
          page = 1;
          getAllQuestion(page, limit);
        } else {
          toastErr('Thêm thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  } catch (err) {
    console.log(err);
  }
}

async function updateQuestion() {
  try {
    const modalBody = document.querySelector('.question-update-modal .modal-body form');
    const questionContent = modalBody.querySelector('#questionContent').value;
    const questionCategory = modalBody.querySelector('#questionCategory').value;
    const questionObject = modalBody.querySelector('#questionObject').value;
    const answerCode = modalBody.querySelector('#answerCode').value;
    const questionCode = modalBody.querySelector('#questionCode').value;
    if (String(questionContent).trim() == '') {
      return;
    }
    await axios
      .put(
        currentUrl + '/api/admin/question/updateQuestion/' + questionCode,
        {
          questionContent: questionContent,
          questionCategory: questionCategory,
          questionObject: questionObject,
          answerCode: answerCode,
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Cập nhập thành công');
          // đóng modal
          closeQuestionModal('update');
          // refresh list
          page = 1;
          getAllQuestion(page, limit);
        } else {
          toastErr('Cập nhập thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  } catch (err) {
    console.log(err);
  }
}
