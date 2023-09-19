import React from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';

const DealSealedChart = ({ data, title }) => {
  const xData = data && data[0] && data[0].data.map(entry => entry.x);
  const yData = data && data[0] && data[0].data.map(entry => entry.y);

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        formatter: function (value) {
          return moment(value).format('YYYY/MM/DD'); // Format date to 'YYYY/MM/DD'
        }
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => byteSize(value).toString(),
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: yData,
        showSymbol: false, // Hide symbols on the line
        lineStyle: {
          color: '#FFC582', // Set line color to #FFC582,
          emphasis: {
            color: '#FFC582', // Change color on hover
          },
        },
      },
    ],
  };

  return (
    <div className="col-6">
      <h2>{title}</h2>
      {data && data[0] && data[0].data.length > 0 ? (
        <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default DealSealedChart;
