import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  LookingGlassWebXRPolyfill,
  LookingGlassConfig,
} from '@lookingglass/webxr';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { clockConfig, starsConfig } from './config';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import gsap from 'gsap';
import GUI from 'lil-gui';

/**
 * Debug
 */
const gui = new GUI({ title: 'SITE Clock Controls' });
gui.close();
/**
 * BEGIN SCAFOLDING
 */

const canvas = document.getElementById('canvas');

canvas.addEventListener('dblclick', () => {
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

const {
  ticksNum,
  tickDimension,
  movingTicksNum,
  tickColor,
  tickColorsGradient,
} = clockConfig;
const { dimension, colors } = starsConfig;

/** Plane **/
const planeMaterial = new Three.MeshStandardMaterial({ color: 0x111111 });
planeMaterial.roughness = 0.6;
planeMaterial.metalness = 0.2;
planeMaterial.side = Three.DoubleSide;
const plane = new Three.Mesh(
  new Three.PlaneGeometry(dimension.w, dimension.h),
  planeMaterial
);
plane.position.z = -0.5;
scene.add(plane);

gui
  .addColor(planeMaterial, 'color')
  .onChange(() => {
    material.color.set(planeMaterial.color);
  })
  .name('Wall color');

/** Ticks */
const tickMaterial = new Three.MeshStandardMaterial({
  color: clockConfig.tickColor,
});
tickMaterial.roughness = 0;
tickMaterial.metalness = 0.5;

const tickGeometry = new Three.BoxGeometry(
  tickDimension.x,
  tickDimension.y,
  tickDimension.z
);
tickGeometry.translate(0, 2.8, 0);

const staticTicks = [];
const generateTicks = () => {
  for (let i = 0; i < ticksNum; i++) {
    const tick = new Three.Mesh(tickGeometry, tickMaterial);
    tick.rotation.z = i * ((Math.PI * 2) / clockConfig.ticksNum);
    scene.add(tick);
    staticTicks.push(tick);
  }
};
generateTicks();

const staticTicksConfig = gui.addFolder('Static Ticks');

staticTicksConfig
  .add(clockConfig, 'ticksNum')
  .min(clockConfig.movingTicksNum)
  .max(40)
  .step(1)
  .onFinishChange(() => {
    staticTicks.forEach((tick) => scene.remove(tick));
    generateTicks();
  })
  .name('Ticks number');

staticTicksConfig
  .addColor(tickMaterial, 'color')
  .onChange(() => {
    material.color.set(tickMaterial.color);
  })
  .name('Ticks color');

const movingTickColors = gui.addFolder('Moving Ticks');
const movingTicks = [];

for (let i = 1; i <= movingTicksNum; i++) {
  const movingTickMaterial = new Three.MeshStandardMaterial({
    color: tickColorsGradient[i - 1],
  });
  movingTickMaterial.roughness = 0;
  movingTickMaterial.metalness = 0.5;
  const z = tickDimension.z + i * 0.15;
  const tickGeometry = new Three.BoxGeometry(
    tickDimension.x,
    tickDimension.y,
    z
  );
  tickGeometry.translate(0, 2.8, z / 2 - tickDimension.z / 2);

  const tick = new Three.Mesh(tickGeometry, movingTickMaterial);
  tick.material.depthTest = false;
  tick.renderOrder = 10;
  scene.add(tick);
  movingTicks.push(tick);
  movingTickColors
    .addColor(movingTickMaterial, 'color')
    .onChange(() => movingTickMaterial.color.set(movingTickMaterial.color))
    .name(`Tick #${i}`);
}

/** Text */
const fontConfig = gui.addFolder('Title');
const fontLoader = new FontLoader();

fontLoader.load('/helvetiker_bold.typeface.json', (font) => {
  const textConfig = {
    font: font,
    size: 1,
    depth: 0.9,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 2,
  };
  let textGeometry = new TextGeometry(clockConfig.text, textConfig);
  textGeometry.center();
  let text = new Three.Mesh(textGeometry, tickMaterial);

  const onConfigChange = () => {
    textGeometry.dispose();
    scene.remove(text);
    textGeometry = new TextGeometry(clockConfig.text, textConfig);
    textGeometry.center();
    text = new Three.Mesh(textGeometry, tickMaterial);
    text.position.z = 0.3;
    scene.add(text);
  };

  fontConfig.add(clockConfig, 'text').onChange(() => {
    onConfigChange();
  });

  fontConfig
    .add(textConfig, 'size')
    .onChange(() => {
      onConfigChange();
    })
    .min(0.2)
    .max(3)
    .step(0.1);

  text.position.z = 0.3;
  scene.add(text);
});

/** ambient light */
const ambientLight = new Three.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// Directional light
const aboveLight = new Three.DirectionalLight(0x00fffc, 0.9);
scene.add(aboveLight);

// Directional light
const downLight = new Three.DirectionalLight(0x00fffc, 0.9);
downLight.position.set(0, -1, 0);
scene.add(downLight);

/** blue lights */
const blueMaterial = new Three.MeshBasicMaterial({
  color: colors[1][1],
});
const blueGeometery = new Three.BoxGeometry(0.1, 0.17, 0.11);

const farPointLight = new Three.PointLight(colors[1][0], 10);
farPointLight.position.set(1, 1.3, 0);

scene.add(farPointLight);
const farLight = new Three.Mesh(blueGeometery, blueMaterial);
farLight.position.set(1, 1.3, 0);

const middlePointLight = new Three.PointLight(colors[1][0], 10);
middlePointLight.position.set(-1.8, 0.4, 0.3);
scene.add(middlePointLight);
const middleLight = new Three.Mesh(blueGeometery, blueMaterial);
middleLight.position.set(-1.8, 0.4, 0.3);

const closePointLight = new Three.PointLight(colors[1][0], 10);
closePointLight.position.set(0.6, -3, 0.5);
scene.add(closePointLight);
const closeLight = new Three.Mesh(blueGeometery, blueMaterial);
closeLight.position.set(0.6, -3, 0.5);

scene.add(farLight);
scene.add(middleLight);
scene.add(closeLight);

/**
 * Auto Light generator
 */

const { timeout, sizes: startSizes, parameters, numPerRound } = starsConfig;
const materials = [];
const geometries = [];
for (let i = 0; i < colors.length; i++) {
  materials.push(new Three.MeshBasicMaterial({ color: colors[i][1] }));
}

for (let i = 0; i < startSizes.length; i++) {
  geometries.push(new Three.BoxGeometry(...startSizes[i].size));
}

const generateStart = () => {
  const colorIndex = Math.floor(Math.random() * colors.length);
  const color = colors[colorIndex];
  const sizeIndex = Math.floor(Math.random() * startSizes.length);
  const size = startSizes[sizeIndex];
  const x =
    Math.random() * (parameters.x[1] - parameters.x[0]) + parameters.x[0];
  const y =
    Math.random() * (parameters.y[1] - parameters.y[0]) + parameters.y[0];
  const z =
    Math.random() * (parameters.z[1] - parameters.z[0]) + parameters.z[0];

  const movePointLight = new Three.PointLight(color[0], size.brightness);
  const moveLight = new Three.Mesh(
    geometries[sizeIndex],
    materials[colorIndex]
  );

  movePointLight.position.set(x, y, z);
  moveLight.position.set(x, y, z);
  scene.add(movePointLight);
  scene.add(moveLight);
  const delay = Math.random() * 1.5;
  const animationConfig = {
    duration: 6,
    delay,
    z: 2,
    x: x > 0 ? x - 1.3 : x + 1.3,
    y: y > 0 ? y - 1.3 : y + 1.3,
    ease: 'power2.in',
  };
  gsap.to(movePointLight.position, {
    ...animationConfig,
    onComplete: () => scene.remove(movePointLight),
  });
  gsap.to(moveLight.position, {
    ...animationConfig,
    onComplete: () => scene.remove(moveLight),
  });
};

let intervalId;

starsConfig.generateStart = generateStart;
const starsGuiConfig = gui.addFolder('Stars');
starsGuiConfig
  .add(starsConfig, 'enabled')
  .onChange((val) => {
    if (!val) {
      intervalId && clearInterval(intervalId);
    } else {
      executeInterval();
    }
  })
  .name('Auto Generation');

starsGuiConfig
  .add(starsConfig, 'timeout')
  .min(100)
  .max(10000)
  .step(100)
  .onFinishChange(() => {
    intervalId && clearInterval(intervalId);
    executeInterval();
  })
  .name('Interval ms');

starsGuiConfig
  .add(starsConfig, 'numPerRound')
  .min(1)
  .max(15)
  .step(1)
  .onFinishChange(() => {
    intervalId && clearInterval(intervalId);
    executeInterval();
  })
  .name('Stars per interval');

const executeInterval = () => {
  for (let i = 0; i < starsConfig.numPerRound; i++) {
    generateStart();
  }
  intervalId = setInterval(() => {
    for (let i = 0; i < starsConfig.numPerRound; i++) {
      generateStart();
    }
  }, starsConfig.timeout);
};
executeInterval();

starsGuiConfig.add(starsConfig, 'generateStart').name('Generate a Star');

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
  controls.update();
});

function ticking() {
  let index = 0;
  const execute = () => {
    for (let i = 0; i < movingTicksNum; i++) {
      movingTicks[i].rotation.z =
        (index + i) * ((Math.PI * 2) / clockConfig.ticksNum);
    }
    index = index + 1;
  };

  execute();
  setInterval(execute, 995);
}
ticking();

/** WebXR */
const config = LookingGlassConfig;
// config.tileHeight = 512;
// config.numViews = 45;
config.targetY = 0;
config.targetZ = 0;
config.targetDiam = 10;
config.fovy = (40 * Math.PI) / 180;
config.depthiness = 1.61;
new LookingGlassWebXRPolyfill();
document.body.appendChild(VRButton.createButton(renderer));
