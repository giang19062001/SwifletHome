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

// === SPARKLINE CHARTS (4 cái nhỏ) ===
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
    x: { show: false },
    y: { title: { formatter: () => '' } }
  },
  grid: { padding: { top: 20, bottom: 10, left: 110 } }
};

var spark1 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark1' }, series: [{ data: [25, 66, 41, 59, 25, 44, 12, 36, 9, 21] }] };
var spark2 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark2' }, series: [{ data: [12, 14, 2, 47, 32, 44, 14, 55, 41, 69] }] };
var spark3 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark3' }, series: [{ data: [47, 45, 74, 32, 56, 31, 44, 33, 45, 19] }], xaxis: { crosshairs: { width: 1 } } };
var spark4 = { ...sparkConfig, chart: { ...sparkConfig.chart, id: 'spark4' }, series: [{ data: [15, 75, 47, 65, 14, 32, 19, 54, 44, 61] }], xaxis: { crosshairs: { width: 1 } } };

new ApexCharts(document.querySelector("#spark1"), spark1).render();
new ApexCharts(document.querySelector("#spark2"), spark2).render();
new ApexCharts(document.querySelector("#spark3"), spark3).render();
new ApexCharts(document.querySelector("#spark4"), spark4).render();

// === LINE CHART (Media) ===
var optionsLine = {
  chart: {
    height: 328,
    type: 'line',
    zoom: { enabled: false },
    dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.2 }
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#3F51B5', '#2196F3', '#5961f9'],
  series: [
    { name: "Music", data: [1, 15, 26, 20, 33, 27] },
    { name: "Photos", data: [3, 33, 21, 42, 19, 32] },
    { name: "Files", data: [0, 39, 52, 11, 29, 43] }
  ],
  title: {
    text: 'Media',
    align: 'left',
    offsetY: 25,
    offsetX: 20,
    style: { color: '#565c66', fontSize: '16px', fontWeight: 600 }
  },
  subtitle: {
    text: 'Statistics',
    offsetY: 55,
    offsetX: 20,
    style: { color: '#565c66', fontSize: '13px' }
  },
  markers: { size: 6, strokeWidth: 0, hover: { size: 9 } },
  grid: { show: false }, // LOẠI BỎ GRID
  labels: ['01/15/2002', '01/16/2002', '01/17/2002', '01/18/2002', '01/19/2002', '01/20/2002'],
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


// === RADIAL BAR CHART ===
var optionsCircle4 = {
  chart: {
    type: 'radialBar',
    height: 345,
    width: 380,
  },
  plotOptions: {
    radialBar: {
      inverseOrder: true,
      hollow: { margin: 5, size: '48%', background: 'transparent' },
      track: { show: false },
      startAngle: -180,
      endAngle: 180
    },
  },
  stroke: { lineCap: 'round' },
  colors: ['#3F51B5', '#2196F3', '#5961f9'],
  series: [71, 63, 77],
  labels: ['June', 'May', 'April'],
  legend: {
    show: true,
    floating: true,
    position: 'right',
    offsetX: 70,
    offsetY: 230,
    labels: { colors: '#565c66' }
  },
  dataLabels: {
    enabled: true,
    style: { colors: ['#565c66'] },
    formatter: (val) => `${val}%`
  },
  grid: { show: false } // LOẠI BỎ GRID (Radial không có grid, nhưng an toàn)
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
  colors: ['#3F51B5', '#2196F3', '#5961f9'],
  series: [
    { name: 'PRODUCT A', data: [14, 25, 21, 17, 12, 13, 11, 19] },
    { name: 'PRODUCT B', data: [13, 23, 20, 8, 13, 27, 33, 12] },
    { name: 'PRODUCT C', data: [11, 17, 15, 15, 21, 14, 15, 13] }
  ],
  xaxis: {
    categories: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4'],
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
  colors: ['#3F51B5', '#2196F3', '#5961f9'],
  series: [
    { name: "Music", data: [11, 15, 26, 20, 33, 27] },
    { name: "Photos", data: [32, 33, 21, 42, 19, 32] },
    { name: "Files", data: [20, 39, 52, 11, 29, 43] }
  ],
  xaxis: {
    categories: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2'],
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