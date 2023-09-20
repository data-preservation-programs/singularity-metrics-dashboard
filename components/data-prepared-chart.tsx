import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import * as echarts from 'echarts';
import moment from 'moment';
import Loader from '@/components/loader';
import { chartColors } from '@/utils/colors';
import { DataPreparedChartProps } from '@/utils/interfaces';

const DataPreparedChart = ({ data, title }: DataPreparedChartProps) => {
  const [chartHeight, setChartHeight] = useState('600px');

  useEffect(() => {
    const updateChartHeight = () => {
      if (window.matchMedia('(max-width: 1024px)').matches) {
        setChartHeight('300px');
      } else {
        setChartHeight('600px');
      }
    };

    // Initial call to set the correct height
    updateChartHeight();

    // Attach event listener to window.matchMedia
    const mediaQueryList = window.matchMedia('(max-width: 1024px)');
    mediaQueryList.addListener(updateChartHeight);

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQueryList.removeListener(updateChartHeight);
    };
  }, []);

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
        tooltipText += moment(params[0].axisValue).format('MMM D, YYYY');
        return tooltipText;
      },
    },
    grid: {
      top: 25,
      right: 15,
      left: 15,
      bottom: 25,
      containLabel: true
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
        showMinLabel: false,
        hideOverlap: true,
        margin: 10,
        textStyle: {
          color: chartColors.axisLabelTextColor,
        },
        // interval: 200,
        formatter: function (value:any) {
          return moment(value).format('MMM YYYY');
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
          return byteSize(value, { precision: 0 }).toString();
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
            color: chartColors.greenEnd,
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
        <ReactECharts option={options} style={{ height: chartHeight, width: '100%' }} />
      ) : (
        <div className="chart-placeholder">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default DataPreparedChart;
