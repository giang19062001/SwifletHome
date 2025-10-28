const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await uploadFile(file);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  getAllFile();
});

// TODO: FUNC
function copyData(filename, source, mimetype) {
  let copiedName = '';
  if (mimetype.startsWith('audio/')) {
    copiedName = `[[audio-src=${currentUrl}/uploads/${source}/${filename}]]`;
  } else if (mimetype.startsWith('image/')) {
    copiedName = `[[image-src=${currentUrl}/uploads/${source}/${filename}]]`;
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    const iconSvg = getFileIcon(file.mimetype);
    createFileCard(objElement, {
      icon: iconSvg,
      name: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      source: file.source,
      date: new Date(file.createdAt).toLocaleDateString('vi-VN'),
    });
  });
};

const getFileIcon = (mimetype) => {
  const icons = {
    image: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    `,
    audio: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
  console.log(fileData);
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
        onclick="copyData('${fileData.filename}','${fileData.source}','${fileData.mimetype}')">
        Sao chép
      </button>
      ${
        fileData.filename !== 'PAYMENT'
          ? ` <button class="btn-out-err" 
        onclick="deleteFile('${fileData.filename}')">
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
      console.log('Upload thành công!');
    } else {
      console.log('Upload thất bại: ' + result.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}
async function deleteFile(filename) {
  await axios
    .delete(
      currentUrl + '/api/admin/uploadFile/deleteFile/' + filename,
      {},
      axiosAuth(),
    )
    .then(function (response) {
      console.log('response', response);
      if (response.status === 200 && response.data) {
        getAllFile();
      }
    })
    .catch(function (error) {
      console.log('error', error);
    });
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
