import { fadeInLeft } from "react-animations";
import React, { Component } from "react";
import "./Home.css";
import styled, { keyframes } from "styled-components";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
const FadeInAnimation = keyframes`${fadeInLeft}`;
const FadeInTitle = styled.div`
  animation: 3s ${FadeInAnimation};
`;
const FadeInButton = styled.div`
  animation: 3s ${FadeInAnimation};
  animation-delay: 2s;
  animation-fill-mode: both;
`;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="PageText">
        <div className="PageHeader">
          <FadeInTitle>
            <h1
              style={{
                display: "flex !important",
                fontWeight: "lighter",
                marginTop: "300px",
              }}
            >
              Start Your Plant Journey
              <br />
            </h1>
          </FadeInTitle>
          <FadeInButton>
            <Link to="/track">
              <Button className="StartButton">Today</Button>
            </Link>
          </FadeInButton>
        </div>
      </div>
    );
  }
}
