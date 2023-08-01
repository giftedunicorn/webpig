module.exports = {
    apps : [{
      name: 'websocket-server',
      script: './server/index.js',
      instances: "max",
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: 'production'
      },
    }],
  };
  