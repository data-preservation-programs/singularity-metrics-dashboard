import { useState, useEffect } from 'react';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import moment from 'moment';
import byteSize from 'byte-size';
import { MonthlySealed } from '@utils/interfaces';
import { chartColors, colorList, colorEndList } from '@/utils/colors';
import Loader from '@/components/loader';

const MonthlyDeals = ({ monthlySealed }: {monthlySealed: MonthlySealed}) => {
  const [selectedClient, setSelectedClient] = useState('All');
  const [chartOptions, setChartOptions] = useState<EChartsOption>(getInitialChartOptions());
  const [chartKey, setChartKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setChartKey(0);
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mediaQuery.matches);

    const updateChartOptions = () => {
      const newChartOptions: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: chartColors.tooltipBgTransparent,
          borderColor: chartColors.tooltipBgTransparent,
          padding: [3, 10],
          textStyle: {
            fontFamily: 'SuisseIntl',
            color: chartColors.axisLabelTextColor,
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 18
          },
          formatter: function(params: any) {
            const tooltipContent = [];
            tooltipContent.push(moment(params[0].axisValueLabel).format('MMM YYYY'));
            params.forEach(function(item: any) {
              // Check if the data point value is not equal to 0
              if (item.data !== 0) {
                tooltipContent.push(
                  `${item.marker} ${item.seriesName.trim()}: ${byteSize(item.data).toString()}`
                );
              }
            });
            return tooltipContent.join('<br>');
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
          bottom: 60,
          containLabel: true
        },
        dataZoom: [
          {
            show: true,
            type: 'slider',
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
            textStyle: {
              fontFamily: 'SuisseIntl',
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
        xAxis: {
          data: monthlySealed.barData.map((item) => item.month),
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
            fontFamily: 'SuisseIntl',
            color: chartColors.axisLabelTextColor,
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 18,
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
            show: true,
            lineStyle: {
              color: chartColors.gridLineColor,
            },
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
        series:
          selectedClient === 'All'
            ? monthlySealed.keys.map((key, index) => ({
                name: key,
                type: 'bar',
                stack: 'stack',
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
                data: monthlySealed.barData.map((item) => item[key] || 0),
              }))
            : [
                {
                  name: selectedClient,
                  type: 'bar',
                  stack: 'stack',
                  itemStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        {
                          offset: 0,
                          color: chartColors.purple,
                        },
                        {
                          offset: 1,
                          color: chartColors.purpleEnd,
                        },
                      ],
                    },
                  },
                data: monthlySealed.barData.map(
                  (item) => item[selectedClient] || 0
                ),
              },
            ],
      };
      setChartOptions(newChartOptions);
    };

    updateChartOptions();

    const mediaQueryListener = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    mediaQuery.addEventListener('change', mediaQueryListener);
    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener('change', mediaQueryListener);
    };
  }, [selectedClient, monthlySealed]);

  function getInitialChartOptions() {
    return {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value:any) => byteSize(value).toString(),
        },
      },
      series: [],
    };
  }

  const handleRadioChange = (event: any) => {
    setSelectedClient(event.target.value);
    setChartKey(chartKey + 1);
  };

  return (
    <>
      <div className="grid-noBottom">
        <div className="col-12">
          <h2>Monthly Deals Sealed by Client</h2>
        </div>
        {isMobile ? (
          <div className="col-12">
            <div className="client-c">
              <label>Select a client</label>
              <select
                value={selectedClient}
                onChange={handleRadioChange}
              >
                <option value="All">All</option>
                {monthlySealed.keys.map((key) => (
                  <option key={key} value={key}>
                    {key.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="col-3_lg-4_md-12">
            <div className="client-c">
              {monthlySealed && monthlySealed.keys.length ? <label>Select a client</label> : null }
              <div className="client-list">
                {monthlySealed && monthlySealed.keys.length ? (
                  <>
                    <label className="custom-radio">
                      <input
                        type="radio"
                        value="All"
                        checked={selectedClient === "All"}
                        onChange={handleRadioChange}
                      />
                      <span className="custom-radio-button"></span> All
                    </label>
                    {monthlySealed.keys.map((key) => (
                      <label key={key} className="custom-radio">
                        <input
                          type="radio"
                          value={key}
                          checked={selectedClient === key}
                          onChange={handleRadioChange}
                        />
                        <span className="custom-radio-button"></span> {key.trim()}
                      </label>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
        <div className="col-9_lg-8_md-12">
          {monthlySealed && monthlySealed.barData.length ? (
            <ReactECharts
              key={chartKey}
              option={chartOptions}
              style={{ height: "600px", width: '100%' }}
            />
          ) : (
            <div className="chart-placeholder">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthlyDeals;
