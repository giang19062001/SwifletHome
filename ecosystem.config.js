module.exports = {
  apps: [
    {
      name: "SWIFLETHOME",
      script: "dist/src/main.js",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: ["restart.txt"], // Tự động reload khi file restart.txt thay đổi do Jenkins trong container tác động ra ngoài Host
      listen_timeout: 50000,
      kill_timeout: 5000,
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    }
  ]
};



// pm2 start ecosystem.config.js
