const express = require("express");
const app = express();
const SerialPort = require("serialport");
const appPort = process.env.PORT || 8000;
const fs = require("fs");
const path = require("path");
var bodyParser = require("body-parser");
var cors = require("cors");
var jsonParser = bodyParser.json();
var COMPort;
let portPath;

app.use(cors());
SerialPort.list().then(
  (ports) => {
    ports.forEach((port) => {
      console.log(port.vendorId);
      if (port.vendorId === "2341") {
        console.log("Port Set: " + port.path);
        portPath = port.path;
        createPort(portPath);
      }
    });
  },
  (err) => {
    console.log("Error Listing Ports: ", err);
  }
);
fs.readFile(path.join(__dirname, "/data.json"), (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  let json = JSON.parse(data);
  console.log(json);
  app.locals.json = json;
  console.log(app.locals.json.CurrentPlant);
});
fs.readFile(path.join(__dirname, "/PlantHealthRanges.json"), (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  let PlantHealthRanges = JSON.parse(data);
  app.locals.PlantHealthRanges = PlantHealthRanges;
  console.log(app.locals.PlantHealthRanges);
});
app.listen(appPort, () => console.log(`Listening on port ${appPort}`));
//FUNCTIONS
function portOpen() {
  console.log("Serial Port Opened");
}

function readData(data) {
  console.log(data);
  str = data.toString();
  str = str.replace(/(\r\n|\n|\r)/gm, "");
  try {
    str = JSON.parse(str);
  } catch (e) {
    return;
  }
  console.log("Incoming Data: ", str);
  if (str.Command) return;
  if (str.M != undefined && str.L != undefined && str.T != undefined) {
    let data = {};
    data.Moisture = str.M;
    data.Temperature = str.T;
    data.Light = str.L;
    let date = new Date();
    data.dateTime = Date.parse(date);
    console.log("Outgoing Data: ", data);
    app.locals.json.Plants[app.locals.json.CurrentPlant].push(data);
    app.locals.json.Plants[app.locals.json.CurrentPlant].splice(
      0,
      app.locals.json.Plants[app.locals.json.CurrentPlant].length - 60
    );

    fs.writeFile(
      path.join(__dirname, "/data.json"),
      JSON.stringify(app.locals.json, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
        console.log("writing to data.json");
      }
    );
  }
}
function createPort(path) {
  COMPort = new SerialPort(
    path,
    {
      baudRate: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
      flowControl: false,
    },
    (err) => {
      if (err) return console.log("Serial Port Error: ", err.message);
    }
  );
  var Readline = SerialPort.parsers.Readline;
  var parser = new Readline();
  COMPort.pipe(parser);
  COMPort.on("open", portOpen);
  parser.on("data", readData);
}
function writeToPort(command) {
  if (COMPort) {
    COMPort.write(command, function (err) {
      if (err) {
        return console.log("Error on write: ", err.message);
      }
    });
  }
}

//GET REQUESTS
app.get("/express_backend", (req, res) => {
  res.send({ express: "CONNECTED TO  STEM2STEM SERVER" });
});
app.get("/current_plant_data", (req, res) => {
  let data = app.locals.json.Plants[app.locals.json.CurrentPlant];
  console.log(data[data.length - 1]);
  res.send({
    currentPlantData: {
      Name: app.locals.json.CurrentPlant,
      Data: app.locals.json.Plants[app.locals.json.CurrentPlant],
    },
  });
});
app.get("/current_plant", (req, res) => {
  res.send({ currentPlant: app.locals.json.CurrentPlant });
});
app.get("/current_plant_ranges", (req, res) => {
  let data = app.locals.PlantHealthRanges.Plants[app.locals.json.CurrentPlant];
  res.send({ currentPlantRanges: data });
});
//POST REQUESTS
app.post("/change_plant", jsonParser, (req, res) => {
  console.log(req.body);
  app.locals.json.CurrentPlant = req.body.plant;
  fs.writeFile(
    path.join(__dirname, "/data.json"),
    JSON.stringify(app.locals.json, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(app.locals.json));
      console.log("writing to data.json");
    }
  );
});

app.post("/water_plant", jsonParser, (req, res) => {
  console.log(req.body);
  if (req.body.Command === "Water") {
    let command = req.body;
    command.minM =
      app.locals.PlantHealthRanges.Plants[
        app.locals.json.CurrentPlant
      ].Moisture.Min;
    console.log("Writing Command: ", command);
    writeToPort(JSON.stringify(req.body));
  }
});
