const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let latestTelemetry = {
  throttle: 1000,
  yaw: 0,
  pitch: 0,
  roll: 0,
  nrf_ok: false,
  timestamp: Date.now()
};

// POST endpoint: Receives JSON from ESP32 Core 0
app.post('/api/telemetry', (req, res) => {
  latestTelemetry = {
    ...req.body,
    timestamp: Date.now()
  };
  console.log(
    `[RX] THR: ${String(latestTelemetry.throttle).padEnd(4)} | ` +
    `YAW: ${String(latestTelemetry.yaw).padEnd(4)} | ` +
    `PIT: ${String(latestTelemetry.pitch).padEnd(4)} | ` +
    `ROL: ${String(latestTelemetry.roll).padEnd(4)} | ` +
    `NRF: ${latestTelemetry.nrf_ok ? 'OK' : 'FAIL'}`
  );
  res.sendStatus(200);
});

// GET endpoint: Serves latest JSON to your browser or frontend
app.get('/api/telemetry', (req, res) => {
  res.json(latestTelemetry);
});

// Live browser dashboard at http://localhost:3000
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Signal Receiver</title>
      <style>
        body { font-family: Consolas, monospace; background: #0f172a; color: #38bdf8; padding: 24px; }
        .card { background: #1e293b; padding: 20px; border-radius: 8px; max-width: 420px; border: 1px solid #334155; }
        h2 { margin-top: 0; color: #f8fafc; }
        pre { font-size: 16px; color: #4ade80; margin: 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>UAV Signal Receiver</h2>
        <pre id="output">Waiting for ESP32 data...</pre>
      </div>
      <script>
        setInterval(async () => {
          try {
            const res = await fetch('/api/telemetry');
            const data = await res.json();
            document.getElementById('output').textContent = JSON.stringify(data, null, 2);
          } catch (e) {}
        }, 50);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n=== UAV Signal Receiver Running ===');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`ESP32 serverUrl -> http://${iface.address}:${PORT}/api/telemetry`);
        console.log(`Web Dashboard   -> http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log('===================================\n');
});
