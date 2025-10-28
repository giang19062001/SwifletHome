//Quill
const quillAnswer = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }],
        ['link', 'video'],
      ],
    },
  },
  placeholder: 'Nhập nội dung của bạn...',
});

// listen event copy/paste
quillAnswer.root.addEventListener('paste', (e) => {
  e.preventDefault();
  // >> santizer string >> html
  getContent();
});


function getContent() {
  document.getElementById('content-message').innerHTML = quillAnswer.root.innerHTML;

  // >> santizer string >> html
  renderContentHtml();
}
