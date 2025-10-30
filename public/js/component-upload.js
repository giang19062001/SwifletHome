const fileInput = document.getElementById('fileInput');
const videoInputBox = document.getElementById('videoInputBox');
const urlLink = document.getElementById('urlLink');

const acceptMap = {
  image: 'image/*',
  audio: 'audio/*',
};

// image
document.getElementById('btnImage').addEventListener('click', () => {
  fileInput.accept = acceptMap.image;
  fileInput.click();
  videoInputBox.style.visibility = 'hidden'; // ẩn ô nhập video nếu đang mở
});

//  audio
document.getElementById('btnAudio').addEventListener('click', () => {
  fileInput.accept = acceptMap.audio;
  fileInput.click();
  videoInputBox.style.visibility = 'hidden';
});

// add video
document.getElementById('btnVideo').addEventListener('click', () => {
  videoInputBox.style.visibility =
    videoInputBox.style.visibility === 'hidden' ? 'visible' : 'hidden';
});

// choose file image, audio
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await uploadFile(file);
  }
  e.target.value = '';
});

// push video
document.getElementById('videoAddBtn').addEventListener('click', async () => {
  const url = urlLink.value.trim();
  if (!url) return alert('Vui lòng nhập link video!');

  await uploadVideoLink(url);

  urlLink.value = '';
  videoInputBox.style.visibility = 'hidden';
});

// cancel video
document.getElementById('videoCancelBtn').addEventListener('click', () => {
  urlLink.value = '';
  videoInputBox.style.visibility = 'hidden';
});

document.addEventListener('DOMContentLoaded', function () {
  getAllFile();
});

// TODO: FUNC
function convertToEmbedUrl(youtubeUrl) {
  function extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#/]+)/,
      /youtube\.com\/watch\?.*v=([^&?#/]+)/,
      /youtu\.be\/([^&?#/]+)/,
    ];

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
function copyData(filename, source, mimetype) {
  console.log('filename', filename);
  console.log('source', source);
  console.log('mimetype', mimetype);

  let copiedName = '';
  if (mimetype.startsWith('audio/')) {
    copiedName = `[[audio-data=${currentUrl}/uploads/${source}/${filename}]]`;
  } else if (mimetype.startsWith('image/')) {
    copiedName = `[[image-data=${currentUrl}/uploads/${source}/${filename}]]`;
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
        source: file.source,
        date: new Date(file.createdAt).toLocaleDateString('vi-VN'),
      });
    }
  });
};

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
  card.className = 'file-card';

  card.innerHTML = `
    <div class="file-icon">${fileData.icon}</div>
    <div class="file-info">
      <div class="file-name">${fileData.name}</div>
      ${fileData.date ? `<div class="file-meta"><span class="file-date">${fileData.date}</span></div>` : ''}
    </div>
    <div class="file-button">
      <button class="copy-btn btn-common-out" 
        onclick="copyData('${fileData.filename}','${fileData.source ?? ''}','${fileData.mimetype}')">
        Sao chép
      </button>
      ${
        fileData.filename !== 'PAYMENT'
          ? ` <button class="btn-out-err" 
        onclick="deleteFile('${fileData.filename}','${fileData.seq}','${fileData.mimetype}')">
        Xóa
      </button>`
          : ''
      }
     
    </div>
  `;

  container.appendChild(card);
};

// TODO:API
async function uploadFile(file, type) {
  if (!file) return;

  const formData = new FormData();
  formData.append('source', 'answer');
  formData.append('file', file);

  try {
    const response = await axios.post(
      '/api/admin/uploadFile/upload',
      formData,
      axiosAuth({
        'Content-Type': 'multipart/form-data',
      }),
    );

    if (response.data) {
      // reload file list
      getAllFile();
    } else {
      toastErr('Thêm thất bại');
    }
  } catch (error) {
    console.error('Upload error:', error);
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
      .delete(
        currentUrl + '/api/admin/uploadFile/deleteVideoLink/' + seq,
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
          getAllFile();
        } else {
          toastErr('Xóa thất bại');
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
  } else {
    // audio, image
    await axios
      .delete(
        currentUrl + '/api/admin/uploadFile/deleteFile/' + filename,
        axiosAuth(),
      )
      .then(function (response) {
        console.log('response', response);
        if (response.status === 200 && response.data) {
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
  const objElement = document.querySelector(`#${pageElement} .file-list`);

  await axios
    .post(currentUrl + '/api/admin/uploadFile/getAllFile', {}, axiosAuth())
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
