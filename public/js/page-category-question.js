let page = 1;
let limit = 10;
let pageElement = 'page-category-question'
document.addEventListener('DOMContentLoaded', function () {
    getAllCategoryQuestion(page, limit);
});
// FUNC
function changePage(p) {
   page = p;
   document.getElementById("privacy-main-pager").innerHTML = "";
   getAllCategoryQuestion(page, limit);
}
// RENDER
const renderAllQuestion = (data, objElement) => {
    let HTML = '';
    if (data?.list?.length) {
        let i = 1
        data?.list.forEach((ele) => {
            const rowHtml = `
         <tr class="text-center">
            <td><p>${page * i++}</p></td>
            <td><p>${ele.categoryName}</p></td>
            <td><p>${ele.createdAt ? moment(ele.createdAt).format("YYYY-MM-DD HH:mm:ss") : ""}</p></td>
            <td><p>${ele.createdId ?? ''}</p></td>
         </tr>`;
            HTML += rowHtml;
        });
        objElement.innerHTML = HTML;

        // render paging
        let pagerHTML = createPagerHTML(data.total, limit, page, 5, 'changePage');
        document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
    }
};
// API
async function getAllCategoryQuestion(currentPage, limit) {
    const objElement = document.querySelector(`#${pageElement} .body-table`);

    await axios
        .post(currentUrl + '/api/admin/categoryQuestion/getAll', {
            page: currentPage,
            limit: limit,
        },axiosAuth())
        .then(function (response) {
            console.log('response', response);
            if (response.status === 200 && response.data) {
                renderAllQuestion(response.data, objElement);
            }
        })
        .catch(function (error) {
            console.log('error', error);
        });
}
