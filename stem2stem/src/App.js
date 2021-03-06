import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Button, Toolbar } from "@material-ui/core";
import "./App.css";
import Home from "./Home.js";
import Change from "./Change.js";
import Track from "./Track";
import Water from "./Water";
import logo from "./images/logo.png";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { serverConnection: null };
  }
  componentDidMount() {
    this.callBackendAPI()
      .then((res) => this.setState({ serverConnection: res.express }))
      .catch((err) => console.log(err));
  }
  callBackendAPI = async () => {
    const response = await fetch("/express_backend");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };
  render() {
    return (
      <Router>
        <AppBar className="AppBar">
          <Toolbar>
            <img
              src={logo}
              alt="Stem2Stem"
              style={{ width: 250, height: 75 }}
            />
            <div style={{ marginLeft: "120px" }}>
              <Link to="/">
                <Button className="AppBarButton">Home</Button>
              </Link>
              <Link to="/track">
                <Button className="AppBarButton">Track A Plant</Button>
              </Link>
              <Link to="/change">
                <Button className="AppBarButton">Change Plant</Button>
              </Link>
              <Link to="/water">
                <Button className="AppBarButton">Water Plant</Button>
              </Link>
            </div>
            {this.state.serverConnection ? (
              <p style={{ marginLeft: "auto" }}>
                {this.state.serverConnection}
              </p>
            ) : (
              <p style={{ marginLeft: "auto" }}>
                CANNOT CONNECT TO STEM2STEM SERVER
              </p>
            )}
          </Toolbar>
        </AppBar>

        <div className="Main">
          <Routes>
            <Route path="/track" element={<Track />} />
            <Route path="/change" element={<Change />} />
            <Route path="/water" element={<Water />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    );
  }
}
