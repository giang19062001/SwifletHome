// TODO:INIT
const answerCode = CURRENT_PATH.includes('/update') ? CURRENT_PATH.split('/').pop() : null;
const pageElement = 'page-answer-mutation';

// Theo dõi nút chế độ xem
document.getElementById('isPaidPreview').addEventListener('change', (event) => {
  getThenRenderEditorContent(); // getThenRenderEditorContent() -> renderContentHtml()
});

// Theo dõi radio isFree thay đổi
document.querySelectorAll('input[name="isFree"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    // set chế độ xem là NOT_PAID_YET
    document.getElementById('isPaidPreview').checked = false;
    //re-render
    getThenRenderEditorContent(); // getThenRenderEditorContent() -> renderContentHtml()
    // ẩn/ hiện nút thanh toán
    togglePaymentButton();

    // ẩn/ hiện chế độ xem
    togglePreview();
  });
});

// Chờ fileList sẵn sàng và re-render
document.addEventListener('DOMContentLoaded', () => {
  const waitForFileList = setInterval(() => {
    if (Array.isArray(fileList) && fileList.length > 0) {
      clearInterval(waitForFileList);
      // re-render editor content
      getThenRenderEditorContent();
      // ẩn/ hiện nút thanh toán
      togglePaymentButton();
      // ẩn/ hiện chế độ xem
      togglePreview();
    }
  }, 100);
});
// TODO: FUNC

/// Hàm hiển thị/ẩn hộp chế độ xem
function togglePreview() {
  const isFree = document.querySelector('input[name="isFree"]:checked')?.value;
  console.log(isFree);
  if (isFree == 'Y') {
    document.querySelector('.preview-box').style.display = 'none';
  } else {
    document.querySelector('.preview-box').style.display = 'flex';
  }
}

// TODO:RENDER
function renderContentHtml() {
  const isFree = document.querySelector('input[name="isFree"]:checked').value; // Y | N
  const isPaidPreview = document.getElementById('isPaidPreview').checked ? 'PAID' : 'NOT_PAID_YET';

  // lấy content từ bong bóng message html
  const bot = document.getElementById('content-message');
  let contentHtml = bot.innerHTML;
  answerContent = contentHtml; // ! DATA để gửi đến API

  // xóa nút thanh toán ra khỏi editor
  if (isFree == 'Y') {
    contentHtml = removeEditorText('[[payment]]');
  }
  console.log(isPaidPreview);

  // Xóa nút thanh toán nếu  chế độ xem là đã trả phí
  if (isPaidPreview == 'PAID') {
    contentHtml = contentHtml.replaceAll(`<img src="${CURRENT_URL}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`, '');
  }

  // Replace [[payment]]
  if (isPaidPreview == 'NOT_PAID_YET') {
    // chưa trả phí → hiển nút thanh toán
    if (contentHtml.includes('[[payment]]')) {
      // Lấy phần trước [[payment]]
      const parts = contentHtml.split('[[payment]]');

      // Chỉ giữ phần trước + nút thanh toán
      contentHtml = parts[0] + `<img src="${CURRENT_URL}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`;
    }
    // Nếu không có [[payment]], giữ nguyên contentHtml
  } else {
    // đã trả phí rồi → ẩn nút thanh toán
    contentHtml = contentHtml.replace(/\[\[payment\]\]/g, ``);
  }

  // Replace [[image-data=...]]
  contentHtml = contentHtml.replace(/\[\[image-data=(.*?)\]\]/g, (match, url) => {
    return `<img src="${url}" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`;
  });

  // Replace [[audio-data=...]]
  contentHtml = contentHtml.replace(/\[\[audio-data=(.*?)\]\]/g, (match, url) => {
    const lastSlashIndex = url.lastIndexOf('/');
    const fileUrl = url.substring(0, lastSlashIndex);
    const filename = url.substring(lastSlashIndex + 1);
    const fileInfo = fileList?.find((ele) => ele.filename === filename);
    const audioPay = fileInfo?.filenamePay ?? filename; // audio miễn phí

    const audioSrc = isPaidPreview == 'NOT_PAID_YET' ? `${url}` : `${fileUrl}/${audioPay}`;
    return `<audio controls style="width:100%; margin:8px 0;">
              <source src="${audioSrc}" type="audio/mpeg">
            </audio>`;
  });

  // Replace [[video-data=...]]
  contentHtml = contentHtml.replace(/\[\[video-data=(.*?)\]\]/g, (match, url) => {
    return `<iframe class="if-video" frameborder="0" allowfullscreen="true" src="${url}"></iframe>`;
  });

  // RE-RENDER bong bóng tin nhắn
  bot.innerHTML = contentHtml;
}

// TODO:API
async function createAnswer() {
  getThenRenderEditorContent(); // assisgn value

  // validate
  if (validateEditorContent() == false) {
    toastErr('Vui lòng nhập nội dung.');
    return;
  }

  // disable button
  const submitBtn = document.querySelector('.btn-submit');
  submitBtn.disabled = true;

  try {
    const answerCategory = document.getElementById('answerCategory').value;
    const answerObject = document.getElementById('answerObject').value;
    const isFree = document.querySelector('input[name="isFree"]:checked').value; // Y | N
    await axios
      .post(
        CURRENT_URL + '/api/admin/answer/create',
        {
          answerContent,
          answerCategory,
          answerObject,
          isFree: isFree,
          createdId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        toastOk('Thêm thành công');
        reloadPage('/dashboard/q-and-a/answer');
      })
      .catch(function (error) {
        console.log('error', error);
        submitBtn.disabled = false; // bật lại button
      });
  } catch (error) {
    console.log('err', error);
    submitBtn.disabled = false; // bật lại button
  } finally {
    // submitBtn.disabled = false; // bật lại button
  }
}

async function updateAnswer() {
  getThenRenderEditorContent(); // assisgn value

  // validate
  if (validateEditorContent() == false) {
    toastErr('Vui lòng nhập nội dung.');
    return;
  }

  // disable button
  const submitBtn = document.querySelector('.btn-submit');
  submitBtn.disabled = true;

  try {
    const answerCategory = document.getElementById('answerCategory').value;
    const answerObject = document.getElementById('answerObject').value;
    const isFree = document.querySelector('input[name="isFree"]:checked').value; // Y | N

    await axios
      .put(
        CURRENT_URL + '/api/admin/answer/update/' + answerCode,
        {
          answerContent,
          answerCategory,
          answerObject,
          isFree: isFree,
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        toastOk('Chỉnh sửa thành công');
        reloadPage('/dashboard/q-and-a/answer');
      })
      .catch(function (error) {
        console.log('error', error);
        submitBtn.disabled = false; // bật lại button
      });
  } catch (error) {
    console.log('err', error);
    submitBtn.disabled = false; // bật lại button
  } finally {
    // submitBtn.disabled = false; // bật lại button
  }
}
