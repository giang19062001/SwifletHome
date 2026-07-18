window.Apex = {
  chart: {
    foreColor: '#565c66',
    toolbar: { show: false },
  },
  stroke: { width: 3 },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark' },
  grid: {
    borderColor: "#535A6C",
    xaxis: { lines: { show: true } }
  }
};

const rootStyles = getComputedStyle(document.documentElement);
const dynamicColor1 = rootStyles.getPropertyValue('--main-color').trim() || '#3F51B5';
const dynamicColor2 = rootStyles.getPropertyValue('--main-color-light').trim() || '#2196F3';
const dynamicColor3 = rootStyles.getPropertyValue('--main-color-lighter').trim() || '#5961f9';
const chartColors = [dynamicColor1, dynamicColor2, dynamicColor3];
// === SPARKLINE CHARTS (4 cái nhỏ) ===
const sparkCategories = [];
for (let i = 9; i >= 0; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  sparkCategories.push("Tháng " + (d.getMonth() + 1));
}

const sparkConfig = {
  chart: {
    group: 'sparks',
    type: 'line',
    height: 80,
    sparkline: { enabled: true },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 2,
      opacity: 0.3,
    }
  },
  stroke: { curve: 'smooth' },
  markers: { size: 0 },
  colors: ['#fff'],  // giữ trắng
  tooltip: {
    enabled: true,
    theme: 'dark',
    x: { show: false },
    y: {
      title: {
        formatter: function (seriesName, opts) {
          return sparkCategories[opts.dataPointIndex] + ':';
        }
      }
    }
  },
  xaxis: {
    categories: sparkCategories,
    crosshairs: { width: 1 }
  },
  grid: { padding: { top: 20, bottom: 30, left: 110 } }
};

var spark1 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark1' }, series: [{ name: '', data: [] }] };
var spark2 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark2' }, series: [{ name: '', data: [] }] };
var spark3 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark3' }, series: [{ name: '', data: [] }] };
var spark4 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark4' }, series: [{ name: '', data: [] }] };

new ApexCharts(document.querySelector("#spark1"), spark1).render();
new ApexCharts(document.querySelector("#spark2"), spark2).render();
new ApexCharts(document.querySelector("#spark3"), spark3).render();
new ApexCharts(document.querySelector("#spark4"), spark4).render();


// === LINE CHART (Media) ===
const mediaLabels = [];
for (let i = 5; i >= 0; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  mediaLabels.push(String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
}

var optionsLine = {
  chart: {
    height: 328,
    type: 'line',
    zoom: { enabled: false },
    dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.2 }
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: chartColors,
  series: [
    { name: "Nhà yến của khách hàng", data: [] },
    { name: "Nhà yến SCT đã duyệt", data: [] },
    { name: "Nhà yến SCT chờ duyệt", data: [] }
  ],
  title: {
    text: 'Thống kê',
    align: 'left',
    offsetY: 25,
    offsetX: 20,
    style: { color: '#565c66', fontSize: '16px', fontWeight: 600 }
  },
  subtitle: {
    text: 'Nhà Yến',
    offsetY: 55,
    offsetX: 20,
    style: { color: '#565c66', fontSize: '13px' }
  },
  markers: { size: 6, strokeWidth: 0, hover: { size: 9 } },
  grid: { show: false }, // LOẠI BỎ GRID
  labels: mediaLabels,
  xaxis: {
    tooltip: { enabled: false },
    labels: { style: { colors: '#565c66' } }
  },
  yaxis: { labels: { style: { colors: '#565c66' } } },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -20,
    labels: { colors: '#565c66' }
  }
};

var chartLine = new ApexCharts(document.querySelector('#line-adwords'), optionsLine);
chartLine.render();


// === DONUT CHART ===
var optionsCircle4 = {
  chart: {
    type: 'donut',
    height: 345,
    width: 380,
  },
  title: {
    text: 'Thống kê khách hàng, công xưởng',
    align: 'left',
    margin: 30,
    style: { color: '#565c66', fontSize: '16px', fontWeight: 600 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { 
            show: true,
            fontSize: '12px'
          },
          value: { 
            show: true,
            fontSize: '20px'
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Tổng khách hàng',
            fontSize: '12px',
            formatter: function (w) {
              return w.globals.seriesTotals[0];
            }
          }
        }
      }
    }
  },
  stroke: { width: 0 },
  colors: chartColors,
  series: [],
  labels: ['Tổng khách hàng', 'Tổng công xưởng đã duyệt', 'Tổng công xưởng chờ duyệt'],
  legend: {
    show: true,
    floating: false,
    position: 'bottom',
    labels: { colors: '#565c66' }
  },
  grid: { show: false } // LOẠI BỎ GRID
};

