let fileList = [];
// Elements
const imgInput = document.getElementById('imgInput');
const fileBox = document.querySelector('.file-box');

// Audio
const audioInputBox = document.querySelector('.audio-input-box');
const audioInputFree = document.getElementById('audioInputFree');
const audioInputPay = document.getElementById('audioInputPay');
const audioCancelBtn = document.getElementById('audioCancelBtn');
const audioAddBtn = document.getElementById('audioAddBtn');

// Video
const videoInputBox = document.querySelector('.video-input-box');
const videoInput = document.getElementById('videoInput');
const videoCancelBtn = document.getElementById('videoCancelBtn');

// Buttons
const btnImage = document.getElementById('btnImage');
const btnAudio = document.getElementById('btnAudio');
const btnVideo = document.getElementById('btnVideo');

// Helper functions
const showBox = (boxToShow) => {
  [fileBox, audioInputBox, videoInputBox].forEach((box) => {
    box.style.display = box === boxToShow ? 'flex' : 'none';
  });
};

const resetInputs = (...inputs) => inputs.forEach((el) => (el.value = ''));

// Event: image
btnImage.addEventListener('click', () => imgInput.click());

// Event: audio
btnAudio.addEventListener('click', () => showBox(audioInputBox));
audioCancelBtn.addEventListener('click', () => {
  resetInputs(audioInputFree, audioInputPay);
  showBox(fileBox);
});

// Event: video
btnVideo.addEventListener('click', () => showBox(videoInputBox));
videoCancelBtn.addEventListener('click', () => {
  resetInputs(videoInput);
  showBox(fileBox);
});

// Push: audio
audioAddBtn.addEventListener('click', async () => {
  const freeFile = audioInputFree.files[0];
  const payFile = audioInputPay.files[0];

  if (!freeFile || !payFile) {
    toastErr('Vui lòng chọn cả hai file audio!');
    return;
  }
  await uploadAudios(freeFile, payFile);

  resetInputs(videoInput);
  showBox(fileBox);
});

// Push: video
videoAddBtn.addEventListener('click', async () => {
  const url = videoInput.value.trim();
  if (!url) return alert('Vui lòng nhập link video!');

  await uploadVideoLink(url);

  resetInputs(videoInput);
  showBox(fileBox);
});

// Push: image
imgInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await uploadImg(file);
  }
  resetInputs(imgInput);
  showBox(fileBox);
});

document.addEventListener('DOMContentLoaded', function () {
  getAllFile();
});

// TODO: FUNC
/// Hàm hiển thị/ẩn nút PAYMENT theo radio isFree
function togglePaymentButton() {
  const isFree = document.querySelector('input[name="isFree"]:checked')?.value;
  document.querySelector('button.PAYMENT').style.display = (isFree === 'Y') ? 'none' : 'block';
}
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

// copy data để paste vào editors
function copyData(filename, mimetype) {
  console.log('filename', filename);
  console.log('mimetype', mimetype);

  let copiedName = '';
  if (mimetype.startsWith('audio/')) {
    if (filename.includes('editorAudio')) {
      copiedName = `[[audio-data=${currentUrl}/uploads/audios/editors/${filename}]]`;
    }
  } else if (mimetype.startsWith('image/')) {
    if (filename.includes('editorImg')) {
      copiedName = `[[image-data=${currentUrl}/uploads/images/editors/${filename}]]`;
    }
  } else if (mimetype.startsWith('video/')) {
    copiedName = `[[video-data=${convertToEmbedUrl(filename)}]]`;
  } else if (mimetype.startsWith('payment/')) {
    copiedName = `[[payment]]`;
  }
  try {
    navigator.clipboard.writeText(copiedName);
    console.log(copiedName);
  } catch {
    console.log(copiedName);
  }
}

