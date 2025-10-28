let page = 1;
let limit = 10;
let categoryQuestions = [];
const pageElement = 'page-home';
const homeFormConstraints = {
  homeName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên nhà yến.' },
  },
  homeAddress: {
    presence: {
      allowEmpty: false,
      message: '^Vui lòng nhập vị trí nhà yến.',
    },
    length: {
      minimum: 5,
      message: '^Tên nhà yến phải có ít nhất 5 ký tự.',
    },
  },
  latitude: {
    presence: { message: '^Vui lòng nhập kinh độ.' },
    numericality: {
      greaterThanOrEqualTo: -90,
      lessThanOrEqualTo: 90,
      message: '^Kinh độ phải từ -90 đến 90.',
    },
  },
  longitude: {
    presence: { message: '^Vui lòng nhập vĩ độ.' },
    numericality: {
      greaterThanOrEqualTo: -180,
      lessThanOrEqualTo: 180,
      message: '^Vĩ độ phải từ -180 đến 180.',
    },
  },
};

// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  getAllHome(page, limit);
});

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllHome(page, limit);
}
async function showHomeModal(type, homeData) {
  // init modal
  const modalSelector =
    type === 'create' ? '.home-create-modal' : '.home-update-modal';
  const modalEl = document.querySelector(modalSelector);

  // boostrap validation

  const homeValidator = new FormValidator(
    'home-create-form',
    homeFormConstraints,
  );

  homeValidator.setSubmitHandler((formData) => {
    console.log('Submit home form:', formData);
  });
  // show modal
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// TODO: RENDER
function renderAllHome(data, objElement) {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.homeName}</p></td>
            <td><p>${ele.location}</p></td>
            <td><p>${ele.latitude}</p></td>
            <td><p>${ele.longitude}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-common-out">Cập nhập</button>
                <button class="btn-out-err">Xóa</button>
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
async function getAllHome(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  await axios
    .post(
      currentUrl + '/api/admin/home/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllHome(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
