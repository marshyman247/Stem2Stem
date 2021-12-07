import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Button, Toolbar } from "@material-ui/core";
import "./App.css";
import Home from "./Home.js";
import Change from "./Change.js";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }
  componentDidMount() {
    this.callBackendAPI()
      .then((res) => this.setState({ data: res.express }))
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
    function Track() {
      return (
        <div className="PageText">
          <h1 style={{ fontWeight: "lighter" }}>Track A Plant</h1>
        </div>
      );
    }

    return (
      <Router>
        <AppBar className="AppBar">
          <Toolbar>
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
            </div>
            <p>{this.state.data}</p>
          </Toolbar>
        </AppBar>

        <div className="Main">
          <Routes>
            <Route path="/track" element={<Track />} />
            <Route path="/change" element={<Change />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    );
  }
}
