let page = 1;
let limit = 10;
let pageElement = 'question-container';
let categoryQuestions = [];
let answers = [];
document.addEventListener('DOMContentLoaded', function () {
  getAllQuestion(page, limit);
  getAllCategory(page, limit);
  getAllAnswer(0, 0);
});
// FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllQuestion(page, limit);
}
// RENDER
const showQuestionEditModal = (questionData) => {
  console.log('answers', answers);
  console.log('questionData', questionData);

  const modalEl = document.querySelector('.question-edit-modal');
  const modalBody = modalEl.querySelector('.modal-body');

  const categoryOptions = categoryQuestions
    .map(
      (cate) =>
        `<option value="${cate.categoryCode}" ${questionData.categoryQuesCode === cate.categoryCode ? 'selected' : ''}>${cate.categoryName}</option>`,
    )
    .join('');

  const answerOptions = answers
    .map(
      (ans) =>
        `<option value="${ans.answerCode}" data-answer-code="${ans.answerCode}" ${questionData.answerCode === ans.answerCode ? 'selected' : ''}>${
          ans.answerContentRaw.length > 30
            ? ans.answerContentRaw.substring(0, 30) + '...'
            : ans.answerContentRaw
        }</option>`,
    )
    .join('');

  modalBody.innerHTML = `
     <form>
          <input type="hidden" class="form-control" id="questionCode" value="${questionData.questionCode}"></input>
          <div class="form-group mb-3">
            <label for="questionContent" class="form-label">Câu hỏi</label>
            <textarea class="form-control" id="questionContent">${questionData.questionContent}</textarea>
          </div>
            <div class="row mb-3">
            <div class="col-md-6">
              <label for="categoryQuesCode" class="form-label">Thể loại</label>
              <select class="form-select" id="categoryQuesCode">
                ${categoryOptions}
              </select>
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
                ${answerOptions}
              </select>
              <div class="mt-2">
                <a href="#" id="answerDetailLink"  target="_blank" class="btn btn-sm btn-outline-primary" style="display: none;">
                  <i class="fas fa-external-link-alt"></i> Xem chi tiết câu trả lời
                </a>
              </div>
          </div>
    </form>
  `;

  // show answer link button
  const answerSelect = modalBody.querySelector('#answerCode');
  const answerDetailLink = modalBody.querySelector('#answerDetailLink');

  answerSelect.addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    const id = selectedOption.getAttribute('data-answer-code');

    if (id && selectedOption.value !== '') {
      answerDetailLink.href = `/dashboard/answer/detail/${id}`;
      answerDetailLink.style.display = 'inline-block';
    } else {
      answerDetailLink.style.display = 'none';
    }
  });

  // Trigger change event after render to show link button if there is answer seleted
  setTimeout(() => {
    answerSelect.dispatchEvent(new Event('change'));
  }, 0);

  //assign action for button
  modalEl
    .querySelector('.modal-footer button')
    .addEventListener('click', updateQuestion);
  // Show the modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

const renderAllQuestion = (data, objElement) => {
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
            </td>
         </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    // render paging
    let pagerHTML = createPagerHTML(data.count, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  }
};
// API
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
        showQuestionEditModal(response.data);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
async function getAllAnswer(currentPage, limit) {
  await axios
    .post(window.location.origin + '/api/admin/answer/getAll', {
      page: currentPage,
      limit: limit,
      categoryAnsCode: '',
      answerObject: '',
    })
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        answers = response.data.list;
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function updateQuestion() {
  try {
    const modalBody = document.querySelector(
      '.question-edit-modal .modal-body',
    );
    const questionContent = modalBody.querySelector('#questionContent').value;
    const categoryQuesCode = modalBody.querySelector('#categoryQuesCode').value;
    const questionObject = modalBody.querySelector('#questionObject').value;
    const answerCode = modalBody.querySelector('#answerCode').value;
    const questionCode = modalBody.querySelector('#questionCode').value;
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
        }else{
          toastErr("Cập nhập thất bại")
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log(error);
  }
}
