import React from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';
import { DealsChartProps } from '@utils/interfaces';

const DealsChart = ({ data, title }: DealsChartProps) => {
  const seriesData = data.map(item => ({
    name: item.id,
    type: 'bar',
    stack: 'stack',
    data: item.data.map(dataItem => dataItem.y),
  }));

  const xData = data && data[0] && data[0].data.map(dataItem => dataItem.x);

  const option = {
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.id),
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        formatter: function (value:any) {
          return moment(value).format('YYYY/MM/DD');
        }
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value:any) => byteSize(value).toString(),
      },
    },
    series: seriesData,
  };

  return (
    <div className="col-6_md-12">
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default DealsChart;
