import React, { Component } from "react";
import "./Home.css";
import { InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";

export default class Change extends Component {
  constructor(props) {
    super(props);
    this.state = { SelectedPlant: "None" };
  }
  handleChange = (e) => {
    this.setState({ SelectedPlant: e.target.value });
  };
  render() {
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h2
            style={{
              display: "flex !important",
              fontWeight: "lighter",
              marginTop: "300px",
            }}
          >
            Change Plants <br />
          </h2>
          <div style={{ margin: "20px" }}>
            <div style={{ width: "200px" }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Plant</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={this.state.SelectedPlant}
                  label="Plant"
                  onChange={(e) => this.handleChange(e)}
                >
                  <MenuItem value={"Cactus"}>Cactus</MenuItem>
                  <MenuItem value={"Sunflower"}>Sunflower</MenuItem>
                  <MenuItem value={"Tulip"}>Tulip</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
