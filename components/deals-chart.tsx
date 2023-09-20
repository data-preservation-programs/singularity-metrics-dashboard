import React from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';
import { DealsChartProps } from '@utils/interfaces';
import Loader from '@/components/loader';
import { chartColors } from '@/utils/colors';
import { convertToTitleCase } from '@utils/utils';

const DealsChart = ({ data, title }: DealsChartProps) => {

  const customColors = [chartColors.green, chartColors.pink, chartColors.gray, chartColors.orange, chartColors.purple, chartColors.blue];

  const option = {
    legend: {
      orient: 'vertical',
      left: '11%',
      data: data.map(item => item.id),
      icon: 'rect', //"image://data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23A7C889'/%3E%3C/svg%3E%0A",
      itemGap: 5,
      textStyle: {
        color: chartColors.axisLabelTextColor,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 17,
        padding: [0,0,0,6]
      },
      formatter: function (name:any) {
        return convertToTitleCase(name)
      }
    },
    dataZoom: [
      {
        show: true,
        type: 'slider',
        start: 92,
        end: 100
      },
    ],
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
      formatter: (params:any) => {
        let tooltip = '';
        params.forEach((param:any) => {
          tooltip += `${param.marker} ${convertToTitleCase(param.seriesName)}: ${byteSize(param.value).toString()}<br />`;
        });
        return tooltip;
      }
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
