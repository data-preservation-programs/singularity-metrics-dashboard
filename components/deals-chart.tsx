import React from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';
import { DealsChartProps } from '@utils/interfaces';
import Loader from '@/components/loader';
import * as echarts from 'echarts';
import { chartColors } from '@/utils/colors';

const DealsChart = ({ data, title }: DealsChartProps) => {

  const customColors = [chartColors.green, chartColors.pink, chartColors.gray, chartColors.orange, chartColors.purple, chartColors.blue];

  const option = {
    legend: {
      orient: 'vertical',
      left: '11%',
      data: data.map(item => item.id),
      textStyle: {
        color: chartColors.axisLabelTextColor,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 17
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.tooltipBgTransparent,
      borderColor: chartColors.tooltipBgTransparent,
      padding: [3, 10],
      textStyle: {
        color: chartColors.axisLabelTextColor,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 18
      },
    },
    grid: {
      top: '25px',
      right: '15px',
      bottom: '35px',
    },
    xAxis: {
      data: data && data[0] && data[0].data.map(dataItem => dataItem.x),
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
          return moment(value).format('YYYY/MM/DD');
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
    series: data.map((item, index) => ({
      data: item.data.map(dataItem => dataItem.y),
      name: item.id,
      type: 'bar',
      stack: 'stack',
      showSymbol: false,
      // Set the custom color for this data series
      itemStyle: {
        color: customColors[index % customColors.length]
      },
    }))
  };

  return (
    <div className="col-6_md-12">
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default DealsChart;
