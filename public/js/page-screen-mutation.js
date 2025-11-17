let contentFields = [];

document.addEventListener('DOMContentLoaded', function () {
const params = new URLSearchParams(currentSearch);

// Lấy giá trị theo key
const screenKeyword = params.get("screen-keyword");
console.log(screenKeyword);
});

// TODO: FUNC
function getContentType() {
  let flower = 'hoa hồng';

  switch (flower) {
    case 'hoa hồng':
      console.log('Đây là hoa hồng.');
      break;
    case 'hoa hướng dương':
      console.log('Đây là hoa hướng dương.');
      break;
    default:
      console.log('Tôi không biết đó là hoa gì.');
  }
}
