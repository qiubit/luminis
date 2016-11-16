google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

var a = [
  ['Poziom alkoholu u domownikow', 'Promile'],
  ['0',  1],
  ['1',  1],
  ['2',  1],
  ['3',  1],
  ['4',  1],
  ['5',  1],
  ['6',  1],
  ['7',  1],
  ['8',  1],
  ['9',  1],
  ['10',  1],
  ['11',  1]
];

function drawChart() {
  drawChartfun(a);
}
function drawChartfun(a) {
  var data = google.visualization.arrayToDataTable(a);

  var options = {
    title: 'Poziom alkoholu u domownikow',
    vAxis: {
      minValue: 0,
      maxValue: 10
    },
    curveType: 'function',
    legend: { position: 'bottom' }
  };

  var chart = new google.visualization.LineChart(document.getElementById('my_chart'));

  chart.draw(data, options);
}

// (!): Insert your websocket server address here
var ws = new WebSocket('ws://192.168.0.139:9000');

ws.onmessage = function (evt)
{
   var received_msg = evt.data;
   for (var i = 1; i + 1< a.length; i++) {
     a[i][1] = a[i + 1][1]
   }
   a[a.length - 1][1] = +evt.data;
   drawChart();
};

