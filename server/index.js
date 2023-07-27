require('dotenv').config();
const debug = require('debug')(`${process.env.APPNAME}:index`);
const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const wss = require ('./wss');

const HTTPPORT = 4000;
const WSSPORT = 8090;

// env
process.env.NODE_ENV = app.get('env');
process.env.DEPLOYMENT_MODE = app.get('env');
debug("app.get('env')", app.get('env'));
debug('process.env.NODE_ENV', process.env.NODE_ENV);
debug('DEPLOYMENT_MODE', process.env.DEPLOYMENT_MODE);

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({
  limit: '2mb',
  extended: true,
}));
app.use((req, res, next) => {
  res.setTimeout(30000);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// init the websocket server
wss.init(WSSPORT)

// init the http server
server.listen(HTTPPORT, () => {
  debug(`${process.env.APPNAME} is running on port: ${HTTPPORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close((err) => {
    if (err) {
      debug(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
