// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  // ASSIGN NÚT CHẤP THUẬN
  const btnApproved = document.querySelector('#btn-approved');

  if (btnApproved) {
    btnApproved.addEventListener('click', async function () {
      btnApproved.disabled = true;

      try {
        await approvedQrcode(qrData.requestCode);
      } catch (err) {
        toastErr('Chỉnh sửa thất bại');
        console.log('error', error);
      } finally {
        btnApproved.disabled = false;
      }
    });
  }

  // ASSIGN NÚT TỪ CHỐI
  const btnRefuse = document.querySelector('#btn-refuse');

  if (btnRefuse) {
    btnRefuse.addEventListener('click', async function () {
      btnApproved.disabled = true;

      try {
        await refuseQrcode(qrData.requestCode);
      } catch (err) {
        toastErr('Chỉnh sửa thất bại');
        console.log('error', error);
      } finally {
        btnRefuse.disabled = false;
      }
    });
  }
});

// TODO: API
async function approvedQrcode(requestCode) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn duyệt yêu cầu Qr code này?`);
  if (!confirmed) {
    return;
  }
  await axios.put(CURRENT_URL + `/api/admin/qrcode/approved/${requestCode}`, {}, axiosAuth()).then(function (response) {
    console.log('response', response);
    toastOk('Chỉnh sửa thành công');
    reloadPage('/dashboard/qrcode');
  });
}

async function refuseQrcode(requestCode) {
  const confirmed = window.confirm(`Bạn có chắc chắn muốn từ chối yêu cầu Qr code này?`);
  if (!confirmed) {
    return;
  }
  await axios.put(CURRENT_URL + `/api/admin/qrcode/refuse/${requestCode}`, {}, axiosAuth()).then(function (response) {
    console.log('response', response);
    toastOk('Chỉnh sửa thành công');
    reloadPage('/dashboard/qrcode');
  });
}
