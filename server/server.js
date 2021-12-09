const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const fs = require('fs')
const path = require("path");
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()

fs.readFile(path.join(__dirname, '/data.json'), (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  let json = JSON.parse(data);
  console.log(json);
  app.locals.json = json;
  console.log(app.locals.json.CurrentPlant);

})


app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/express_backend", (req, res) => {
  res.send({ express: "CONNECTED TO  STEM2STEM SERVER" });
});

app.get("/current_plant", (req, res) => {
  res.send({ currentPlant: app.locals.json.CurrentPlant });
});

app.post("/change_plant", jsonParser,(req, res) => {
  console.log(req.body);
  app.locals.json.CurrentPlant = req.data["body"];
  fs.writeFile(path.join(__dirname, '/data.json'), JSON.stringify(app.locals.json,  null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(app.locals.json));
    console.log('writing to data.json');
  })
})
