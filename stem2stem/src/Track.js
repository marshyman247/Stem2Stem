import React, { Component } from "react";
import "./Track.css";

export default class Track extends Component {
  constructor(props) {
    super(props);
    this.state = { SelectedPlant: "None", tempSelected: "" };
  }
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    console.log(this.state.SelectedPlant);
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h1 style={{ fontWeight: "lighter" }}>Track A Plant</h1>
          <br />
        </div>
      </div>
    );
  }
}
