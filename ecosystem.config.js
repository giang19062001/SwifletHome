module.exports = {
  apps: [
    {
      name: "SWIFLETHOME",
      script: "dist/src/main.js",   
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      listen_timeout: 50000,
      kill_timeout: 5000,
      interpreter: "node"
    }
  ]
};



// pm2 start ecosystem.config.js
