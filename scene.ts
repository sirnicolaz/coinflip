// Import necessary modules from Decentraland SDK
import {
  engine,
  Entity,
  Transform,
  Vector3,
  BoxShape,
  CylinderShape,
  OnPointerDown,
} from "decentraland-ecs";

// Utility to simulate setInterval in Decentraland
function setInterval(callback: () => void, interval: number): () => void {
  let elapsed = 0;
  const system = new (class {
    update(dt: number) {
      elapsed += dt * 1000;
      if (elapsed >= interval) {
        callback();
        elapsed = 0;
      }
    }
  })();
  engine.addSystem(system);
  return () => engine.removeSystem(system);
}

function clearInterval(clearFunction: () => void) {
  clearFunction();
}
// Create the base cube
const cube = new Entity();
cube.addComponent(
  new Transform({
    position: new Vector3(8, 1, 8), // Centered on the scene
    scale: new Vector3(2, 2, 2),
  })
);
cube.addComponent(new BoxShape());
engine.addEntity(cube);

// Create the coin
const coin = new Entity();
coin.addComponent(
  new Transform({
    position: new Vector3(8, 2.5, 8), // Positioned on top of the cube
    scale: new Vector3(1, 0.1, 1), // Flat, coin-like shape
  })
);
coin.addComponent(new CylinderShape());
engine.addEntity(coin);

// Add coin flipping logic
let isFlipping = false;
const flipSpeed = 6; // Speed of flip

coin.addComponent(
  new OnPointerDown(() => {
    if (!isFlipping) {
      isFlipping = true;
      let flipProgress = 0;
      const flipInterval = setInterval(() => {
        const transform = coin.getComponent(Transform);
        transform.rotate(Vector3.Left(), flipSpeed);
        flipProgress += flipSpeed;

        // Stop flipping after a 360-degree rotation
        if (flipProgress >= 360) {
          clearInterval(flipInterval);
          isFlipping = false;
        }
      }, 16); // Roughly 60 FPS
    }
  })
);

// Optionally, you can customize the VR interactivity logic further.

// Add scene lighting and other components if necessary (optional)
