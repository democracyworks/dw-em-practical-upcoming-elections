var express = require("express");
var https = require("https");
var router = express.Router();
var postalAbbreviations = require("../us_state.js");

router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Find My Election",
    states: postalAbbreviations,
  });
});

function getOcdIds(city, stateAbbr) {
  var stateId = stateAbbr.toLowerCase();
  var cityId = city.toLowerCase().replace(" ", "_");
  var ocdIdStatePrefix = "ocd-division/country:us/state:"
  var ocdIdPlacePrefix = "/place:"
  var stateOcdId = ocdIdStatePrefix + stateId;
  var cityOcdId = stateOcdId + ocdIdPlacePrefix + cityId;
  return [stateOcdId, cityOcdId];
}

router.post("/search", function (req, res, next) {
  var { city, state } = req.body;
  var ocdIds = getOcdIds(city, state);
  console.log(ocdIds.join());
  https.get(
    "https://api.turbovote.org/elections/upcoming?district-divisions=" +
      ocdIds.join(","),
    { headers: { Accept: "application/json" } },
    (result) => {
      let electionStream = "";
      result.on("data", (chunk) => {
        electionStream += chunk;
      });
      result.on("end", () => {
        res.render("search-results", {
          title: "Search Results",
          elections: JSON.parse(electionStream),
        });
      });
    }
  );
});

module.exports = router;
