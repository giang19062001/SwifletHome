let fileMediaAudioList = [];
// Audio
const audioInputBox = document.querySelector('.audio-input-box');
const audioInputFree = document.getElementById('audioInputFree');
const audioInputPay = document.getElementById('audioInputPay');
const audioCancelBtn = document.getElementById('audioCancelBtn');
const audioAddBtn = document.getElementById('audioAddBtn');

// Video
const videoInputBox = document.querySelector('.video-input-box');
const videoInputName = document.getElementById('videoInputName');
const videoInputUrl = document.getElementById('videoInputUrl');
const videoCancelBtn = document.getElementById('videoCancelBtn');
// TODO: FUNC
document.getElementById('isUpgradePreview').addEventListener('change', (event) => {
  const objElement = document.querySelector(`#file-audio-box`);

  renderAllFile(fileMediaAudioList, objElement);
});

const resetInputs = (...inputs) => inputs.forEach((el) => (el.value = ''));

// Event: audio
audioCancelBtn.addEventListener('click', () => {
  resetInputs(audioInputFree, audioInputPay);
});

// Event: video
videoCancelBtn.addEventListener('click', () => {
  resetInputs(videoInputName, videoInputUrl);
});

// Push: audio
audioAddBtn.addEventListener('click', async () => {
  const freeFile = audioInputFree.files[0];
  const payFile = audioInputPay.files[0];

  if (!freeFile || !payFile) {
    toastErr('Vui lòng chọn cả hai file audio!');
    return;
  }
  await uploadMediaAudios(freeFile, payFile);

  //reset
  resetInputs(audioInputFree, audioInputPay);
});

// Push: video
videoAddBtn.addEventListener('click', async () => {
  const url = videoInputUrl.value.trim();
  const name = videoInputName.value.trim();
  if (!name) {
    toastErr('Vui lòng nhập tên video!');
    return;
  }
  if (!url) {
    toastErr('Vui lòng nhập link video!');
    return;
  }

  await uploadMediaVideoLink(name, url);

  //reset
  resetInputs(videoInputName, videoInputUrl);
});

document.addEventListener('DOMContentLoaded', function () {
  getAllMediaAudioFile();
  getAllMediaVideoLink();
});

