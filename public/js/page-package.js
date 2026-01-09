let page = 1;
let limit = 10;
let pageElement = 'page-package';
document.addEventListener('DOMContentLoaded', function () {
  getAllPackage(page, limit);
});

// TODO:FUNC
function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getAllPackage(page, limit);
}

function closeModal(type) {
  // Xác định modal theo loại
  const modalSelector = type === 'create' ? '.package-create-modal' : '.package-update-modal';
  const modalEl = document.querySelector(modalSelector);

  if (!modalEl) return;

  // đóng modal boostrap
  closeCommonModal(modalEl);
}

// Hàm xử lý khi thay đổi radio
function initPackageOptionType() {
  const priceInput = document.querySelector('#packagePrice');
  const itemPriceInput = document.querySelector('#packageItemSamePrice');
  const selectedValue = document.querySelector('input[name="packageOptionType"]:checked')?.value;

  if (!selectedValue) return;

  switch (selectedValue) {
    case 'MONEY':
      priceInput.disabled = false;
      itemPriceInput.disabled = true;
      // itemPriceInput.value = '';
      document.querySelectorAll('[class^="err-packageItemSamePrice"]').forEach((el) => (el.style.display = 'none'));
      break;

    case 'ITEM':
      priceInput.disabled = true;
      // priceInput.value = '0';
      itemPriceInput.disabled = false;
      document.querySelectorAll('[class^="err-packagePrice"]').forEach((el) => (el.style.display = 'none'));
      break;

    case 'BOTH':
      priceInput.disabled = false;
      itemPriceInput.disabled = false;
      document.querySelectorAll('[class^="err-packageItemSamePrice"]').forEach((el) => (el.style.display = 'none'));
      document.querySelectorAll('[class^="err-packagePrice"]').forEach((el) => (el.style.display = 'none'));
      break;
  }
}