// TODO: RENDER
const renderAllFile = (data, objElement) => {
  console.log(objElement);
  fileList = data; // set global

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
    if (fileData.filename == 'PAYMENT') {
    }
    card.className = `file-card`;

    card.innerHTML = `
    <div class="file-icon">${fileData.icon}</div>
    <div class="file-info">
      <div class="file-name">${fileData.name}</div>
      ${fileData.date ? `<div class="file-meta"><span class="file-date">${fileData.date}</span></div>` : ``}
    </div>
    <div class="file-button">
         ${fileData.filename == 'PAYMENT'
        ? `<button style="display:none" class="copy-btn btn-main-out PAYMENT" 
        onclick="copyData('${fileData.filename}','${fileData.mimetype}')">
        Sao chép
      </button>`
        : `<button class="copy-btn btn-main-out" 
        onclick="copyData('${fileData.filename}','${fileData.mimetype}')">
        Sao chép
      </button>`
      }
      ${fileData.filename !== 'PAYMENT'
        ? ` <button class="btn-err-out" 
        onclick="deleteFile('${fileData.filename}','${fileData.seq}','${fileData.mimetype}')">
        Xóa
      </button>`
        : ''
      }
     
    </div>
  `;

    container.appendChild(card);
  };

  objElement.innerHTML = '';

  // payment card

  createFileCard(objElement, {
    icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC50F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M6 12h.01M18 12h.01"></path>
    </svg>
    `,
    name: 'Trả phí',
    filename: 'PAYMENT',
    mimetype: 'payment/',
  });

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
        name: file.urlLink,
        filename: file.urlLink,
        mimetype: file.mimetype,
      });
    } else {
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
  });
};

// TODO:API
async function uploadImg(file) {
  if (!file) return;

  const formData = new FormData();
  formData.append('createdId', user.userId);
  formData.append('editorImg', file);

  try {
    const response = await axios.post(
      '/api/admin/uploadFile/uploadImg',
      formData,
      axiosAuth({
        'Content-Type': 'multipart/form-data',
      }),
    );

    if (response.data) {
      // reload file list
      toastOk('Thêm file thành công');
      getAllFile();
    } else {
      toastErr('Thêm file thất bại');
    }
  } catch (error) {
    console.error('Upload error:', error);
    if (error.response.data) {
      toastErr(error.response.data.message);
    }
  }
}
async function uploadAudios(freeFile, payFile) {
  // Tạo FormData
  const formData = new FormData();
  formData.append('createdId', user.userId);
  formData.append('editorAudioFree', freeFile);
  formData.append('editorAudioPay', payFile);

  try {
    const response = await axios.post(
      '/api/admin/uploadFile/uploadAudios',
      formData,
      axiosAuth({
        'Content-Type': 'multipart/form-data',
      }),
    );

    if (response.data) {
      // reload file list
      toastOk('Thêm file thành công');
      getAllFile();
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
async function uploadVideoLink(urlLink) {
  try {
    await axios
      .post(
        currentUrl + '/api/admin/uploadFile/uploadVideoLink',
        {
          urlLink: urlLink,
          createdId: user.userId,
        },
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Thêm thành công');
          getAllFile();
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

async function deleteFile(filename, seq, mimetype) {
  if (mimetype.startsWith('video/')) {
    // video youyube
    await axios
      .delete(currentUrl + '/api/admin/uploadFile/deleteVideoLink/' + seq, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Xóa thành công');
          getAllFile();
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
      .delete(currentUrl + '/api/admin/uploadFile/deleteAudio/' + filename, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Xóa thành công');
          getAllFile();
        } else {
          toastErr('Xóa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } else if (mimetype.startsWith('image/')) {
    // audio
    await axios
      .delete(currentUrl + '/api/admin/uploadFile/deleteImg/' + filename, axiosAuth())
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          toastOk('Xóa thành công');
          getAllFile();
        } else {
          toastErr('Xóa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  }
}

async function getAllFile() {
  const objElement = document.querySelector(`.file-box`);

  await axios
    .get(currentUrl + '/api/admin/uploadFile/getAllFile', axiosAuth())
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
