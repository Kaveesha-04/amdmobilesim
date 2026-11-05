# Adaptable and Modular Drone Simulator

A browser-based 3D simulator for the **Adaptable and Modular Drone**, built around the **MoonLady Beta 1** flight controller and set in a virtual FIT EXPO 2026 exhibition hall.

You can inspect the drone on its display stand and fly a virtual copy with the keyboard or a real transmitter.

> **Safety:** this is only a simulator. It never sends commands to a real drone or its motors.

## Contents

- [Getting started](#getting-started)
- [The two modes](#the-two-modes)
- [Natural Mode](#natural-mode)
- [Artificial Mode](#artificial-mode)
- [Flying with a transmitter](#flying-with-a-transmitter)
- [Using the interface](#using-the-interface)
- [How the simulation works](#how-the-simulation-works)
- [Current limitations](#current-limitations)
- [Troubleshooting](#troubleshooting)
- [Project layout](#project-layout)

## Getting started

You need [Node.js](https://nodejs.org/) (tested on version 22) and a browser with WebGL. A graphics card helps, because the scene is slow on software rendering.

```bash
npm install
npm run dev
```

Open the address Vite prints, normally <http://localhost:5173>.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run typecheck` | Checks the TypeScript |
| `npm run build` | Typechecks and builds for production into `dist/` |
| `npm run preview` | Serves the production build |

## The two modes

The simulator opens in Natural Mode. Switch using the bottom menu or the Home panel.

| | Natural Mode | Artificial Mode |
|---|---|---|
| **Purpose** | Show the drone's orientation on a 3D model | Fly a virtual drone |
| **Does the drone move around?** | No, it stays on the stand and only rotates | Yes, inside the flight area |
| **Input** | Orientation telemetry | Keyboard or transmitter |
| **Display stand** | Raised | Flat floor markings, so the drone can land on them |

## Natural Mode

Natural Mode is designed to mirror the real drone's roll, pitch and yaw. **It isn't connected to a real drone yet**, because the drone's way of sending its orientation hasn't been confirmed.

- **In development (`npm run dev`):** the model runs on simulated data, and the app labels it as simulated.
- **In a production build:** there is no data source, so the app reports that no telemetry source is configured.

To try it in development:

1. Open **Natural Mode** in the bottom menu.
2. Under **Simulated data controls**, press **Start stream**. The status bar changes to *Connected*.
3. Move the **Roll**, **Pitch** and **Yaw** sliders and watch the model follow.

The same section lets you test how the app handles problems:

- **Send bad readings** sends invalid data.
- **Pause stream** stops the data, so it goes stale.
- **Disconnect** drops the connection.
- **Return to neutral** levels the model and clears any bad readings.

## Artificial Mode

### Your first flight

1. Open **Artificial Mode** in the bottom menu.
2. Press **Enter** to arm. The propellers start at idle.
3. Hold **↑** to raise the throttle. The drone lifts off above 50%.
4. Release **↑** once it's climbing. The throttle stays where you left it, so bring it back to about 50% to hover.
5. Steer with **W A S D**, and turn with **Q** and **E**.
6. To land, hold **↓** to bring the throttle below 45% and let the drone descend.
7. Press **Space** to disarm once it's down.

### Keyboard controls

| Key | Action |
|---|---|
| **W / S** | Pitch forward / back |
| **A / D** | Roll left / right |
| **Q / E** | Yaw left / right |
| **↑ / ↓** | Throttle up / down |
| **Enter** | Arm |
| **Space** | Emergency stop / disarm |
| **R** | Reset to the start position |
| **C** | Switch between follow and free camera |

> **Space in the air is an emergency stop.** The motors cut immediately and the drone falls. To land normally, lower the throttle instead.

### Flight states

| State | Meaning |
|---|---|
| **Disarmed** | Motors off |
| **Armed** | On the ground with motors idling |
| **Flying** | In the air |
| **Landing** | Descending with the throttle below 45% |

Arming is refused if the throttle is above 5% or the drone is in the air, so it can't jump off the ground. The drone also can't yaw until it has left the ground.

### Motor Monitor

In the Artificial Mode panel, choose **Motor Monitor** to see each of the four motors' output, estimated RPM and running status. A motor at 85% output or more is shown as near its limit.

In the 3D view, a small display beside each motor shows its live output as a bar and a percentage. These move with the drone, and appear only in Artificial Mode, because Natural Mode has no measured motor speeds. Turn them on or off with **Speed indicators on drone** in the Motor Monitor.

The RPM is illustrative: output (0 to 1) × 12,000. It isn't measured from the real motors.

### The flight area

The drone flies inside a **40 × 40 m area with a 15 m ceiling**, marked on the floor. At an edge it stops and the panel shows *At the edge of the flight area*. The hall's walls and pillars aren't obstacles, because only the flight area limits the drone.

## Flying with a transmitter

The real transmitter can fly the virtual drone through this chain:

```text
Transmitter → ESP32 → Signal Receiver (Node.js, port 3000) → Simulator
```

The flow is one way: nothing is sent back to the drone.

> **No calibration step is needed.** The team shares one transmitter, so its measured values are built into `src/config/transmitter.ts` and every laptop uses them.

### 1. Start the Signal Receiver

The folder name really is spelled `Signal Reciever`.

```bash
cd "Signal Reciever"
npm install
npm start
```

The receiver prints two addresses:

- **ESP32 serverUrl:** set this in the ESP32 firmware.
- **Web Dashboard:** open this to see the incoming values live.

The ESP32 sends JSON to `POST /api/telemetry`, for example:

```json
{ "throttle": 1000, "yaw": 0, "pitch": 0, "roll": 0, "nrf_ok": true }
```

### 2. Check the calibration

The built-in values only need changing if you use a different transmitter or a stick moves the wrong way. They're in `TRANSMITTER_CALIBRATION`, in raw transmitter units:

| Setting | Meaning |
|---|---|
| `min`, `max` | The stick's limits |
| `center` | Where the stick rests (roll, pitch and yaw only) |
| `deadband` | How far from rest, or from the bottom on throttle, still reads as zero |
| `invert` | `true` if the stick moves the opposite way to what you want |

Positive roll is right, positive pitch is forward and positive yaw is nose right.

### 3. Fly

1. In the Artificial Mode panel, select **Transmitter**. You can only change input while disarmed and on the ground.
2. Check that the status bar shows *Transmitter: Connected*.
3. Lower the throttle stick and press **Enter** on the keyboard to arm.
4. Raise the throttle to take off.

Arm, disarm, reset and camera stay on the keyboard, because the transmitter has no channels for them.

If the receiver runs on another computer, open the **Telemetry** panel and change **Receiver address**, or set `VITE_SIGNAL_RECEIVER_URL` in `.env.local`. The default is `http://localhost:3000`.

### Connection status

| Status | Meaning |
|---|---|
| Connected (green) | Fresh, valid data is arriving |
| Waiting for data (blue) | Waiting for the first data |
| Disconnected (grey) | The receiver can't be reached |
| Signal lost (orange) | No new message for over 1 second |
| Invalid data (red) | A value is too far outside its calibrated range |

**Failsafe:** if the signal is lost or invalid during flight, the virtual motors stop and the drone falls. It stays disarmed when the signal returns, until you arm it again.

## Using the interface

**Bottom menu:** Home, Natural Mode, Artificial Mode, Telemetry, Settings and Help. Choose an item to open its panel. Choose it again, press **Esc** or click the scene to close it. The simulation keeps running behind panels.

**Camera**

- Drag the scene to look around when using the free camera. Natural Mode always works this way.
- Scroll, or use the zoom bar above the menu, to move closer or further away. The reset button beside it restores the default distance.
- In Artificial Mode, the follow camera stays behind the drone. Press **C** to switch to the free camera.

**Telemetry panel:** shows the current data source, the orientation and throttle values, and the transmitter details when it's in use.

**Settings panel**

| Setting | Effect |
|---|---|
| Graphics quality | High, Balanced or Performance. Lower draws fewer pixels, which helps on slower laptops |
| Camera | Follow or free, in Artificial Mode |
| Reduce visual effects | Simplifies the glass panel effects |
| Show flight readout on screen | Shows or hides the small status readout |
| Fullscreen | Enters or exits fullscreen |

## How the simulation works

Each step in Artificial Mode runs in this order:

```text
Input → Virtual flight controller → Physics → Motor outputs → 3D scene
```

1. **Input** reads the keyboard or transmitter as throttle, roll, pitch and yaw.
2. **The virtual flight controller** turns those into a target tilt, turn rate and thrust. It limits tilt near the ground so the propellers can't touch the floor, and it adds thrust when tilted so forward flight doesn't sink.
3. **The physics** applies gravity, thrust, drag and ground friction, and keeps the drone inside the flight area. It advances in fixed steps of 1/120 s, so the result doesn't depend on frame rate.
4. **Motor outputs** drive the propeller animation and the Motor Monitor. The physics works from the flight controller's target rather than from each motor's thrust.

| Value | Setting |
|---|---|
| Gravity | 9.81 m/s² |
| Hover throttle | 50% (full thrust is twice gravity) |
| Maximum tilt | 30° |
| Maximum yaw rate | 120°/s |
| Keyboard throttle, zero to full | 2.5 s |
| Propeller reach from centre | 0.352 m |

These values live in `src/config/flight.ts`.

**The exhibition hall** is a 60 × 60 × 18.5 m space drawn entirely in code, so it needs no extra downloads apart from the drone model. Its wall screens show the FIT EXPO 2026 banner and information about the drone, the MoonLady Beta 1 flight controller and the Aeronexus Flight v1 software. Its colours are set in `src/config/hall.ts`.

## Current limitations

- **The physics is a simplified teaching model.** It is chosen to feel believable, and isn't measured from the real drone, so it can't predict how the real drone will fly.
- **Natural Mode has no real data source yet.** It only runs on simulated data, and only in development.
- **The transmitter's stick directions aren't confirmed yet.** Its ranges and sending rate have been measured, but `invert` hasn't been checked in a real flight.
- **Motor numbering and RPM are the simulator's own,** and say nothing about the real drone's wiring or motors.

## Troubleshooting

| Problem | What to try |
|---|---|
| Natural Mode says *Waiting for data* | Press **Start stream** in the Natural Mode panel |
| *Lower the throttle to arm* | Hold **↓** until the throttle reads 5% or less |
| *Cannot arm in the air* | Land first, or press **R** to reset |
| The drone won't lift off | Raise the throttle above 50% |
| Transmitter shows *Disconnected* | Start the Signal Receiver and check the receiver address |
| Input or address options are locked | Disarm and land first |
| Low frame rate | Lower **Graphics quality** in Settings, or turn on **Reduce visual effects** |

## Project layout

```text
public/models/           The drone's 3D model
Signal Reciever/         Node.js server between the ESP32 and the simulator
src/
  components/environment/  Exhibition hall and outdoor scenery
  components/panels/       Home, Settings, Help and Telemetry panels
  components/shell/        Status bar and bottom menu
  components/simulator/    Drone model, cameras and 3D scene
  config/                  Flight, camera, hall, world and transmitter settings
  features/                Natural Mode and Artificial Mode
  services/                Keyboard, transmitter and telemetry input
  simulation/              Flight controller and physics
  stores/                  Application state
```

Built with React, TypeScript, Vite, Three.js, React Three Fiber and Tailwind CSS.
