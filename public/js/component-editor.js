// linehight
const Block = Quill.import('blots/block');

class LineHeightBlot extends Block {
  static blotName = 'lineheight';
  static tagName = 'P';

  static create(value) {
    const node = super.create();
    node.style.lineHeight = value;
    return node;
  }

  static formats(node) {
    return node.style.lineHeight || undefined;
  }
}

Quill.register(LineHeightBlot, true);

//  raw HTML
function insertRawHTML() {
  const htmlString = prompt('Nhập HTML code:');

  if (htmlString) {
    const range = this.quill.getSelection(true);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // chèn HTML vào editor
    const delta = this.quill.clipboard.convert(htmlString);
    this.quill.updateContents(delta, 'user');

    // move cursor
    this.quill.setSelection(range.index + delta.length(), 'silent');
  }
}

// quill
const quillGlobal = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }],
        [{ lineheight: ['1', '1.5', '2', '3'] }],
        ['link'],
        ['insertHTML'],
      ],
    },
  },
  placeholder: 'Nhập nội dung của bạn...',
});


// giá trị trạng thái hiện tại
let isHTMLMode = false;
let htmlContent = '';

// icon cho nút HTML
const htmlButton = document.querySelector('.ql-insertHTML');
const editorContainer = document.querySelector('#editor');

if (htmlButton && editorContainer) {
  htmlButton.innerHTML = '&lt;&gt;'; // Icon <>

  //  event listener để toggle giữa text và HTML
  htmlButton.addEventListener('click', function () {
    if (!isHTMLMode) {

      htmlContent = quillGlobal.root.innerHTML

      // tắt text
      quillGlobal.enable(false);

      // tạo textarea để hiển thị HTML
      const textarea = document.createElement('textarea');
      textarea.className = 'html-editor';
      textarea.value = htmlContent;

      // sync dữ liệu khi nhập trong textarea
      textarea.addEventListener('input', function() {
        quillGlobal.root.innerHTML = textarea.value;
      });

      // ẩn text, hiển thị textarea
      editorContainer.style.display = 'none';
      editorContainer.parentNode.insertBefore(textarea, editorContainer);
      isHTMLMode = true;
    } else {
      const textarea = document.querySelector('.html-editor');

      if (textarea) {
        // lấy HTML đã sửa
        const updatedHTML = textarea.value;

        // cập nhật nội dung vào quill
        quillGlobal.root.innerHTML = updatedHTML;

        // xóa textarea
        textarea.remove();
      }

      // hiện lại text
      editorContainer.style.display = 'block';
      quillGlobal.enable(true);
      isHTMLMode = false;
    }
  });
}

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

    toastErr('Chỉ được thêm duy nhất một [[payment]] tag');
    return;
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