var chartCircle4 = new ApexCharts(document.querySelector('#radialBarBottom'), optionsCircle4);
chartCircle4.render();


// === BAR CHART ===
var optionsBar = {
  chart: {
    height: 380,
    type: 'bar',
    stacked: true,
  },
  plotOptions: {
    bar: { columnWidth: '30%', horizontal: false },
  },
  colors: chartColors,
  series: [
    { name: 'Sản lượng tổ yến đã thu hoạch', data: [] },
    { name: 'Sản lượng tổ yến còn lại', data: [] }
  ],
  xaxis: {
    categories: mediaLabels,
    labels: { style: { colors: '#565c66' } }
  },
  yaxis: { labels: { style: { colors: '#565c66' } } },
  legend: { labels: { colors: '#565c66' } },
  fill: { opacity: 1 },
  grid: { show: false } // LOẠI BỎ GRID
};

var chartBar = new ApexCharts(document.querySelector("#barchart"), optionsBar);
chartBar.render();


// === AREA CHART ===
var optionsArea = {
  chart: {
    height: 380,
    type: 'area',
    stacked: false,
  },
  stroke: { curve: 'straight', width: 2 },
  colors: chartColors,
  series: [
    { name: "Yêu cầu QR chờ duyệt", data: [] },
    { name: "Yêu cầu QR đã duyệt", data: [] },
    { name: "QR đã được đăng bán", data: [] }
  ],
  xaxis: {
    categories: mediaLabels,
    labels: { style: { colors: '#565c66' } }
  },
  yaxis: { labels: { style: { colors: '#565c66' } } },
  tooltip: { followCursor: true },
  fill: { opacity: 0.8 },
  legend: { labels: { colors: '#565c66' } },
  grid: { show: false } // LOẠI BỎ GRID
};

var chartArea = new ApexCharts(document.querySelector("#areachart"), optionsArea);
chartArea.render();

// TODO: API
async function fetchOverview() {
  try {
    const res = await axios.get('/api/admin/report/getOverview', axiosAuth());
    if (res.data) {
      document.getElementById('totalDoctor').innerText = res.data.totalDoctor;
      document.getElementById('totalSightseeing').innerText = res.data.totalSightseeing;
      document.getElementById('totalGuestConsulation').innerText = res.data.totalGuestConsulation;
      document.getElementById('totalConsignment').innerText = res.data.totalConsignment;

      if (res.data.totalDoctorSeries) {
        ApexCharts.exec('spark1', 'updateSeries', [{ data: res.data.totalDoctorSeries }]);
      }
      if (res.data.totalSightseeingSeries) {
        ApexCharts.exec('spark2', 'updateSeries', [{ data: res.data.totalSightseeingSeries }]);
      }
      if (res.data.totalGuestConsulationSeries) {
        ApexCharts.exec('spark3', 'updateSeries', [{ data: res.data.totalGuestConsulationSeries }]);
      }
      if (res.data.totalConsignmentSeries) {
        ApexCharts.exec('spark4', 'updateSeries', [{ data: res.data.totalConsignmentSeries }]);
      }

      if (res.data.mediaUserHomeSeries && res.data.mediaSaleHomeApprovedSeries && res.data.mediaSaleHomeWaitingSeries) {
        chartLine.updateSeries([
          { name: "Nhà yến của khách hàng (Tổng: " + res.data.totalUserHome + ")", data: res.data.mediaUserHomeSeries },
          { name: "Nhà yến SCT đã duyệt (Tổng: " + res.data.totalSaleHomeApproved + ")", data: res.data.mediaSaleHomeApprovedSeries },
          { name: "Nhà yến SCT chờ duyệt (Tổng: " + res.data.totalSaleHomeWaiting + ")", data: res.data.mediaSaleHomeWaitingSeries }
        ]);
      }

      if (res.data.radialUserSeries) {
        chartCircle4.updateSeries(res.data.radialUserSeries);
      }

      if (res.data.areaQrWaitingSeries && res.data.areaQrApprovedSeries && res.data.areaQrSellingSeries) {
        chartArea.updateSeries([
          { name: "Yêu cầu QR chờ duyệt", data: res.data.areaQrWaitingSeries },
          { name: "Yêu cầu QR đã duyệt", data: res.data.areaQrApprovedSeries },
          { name: "QR Code đã đăng bán", data: res.data.areaQrSellingSeries }
        ]);
      }

      if (res.data.barHarvestCollectedSeries && res.data.barHarvestRemainSeries) {
        chartBar.updateSeries([
          { name: "Sản lượng tổ yến đã thu hoạch", data: res.data.barHarvestCollectedSeries },
          { name: "Sản lượng tổ yến còn lại", data: res.data.barHarvestRemainSeries }
        ]);
      }
    }
  } catch (error) {
    console.error("Failed to fetch overview data", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchOverview();
});
