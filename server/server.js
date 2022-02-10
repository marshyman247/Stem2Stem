const express = require("express");
const app = express();
const SerialPort = require("serialport");
const appPort = process.env.PORT || 8000;
const fs = require("fs");
const path = require("path");
var bodyParser = require("body-parser");
var cors = require("cors");
var jsonParser = bodyParser.json();
app.use(cors());

let portPath;
async () => {
  try {
    const list = await SerialPort.list();
    portPath = list.find((port) => port.vendorId === "1A86");
    console.log(portPath);
  } catch (e) {
    console.log(e);
  }
};
SerialPort.list().then(
  (ports) => {
    ports.forEach((port) => {
      if (port.vendorId === "1A86") {
        console.log("Port Set: " + port.path);
        portPath = port.path;
        const COMPort = new SerialPort(
          portPath,
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
    });
  },
  (err) => {
    console.log("Error Listing Ports: ", err);
  }
);

function portOpen() {
  console.log("Serial Port Opened");
}

function readData(data) {
  str = data.toString(); //Convert to string
  str = str.replace(/(\r\n|\n|\r)/gm, ""); //remove '\r' from this String
  str = JSON.stringify(data); // Convert to JSON
  str = JSON.parse(data); //Then parse it

  console.log("Data:", str);
}

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

app.listen(appPort, () => console.log(`Listening on port ${appPort}`));

app.get("/express_backend", (req, res) => {
  res.send({ express: "CONNECTED TO  STEM2STEM SERVER" });
});

app.get("/current_plant", (req, res) => {
  res.send({ currentPlant: app.locals.json.CurrentPlant });
});

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
