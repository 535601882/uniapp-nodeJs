const fs = require('fs');

function image2Base64(imagePath) {
  const image = fs.readFileSync(imagePath);
  return image.toString('base64');
}

module.exports = { image2Base64 }; 