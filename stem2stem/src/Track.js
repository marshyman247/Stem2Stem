import React, { Component } from "react";
import "./Track.css";
import {
  VictoryGroup,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryPie,
  VictoryLabel,
  VictoryAnimation,
  VictoryTooltip,
} from "victory";

import { fadeInUp } from "react-animations";

import styled, { keyframes } from "styled-components";
const FadeInAnimation = keyframes`${fadeInUp}`;

const FadeInDiv = styled.div`
  animation: 1s ${FadeInAnimation};
  animation-fill-mode: both;
`;
export default class Track extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plantData: [],
      tempScore: 0,
      moistScore: 0,
      lightScore: 0,
      plantName: "",
      plantRanges: [],
    };
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchServerData()
      .then((res) =>
        this.setState({
          plantData: res.Data,
          plantName: res.Name,
        })
      )
      .catch((err) => console.log(err));
    console.log(this.state.plantData);
    this.fetchServerRanges()
      .then((res) => {
        this.setState({ plantRanges: res });
        let tS = this.calculatePlantScore(
          res.Temperature.Max,
          res.Temperature.Min,
          this.state.plantData[this.state.plantData.length - 1].Temperature
        );
        let mS = this.calculatePlantScore(
          res.Moisture.Max,
          res.Moisture.Min,
          this.state.plantData[this.state.plantData.length - 1].Moisture
        );
        let lS = this.calculatePlantScore(
          res.Light.Max,
          res.Light.Min,
          this.state.plantData[this.state.plantData.length - 1].Light
        );
        this.setStateInterval = window.setInterval(() => {
          this.setState({
            tempScore: tS < 0 ? 0 : tS,
            moistScore: mS < 0 ? 0 : mS,
            lightScore: lS < 0 ? 0 : lS,
          });
        }, 1000);
      })
      .catch((err) => console.log(err));
  }
  fetchServerData = async () => {
    const response = await fetch("/current_plant_data");
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message);
    }
    console.log(body.currentPlantData);
    return body.currentPlantData;
  };
  fetchServerRanges = async () => {
    const response = await fetch("/current_plant_ranges");
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message);
    }
    console.log(body.currentPlantRanges);
    return body.currentPlantRanges;
  };
  getData = (score) => {
    return [
      { x: 1, y: score },
      { x: 2, y: 10 - score },
    ];
  };
  calculatePlantScore = (min, max, reading) => {
    let mid = (max + min) / 2;
    let score =
      8 +
      (-2 * reading ** 2 + 2 * min ** 2) /
        (-(mid ** 2) - min * max + min * mid + max * mid) +
      (-2 * (min * reading) -
        2 * (max * reading) +
        2 * min ** 2 +
        2 * (min * max)) /
        (mid ** 2 + min * max - min * mid - max * mid);
    return score;
  };
  render() {
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h1 style={{ fontWeight: "lighter" }}>Track A Plant</h1>
          <br />
          <h2 style={{ fontWeight: "lighter" }}>
            Currently Tracking: {this.state.plantName}
          </h2>
        </div>
        <div className="TrackPage">
          <div className="dataCollumn">
            <svg viewBox="0 0 400 400" className="scoreBar">
              <VictoryPie
                standalone={false}
                animate={{ duration: 800 }}
                data={this.getData(this.state.tempScore)}
                innerRadius={100}
                cornerRadius={20}
                labels={() => null}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      return datum.x === 1 ? "#A4031F" : "transparent";
                    },
                    stroke: ({ datum }) => {
                      return datum.x === 1 ? "black" : "transparent";
                    },
                  },
                }}
              />
              <VictoryAnimation duration={800} data={this.state}>
                {(newProps) => {
                  return (
                    <VictoryLabel
                      text={[
                        Math.round(newProps.tempScore * 10) / 10,
                        "Temperature",
                        "Score",
                      ]}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      x={"50%"}
                      y={200}
                      style={{ fontSize: 22, fill: "#A4031F" }}
                    />
                  );
                }}
              </VictoryAnimation>
            </svg>
            <FadeInDiv className="TempChartContainer">
              <VictoryChart
                width={500}
                fontWeight={1}
                scale={{ x: "time" }}
                padding={{ bottom: 60, top: 10, left: 60, right: 25 }}
              >
                <VictoryGroup
                  data={this.state.plantData}
                  x="dateTime"
                  y="Temperature"
                >
                  <VictoryLine
                    x="dateTime"
                    y="Temperature"
                    style={{
                      data: { stroke: "#A4031F", strokeWidth: "4px solid" },
                      parent: { border: "4px solid #ccc" },
                    }}
                  />
                  <VictoryScatter
                    x="dateTime"
                    y="Temperature"
                    size={4}
                    style={{
                      labels: {
                        fill: "black",
                        fontWeight: "lighter",
                        width: 200,
                      },
                    }}
                    labels={({ datum }) => {
                      let date = new Date(datum.dateTime);
                      return `Date: ${date.getUTCDate()}/${
                        date.getUTCMonth() + 1
                      }/${date.getFullYear()} - ${date.getHours()}:${String(
                        date.getMinutes()
                      ).padStart(2, "0")}\nValue: ${datum.Temperature}°C`;
                    }}
                    labelComponent={
                      <VictoryTooltip
                        cornerRadius={(datum) => {
                          let index = datum.index;
                          let length = datum.data.length;
                          console.log(index, length);
                          console.log(datum);
                          this.direction =
                            datum.index > datum.data.length / 2
                              ? { x: -110 }
                              : { x: 110 };
                          this.orientation =
                            datum.index > datum.data.length / 2
                              ? "right"
                              : "left";
                          return 0;
                        }}
                        pointerWidth={20}
                        centerOffset={this.direction}
                        pointerOrientation={this.orientation}
                        flyoutWidth={190}
                        flyoutStyle={{
                          fill: "#37a0c4",
                        }}
                      />
                    }
                  />
                </VictoryGroup>
                <VictoryAxis
                  label="Date"
                  tickValues={this.state.plantData.map(
                    (d) => new Date(d.dateTime)
                  )}
                  tickFormat={(t) =>
                    `${t.getUTCDate()}/${
                      t.getUTCMonth() + 1
                    }/${t.getFullYear()}\n${t.getHours()}:${String(
                      t.getMinutes()
                    ).padStart(2, "0")}`
                  }
                  tickCount={3}
                  axisLabelComponent={<VictoryLabel dy={20} />}
                  tickLabelComponent={<VictoryLabel style={{ fontSize: 10 }} />}
                  style={{
                    ticks: { stroke: "grey", size: 5 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Temperature (°C)"
                  axisLabelComponent={<VictoryLabel dy={-20} />}
                  style={{
                    grid: {
                      stroke: "grey",
                      opacity: "25%",
                    },
                    ticks: { stroke: "grey", size: 5 },
                  }}
                  tickFormat={(t) => Math.trunc(t)}
                  tickCount={2}
                />
              </VictoryChart>
            </FadeInDiv>
          </div>
          <div className="dataCollumn">
            <svg viewBox="0 0 400 400" className="scoreBar">
              <VictoryPie
                standalone={false}
                animate={{ duration: 800 }}
                data={this.getData(this.state.moistScore)}
                innerRadius={100}
                cornerRadius={20}
                labels={() => null}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      return datum.x === 1 ? "#006E90" : "transparent";
                    },
                    stroke: ({ datum }) => {
                      return datum.x === 1 ? "black" : "transparent";
                    },
                  },
                }}
              />
              <VictoryAnimation duration={800} data={this.state}>
                {(newProps) => {
                  return (
                    <VictoryLabel
                      text={[
                        Math.round(newProps.moistScore * 10) / 10,
                        "Moisture",
                        "Score",
                      ]}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      x={"50%"}
                      y={200}
                      style={{ fontSize: 22, fill: "#006E90" }}
                    />
                  );
                }}
              </VictoryAnimation>
            </svg>
            <FadeInDiv className="MoistChartContainer">
              <VictoryChart
                width={500}
                fontWeight={1}
                scale={{ x: "time" }}
                padding={{ bottom: 60, top: 10, left: 60, right: 25 }}
              >
                <VictoryGroup
                  data={this.state.plantData}
                  x="dateTime"
                  y="Moisture"
                >
                  <VictoryLine
                    x="dateTime"
                    y="Moisture"
                    style={{
                      data: { stroke: "#006E90", strokeWidth: "4px solid" },
                      parent: { border: "4px solid #ccc" },
                    }}
                  />
                  <VictoryScatter
                    x="dateTime"
                    y="Moisture"
                    size={4}
                    style={{
                      labels: {
                        fill: "black",
                        fontWeight: "lighter",
                        width: 200,
                      },
                    }}
                    labels={({ datum }) => {
                      let date = new Date(datum.dateTime);
                      return `Date: ${date.getUTCDate()}/${
                        date.getUTCMonth() + 1
                      }/${date.getFullYear()} - ${date.getHours()}:${String(
                        date.getMinutes()
                      ).padStart(2, "0")}\nValue: ${datum.Moisture}%`;
                    }}
                    labelComponent={
                      <VictoryTooltip
                        cornerRadius={(datum) => {
                          let index = datum.index;
                          let length = datum.data.length;
                          console.log(index, length);
                          console.log(datum);
                          this.direction =
                            datum.index > datum.data.length / 2
                              ? { x: -110 }
                              : { x: 110 };
                          this.orientation =
                            datum.index > datum.data.length / 2
                              ? "right"
                              : "left";
                          return 0;
                        }}
                        pointerWidth={20}
                        centerOffset={this.direction}
                        pointerOrientation={this.orientation}
                        flyoutWidth={190}
                        flyoutStyle={{
                          fill: "#37a0c4",
                        }}
                      />
                    }
                  />
                </VictoryGroup>
                <VictoryAxis
                  label="Date"
                  tickValues={this.state.plantData.map(
                    (d) => new Date(d.dateTime)
                  )}
                  tickFormat={(t) =>
                    `${t.getUTCDate()}/${
                      t.getUTCMonth() + 1
                    }/${t.getFullYear()}\n${t.getHours()}:${String(
                      t.getMinutes()
                    ).padStart(2, "0")}`
                  }
                  tickCount={3}
                  axisLabelComponent={<VictoryLabel dy={20} />}
                  tickLabelComponent={<VictoryLabel style={{ fontSize: 10 }} />}
                  style={{
                    ticks: { stroke: "grey", size: 5 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Moisture (%)"
                  axisLabelComponent={<VictoryLabel dy={-20} />}
                  style={{
                    grid: {
                      stroke: "grey",
                      opacity: "25%",
                    },
                    ticks: { stroke: "grey", size: 5 },
                  }}
                  tickFormat={(t) => Math.trunc(t)}
                />
              </VictoryChart>
            </FadeInDiv>
          </div>
          <div className="dataCollumn">
            <svg viewBox="0 0 400 400" className="scoreBar">
              <VictoryPie
                standalone={false}
                animate={{ duration: 800 }}
                data={this.getData(this.state.lightScore)}
                innerRadius={100}
                cornerRadius={20}
                labels={() => null}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      return datum.x === 1 ? "#D19C1D" : "transparent";
                    },
                    stroke: ({ datum }) => {
                      return datum.x === 1 ? "black" : "transparent";
                    },
                  },
                }}
              />
              <VictoryAnimation duration={800} data={this.state}>
                {(newProps) => {
                  return (
                    <VictoryLabel
                      text={[
                        Math.round(newProps.lightScore * 10) / 10,
                        "Light",
                        "Score",
                      ]}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      x={"50%"}
                      y={200}
                      style={{ fontSize: 22, fill: "#D19C1D" }}
                    />
                  );
                }}
              </VictoryAnimation>
            </svg>
            <FadeInDiv className="LightChartContainer">
              <VictoryChart
                width={500}
                fontWeight={1}
                scale={{ x: "time" }}
                padding={{ bottom: 60, top: 10, left: 60, right: 25 }}
              >
                <VictoryGroup
                  data={this.state.plantData}
                  x="dateTime"
                  y="Light"
                >
                  <VictoryLine
                    x="dateTime"
                    y="Light"
                    style={{
                      data: { stroke: "#D19C1D", strokeWidth: "4px solid" },
                      parent: { border: "4px solid #ccc" },
                    }}
                  />
                  <VictoryScatter
                    x="dateTime"
                    y="Light"
                    size={4}
                    style={{
                      labels: {
                        fill: "black",
                        fontWeight: "lighter",
                        width: 200,
                      },
                    }}
                    labels={({ datum }) => {
                      let date = new Date(datum.dateTime);
                      return `Date: ${date.getUTCDate()}/${
                        date.getUTCMonth() + 1
                      }/${date.getFullYear()} - ${date.getHours()}:${String(
                        date.getMinutes()
                      ).padStart(2, "0")}\nValue: ${datum.Light}`;
                    }}
                    labelComponent={
                      <VictoryTooltip
                        cornerRadius={(datum) => {
                          let index = datum.index;
                          let length = datum.data.length;
                          console.log(index, length);
                          console.log(datum);
                          this.direction =
                            datum.index > datum.data.length / 2
                              ? { x: -110 }
                              : { x: 110 };
                          this.orientation =
                            datum.index > datum.data.length / 2
                              ? "right"
                              : "left";
                          return 0;
                        }}
                        pointerWidth={20}
                        centerOffset={this.direction}
                        pointerOrientation={this.orientation}
                        flyoutWidth={200}
                        flyoutStyle={{
                          fill: "#37a0c4",
                        }}
                      />
                    }
                  />
                </VictoryGroup>
                <VictoryAxis
                  label="Date"
                  tickValues={this.state.plantData.map(
                    (d) => new Date(d.dateTime)
                  )}
                  tickFormat={(t) =>
                    `${t.getUTCDate()}/${
                      t.getUTCMonth() + 1
                    }/${t.getFullYear()}\n${t.getHours()}:${String(
                      t.getMinutes()
                    ).padStart(2, "0")}`
                  }
                  tickCount={3}
                  axisLabelComponent={<VictoryLabel dy={20} />}
                  tickLabelComponent={<VictoryLabel style={{ fontSize: 10 }} />}
                  style={{
                    ticks: { stroke: "grey", size: 5 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Light"
                  axisLabelComponent={<VictoryLabel dy={-20} />}
                  style={{
                    grid: {
                      stroke: "grey",
                      opacity: "25%",
                    },
                    ticks: { stroke: "grey", size: 5 },
                  }}
                  tickFormat={(t) => Math.trunc(t)}
                />
              </VictoryChart>
            </FadeInDiv>
          </div>
        </div>
      </div>
    );
  }
}
