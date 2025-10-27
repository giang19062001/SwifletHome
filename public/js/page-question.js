let page = 1;
let limit = 10;
let pageElement = 'question-container';
let categoryQuestions = [];

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
// TODO: RENDER
async function showQuestionModal(type, questionData) {
  // init modal
  const modalSelector =
    type === 'create' ? '.question-create-modal' : '.question-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');

  // render <option> category
  const categoryOptions = categoryQuestions
    .map(
      (cate) => `
      <option value="${cate.categoryCode}" 
        ${questionData.categoryQuesCode === cate.categoryCode ? 'selected' : ''}>
        ${cate.categoryName}
      </option>
    `,
    )
    .join('');

  // form
  modalBody.innerHTML = `
    <form>
      <input type="hidden" id="questionCode" value="${questionData.questionCode || ''}">
      <div class="form-group mb-3">
        <label for="questionContent" class="form-label">Câu hỏi</label>
        <textarea class="form-control" id="questionContent">${questionData.questionContent || ''}</textarea>
        <div class="invalid-questionContent">Vui lòng nhập nội dung câu hỏi.</div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <label for="categoryQuesCode" class="form-label">Thể loại</label>
          <select class="form-select" id="categoryQuesCode">${categoryOptions}</select>
        </div>
        <div class="col-md-6">
          <label for="questionObject" class="form-label">Đối tượng</label>
          <select class="form-select" id="questionObject">
            <option value="YEN" ${questionData.target === 'YEN' ? 'selected' : ''}>Yến</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label for="answerCode" class="form-label">Câu trả lời</label>
        <select class="form-select" id="answerCode">
          <option value="">Chọn câu trả lời</option>
        </select>
        <div class="mt-2">
          <a href="#" id="answerDetailLink" target="_blank" class="btn btn-sm btn-outline-primary" style="display: none;">
            <i class="fas fa-external-link-alt"></i> Xem chi tiết câu trả lời
          </a>
        </div>
      </div>
    </form>
  `;

  // render answer list
  await renderAllAnswer(
    modalBody,
    questionData ? questionData.answerCode : '',
    modalBody.querySelector('#categoryQuesCode').value,
  );
  // validate
  modalBody
    .querySelector('#questionContent')
    ?.addEventListener('input', (e) => {
      modalBody.querySelector('.invalid-questionContent').style.display =
        String(e.target.value).trim() == '' ? 'block' : 'none';
    });

  // assign event show link "Xem chi tiết"
  const answerSelect = modalBody.querySelector('#answerCode');
  const answerDetailLink = modalBody.querySelector('#answerDetailLink');

  answerSelect.addEventListener('change', function () {
    const selected = this.options[this.selectedIndex];
    const code = selected.getAttribute('data-answer-code');
    if (code) {
      answerDetailLink.href = `/dashboard/answer/detail/${code}`;
      answerDetailLink.style.display = 'inline-block';
    } else {
      answerDetailLink.style.display = 'none';
    }
  });

  // trigger event immediately
  setTimeout(() => answerSelect.dispatchEvent(new Event('change')), 0);

  // assign <event> update
  modalEl.querySelector('.modal-footer button').onclick =
    type === 'create' ? createQuestion : updateQuestion;

  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function renderAllAnswer(modalBody, answerCode, categoryQuesCode) {
  // sub function
  async function renderAnswer(currentCategoryCode) {
    const answers = await getAllAnswer(0, 0, currentCategoryCode, 'YEN');
    const answerOptions = answers
      ?.map(
        (ans) => `
          <option value="${ans.answerCode}" data-answer-code="${ans.answerCode}"
            ${answerCode === ans.answerCode ? 'selected' : ''}>
            ${ans.answerContentRaw.length > 30 ? ans.answerContentRaw.slice(0, 30) + '...' : ans.answerContentRaw}
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
  await renderAnswer(categoryQuesCode);

  // render when category change
  modalBody
    .querySelector('#categoryQuesCode')
    .addEventListener('change', async (e) => {
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
            <td><p>${ele.answerCode ? 'Đã trả lời' : 'Chưa trả lời'}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out"  onclick="getDetail('${ele.questionCode}')">Cập nhập</button>
                <button class="btn-out-err"  onclick="deleteQuestion('${ele.questionCode}')">Xóa</button>
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // render paging
    let pagerHTML = createPagerHTML(data.count, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  }
}
// TODO: API
async function getAllQuestion(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);

  await axios
    .post(window.location.origin + '/api/admin/question/getAll', {
      page: currentPage,
      limit: limit,
    })
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllQuestion(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getAllCategory(currentPage, limit) {
  await axios
    .post(window.location.origin + '/api/admin/categoryQuestion/getAll', {
      page: currentPage,
      limit: limit,
    })
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        categoryQuestions = response.data.list;
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getDetail(questionCode) {
  await axios
    .post(window.location.origin + '/api/admin/question/getDetail', {
      questionCode: questionCode,
    })
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        showQuestionModal('update', response.data);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getAllAnswer(currentPage, limit, categoryAnsCode, answerObject) {
  return await axios
    .post(window.location.origin + '/api/admin/answer/getAll', {
      page: currentPage,
      limit: limit,
      categoryAnsCode: categoryAnsCode,
      answerObject: answerObject,
    })
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        console.log('response.data.list', response.data.list);
        return response.data.list;
      } else {
        return [];
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function deleteQuestion(questionCode) {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa câu hỏi này không?`,
  );
  if (!confirmed) {
    return;
  }
  await axios
    .delete(
      window.location.origin +
        `/api/admin/question/deleteQuestion/${questionCode}`,
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        page = 1;
        getAllQuestion(page, limit);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function createQuestion() {
  try {
    const modalBody = document.querySelector(
      '.question-create-modal .modal-body form',
    );
    const questionContent = modalBody.querySelector('#questionContent').value;
    const categoryQuesCode = modalBody.querySelector('#categoryQuesCode').value;
    const questionObject = modalBody.querySelector('#questionObject').value;
    const answerCode = modalBody.querySelector('#answerCode').value;
    if (String(questionContent).trim() == '') {
      modalBody.querySelector('.invalid-questionContent').style.display =
        'block';
      return;
    }
    await axios
      .post(window.location.origin + '/api/admin/question/createQuestion', {
        questionContent: questionContent,
        categoryQuesCode: categoryQuesCode,
        questionObject: questionObject,
        answerCode: answerCode,
      })
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Thêm thành công');
          setTimeout(() => {
            location.reload();
          }, 2000);
        } else {
          toastErr('Thêm thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log(error);
  }
}

async function updateQuestion() {
  try {
    const modalBody = document.querySelector(
      '.question-update-modal .modal-body form',
    );
    const questionContent = modalBody.querySelector('#questionContent').value;
    const categoryQuesCode = modalBody.querySelector('#categoryQuesCode').value;
    const questionObject = modalBody.querySelector('#questionObject').value;
    const answerCode = modalBody.querySelector('#answerCode').value;
    const questionCode = modalBody.querySelector('#questionCode').value;
    if (String(questionContent).trim() == '') {
      return;
    }
    await axios
      .put(window.location.origin + '/api/admin/question/updateQuestion', {
        questionContent: questionContent,
        categoryQuesCode: categoryQuesCode,
        questionObject: questionObject,
        answerCode: answerCode,
        questionCode: questionCode,
      })
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Cập nhập thành công');
          setTimeout(() => {
            location.reload();
          }, 2000);
        } else {
          toastErr('Cập nhập thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log(error);
  }
}
