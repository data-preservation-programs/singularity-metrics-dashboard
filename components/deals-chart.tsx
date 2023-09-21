import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import moment from 'moment';
import Loader from '@/components/loader';
import { DealsChartProps } from '@utils/interfaces';
import { chartColors, colorList, colorEndList } from '@/utils/colors';
import { convertToTitleCase } from '@utils/utils';

const DealsChart = ({ data, title }: DealsChartProps) => {
  const [chartHeight, setChartHeight] = useState('600px');

  useEffect(() => {
    const updateChartHeight = () => {
      if (window.matchMedia('(max-width: 1024px)').matches) {
        setChartHeight('450px');
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
    legend: {
      orient: 'vertical',
      top: 24,
      left: 75,
      data: data.map(item => item.id),
      icon: 'rect', //"image://data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23A7C889'/%3E%3C/svg%3E%0A",
      padding: 15,
      borderRadius: 5,
      borderColor: chartColors.gridLineColor,
      backgroundColor: chartColors.legendBg,
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
        end: 100,
        fillerColor: chartColors.greenEnd,
        selectedDataBackground: {
          lineStyle: {
            color: chartColors.green
          },
          areaStyle: {
            color: chartColors.green,
            opacity: .15
          }
        },
        bottom: 15,
        brushStyle: {
          color: chartColors.greenEnd,
        },
        emphasis: {
          handleStyle: {
            color: chartColors.sliderHandleGreen,
            borderColor: chartColors.sliderHandleGreen
          },
          moveHandleStyle: {
            color: chartColors.sliderHandleGreen,
            borderColor: chartColors.sliderHandleGreen
          }
        }
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
        let tooltip = moment(params[0].axisValueLabel).format('MMM D, YYYY') + '<br />';
        params.forEach((param:any) => {
          tooltip += `${param.marker} ${convertToTitleCase(param.seriesName)}: ${byteSize(param.value).toString()}<br />`;
        });
        return tooltip;
      }
    },
    grid: {
      top: 25,
      right: 15,
      left: 15,
      bottom: 60,
      containLabel: true
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
        hideOverlap: true,
        margin: 10,
        textStyle: {
          color: chartColors.axisLabelTextColor,
        },
        formatter: function (value:any) {
          return moment(value).format('MMM D, YYYY');
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
    series: data.map((item, index) => ({
      data: item.data.map(dataItem => dataItem.y),
      name: item.id,
      type: 'bar',
      stack: 'stack',
      showSymbol: false,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, // Start position for the gradient
          y: 0, // End position for the gradient
          x2: 0, // Start position for the gradient
          y2: 1, // End position for the gradient
          colorStops: [
            {
              offset: 0,
              color: colorList[index % colorList.length],
            },
            {
              offset: 1,
              color: colorEndList[index % colorEndList.length],
            },
          ],
        },
      },
    }))
  };

  return (
    <div className="col-6_md-12">
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} />
      ) : (
        <div className="chart-placeholder">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default DealsChart;
