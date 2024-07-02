import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  LookingGlassWebXRPolyfill,
  LookingGlassConfig,
} from '@lookingglass/webxr';
import { VRButton } from 'three/addons/webxr/VRButton.js';

/**
 * BEGIN SCAFOLDING
 */

const canvas = document.getElementById('canvas');

canvas.addEventListener('dblclick', () => {
  console.log('fbl');
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
});

const scene = new Three.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/** renderer */
const renderer = new Three.WebGLRenderer({
  canvas: canvas,
});
renderer.xr.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/** Camera */
const camera = new Three.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);
renderer.xr.updateCamera(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * END SCAFOLDING
 */

// Axes Helper
const axesHelper = new Three.AxesHelper(3);
axesHelper.visible = false;
scene.add(axesHelper);

const clockConfig = {
  ticksNum: 30,
  redius: 3,
  movingTicksNum: 5,
  tickDimension: {
    x: 0.5,
    y: 1,
    z: 0.3,
  },
};

const { ticksNum, tickDimension, movingTicksNum } = clockConfig;

const planeMaterial = new Three.MeshStandardMaterial({ color: 0x111111 });
planeMaterial.roughness = 0.6;
planeMaterial.metalness = 0.2;
const plane = new Three.Mesh(
  new Three.PlaneGeometry(clockConfig.redius * 2 + tickDimension.y, 10),
  planeMaterial
);
plane.position.z = -0.5;
scene.add(plane);

const tickMaterial = new Three.MeshStandardMaterial({
  color: `rgb(0, 64, 40)`,
});
tickMaterial.roughness = 0;
tickMaterial.metalness = 0.5;
tickMaterial.transparent = true;
tickMaterial.opacity = 0.4;

const tickGeometry = new Three.BoxGeometry(
  tickDimension.x,
  tickDimension.y,
  0.5
);
tickGeometry.translate(0, 3, 0);
for (let i = 0; i < ticksNum; i++) {
  const tick = new Three.Mesh(tickGeometry, tickMaterial);
  tick.rotation.z = i * ((Math.PI * 2) / (clockConfig.ticksNum - 10));
  scene.add(tick);
}

const movingTickMaterial = new Three.MeshStandardMaterial({
  color: `rgb(0, 64, 40)`,
});
movingTickMaterial.roughness = 0;
movingTickMaterial.metalness = 0.5;
const movingTicks = [];
for (let i = 1; i <= movingTicksNum; i++) {
  const tickGeometry = new Three.BoxGeometry(
    tickDimension.x,
    tickDimension.y,
    tickDimension.z * i
  );
  tickGeometry.translate(0, 3, (tickDimension.z * i) / 2);

  const tick = new Three.Mesh(tickGeometry, movingTickMaterial);
  //   tick.rotation.z = i * ((Math.PI * 2) / (clockConfig.ticksNum - 10));
  scene.add(tick);
  movingTicks.push(tick);
}

/** ambient light */
const ambientLight = new Three.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Directional light
const aboveLight = new Three.DirectionalLight(0x00fffc, 0.9);
scene.add(aboveLight);

// Directional light
const downLight = new Three.DirectionalLight(0x00fffc, 0.9);
downLight.position.set(0, -1, 0);
scene.add(downLight);

/** blue lights */
const color = `rgb(25, 162,248)`;
const blueMaterial = new Three.MeshBasicMaterial({
  color: color,
});
const blueGeometery = new Three.BoxGeometry(0.1, 0.17, 0.07);

const farPointLight = new Three.PointLight(0x0075ef, 10);
farPointLight.position.set(1, 1.3, 0);
scene.add(farPointLight);
const farLight = new Three.Mesh(blueGeometery, blueMaterial);
farLight.position.set(1, 1.3, 0);

const middlePointLight = new Three.PointLight(0x0075ef, 10);
middlePointLight.position.set(-1.8, 0.4, 0.3);
scene.add(middlePointLight);
const middleLight = new Three.Mesh(blueGeometery, blueMaterial);
middleLight.position.set(-1.8, 0.4, 0.3);

const closePointLight = new Three.PointLight(0x0075ef, 10);
closePointLight.position.set(0.6, -3, 0.5);
scene.add(closePointLight);
const closeLight = new Three.Mesh(blueGeometery, blueMaterial);
closeLight.position.set(0.6, -3, 0.5);

scene.add(farLight);
scene.add(middleLight);
scene.add(closeLight);

// const frameTick = () => {
//   renderer.render(scene, camera);
//   //   controls.update();

//   window.requestAnimationFrame(frameTick);
// };

// frameTick();

function ticking() {
  let index = 0;
  const execute = () => {
    index = index + 1;
    for (let i = 1; i <= movingTicksNum; i++) {
      i === movingTicksNum && console.log((index + i) % ticksNum);
      movingTicks[i - 1].rotation.z =
        ((index + i) % ticksNum) *
        ((Math.PI * 2) / (clockConfig.ticksNum - 10));
    }
  };

  execute();
  setInterval(execute, 995);
}
ticking();

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
  controls.update();
});

/** WebXR */
const config = LookingGlassConfig;
// config.tileHeight = 512;
// config.numViews = 45;
config.targetY = 0;
config.targetZ = 0;
config.targetDiam = 10;
config.fovy = (40 * Math.PI) / 180;
new LookingGlassWebXRPolyfill();
document.body.appendChild(VRButton.createButton(renderer));

// 1bxK2EswnZeRbvR0Dm6RSizl4yW_4UQPmtAb8XhFqtTsyqCM4
