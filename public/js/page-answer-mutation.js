// FUNC
const answerCode = currentPath.includes('/update')
  ? currentPath.split('/').pop()
  : null;
const pageElement = 'page-answer-mutation';

//RENDER
function renderContentHtml() {
  const bot = document.getElementById('content-message');
  answerContent = bot.innerHTML;
  answerContentRaw = bot.innerHTML;

  // replace [[image-src=...]]
  answerContent = answerContent.replace(
    /\[\[image-src=(.*?)\]\]/g,
    `<img src="$1" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`,
  );

  // replace [[audio-src=...]]
  answerContent = answerContent.replace(
    /\[\[audio-src=(.*?)\]\]/g,
    `<audio controls style="width:100%; margin:8px 0;"><source src="$1" type="audio/mpeg">Trình duyệt không hỗ trợ audio</audio>`,
  );

  // replace [[payment]]
  answerContent = answerContent.replace(
    /\[\[payment\]\]/g,
    `<img src="${currentUrl}/images/pay-btn.png" alt="image" style="max-width:100%; border-radius:8px; margin:8px 0;">`,
  );

  bot.innerHTML = answerContent;
}
// API
async function createAnswer() {
  try {
    const categoryAnsCode = document.getElementById('categoryAnsCode').value;
    const answerObject = document.getElementById('answerObject').value;
    await axios
      .post(currentUrl + '/api/admin/answer/createAnswer', {
        answerContent,
        answerContentRaw,
        categoryAnsCode,
        answerObject,
        createdId: user.userId,
      },axiosAuth())
      .then(function (response) {
        console.log('response', response);
        toastOk('Cập nhập thành công');
        // back to list
        setTimeout(() => {
          window.location.href = '/dashboard/answer/list';
        }, 1500);
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
      .put(currentUrl + '/api/admin/answer/updateAnswer', {
        answerCode,
        answerContent,
        answerContentRaw,
        categoryAnsCode,
        answerObject,
      },axiosAuth())
      .then(function (response) {
        console.log('response', response);
        toastOk('Cập nhập thành công');
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } catch (error) {
    console.log('err', error);
  }
}
