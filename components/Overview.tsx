"use client";

import { useEffect, useState } from "react";
import { CarRow, DealRow, VerifiedClient, Version } from "@/app/api/types";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

import byteSize from "byte-size";
import Loader from "@/components/loader";
import ReactECharts from "echarts-for-react";
import { mapToArray, toAccumulative } from "@/utils/utils";
import MonthlySealed from "@utils/interfaces";

export default function Overview() {
  const [count, setCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [numOfFiles, setNumOfFiles] = useState(0);
  const [pieceSize, setPieceSize] = useState(0);
  const [dailyPrepared, setDailyPrepared] = useState<
    { id: Version; data: { x: string; y: number }[] }[]
  >([]);
  const [totalPrepared, setTotalPrepared] = useState<
    { id: Version; data: { x: string; y: number }[] }[]
  >([]);

  const [proposed, setProposed] = useState(0);
  const [active, setActive] = useState(0);
  const [activeQap, setActiveQap] = useState(0);
  const [clients, setClients] = useState<Set<string>>(new Set());
  const [dailySealed, setDailySealed] = useState<
    { id: Version; data: { x: string; y: number }[] }[]
  >([]);
  const [totalSealed, setTotalSealed] = useState<
    { id: Version; data: { x: string; y: number }[] }[]
  >([]);
  const [dailyDeal, setDailyDeal] = useState<
    { id: string; data: { x: string; y: number }[] }[]
  >([]);
  const [totalDeal, setTotalDeal] = useState<
    { id: string; data: { x: string; y: number }[] }[]
  >([]);
  const [monthlySealed, setMonthlySealed] = useState<MonthlySealed>({
    barData: [],
    details: new Map(),
    keys: [],
  });
  const [selectedClient, setSelectedClient] = useState<string>("All");

  useEffect(() => {
    fetch("/api/global?type=carsGlobal")
      .then((res) => res.json())
      .then((cars: CarRow[]) => {
        let count = 0;
        let fileSize = 0;
        let numOfFiles = 0;
        let pieceSize = 0;
        const dailyPreparedMap: {
          [key in Version]: { x: string; y: number }[];
        } = { v1: [], v2: [] };
        const totalPreparedMap: {
          [key in Version]: { x: string; y: number }[];
        } = { v1: [], v2: [] };
        for (const car of cars) {
          count += car.count;
          fileSize += car.fileSize;
          numOfFiles += car.numOfFiles;
          pieceSize += car.pieceSize;
          dailyPreparedMap[car.version].push({ x: car.date, y: car.pieceSize });
          totalPreparedMap[car.version].push({
            x: car.date,
            y:
              car.pieceSize + totalPreparedMap[car.version].slice(-1)[0]?.y ||
              0,
          });
        }
        setCount(count);
        setFileSize(fileSize);
        setNumOfFiles(numOfFiles);
        setPieceSize(pieceSize);
        setDailyPrepared([
          { id: "v1", data: dailyPreparedMap["v1"] },
          { id: "v2", data: dailyPreparedMap["v2"] },
        ]);
        setTotalPrepared([
          { id: "v1", data: totalPreparedMap["v1"] },
          { id: "v2", data: totalPreparedMap["v2"] },
        ]);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/global?type=dealsGlobal"),
      fetch("/api/global?type=verifiedClients"),
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([deals, verifiedClients]: [DealRow[], VerifiedClient[]]) => {
        const clients = new Set<string>();
        let proposed = 0;
        let active = 0;
        let activeQap = 0;
        const dailySealedMap = new Map<Version, Map<string, number>>();
        const dailyDealMap = new Map<string, Map<string, number>>();
        const monthlySealedPerClientMap = new Map<
          string,
          { [id: string]: number }
        >();
        for (const deal of deals) {
          clients.add(deal.client);
          if (deal.state === "active" || deal.state === "expired") {
            active += deal.pieceSize;
            activeQap += deal.qap;
          }
          proposed += deal.pieceSize;
          const month = deal.date.slice(0, 7);
          if (deal.state === "active" || deal.state === "expired") {
            monthlySealedPerClientMap.has(month) ||
              monthlySealedPerClientMap.set(month, {});
            monthlySealedPerClientMap.get(month)![deal.client] =
              deal.pieceSize +
              (monthlySealedPerClientMap.get(month)![deal.client] || 0);
            dailySealedMap.has(deal.version) ||
              dailySealedMap.set(deal.version, new Map());
            dailySealedMap
              .get(deal.version)!
              .set(
                deal.date,
                deal.pieceSize +
                  (dailySealedMap.get(deal.version)!.get(deal.date) || 0)
              );
          }
          dailyDealMap.has(deal.state) ||
            dailyDealMap.set(deal.state, new Map());
          dailyDealMap
            .get(deal.state)!
            .set(
              deal.date,
              deal.pieceSize +
                (dailyDealMap.get(deal.state)!.get(deal.date) || 0)
            );
        }
        const totalSealedMap = toAccumulative(dailySealedMap);
        const totalDealMap = toAccumulative(dailyDealMap);
        setClients(clients);
        setProposed(proposed);
        setActive(active);
        setActiveQap(activeQap);
        setDailySealed(mapToArray(dailySealedMap));
        setTotalSealed(mapToArray(totalSealedMap));
        setDailyDeal(mapToArray(dailyDealMap));
        setTotalDeal(mapToArray(totalDealMap));
        const verifiedClientsMap = new Map<string, VerifiedClient>();
        for (const client of verifiedClients) {
          if (verifiedClientsMap.has(client.address)) {
            if (
              parseFloat(
                verifiedClientsMap.get(client.address)!.initialAllowance
              ) > parseFloat(client.initialAllowance)
            ) {
              continue;
            }
          }
          verifiedClientsMap.set(client.address, client);
          verifiedClientsMap.set(client.addressId, client);
        }

        const orgNames = new Set<string>();
        const barData = new Map<string, Map<string, number>>();
        const details = new Map<string, [VerifiedClient, number][]>();
        for (const [
          month,
          monthlySealedPerClient,
        ] of monthlySealedPerClientMap) {
          barData.has(month) || barData.set(month, new Map());
          for (const [client, pieceSize] of Object.entries(
            monthlySealedPerClient
          )) {
            let name = "Others";
            let verifiedClient: VerifiedClient = {
              address: client,
              addressId: client,
              name: "Unknown",
              orgName: "Unknown",
              auditTrail: "",
              industry: "",
              region: "",
              website: "",
              initialAllowance: "",
            };
            if (verifiedClientsMap.has(client)) {
              name =
                verifiedClientsMap.get(client)!.name === ""
                  ? verifiedClientsMap.get(client)!.orgName
                  : verifiedClientsMap.get(client)!.name;
              const split = name.split(" ");
              if (split.length > 1) {
                if (split[0].length > 10) {
                  name = split[0];
                } else {
                  name = split[0] + " " + split[1];
                }
              }
              verifiedClient = verifiedClientsMap.get(client)!;
            }
            orgNames.add(name);
            barData.get(month)!.has(name) || barData.get(month)!.set(name, 0);
            barData
              .get(month)!
              .set(name, barData.get(month)!.get(name)! + pieceSize);
            details.has(month + "#" + name) ||
              details.set(month + "#" + name, []);
            const index = details
              .get(month + "#" + name)!
              .findIndex(([vc, _]) => vc.address === verifiedClient.address);
            if (index === -1) {
              details
                .get(month + "#" + name)!
                .push([verifiedClient, pieceSize]);
            } else {
              details.get(month + "#" + name)![index][1] += pieceSize;
            }
          }
        }
        const monthlySealedBarData: { [key: string]: string | number }[] = [];
        for (const [month, clientMap] of barData) {
          monthlySealedBarData.push({
            month: month,
            ...Object.fromEntries(clientMap),
          });
        }
        const monthlySealed: MonthlySealed = {
          barData: monthlySealedBarData,
          details: details,
          keys: Array.from(orgNames.keys()),
        };
        setMonthlySealed(monthlySealed);
      });
  }, []);

  const overviewData = [
    {
      label: "Number of CAR prepared",
      value: count === 0 ? <Loader /> : count.toLocaleString(),
    },
    {
      label: "Number of Files prepared",
      value: numOfFiles === 0 ? <Loader /> : numOfFiles.toLocaleString(),
    },
    {
      label: "Total Data Size prepared",
      value: fileSize === 0 ? <Loader /> : byteSize(fileSize).toString(),
    },
    {
      label: "Total Piece Size prepared",
      value: pieceSize === 0 ? <Loader /> : byteSize(pieceSize).toString(),
    },
    {
      label: "Number of Clients",
      value: clients.size === 0 ? <Loader /> : clients.size.toLocaleString(),
    },
    {
      label: "Deals Proposed",
      value: proposed === 0 ? <Loader /> : byteSize(proposed).toString(),
    },
    {
      label: "Deals Active",
      value: active === 0 ? <Loader /> : byteSize(active).toString(),
    },
    {
      label: "QAP Onboarded",
      value: activeQap === 0 ? <Loader /> : byteSize(activeQap).toString(),
    },
  ];

  return (
    <div>
      <div className="grid">
        <div className="col-12">
          <h2>Overview</h2>
        </div>
      </div>
      <div className="grid">
        {overviewData.map((data, index) => (
          <div className="col-3_md-6_mi-12 card-wrapper" key={index}>
            <div className="card type__horizontal">
              <div className="content">
                <h3>{data.value}</h3>
                <h4>{data.label}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Daily Data Prepared</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={dailyPrepared}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Total Data Prepared</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={totalPrepared}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Daily Deal Sealed</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={dailySealed}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Total Deal Sealed</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={totalSealed}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Daily Deal</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={dailyDeal}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Total Deal</h2>
      <div style={{ height: "600px" }}>
        <ResponsiveLine
          data={totalDeal}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          curve={"monotoneX"}
          enableSlices={"x"}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            nice: true,
            stacked: true,
          }}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          enableArea={true}
          yFormat={(value: any) => byteSize(value).toString()}
          xScale={{ type: "time", format: "%Y-%m-%d", useUTC: true }}
          axisBottom={{
            format: "%Y-%m-%d",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: 20,
              itemWidth: 80,
              itemHeight: 20,
            },
          ]}
        />
      </div>

      <h2>Monthly deals Sealed by Client</h2>
      <label>Choose a client</label>
      <div>
        <label>
          <input
            type="radio"
            value="All"
            checked={selectedClient === "All"}
            onChange={(event) => setSelectedClient(event.target.value)}
          />
          All
        </label>
        {monthlySealed.keys.map((key) => (
          <label key={key}>
            <input
              type="radio"
              value={key}
              checked={selectedClient === key}
              onChange={(event) => setSelectedClient(event.target.value)}
            />
            {key}
          </label>
        ))}
      </div>

      <div style={{ height: "600px" }}>
        <ResponsiveBar
          data={monthlySealed.barData}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          keys={selectedClient === "All" ? monthlySealed.keys : [selectedClient]}
          indexBy={"month"}
          groupMode={"stacked"}
          layout={"vertical"}
          colors={{ scheme: "set3" }}
          minValue={0}
          valueFormat={(value: number) => byteSize(value).toString()}
          axisLeft={{
            legendPosition: "middle",
            legendOffset: -40,
            format: (value: number) => byteSize(value).toString(),
          }}
          axisBottom={{
            legendPosition: "middle",
            legendOffset: 40,
          }}
          labelSkipHeight={12}
          label={(data) => {
            return data.id as string;
          }}
          tooltip={(data) => {
            const name = data.id;
            const month = data.indexValue;
            const detail: [VerifiedClient, number][] = monthlySealed.details.get(
              month + "#" + name
            )!;
            return (
              <div
                style={{ padding: 12, color: data.color, background: "#444444" }}
              >
                <h3>
                  {name}: {data.formattedValue}
                </h3>
                {detail.map(([client, value]) => {
                  return (
                    <>
                      <br />
                      <br />
                      <strong>
                        {client.addressId} - {client.address}
                      </strong>
                      <br />
                      <strong>{byteSize(value).toString()}</strong>
                      {client.region === "" ? (
                        ""
                      ) : (
                        <>
                          <br />
                          <span>Region: {client.region}</span>
                        </>
                      )}
                      {client.industry === "" ? (
                        ""
                      ) : (
                        <>
                          <br />
                          <span>Industry: {client.industry}</span>
                        </>
                      )}
                      {client.website === "" ? (
                        ""
                      ) : (
                        <>
                          <br />
                          <span>Website: {client.website}</span>
                        </>
                      )}
                      {!client.auditTrail.includes("https://") ? (
                        ""
                      ) : (
                        <>
                          <br />
                          <span>
                            Issue: {client.auditTrail.split("/").slice(-1)[0]}
                          </span>
                        </>
                      )}
                    </>
                  );
                })}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
