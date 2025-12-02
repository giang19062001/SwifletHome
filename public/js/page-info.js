let page = 1;
let limit = 10;
let pageElement = 'page-screen';
let infoContent = {};
const fileFields = ['qrcode']; // danh sách key nên render ra là input file
document.addEventListener('DOMContentLoaded', function () {
  getAllInfo(page, limit);
});

const InfoConstraints = {
  infoName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập thông tin' },
  },
  infoDescription: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập thông tin mô tả' },
  },
};
const InfoBankConstraints = {
  accountName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên chủ tài khoản.' },
  },
  accountNumber: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập mã tài khoản.' },
  },
  bankBranch: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên chi nhánh ngân hàng.' },
  },
  bankName: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập tên ngân hàng.' },
  },
  paymentContent: {
    presence: { allowEmpty: false, message: '^Vui lòng nhập nội dung chuyển khoản.' },
  },
};

// TODO: FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllInfo(page, limit);
}

// hiện tên dựa theo key
function showNameOfKey(key) {
  let name = '';
  switch (key) {
    case 'infoName':
      name = 'Thông tin';
      break;
    case 'infoDescription':
      name = 'Thông tin mô tả';
      break;
    case 'accountName':
      name = 'Tên chủ tài khoản';
      break;
    case 'accountNumber':
      name = 'Mã tài khoản';
      break;
    case 'bankBranch':
      name = 'Tên chi nhánh ngân hàng';
      break;
    case 'bankName':
      name = 'Tên ngân hàng';
      break;
    case 'paymentContent':
      name = 'Nội dung chuyển khoản';
      break;
    case 'qrcode':
      name = 'Mã Qr code';
      break;
    default:
      name = '';
  }
  return name;
}

// lấy validate theo key
function mapConstraints(infoKeyword) {
  let constraints = null;
  switch (infoKeyword) {
    case 'BANK':
      constraints = InfoBankConstraints;
      break;
    default:
      constraints = null;
  }
  return constraints;
}

// lấy content fields theo key
function mapContentFileds(infoKeyword, infoName, infoDescription, data) {
  const info = {
    infoName: infoName ?? '',
    infoDescription: infoDescription ?? '',
  };
  switch (infoKeyword) {
    case 'BANK':
      infoContent = {
        bankName: data.bankName ?? '',
        bankBranch: data.bankBranch ?? '',
        accountName: data.accountName ?? '',
        accountNumber: data.accountNumber ?? '',
        paymentContent: data.paymentContent ?? '',
        qrcode: data.qrcode ?? '',
      };
      break;
    default:
      infoContent = {};
  }
}

// lấy content, fields động từ form và trả ra formData
function getDataForm(modalBody) {
  const formData = new FormData();

  // Lấy infoKeyword
  const keywordInput = modalBody.querySelector('#infoKeyword');
  const infoKeyword = keywordInput ? keywordInput.value : '';
  formData.append('infoKeyword', infoKeyword);
  let infoContentChanged = {};

  // Lấy các field trong infoContent
  Object.keys(infoContent).forEach((key) => {
    const inputEl = modalBody.querySelector(`#${key}`);
    if (!inputEl) return;

    // file ảnh
    if (fileFields.includes(key)) {
      // Nếu có file được chọn
      if (inputEl.files && inputEl.files[0]) {
        formData.append('configfiles', inputEl.files[0]); // append file object
      }
      // Nếu không chọn file mới thì append path cũ
      infoContentChanged[key] = infoContent[key];
    } else {
      // validate lỗi
      if (String(inputEl.value).trim() === '') {
        const errEl = modalBody.querySelector(`.err-${key}`);
        if (errEl) errEl.style.display = 'block';
        return;
      }
      // file text
      infoContentChanged[key] = inputEl.value;
    }
  });
  formData.append('infoContent', JSON.stringify(infoContentChanged));

  return formData;
}

function closeModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'create' ? '.info-create-modal' : '.info-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal boostrap
  closeCommonModal(modalEl);
}

