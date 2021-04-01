const fs = require('fs');
const path = require('path');

module.exports = {
  locationDetails: JSON.parse(
    fs.readFileSync(path.join(__dirname, '../staticData/locationDetails.json'))
  ),
  locationDetailsParsed: JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../staticData/locationDetailsParsed.json')
    )
  ),
};
