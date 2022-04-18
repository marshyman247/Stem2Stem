import React, { Component } from "react";
import axios from "axios";
import { Button } from "@material-ui/core";

export default class Water extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
  }
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  handleClick = () => {
    if (this.state.disabled) return;
    let command = JSON.stringify({ Command: "Water" });
    axios
      .post("http://localhost:8000/water_plant", command, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
          "Access-Control-Allow-Headers":
            "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
        },
      })
      .catch((err) => {
        console.error(err);
      });
    this.setState({ disabled: true });
    setTimeout(
      function () {
        this.setState({ disabled: false });
      }.bind(this),
      60000
    );
  };
  render() {
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h1 style={{ fontWeight: "lighter" }}>Water Plant</h1>
          <br />
        </div>
        <Button
          className="submitButton"
          type="button"
          disabled={this.state.disabled}
          onClick={() => this.handleClick()}
        >
          {this.state.disabled ? "Watering..." : "Submit"}
        </Button>
      </div>
    );
  }
}
