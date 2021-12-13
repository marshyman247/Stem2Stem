import React, { Component } from "react";
import "./Change.css";
import { InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import axios from "axios";

export default class Change extends Component {
  constructor(props) {
    super(props);
    this.state = { SelectedPlant: "None", tempSelected: "" };
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchServerPlant()
      .then((res) =>
        this.setState({
          SelectedPlant: res.currentPlant,
          tempSelected: res.currentPlant,
        })
      )
      .catch((err) => console.log(err));
  }
  fetchServerPlant = async () => {
    const response = await fetch("/current_Plant");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };
  handleChange = (e) => {
    this.setState({ tempSelected: e.target.value });
  };
  handleClick = () => {
    let json = JSON.stringify({ plant: this.state.tempSelected });
    console.log(json);
    axios
      .post("http://localhost:8000/change_plant", json, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
          "Access-Control-Allow-Headers":
            "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
        },
      })
      .then(() => this.setState({ SelectedPlant: this.state.tempSelected }))
      .catch((err) => {
        console.error(err);
      });
  };
  render() {
    console.log(this.state.SelectedPlant);
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h1 style={{ fontWeight: "lighter" }}>Change Plants</h1>
          <br />
        </div>
        <div style={{ width: "75%", margin: "auto" }}>
          <FormControl style={{ width: "40%" }}>
            <InputLabel id="demo-simple-select-label">Plant</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={this.state.tempSelected}
              label="Plant"
              onChange={(e) => this.handleChange(e)}
            >
              <MenuItem value={"Cactus"}>Cactus</MenuItem>
              <MenuItem value={"Lily"}>Lily</MenuItem>
              <MenuItem value={"Lobelia"}>Lobelia</MenuItem>
              <MenuItem value={"Marigold"}>Marigold</MenuItem>
              <MenuItem value={"Cranberry"}>Cranberry</MenuItem>
            </Select>
          </FormControl>
          <button
            className="submitButton"
            type="button"
            onClick={() => this.handleClick()}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}
