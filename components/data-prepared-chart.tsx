import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import * as echarts from 'echarts';
import Loader from '@/components/loader';
import moment from 'moment';
import { chartColors } from '@/utils/colors';
import { DataPreparedChartProps } from '@utils/interfaces';

const DataPreparedChart = ({ data, title }: DataPreparedChartProps) => {
  const options = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.tooltipBgGreen,
      borderColor: chartColors.tooltipBgGreen,
      padding: [3, 10],
      textStyle: {
        color: chartColors.tooltipColor,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 18
      },
      formatter: function (params:any) {
        let tooltipText = '';
        params.forEach((param:any) => {
          tooltipText += param.marker + ' ' + param.seriesName + ': ' + byteSize(param.value[1]).toString() + '<br />';
        });
        tooltipText += moment(params[0].axisValue).format('YYYY/MM/DD');
        return tooltipText;
      },
    },
    grid: {
      top: '25px',
      right: '15px',
      bottom: '35px',
    },
    xAxis: {
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
    series: data && data.map((item, index) => ({
      data: item.data.map(d => ({
        name: d.x,
        value: [d.x, d.y],
      })),
      name: item.id,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColors.green,
          },
          {
            offset: 1,
            color: 'rgba(167, 200, 137, 0)',
          },
        ]),
      },
      itemStyle: {
        color: index === 0 ? chartColors.green : chartColors.orange,
        emphasis: {
          color: index === 0 ? chartColors.green : chartColors.orange,
        },
      },
      lineStyle: {
        color: index === 0 ? chartColors.green : chartColors.orange,
      },
      showSymbol: false,
    }))
  };

  return (
    <div className="col-6_md-12">
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        <ReactECharts option={options} style={{ height: '600px', width: '100%' }} />
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default DataPreparedChart;
