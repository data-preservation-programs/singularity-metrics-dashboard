import React from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';
import { chartColors } from '@/utils/colors';
import * as echarts from 'echarts';
import Loader from '@/components/loader';
import { DataPreparedChartProps } from '@utils/interfaces';

const DealSealedChart = ({ data, title }: DataPreparedChartProps) => {
  const xData = data && data[0] && data[0].data.map(entry => entry.x);
  const yData = data && data[0] && data[0].data.map(entry => entry.y);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.tooltipBgOrange,
      borderColor: chartColors.tooltipBgOrange,
      padding: [3, 10],
      textStyle: {
        color: chartColors.tooltipColor,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 18
      },
      formatter: function (params:any) {
        const xValue = params[0].name;
        const yValue = byteSize(params[0].value).toString();
        return `${yValue}<br/>${moment(xValue).format('YYYY/MM/DD')}`;
      },
    },
    grid: {
      top: '25px',
      right: '15px',
      bottom: '35px',
    },
    xAxis: {
      data: xData,
      axisTick: false,
      type: 'category',
      splitLine: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.gridLineColor,
        },
      },
      axisLabel: {
        margin: 10,
        textStyle: {
          color: chartColors.axisLabelTextColor,
        },
        interval: 200,
        formatter: function (value:any) {
          return moment(value).format('YYYY/MM/DD'); // Format date to 'YYYY/MM/DD'
        }
      },
    },
    yAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.gridLineColor,
        },
      },
      type: 'value',
      splitLine: {
        show: false,
      },
      axisLabel: {
        textStyle: {
          color: chartColors.axisLabelTextColor,
        },
        formatter: function (value:any) {
          return byteSize(value).toString();
        },
      },
    },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColors.orange,
          },
          {
            offset: 1,
            color: 'rgba(255, 197, 130, 0)',
          },
        ]),
      },
      itemStyle: {
        color: chartColors.orange,
        emphasis: {
          color: chartColors.orange,
        },
      },
      data: yData,
      lineStyle: {
        color: chartColors.orange,
      },
      showSymbol: false, // Hide symbols on the line
    }],
  };

  return (
    <div className="col-6_md-12">
      <h2>{title}</h2>
      {data && data[0] && data[0].data.length > 0 ? (
        <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default DealSealedChart;
