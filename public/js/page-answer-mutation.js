// TODO:INIT
const answerCode = currentPath.includes('/update') ? currentPath.split('/').pop() : null;
const pageElement = 'page-answer-mutation';
const isFreeViewSwitch = document.getElementById('isFreeViewSwitch');

// preview
isFreeViewSwitch.addEventListener('change', (event) => {
  if (event.target.checked) {
    // pay
    console.log('pay');
    getContent(); // getContent() -> renderContentHtml() FROM component-editor.js
  } else {
    // free
    console.log('free');
    renderFreeContentHtml();
  }
});

// check fileList until that has data
document.addEventListener('DOMContentLoaded', function () {
  const waitForFileList = setInterval(() => {
    if (Array.isArray(fileList) && fileList.length > 0) {
      clearInterval(waitForFileList);

      if (isFreeViewSwitch.checked) {
        renderContentHtml();
      } else {
        renderFreeContentHtml();
      }
    }
  }, 100);
});

// TODO:RENDER
function renderFreeContentHtml() {
  const bot = document.getElementById('content-message');
  contentHtml = bot.innerHTML;

  // payment
  contentHtml = contentHtml.replaceAll(`<img src="${currentUrl}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`, '');

  // audio
  contentHtml = contentHtml.replace(/<audio[^>]*><source[^>]*src="(.*?)"[^>]*><\/audio>/g, (match, src) => {
    const lastSlashIndex = src.lastIndexOf('/');
    const fileUrl = src.substring(0, lastSlashIndex);
    const filename = src.substring(lastSlashIndex + 1);

    const fileInfo = fileList?.find((ele) => ele.filenamePay === filename);
    if (fileInfo && fileInfo.filename) {
      return `<audio controls style="width:100%; margin:8px 0;"><source src="${fileUrl}/${fileInfo.filename}" type="audio/mpeg"></audio>`;
    }
  });
  bot.innerHTML = contentHtml;
}
function renderContentHtml() {
  const bot = document.getElementById('content-message');
  contentHtml = bot.innerHTML;
  // assign data to POST
  answerContentRaw = bot.innerHTML;

  // replace [[image-data=...]]
  contentHtml = contentHtml.replace(/\[\[image-data=(.*?)\]\]/g, (match, url) => {
    return `<img src="${url}" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`;
  });

  // replace [[audio-data=...]]
  contentHtml = contentHtml.replace(/\[\[audio-data=(.*?)\]\]/g, (match, url) => {
    const lastSlashIndex = url.lastIndexOf('/');
    const fileUrl = url.substring(0, lastSlashIndex);
    const filename = url.substring(lastSlashIndex + 1);
    const audioPay = fileList?.find((ele) => ele.filename === filename)?.filenamePay ?? 0;
    if (isFreeViewSwitch.checked) {
      //pay
      return `<audio controls style="width:100%; margin:8px 0;"><source src="${fileUrl}/${audioPay}" type="audio/mpeg"></audio>`;
    } else {
      //free
      return `<audio controls style="width:100%; margin:8px 0;"><source src="${url}" type="audio/mpeg"></audio>`;
    }
  });

  // replace [[video-data=...]]
  contentHtml = contentHtml.replace(/\[\[video-data=(.*?)\]\]/g, (match, url) => {
    return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${url}"></iframe>`;
  });

  // replace [[payment]]
  if (isFreeViewSwitch.checked) {
    //pay
    contentHtml = contentHtml.replace(/\[\[payment\]\]/g, `<img src="${currentUrl}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`);
  } else {
    //free
    contentHtml = contentHtml.replace(/\[\[payment\]\]/g, ``);
  }

  bot.innerHTML = contentHtml;
}
// TODO:API
async function createAnswer() {
  getContent(); // assisgn value

  // validate
  if (validateContent() == false) {
    toastErr('Vui lòng nhập nội dung.');
    return;
  }
  try {
    const categoryAnsCode = document.getElementById('categoryAnsCode').value;
    const answerObject = document.getElementById('answerObject').value;
    await axios
      .post(
        currentUrl + '/api/admin/answer/createAnswer',
        {
          answerContentRaw,
          categoryAnsCode,
          answerObject,
          isFree: checkIsFree(),
          createdId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        toastOk('Cập nhập thành công');
        reloadPage('/dashboard/answer/list');
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log('err', error);
  }
}

async function updateAnswer() {
  getContent(); // assisgn value

  // validate
  if (validateContent() == false) {
    toastErr('Vui lòng nhập nội dung.');
    return;
  }
  try {
    const categoryAnsCode = document.getElementById('categoryAnsCode').value;
    const answerObject = document.getElementById('answerObject').value;
    await axios
      .put(
        currentUrl + '/api/admin/answer/updateAnswer/' + answerCode,
        {
          answerContentRaw,
          categoryAnsCode,
          answerObject,
          isFree: checkIsFree(),
          updatedId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        toastOk('Cập nhập thành công');
        reloadPage();
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log('err', error);
  }
}
