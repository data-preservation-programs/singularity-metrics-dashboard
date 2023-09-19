import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import byteSize from "byte-size";

const MonthlyDeals = ({ monthlySealed }) => {
  const [selectedClient, setSelectedClient] = useState("All");
  const [chartOptions, setChartOptions] = useState(getInitialChartOptions());
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    // Function to update the chart options based on selectedClient
    const updateChartOptions = () => {
      const newChartOptions = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: monthlySealed.barData.map((item) => item.month),
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value) => byteSize(value).toString(),
          },
        },
        series:
          selectedClient === "All"
            ? monthlySealed.keys.map((key) => ({
                name: key,
                type: "bar",
                stack: "stack",
                data: monthlySealed.barData.map((item) => item[key] || 0),
              }))
            : [
                {
                  name: selectedClient,
                  type: "bar",
                  stack: "stack",
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
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "category",
        data: [],
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value) => byteSize(value).toString(),
        },
      },
      series: [],
    };
  }

  // Function to handle radio button change
  const handleRadioChange = (event) => {
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
