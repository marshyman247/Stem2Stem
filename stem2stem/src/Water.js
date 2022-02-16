import React, { Component } from "react";
import "./Water.css";
import axios from "axios";

export default class Water extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  handleClick = () => {
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
  };
  render() {
    return (
      <div className="PageText">
        <div className="PageHeader">
          <h1 style={{ fontWeight: "lighter" }}>Water Plant</h1>
          <br />
        </div>
        <button
          className="submitButton"
          type="button"
          onClick={() => this.handleClick()}
        >
          Submit
        </button>
      </div>
    );
  }
}
