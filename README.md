# Adaptable and Modular Drone: Flight Simulator

A browser-based 3D flight simulator for the **Adaptable and Modular Drone**, built around the **MoonLady Beta 1** flight controller and set in a virtual FIT EXPO 2026 exhibition hall.

Anyone can fly it with on-screen thumb sticks, and it's designed for phones first. It also works with a keyboard on a laptop.

> **Safety:** this is only a simulator. It never sends commands to a real drone or its motors.

## Getting started

You need [Node.js](https://nodejs.org/) (tested on version 22).

```bash
npm install
npm run dev
```

Open the address Vite prints, normally <http://localhost:5173>.

To try it on a phone on the same Wi-Fi network, run `npm run dev -- --host` and open the **Network** address it prints on the phone.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run typecheck` | Checks the TypeScript |
| `npm run build` | Typechecks and builds for production into `dist/` |
| `npm run preview` | Serves the production build |

The build is plain static files, so `dist/` can be put on any static web host.

## Your first flight

1. Tap **Start**. The propellers begin to idle.
2. Hold the **left stick** up to raise the throttle. The drone lifts off above 50%.
3. Let go once it's climbing. The throttle stays where you left it. The line on the bar beside the stick marks 50%, where the drone hovers.
4. Fly with the **right stick**, and turn with the left stick.
5. To land, hold the left stick down to bring the throttle below 45% and let the drone descend.
6. Tap **Stop** once it's down.

**Stop** turns the motors off at once, so in the air the drone falls. **Reset** puts the drone back at the start.

## Controls

| Control | On screen | Keyboard |
|---|---|---|
| Climb / descend | Left stick up / down | **↑ / ↓** |
| Turn left / right | Left stick sideways | **Q / E** |
| Fly forward / back | Right stick up / down | **W / S** |
| Fly left / right | Right stick sideways | **A / D** |
| Start motors | **Start** | **Enter** |
| Stop motors | **Stop** | **Space** |
| Reset | **Reset** | **R** |
| Switch camera | **Free view** / **Follow** | **C** |

Both sticks work at the same time. Small movements do less than the same movement would on a straight scale, for finer control, and a small area around each stick's centre does nothing.

Sticks and keys share one throttle, and the on-screen controls also work with a mouse.

## The screen

- **Top left:** flight state, height and speed.
- **Motors switch:** turns the small display beside each motor on or off. Each shows that motor's live output as a bar and a percentage, and the choice is remembered.
- **Settings:** graphics quality, camera, visual effects and fullscreen. Phones and tablets start on Balanced quality, and Performance helps on slower ones.
- **Help:** a reminder of the controls.
- **+ and − at the right:** zoom. Tap the percentage to reset it, or scroll over the scene with a mouse.
- In **Free view**, drag the scene to look around.

## Flight states

| State | Meaning |
|---|---|
| **Motors off** | Disarmed |
| **Armed** | On the ground with motors idling |
| **Flying** | In the air |
| **Landing** | Descending with the throttle below 45% |

The motors can't be started in the air, so after **Stop** the drone has to land first, or be reset. The drone can't turn until it has left the ground.

## The flight area

The drone flies inside a **40 × 40 m area with a 15 m ceiling**, marked on the floor. At an edge it stops and the screen shows *At the edge of the flight area*. The hall's walls and pillars aren't obstacles, because only the flight area limits the drone.

## How the simulation works

Each step runs in this order:

```text
Input → Virtual flight controller → Physics → Motor outputs → 3D scene
```

1. **Input** reads the on-screen sticks and keyboard as throttle, roll, pitch and yaw.
2. **The virtual flight controller** turns those into a target tilt, turn rate and thrust. It limits tilt near the ground so the propellers can't touch the floor, and it adds thrust when tilted so forward flight doesn't sink.
3. **The physics** applies gravity, thrust, drag and ground friction, and keeps the drone inside the flight area. It advances in fixed steps of 1/120 s, so the result doesn't depend on frame rate.
4. **Motor outputs** drive the propeller animation and the motor displays. The physics works from the flight controller's target rather than from each motor's thrust.

| Value | Setting |
|---|---|
| Gravity | 9.81 m/s² |
| Hover throttle | 50% (full thrust is twice gravity) |
| Maximum tilt | 30° |
| Maximum yaw rate | 120°/s |
| Throttle, zero to full | 2.5 s |
| Propeller reach from centre | 0.352 m |

These values and the stick settings live in `src/config/flight.ts`.

**The exhibition hall** is a 60 × 60 × 18.5 m space drawn entirely in code, so it needs no extra downloads apart from the drone model. Its colours are set in `src/config/hall.ts`.

## Current limitations

- **The physics is a simplified teaching model.** It is chosen to feel believable, and isn't measured from the real drone, so it can't predict how the real drone will fly.
- **Motor numbering is the simulator's own,** and says nothing about the real drone's wiring.
- **The browser needs WebGL 2.** The scene shows a message if it isn't available.

## Troubleshooting

| Problem | What to try |
|---|---|
| *Cannot arm in the air* | Land first, or tap **Reset** |
| The drone won't lift off | Raise the throttle above 50% |
| Low frame rate | Choose **Performance** in Settings, or turn on **Reduce visual effects** |
| The phone can't open the page | Use `npm run dev -- --host`, and check it's on the same network |

## Project layout

```text
public/models/             The drone's 3D model
src/
  components/environment/  Exhibition hall and scenery
  components/panels/       Settings and Help panels
  components/shell/        Status bar and panel frame
  components/simulator/    Drone model, motor displays, cameras and 3D scene
  config/                  Flight, camera, hall and world settings
  features/artificial-mode/  Flight view, thumb sticks and on-screen buttons
  services/flightInput/    On-screen stick and keyboard input
  simulation/              Flight controller and physics
  stores/                  Application state
```

Built with React, TypeScript, Vite, Three.js, React Three Fiber and Tailwind CSS.
