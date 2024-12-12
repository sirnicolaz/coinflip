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

class RotatorSystem {
  // this group will contain every entity that has a Transform component
  group = engine.getComponentGroup(Transform);

  update(dt: number) {
    // iterate over the entities of the group
    for (const entity of this.group.entities) {
      // get the Transform component of the entity
      const transform = entity.getComponent(Transform);

      // mutate the rotation
      transform.rotate(Vector3.Up(), dt * 10);
    }
  }
}

// Add a new instance of the system to the engine
engine.addSystem(new RotatorSystem());

/// --- Spawner function ---

function spawnCube(x: number, y: number, z: number) {
  // create the entity
  const cube = new Entity();

  // add a transform to the entity
  cube.addComponent(new Transform({ position: new Vector3(x, y, z) }));

  // add a shape to the entity
  cube.addComponent(new BoxShape());

  // add the entity to the engine
  engine.addEntity(cube);

  return cube;
}

function spawnCoin(x: number, y: number, z: number) {
  // create the entity
  const coin = new Entity();

  const myMaterial = new Material();
  myMaterial.albedoColor = Color3.FromHexString("#FFFF00");
  myMaterial.metallic = 0.9;
  myMaterial.roughness = 0.1;
  coin.addComponent(myMaterial);

  // add a transform to the entity
  coin.addComponent(
    new Transform({
      position: new Vector3(x, y, z),
      scale: new Vector3(0.1, 0.01, 0.1),
    })
  );

  const textN = new Entity();
  textN.addComponent(new TextShape("N"));
  textN.getComponent(TextShape).color = Color3.Red();
  textN.addComponent(
    new Transform({
      position: new Vector3(x, y + 0.01, z), // Centered slightly above the coin surface
      rotation: Quaternion.Euler(90, 0, 0),
      scale: new Vector3(0.05, 0.05, 0.05), // Properly scaled for the coin
    })
  );
  engine.addEntity(textN);

  // Add "A" engraving on the opposite side
  const textA = new Entity();
  textA.addComponent(new TextShape("A"));
  textA.getComponent(TextShape).color = Color3.Blue();
  textA.addComponent(
    new Transform({
      position: new Vector3(x, y - 0.01, z), // Centered slightly below the coin surface
      rotation: Quaternion.Euler(90, 180, 0),
      scale: new Vector3(0.05, 0.05, 0.05), // Properly scaled for the coin
    })
  );
  engine.addEntity(textA);
  textA.setParent(coin);
  textN.setParent(coin);

  // add a shape to the entity
  coin.addComponent(new CylinderShape());

  // add the entity to the engine
  engine.addEntity(coin);

  return coin;
}

const debugText = new Entity();
debugText.addComponent(
  new Transform({
    position: new Vector3(8, 3, 8),
  })
);
const textShape = new TextShape("0");
debugText.addComponent(textShape);
engine.addEntity(debugText);

function debug(text: string) {
  textShape.value = text;
}

/// --- Spawn a cube ---

const coin = spawnCoin(8, 1.6, 8);
const cube = spawnCube(8, 1, 8);

let isFlipping = false;
const flipSpeed = 30; // Speed of flip

coin.addComponent(
  new OnPointerDown(() => {
    const degree = Math.floor(Math.random() * 30.0) * 180;
    if (!isFlipping) {
      isFlipping = true;
      let flipProgress = 0;
      const flipInterval = setInterval(() => {
        if (flipProgress >= degree) {
          clearInterval(flipInterval);
          isFlipping = false;
          debug((degree / 180) % 2 === 0 ? "HEAD" : "TAIL");
          return;
        }
        const transform = coin.getComponent(Transform);
        transform.rotate(Vector3.Left(), flipSpeed);
        flipProgress += flipSpeed;
        // Stop flipping after a 360-degree rotation
      }, 16); // Roughly 60 FPS
    }
  })
);
