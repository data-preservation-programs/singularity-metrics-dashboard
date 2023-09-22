import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import * as echarts from 'echarts';
import moment from 'moment';
import Loader from '@/components/loader';
import { chartColors } from '@/utils/colors';
import { DataPreparedChartProps } from '@utils/interfaces';

const DealSealedChart = ({ data, title }: DataPreparedChartProps) => {
  const [chartHeight, setChartHeight] = useState('600px');
  const xData = data && data[0] && data[0].data.map(entry => entry.x);
  const yData = data && data[0] && data[0].data.map(entry => entry.y);

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

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.tooltipBgOrange,
      borderColor: chartColors.tooltipBgOrange,
      padding: [3, 10],
      textStyle: {
        fontFamily: 'SuisseIntl',
        color: chartColors.tooltipColor,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 18
      },
      formatter: function (params:any) {
        const xValue = params[0].name;
        const yValue = byteSize(params[0].value).toString();
        return `${yValue}<br/>${moment(xValue).format('MMM D, YYYY')}`;
      },
      axisPointer: {
        lineStyle: {
          color: chartColors.hoverDottedLines
        }
      }
    },
    grid: {
      top: 25,
      right: 15,
      left: 15,
      bottom: 25,
      containLabel: true
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
        fontFamily: 'SuisseIntl',
        showMinLabel: false,
        hideOverlap: true,
        margin: 10,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 27,
        color: chartColors.axisLabelTextColor,
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
        fontFamily: 'SuisseIntl',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 27,
        color: chartColors.axisLabelTextColor,
        formatter: function (value:any) {
          return byteSize(value, { precision: 0 }).toString();
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
            color: chartColors.orangeEnd,
          },
        ]),
      },
      itemStyle: {
        color: chartColors.orange,
      },
      emphasis: {
        scale: 2.5,
        itemStyle: {
          color: chartColors.tooltipColor,
          borderColor: chartColors.orange,
        }
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
        <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
      ) : (
        <div className="chart-placeholder">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default DealSealedChart;