// TODO: FUNC
// convert embed sang watch của youtube
function convertToEmbedUrl(youtubeUrl) {
  function extractVideoId(url) {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#/]+)/, /youtube\.com\/watch\?.*v=([^&?#/]+)/, /youtu\.be\/([^&?#/]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  const videoId = extractVideoId(youtubeUrl);

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  return `https://www.youtube.com/embed/${videoId}?showinfo=0`;
}

// TODO: RENDER
const renderAllFile = (data, objElement) => {
  const getFileIcon = (mimetype) => {
    const icons = {
      image: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#59AC77">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    `,
      audio: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#279EFF">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `,
    };

    if (mimetype.startsWith('image/')) return icons.image;
    if (mimetype.startsWith('audio/')) return icons.audio;

    return icons.image;
  };

  const createFileCard = (container, fileData) => {
    const card = document.createElement('div');
    card.className = `file-card`;

    card.innerHTML = `
    <div class="file-icon">${fileData.icon}</div>
    <div class="file-info">
      <div class="file-name">${fileData.name}</div>
      ${fileData.date ? `<div class="file-meta"><span class="file-date">${fileData.date}</span></div>` : ``}
    </div>
    <div class="file-button">
      <button class="btn-error-out" 
        onclick="deleteFile('${fileData.seq}','${fileData.mimetype}')">
        Xóa
      </button>   
    </div>`;

    container.appendChild(card);
  };

  objElement.innerHTML = '';
  // card for each file
  data.forEach((file) => {
    if (file.mimetype === 'video/youtube' && file.urlLink) {
      createFileCard(objElement, {
        icon: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f75270" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 8.5s0-2.5-2-3.5c-1.5-1-8-1-8-1s-6.5 0-8 1C2 6.5 2 8.5 2 8.5v7s0 2.5 2 3.5c1.5 1 8 1 8 1s6.5 0 8-1c2-1 2-3.5 2-3.5v-7z"></path>
        <polygon points="10 15 15 12 10 9 10 15"></polygon>
      </svg>
    `,
        seq: file.seq,
        name: file.originalname,
        filename: file.urlLink,
        mimetype: file.mimetype,
      });
    } else {
      // audio
      const isUpgradePreview = document.getElementById('isUpgradePreview').checked ? 'UPGRADE' : 'NOT_UPGRADE';

      if (isUpgradePreview === 'UPGRADE' && file.isFree == 'N') {
        const iconSvg = getFileIcon(file.mimetype);
        createFileCard(objElement, {
          icon: iconSvg,
          seq: file.seq,
          name: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          date: new Date(file.createdAt).toLocaleDateString('vi-VN'),
        });
      }
      if (isUpgradePreview === 'NOT_UPGRADE' && file.isFree == 'Y') {
        const iconSvg = getFileIcon(file.mimetype);
        createFileCard(objElement, {
          icon: iconSvg,
          seq: file.seq,
          name: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          date: new Date(file.createdAt).toLocaleDateString('vi-VN'),
        });
      }
    }
  });
};
// TODO:API

async function uploadMediaAudios(freeFile, payFile) {
  // Tạo FormData
  const formData = new FormData();
  formData.append('mediaAudioFree', freeFile);
  formData.append('mediaAudioPay', payFile);

  try {
    const response = await axios.post(
      '/api/admin/upload/uploadMediaAudios',
      formData,
      axiosAuth({
        'Content-Type': 'multipart/form-data',
      }),
    );

    if (response.data) {
      // reload file list
      toastOk('Thêm file thành công');
      getAllMediaAudioFile();

      // clear input
      resetInputs(audioInputFree, audioInputPay);
    } else {
      toastErr('Thêm file thất bại');
    }
  } catch (error) {
    console.error('Upload error:', error.response.data);
    if (error.response.data) {
      toastErr(error.response.data.message);
    }
  }
}
async function uploadMediaVideoLink(name, url) {
  try {
    await axios
      .post(
        CURRENT_URL + '/api/admin/upload/uploadMediaVideoLink',
        {
          originalname: name,
          urlLink: url,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          // reload file list

          toastOk('Thêm thành công');
          getAllMediaVideoLink();

          // clear input
          resetInputs(videoInputUrl);
        } else {
          toastErr('Thêm thất bại');
        }
      })
      .catch(function (err) {
        console.log('err', err);
      });
  } catch (err) {
    console.log(err);
  }
}

async function deleteFile(seq, mimetype) {
  if (mimetype.startsWith('video/')) {
    // video youyube
    await axios
      .delete(CURRENT_URL + '/api/admin/upload/deleteMediaVideoLink/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Xóa thành công');
          getAllMediaVideoLink();
        } else {
          toastErr('Xóa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } else if (mimetype.startsWith('audio/')) {
    // audio
    await axios
      .delete(CURRENT_URL + '/api/admin/upload/deleteMediaAudio/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Xóa thành công');
          getAllMediaAudioFile();
        } else {
          toastErr('Xóa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  }
}

async function getAllMediaAudioFile() {
  const objElement = document.querySelector(`#file-audio-box`);

  await axios
    .get(CURRENT_URL + '/api/admin/upload/getAllMediaAudioFile', axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        fileMediaAudioList = response.data; // set biến global
        renderAllFile(fileMediaAudioList, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}

async function getAllMediaVideoLink() {
  const objElement = document.querySelector(`#file-video-box`);

  await axios
    .get(CURRENT_URL + '/api/admin/upload/getAllMediaVideoLink', axiosAuth())
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        renderAllFile(response.data, objElement);
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
}
