import React, { useState, useEffect } from "react";
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import byteSize from "byte-size";
import { MonthlySealed } from '@utils/interfaces';
import { chartColors } from '@/utils/colors';
import moment from 'moment';

const MonthlyDeals = ({ monthlySealed }: {monthlySealed: MonthlySealed}) => {
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [chartOptions, setChartOptions] = useState<EChartsOption>(getInitialChartOptions());
  const [chartKey, setChartKey] = useState(0);
  const customColors = [chartColors.green, chartColors.pink, chartColors.gray, chartColors.orange, chartColors.purple, chartColors.blue];

  useEffect(() => {
    const updateChartOptions = () => {
      const filteredData = filterDataByDate(monthlySealed.barData, selectedDateFilter);
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
        dataZoom: {
          show: true,
          type: 'slider'
        },
        xAxis: {
          data: filteredData.map((item) => item.month),
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
                data: filteredData.map((item) => item[key] || 0),
              }))
            : [
                {
                  name: selectedClient,
                  type: 'bar',
                  stack: 'stack',
                  itemStyle: {
                    color: chartColors.purple
                  },
                  data: filteredData.map(
                    (item) => item[selectedClient] || 0
                  ),
                },
              ],
      };
      setChartOptions(newChartOptions);
    };

    updateChartOptions();
  }, [selectedClient, selectedDateFilter, monthlySealed]);

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

  const filterDataByDate = (data: any[], filter: string) => {
    switch (filter) {
      case "LastYear":
        const lastYearStart = moment().subtract(1, "year").startOf("year");
        const lastYearEnd = moment().subtract(1, "year").endOf("year");
        return data.filter(item =>
          moment(item.month).isBetween(lastYearStart, lastYearEnd, undefined, "[]")
        );
      case "Last30Days":
        const last30DaysStart = moment().subtract(30, "days").startOf("day");
        return data.filter(item => moment(item.month).isSameOrAfter(last30DaysStart));
      default:
        return data;
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClient(event.target.value);
    setChartKey(chartKey + 1);
  };

  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateFilter(event.target.value);
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
            key={chartKey}
            option={chartOptions}
            style={{ height: "617px" }}
          />
        </div>
      </div>
      <div className="col-12">
        <label>
          <input
            type="radio"
            value="All"
            checked={selectedDateFilter === "All"}
            onChange={handleDateFilterChange}
          />
          All Time
        </label>
        <label>
          <input
            type="radio"
            value="LastYear"
            checked={selectedDateFilter === "LastYear"}
            onChange={handleDateFilterChange}
          />
          Last Year
        </label>
        <label>
          <input
            type="radio"
            value="Last30Days"
            checked={selectedDateFilter === "Last30Days"}
            onChange={handleDateFilterChange}
          />
          Last 30 Days
        </label>
      </div>
    </>
  );
};

export default MonthlyDeals;