// TODO: RENDER
async function openModal(type, infoData) {
  const modalSelector = type === 'create' ? '.info-create-modal' : '.info-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body form');
  const submitBtn = modalEl.querySelector('.modal-footer button');

  // map lấy content fields dựa vào infoKeyWord
  mapContentFileds(infoData.infoKeyword, infoData.infoName, infoData.infoDescription, infoData.infoContent);

  // Xóa nội dung cũ trong modal-body (nếu có)
  modalBody.innerHTML = '';

  // Render input cho infoKeyword (hidden)
  const keywordInput = document.createElement('input');
  keywordInput.type = 'text';
  keywordInput.id = 'infoKeyword';
  keywordInput.className = 'form-control mb-2 d-none';
  keywordInput.value = infoData.infoKeyword || '';
  modalBody.appendChild(keywordInput);
  // Render các input dựa vào infoContent
  const rowWrapper = document.createElement('div');
  rowWrapper.className = 'row'; // tạo row chứa các cột

  Object.keys(infoContent).forEach((key) => {
    const colWrapper = document.createElement('div');
    colWrapper.className = 'col-md-6 mb-3'; // mỗi input nằm trong 1 cột (2 cột trên 1 hàng)

    const label = document.createElement('label');
    label.textContent = showNameOfKey(key);
    label.className = 'mb-2';
    label.setAttribute('for', key);
    colWrapper.appendChild(label);

    let input;
    if (fileFields.includes(key)) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = key;
      input.name = key;
      input.className = 'form-control';

      const preview = document.createElement('img');
      preview.src = infoContent[key];
      preview.alt = key;
      preview.style.maxWidth = '150px';
      preview.className = 'mt-2 d-block';

      colWrapper.appendChild(input);
      colWrapper.appendChild(preview);
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.id = key;
      input.name = key;
      input.className = 'form-control';
      input.value = infoContent[key] || '';
      colWrapper.appendChild(input);

      const constraints = mapConstraints(infoData.infoKeyword);
      input.addEventListener('input', () => validateField(constraints, input));
    }

    const divErr = document.createElement('div');
    divErr.className = `err-${key}`;
    divErr.setAttribute('data-error', key);
    divErr.textContent = `${showNameOfKey(key)} không thể để trống`;
    colWrapper.appendChild(divErr);

    // thêm từng cột vào 1 hàng
    rowWrapper.appendChild(colWrapper);

    // thêm hr để phân biết thông tin chính với thông tin chung
    if (key === 'infoDescription') {
      const hr = document.createElement('hr');
      rowWrapper.appendChild(hr);
    }
  });

  // thêm row vào body
  modalBody.appendChild(rowWrapper);

  // MỞ MODAL
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal();
  });
  modal.show();

  // Gắn sự kiện submit
  submitBtn.onclick = () => {
    if (type === 'create') {
    } else {
      updateInfo(infoData.infoKeyword, submitBtn);
    }
  };
}

const renderAllInfo = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.infoName}</p></td>
            <td><p>${ele.infoDescription}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
            <td>
                <button class="btn-edit"  onClick="getDetailInfo('${ele.infoKeyword}')">Chỉnh sửa</button>
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
    renderEmptyRowTable(objElement, 5);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// TODO: API
async function getAllInfo(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 5);

  await axios
    .post(
      CURRENT_URL + '/api/admin/info/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllInfo(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailInfo(infoKeyword) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/info/getDetail/' + infoKeyword, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          openModal('update', response.data);
        }
      })
      .catch(function (err) {
        console.log('err', err);
      }),
  );
}

async function updateInfo(infoKeyword, btn) {
  const modalBody = document.querySelector('.info-update-modal .modal-body form');

  // lấy giá trị form và đẩy vào formData
  const formData = getDataForm(modalBody);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // disable nút summit
  btn.disabled = true;

  try {
    const response = await axios.put(CURRENT_URL + '/api/admin/info/update/' + infoKeyword, formData, axiosAuth({ 'Content-Type': 'multipart/form-data' }));
    if (response.data) {
      toastOk('Chỉnh sửa thành công');
      // đóng modal
      closeModal('update');
      // refresh list
      page = 1;
      getAllInfo(page, limit);
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
