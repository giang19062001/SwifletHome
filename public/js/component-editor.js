//Quill
const quillGlobal = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ color: [] }, { background: [] }], [{ list: 'ordered' }], ['link']],
    },
  },
  placeholder: 'Nhập nội dung của bạn...',
});

// lắng nghe sự kiện copy/paste
quillGlobal.root.addEventListener('paste', (e) => {
  e.preventDefault();
  // >> santizer string >> html
  getThenRenderEditorContent();
});

// lắng nghe sự kiện nhập
quillGlobal.on('text-change', (delta, oldDelta, source) => {
  if (source !== 'user') return; // Chỉ kiểm tra khi  nhập

  const text = quillGlobal.getText(); // Lấy plain text

  const countPayment = (text.match(/\[\[payment\]\]/g) || []).length;

  if (countPayment > 1) {
    // Xóa  [[payment]] tag mới nhất mà vừa chèn
    quillGlobal.setContents(oldDelta);

    alert('Chỉ được thêm duy nhất một [[payment]] tag');
    return
  }
});


function removeEditorText(text) {
  let html = quillGlobal.root.innerHTML;
  html = html.replaceAll(text, '');
  quillGlobal.root.innerHTML = html;
  return quillGlobal.root.innerHTML;
}

function setEditorContent(html) {
  quillGlobal.root.innerHTML = html;
}
function getEditorContent() {
  return quillGlobal.root.innerHTML;
}
function validateEditorContent() {
  const text = quillGlobal.root.textContent.trim();
  if (!text || text === '' || text === '\n') {
    return false;
  }
  return true;
}

function getThenRenderEditorContent() {
  document.getElementById('content-message').innerHTML = quillGlobal.root.innerHTML;

  // >> santizer string >> html
  renderContentHtml();
}
