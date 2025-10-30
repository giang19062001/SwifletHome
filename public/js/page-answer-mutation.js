// TODO:INIT
const answerCode = currentPath.includes('/update')
  ? currentPath.split('/').pop()
  : null;
const pageElement = 'page-answer-mutation';

document.addEventListener('DOMContentLoaded', function () {
  renderContentHtml();
});

// TODO:RENDER
function renderContentHtml() {
  const bot = document.getElementById('content-message');
  contentHtml = bot.innerHTML;
  answerContentRaw = bot.innerHTML;

  // replace [[image-data=...]]
  contentHtml = contentHtml.replace(
    /\[\[image-data=(.*?)\]\]/g,
    `<img src="$1" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`,
  );

  // replace [[audio-data=...]]
  contentHtml = contentHtml.replace(
    /\[\[audio-data=(.*?)\]\]/g,
    `<audio controls style="width:100%; margin:8px 0;"><source src="$1" type="audio/mpeg"></audio>`,
  );

  // replace [[video-data=...]]
  contentHtml = contentHtml.replace(
    /\[\[video-data=(.*?)\]\]/g,
    `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="$1"></iframe>`,
  );

  // replace [[payment]]
  contentHtml = contentHtml.replace(
    /\[\[payment\]\]/g,
    `<img src="${currentUrl}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`,
  );

  ;
  bot.innerHTML = contentHtml;
}
// TODO:API
async function createAnswer() {
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
