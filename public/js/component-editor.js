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

// listen event copy/paste
quillGlobal.root.addEventListener('paste', (e) => {
  e.preventDefault();
  // >> santizer string >> html
  getEditorContent();
});

function removeText(text) {
  let html = quillGlobal.root.innerHTML;
  html = html.replaceAll(text, '');
  quillGlobal.root.innerHTML = html;
  return quillGlobal.root.innerHTML;
}

function validateContent() {
  const text = quillGlobal.root.textContent.trim();
  if (!text || text === '' || text === '\n') {
    return false;
  }
  return true;
}

function getEditorContent() {
  document.getElementById('content-message').innerHTML = quillGlobal.root.innerHTML;

  // >> santizer string >> html
  renderContentHtml();
}
