import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import byteSize from 'byte-size';

const DataPreparedChart = ({ data, title }) => {
  const series = data && data.map((item, index) => ({
    name: item.id,
    type: 'line',
    smooth: true,
    itemStyle: {
      color: index === 0 ? '#A7C889' : '#FFC582', // Assign default colors to data points
      emphasis: {
        color: index === 0 ? '#A7C889' : '#FFC582', // Change color on hover
      },
    },
    data: item.data.map((d) => ({
      name: moment(d.x).format('YYYY/MM/DD'), // Format date here as well
      value: [moment(d.x).format('YYYY/MM/DD'), d.y],
    })),
    lineStyle: {
      color: index === 0 ? '#A7C889' : '#FFC582', // Corrected color format
      shadowBlur: 10, // Add shadow for gradient effect
      shadowColor: 'rgba(0, 0, 0, 0.3)', // Shadow color
    },
    showSymbol: false, // Show data points as circles
  }));

  const options = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        // Customize the tooltip content with HTML and CSS
        let tooltip = '<div style="color: #141414; font-size: 12px; line-height: 18px; letter-spacing: 0.12px; border-radius: 2px; background: #D2F9AF; box-shadow: 0px 4px 14px 2px rgba(0, 0, 0, 0.64);">';
        tooltip += '<div>' + moment(params[0].value[0]).format('YYYY/MM/DD') + '</div>';
        params.forEach((param) => {
          tooltip += '<div>' + param.seriesName + ': ' + byteSize(param.value[1]).toString() + '</div>';
        });
        tooltip += '</div>';
        return tooltip;
      },
    },
    // legend: {
    //   data: ['v1', 'v2'],
    // },
    xAxis: {
      type: 'category',
      axisLabel: {
        formatter: function (value) {
          return moment(value).format('YYYY/MM/DD'); // Format date to 'YYYY/MM/DD'
        }
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (value) {
          return byteSize(value).toString();
        },
      },
    },
    series
  };

  return (<div className="col-6">
    <h2>{title}</h2>
      {data && data.length > 0 ? (
        <ReactECharts
          option={options}
          style={{ height: '600px', width: '100%' }}
        />
      ) : (
        <div>Loading</div>
      )}
  </div>
  );
};

export default DataPreparedChart;
