let page = 1;
let limit = 10;
let pageElement = 'page-traceability';

document.addEventListener('DOMContentLoaded', function () {
  getTraceabilityList(page, limit);

  // Gắn sự kiện nút tìm kiếm & làm mới
  const btnApply = document.getElementById('btn-filter-apply');
  if (btnApply) {
    btnApply.addEventListener('click', function () {
      page = 1;
      getTraceabilityList(page, limit);
    });
  }

  const btnReset = document.getElementById('btn-filter-reset');
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      const elKeyword = document.getElementById('filterKeyword');
      if (elKeyword) elKeyword.value = '';
      const elType = document.getElementById('filterType');
      if (elType) elType.value = '';
      const elStatus = document.getElementById('filterStatus');
      if (elStatus) elStatus.value = '';
      const elFromDate = document.getElementById('filterFromDate');
      if (elFromDate) elFromDate.value = '';
      const elToDate = document.getElementById('filterToDate');
      if (elToDate) elToDate.value = '';
      page = 1;
      getTraceabilityList(page, limit);
    });
  }

  // Sự kiện nút lưu trạng thái trong modal
  const btnSaveStatus = document.getElementById('btnSaveSubmissionStatus');
  if (btnSaveStatus) {
    btnSaveStatus.addEventListener('click', updateTraceabilityStatus);
  }
});

function changePage(p) {
  page = p;
  document.getElementById('privacy-main-pager').innerHTML = '';
  getTraceabilityList(page, limit);
}

function getFilterParams() {
  const keyword = document.getElementById('filterKeyword')?.value?.trim() || '';
  const type = document.getElementById('filterType')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const fromDate = document.getElementById('filterFromDate')?.value || '';
  const toDate = document.getElementById('filterToDate')?.value || '';

  const params = {
    page: page,
    limit: limit,
  };

  if (keyword) params.keyword = keyword;
  if (type) params.type = type;
  if (status) params.status = status;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  return params;
}

async function getTraceabilityList(currentPage, limit) {
  const objElement = document.querySelector(`#${pageElement} .body-table`);
  if (!objElement) return;

  showSkeleton(objElement, limit, 8);

  const payload = getFilterParams();

  await axios
    .post(CURRENT_URL + '/api/admin/traceability/getList', payload, axiosAuth())
    .then(function (response) {
      if (response.status === 200 && response.data) {
        renderTraceabilityList(response.data, objElement);
      } else {
        renderEmptyRowTable(objElement, 8);
        hideSkeleton(objElement);
      }
    })
    .catch(function (err) {
      console.error('Lỗi khi lấy danh sách hồ sơ truy xuất:', err);
      renderEmptyRowTable(objElement, 8);
      hideSkeleton(objElement);
    });
}

function renderTraceabilityList(data, objElement) {
  let HTML = '';
  const list = data?.list || (Array.isArray(data?.data) ? data.data : []);
  const total = data?.total || 0;

  if (list && list.length) {
    let i = 1;
    list.forEach((ele) => {
      let statusBadgeClass = 'badge bg-warning text-dark';
      if (ele.status === 'APPROVED') statusBadgeClass = 'badge bg-success';
      if (ele.status === 'REFUSED') statusBadgeClass = 'badge bg-danger';

      const isExt = Boolean(ele.isExternal || ele.batchType === 'EXTERNAL');
      const typeBadge = isExt
        ? `<span class="badge bg-secondary text-white px-2 py-1"><i class="fa fa-globe me-1"></i>Ngoại bộ</span>`
        : `<span class="badge bg-primary text-white px-2 py-1"><i class="fa fa-home me-1"></i>Nội bộ</span>`;

      const originInfo = isExt
        ? `<p class="mb-0 text-muted fst-italic">Truy xuất ngoại bộ</p>`
        : `<p class="mb-0 fw-bold">${ele.userHomeName || '-'}</p>
           <p class="mb-0 text-muted small">${ele.userHomeCode || ''}</p>`;

      const rowHtml = `
        <tr class="text-center align-middle">
          <td><p class="mb-0">${(page - 1) * limit + i++}</p></td>
          <td>${typeBadge}</td>
          <td>
            <p class="mb-0 fw-bold">${ele.userName || 'Chưa cập nhật'}</p>
            <p class="mb-0 text-muted small">${ele.userPhone || ''}</p>
          </td>
          <td>
            ${originInfo}
          </td>
          <td><span class="${statusBadgeClass}">${ele.statusLabel || ele.status}</span></td>
          <td><p class="mb-0">${ele.createdAt ? moment(ele.createdAt).format('YYYY-MM-DD HH:mm') : ''}</p></td>
          <td style="width: 300px;">
            <div class="d-flex justify-content-center gap-1">
              <a class="btn btn-sm btn-info text-white" href="/dashboard/traceability/detail/${ele.traceabilityId}" title="Xem chi tiết trang">
                <i class="fa fa-eye me-1"></i> Chi tiết
              </a>
              ${
                ele.hasFinalForm && !isExt
                  ? `<button class="btn btn-sm btn-info" onclick="openStatusModal(${ele.seq}, '${ele.status}', '${ele.traceabilityId}', ${isExt})" title="Cập nhật trạng thái">
                <i class="fa fa-edit"></i> Duyệt
              </button>`
                  : ''
              }
            </div>
          </td>
        </tr>`;
      HTML += rowHtml;
    });
    objElement.innerHTML = HTML;

    let pagerHTML = renderPager(total, limit, page, 5, 'changePage');
    document.getElementById('privacy-main-pager').innerHTML = pagerHTML;
  } else {
    renderEmptyRowTable(objElement, 8);
  }
  hideSkeleton(objElement);
}

function openStatusModal(seq, currentStatus, code, isExternal = false) {
  const modalEl = document.querySelector('.traceability-status-modal');
  if (!modalEl) return;

  modalEl.querySelector('#statusSubmissionSeq').value = seq;
  const isExtEl = modalEl.querySelector('#statusIsExternal');
  if (isExtEl) isExtEl.value = isExternal ? 'true' : 'false';
  modalEl.querySelector('#statusTraceabilityCode').innerText = code || '';
  modalEl.querySelector('#selectSubmissionStatus').value = currentStatus || 'PROCESSING';

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function updateTraceabilityStatus() {
  const modalEl = document.querySelector('.traceability-status-modal');
  if (!modalEl) return;

  const seq = modalEl.querySelector('#statusSubmissionSeq').value;
  const isExternal = modalEl.querySelector('#statusIsExternal')?.value === 'true';
  const status = modalEl.querySelector('#selectSubmissionStatus').value;

  if (!seq) {
    toastErr('Không tìm thấy thông tin bản ghi');
    return;
  }

  await axios
    .put(CURRENT_URL + '/api/admin/traceability/updateStatus/' + seq, { status: status, isExternal: isExternal }, axiosAuth())
    .then(function (response) {
      if (response.status === 200 && response.data) {
        toastOk('Cập nhật trạng thái thành công');
        closeCommonModal(modalEl);
        getTraceabilityList(page, limit);
      } else {
        toastErr('Cập nhật trạng thái thất bại');
      }
    })
    .catch(function (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      toastErr('Cập nhật trạng thái thất bại');
    });
}
