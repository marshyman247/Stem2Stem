import React, { Component } from "react";
import "./Home.css";
import { InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import axios from 'axios';

export default class Change extends Component {
  constructor(props) {
    super(props);
    this.state = {SelectedPlant: "None" , tempSelected: ""};
  }
  componentDidMount() {
    this.fetchServerPlant()
      .then((res) => this.setState({ SelectedPlant: res.currentPlant , tempSelected: res.currentPlant}))
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
    this.setState({tempSelected: e.target.value });
  };
  handleClick = () => {
    let json = JSON.stringify({body :this.state.tempSelected});
    console.log(json)
    axios
    .post('http://localhost:8000/change_plant', json, {
      headers: { "testing" : "IT WORKED","Content-Type":"application/json" 
    }
  },

    )
    .then(() => this.setState({SelectedPlant: this.state.tempSelected}))
    .catch(err => {
      console.error(err);
    })
  };
  render() {
    console.log(this.state.SelectedPlant)
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
          <div style={{ margin: "20px",width: "500px", display: "inline !important" }}>
            <div style={{ width: "200px" }}>
              <FormControl fullWidth>
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
                <button type="button" onClick={() => this.handleClick()}>Submit</button>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
