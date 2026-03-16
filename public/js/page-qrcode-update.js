// TODO: INIT
document.addEventListener('DOMContentLoaded', function () {
  console.log("qrData --", qrData);
  // ASSIGN NÚT CHẤP THUẬN
  const btnApproved = document.querySelector('#btn-approved');

  if (btnApproved) {
    btnApproved.addEventListener('click', async function () {
      btnApproved.disabled = true;

      try {
        await approvedQrcode(qrData.requestCode);
      } catch (err) {
        toastErr('Chỉnh sửa thất bại');
        console.log('error', err);
      } finally {
        btnApproved.disabled = false;
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