// TODO: RENDER
async function openModal(type, packageData) {
  const modalSelector = type === 'create' ? '.package-create-modal' : '.package-update-modal';
  const modalEl = document.querySelector(modalSelector);
  const modalBody = modalEl.querySelector('.modal-body');
  const submitBtn = modalEl.querySelector('.modal-footer button');

  // Fill form
  modalBody.querySelector('#packageCode').value = packageData.packageCode || '';
  modalBody.querySelector('#packageName').value = packageData.packageName || '';
  modalBody.querySelector('#packageDescription').value = packageData.packageDescription || '';
  modalBody.querySelector('#packagePrice').value = packageData.packagePrice || '';
  modalBody.querySelector('#packageExpireDay').value = packageData.packageExpireDay || 0;
  modalBody.querySelector('#packageItemSamePrice').value = packageData.packageItemSamePrice || '';

  const optionType = packageData.packageOptionType || 'MONEY'; // default nếu không có

  const radioMONEY = modalBody.querySelector('#MONEY');
  const radioITEM = modalBody.querySelector('#ITEM');
  const radioBOTH = modalBody.querySelector('#BOTH');

  if (radioMONEY) radioMONEY.checked = optionType === 'MONEY';
  if (radioITEM) radioITEM.checked = optionType === 'ITEM';
  if (radioBOTH) radioBOTH.checked = optionType === 'BOTH';

  // lắng nghe sử kiện đổi option
  radioMONEY.addEventListener('change', initPackageOptionType);
  radioITEM.addEventListener('change', initPackageOptionType);
  radioBOTH.addEventListener('change', initPackageOptionType);

  // chạy ngay khi modal mở  và có giá trị của packageOptionType
  initPackageOptionType();

  //  Disable nút submit
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang tải...';

  // MỞ MODAL
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => {
    closeModal();
  });
  modal.show();

  //  enable lại nút submit
  submitBtn.disabled = false;
  submitBtn.innerHTML = type === 'create' ? 'Thêm' : 'Lưu thông tin';

  // thêm validate
  modalBody.querySelector('#packageName')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-packageName').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#packageDescription')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-packageDescription').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#packageExpireDay')?.addEventListener('input', (e) => {
    modalBody.querySelector('.err-packageExpireDay').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
  });
  modalBody.querySelector('#packagePrice')?.addEventListener('input', (e) => {
    if (document.querySelector('input[name="packageOptionType"]:checked').value == 'ITEM') {
      modalBody.querySelector('.err-packagePrice').style.display = 'none';
    } else {
      modalBody.querySelector('.err-packagePrice').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
    }
  });
  modalBody.querySelector('#packageItemSamePrice')?.addEventListener('input', (e) => {
    if (document.querySelector('input[name="packageOptionType"]:checked').value == 'MONEY') {
      modalBody.querySelector('.err-packageItemSamePrice').style.display = 'none';
    } else {
      modalBody.querySelector('.err-packageItemSamePrice').style.display = String(e.target.value).trim() === '' ? 'block' : 'none';
    }
  });

  // Gắn sự kiện submit
  submitBtn.onclick = () => {
    if (type === 'update') {
      updatePackage(submitBtn);
    }
  };
}
const renderAllPackage = (data, objElement) => {
  let HTML = '';
  if (data?.list?.length) {
    let i = 1;
    data?.list.forEach((ele) => {
      const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.packageName}</p></td>
            <td><p>${ele.packageDescription}</p></td>
            <td><p>${ele.packagePrice}</p></td>
            <td><p>${ele.packageItemSamePrice ? ele.packageItemSamePrice : ''}</p></td>
            <td><p>${VARIABLE_ENUM.PACKAGE_OPTIONS_TYPE[ele.packageOptionType]}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
             <td>
                <button class="btn-edit"  onClick="getDetailPackage('${ele.packageCode}')">Chỉnh sửa</button>
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
    renderEmptyRowTable(objElement, 6);
  }

  // xóa skeleton
  hideSkeleton(objElement);
};
// API
async function getAllPackage(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  // Hiển thị skeleton
  showSkeleton(objElement, limit, 6);

  await axios
    .post(
      CURRENT_URL + '/api/admin/package/getAll',
      {
        page: currentPage,
        limit: limit,
      },
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllPackage(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getDetailPackage(packageCode) {
  await loaderApiCall(
    axios
      .get(CURRENT_URL + '/api/admin/package/getDetail/' + packageCode, axiosAuth())
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

async function updatePackage(btn) {
  const modalBody = document.querySelector('.package-update-modal .modal-body form');

  try {
    const packageName = modalBody.querySelector('#packageName').value;
    const packagePrice = modalBody.querySelector('#packagePrice').value;
    const packageItemSamePrice = modalBody.querySelector('#packageItemSamePrice').value;
    const packageDescription = modalBody.querySelector('#packageDescription').value;
    const packageExpireDay = modalBody.querySelector('#packageExpireDay').value;
    const packageCode = modalBody.querySelector('#packageCode').value;
    const packageOptionType = document.querySelector('input[name="packageOptionType"]:checked').value;

    // VALIDATE
    if (String(packageName).trim() == '') {
      modalBody.querySelector('.err-packageName').style.display = 'block';
      return;
    }
    if (packageOptionType == 'MONEY') {
      if (String(packagePrice).trim() == '') {
        modalBody.querySelector('.err-packagePrice').style.display = 'block';
        return;
      }

      if (isValidMoneyInput(packagePrice) == false) {
        modalBody.querySelector('.err-packagePrice-invalid').style.display = 'block';
        return;
      } else {
        modalBody.querySelector('.err-packagePrice-invalid').style.display = 'none';
      }
    }
    if (packageOptionType == 'ITEM' && String(packageItemSamePrice).trim() == '') {
      modalBody.querySelector('.err-packageItemSamePrice').style.display = 'block';
      return;
    }

    if (packageOptionType == 'BOTH') {
      if (String(packagePrice).trim() == '') {
        modalBody.querySelector('.err-packagePrice').style.display = 'block';
        return;
      }
      if (String(packageItemSamePrice).trim() == '') {
        modalBody.querySelector('.err-packageItemSamePrice').style.display = 'block';
        return;
      }
    }
    if (String(packageExpireDay).trim() == '') {
      modalBody.querySelector('.err-packageExpireDay').style.display = 'block';
      return;
    }
    if (String(packageDescription).trim() == '') {
      modalBody.querySelector('.err-packageDescription').style.display = 'block';
      return;
    }

    // disable nút summit
    btn.disabled = true;

    await axios
      .put(
        CURRENT_URL + '/api/admin/package/update/' + packageCode,
        {
          packageName: packageName,
          packagePrice: packagePrice,
          packageItemSamePrice: packageItemSamePrice,
          packageDescription: packageDescription,
          packageExpireDay: Number(packageExpireDay ?? 0),
          packageOptionType: packageOptionType,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Chỉnh sửa thành công');
          // đóng modal
          closeModal('update');
          // refresh list
          page = 1;
          getAllPackage(page, limit);
        } else {
          toastErr('Chỉnh sửa thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  } catch (err) {
    console.log(err);
  } finally {
    // bật lại nút
    btn.disabled = false;
  }
}
