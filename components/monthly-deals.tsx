import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import byteSize from 'byte-size';
import { MonthlySealed } from '@utils/interfaces';

// Define a type for the xAxis data
type ChartXAxisData = string[];

// Define a type for the chart options
type ChartOptions = {
  tooltip: {
    trigger: string;
    axisPointer: {
      type: string;
    };
  };
  xAxis: {
    type: string;
    data: ChartXAxisData;
  };
  yAxis: {
    type: string;
    axisLabel: {
      formatter: (value: any) => string;
    };
  };
  series: {
    name: any;
    type: string;
    stack: string;
    data: any[];
  }[];
};

const MonthlyDeals = ({ data }: { data: MonthlySealed }) => {
  const [selectedClient, setSelectedClient] = useState<string | 'All'>('All');
  const [chartOptions, setChartOptions] = useState<ChartOptions>(getInitialChartOptions());
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    // Function to update the chart options based on selectedClient
    const updateChartOptions = () => {
      const newChartOptions: ChartOptions = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: data.barData.map((item: any) => item.month) as ChartXAxisData,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: any) => byteSize(value).toString(),
          },
        },
        series:
          selectedClient === 'All'
            ? data.keys.map((key: any) => ({
                name: key,
                type: 'bar',
                stack: 'stack',
                data: data.barData.map((item: any) => item[key] || 0),
              }))
            : [],
      };
      setChartOptions(newChartOptions);
    };

    updateChartOptions();
  }, [selectedClient, data]);

  // Helper function to generate initial chart options
  function getInitialChartOptions(): ChartOptions {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: [] as ChartXAxisData,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: any) => byteSize(value).toString(),
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
        {data.keys.map((key: any) => (
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
