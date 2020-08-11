const http = require('http');
const server = new http.Server();
const LimitSizeStream = require('./LimitSizeStream');
server.on('request', async (req, res) => {
  const limitStream = new LimitSizeStream({limit: 999999});
  for await (const chunk of req) {
    console.log('for iteration');
    limitStream.write(chunk);
  }
  res.end();
});
module.exports = server;