import React, { useState, useEffect } from "react";
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import byteSize from "byte-size";
import { MonthlySealed } from '@utils/interfaces';
import { chartColors } from '@/utils/colors';
import moment from 'moment';

const MonthlyDeals = ({ monthlySealed }: {monthlySealed: MonthlySealed}) => {
  const [selectedClient, setSelectedClient] = useState("All");
  const [chartOptions, setChartOptions] = useState<EChartsOption>(getInitialChartOptions());
  const [chartKey, setChartKey] = useState(0);
  const customColors = [chartColors.green, chartColors.pink, chartColors.gray, chartColors.orange, chartColors.purple, chartColors.blue];

  useEffect(() => {
    // Function to update the chart options based on selectedClient
    const updateChartOptions = () => {
      const newChartOptions: EChartsOption = {
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
            textStyle: {
              color: chartColors.axisLabelTextColor,
            },
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
            show: true,
            lineStyle: {
              color: chartColors.gridLineColor,
            },
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
        series:
          selectedClient === 'All'
            ? monthlySealed.keys.map((key, index) => ({
                name: key,
                type: 'bar',
                stack: 'stack',
                itemStyle: {
                  color: customColors[index % customColors.length]
                },
                data: monthlySealed.barData.map((item) => item[key] || 0),
              }))
            : [
                {
                  name: selectedClient,
                  type: 'bar',
                  stack: 'stack',
                  itemStyle: {
                    color: chartColors.purple
                  },
                  data: monthlySealed.barData.map(
                    (item) => item[selectedClient] || 0
                  ),
                },
              ],
      };
      setChartOptions(newChartOptions);
    };

    updateChartOptions(); // Call the function initially
  }, [selectedClient, monthlySealed]);

  // Helper function to generate initial chart options
  function getInitialChartOptions() {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
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

  // Function to handle radio button change
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClient(event.target.value);
    // Change the chart key to force remounting of the chart component
    setChartKey(chartKey + 1);
  };

  return (
    <>
      <div className="col-12">
        <h2>Monthly deals Sealed by Client</h2>
      </div>
      <div className="col-3_md-12 client-c">
        <label>Select a client</label>
        <label>
          <input
            type="radio"
            value="All"
            checked={selectedClient === "All"}
            onChange={handleRadioChange}
          />
          All
        </label>
        {monthlySealed.keys.map((key) => (
          <label key={key}>
            <input
              type="radio"
              value={key}
              checked={selectedClient === key}
              onChange={handleRadioChange}
            />
            {key}
          </label>
        ))}
      </div>
      <div className="col-9_md-12">
        <div style={{ height: "600px" }}>
          <ReactECharts
            key={chartKey} // Change the key to force remounting
            option={chartOptions}
            style={{ height: "617px" }}
          />
        </div>
      </div>
    </>
  );
};

export default MonthlyDeals;