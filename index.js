import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, mixer, clips;

function loadModel() {
  let loader = new GLTFLoader();
  // const controls = new OrbitControls(camera, renderer.domElement);
  // then load the file and add it to your scene
  loader.load("./models/pusa.glb", function (gltf) {
    let model = gltf.scene;
    scene.add(model);
    model.position.set(0, -5, -12);
    model.scale.set(3, 3, 3);
  });

  loader.load("./models/jiaobeii.glb", function (gltf) {
    console.log("leading model");
    scene.add(gltf.scene);
    gltf.scene.position.set(-2, -8, -8);
    gltf.scene.scale.set(0.01, 0.01, 0.01);
    // gltf.scene.rotateY(-Math.PI / 2);

    // initialize mixer and play animation;
    mixer = new THREE.AnimationMixer(gltf.scene);
    clips = gltf.animations;

    const clipOneUp = THREE.AnimationClip.findByName(clips, "JiaoOneUp");
    const actionOneUp = mixer.clipAction(clipOneUp);
    actionOneUp.setLoop(THREE.LoopOnce);

    const clipOneDown = THREE.AnimationClip.findByName(clips, "JiaoOneDown");
    const actionOneDown = mixer.clipAction(clipOneDown);
    actionOneDown.setLoop(THREE.LoopOnce);

    const clipTwoUp = THREE.AnimationClip.findByName(clips, "JiaoTwoUp");
    const actionTwoUp = mixer.clipAction(clipTwoUp);
    actionTwoUp.setLoop(THREE.LoopOnce);

    const clipTwoDown = THREE.AnimationClip.findByName(clips, "JiaoTwoDown");
    const actionTwoDown = mixer.clipAction(clipTwoDown);
    actionTwoDown.setLoop(THREE.LoopOnce);

    let animationTrigger = document.getElementById("button_go");
    let tooltip = document.getElementById("tooltip");

    let decision;

    animationTrigger.addEventListener("click", () => {
      gltf.scene.scale.set(20, 20, 20);
      decision = Math.random();
      const buttonGo = document.getElementById("button_go");
      buttonGo.style.pointerEvents = "none";
      buttonGo.style.opacity = "0.5";
      // buttonGo.innerHTML = "She is thinking.";

      console.log(decision);
      if (decision < 0.33) {
        console.log(clipOneUp);
        actionOneDown.stop();
        actionOneDown.play();
        actionTwoUp.stop();
        actionTwoUp.play();
        setTimeout(() => {
          tooltip.style.display = "block";
          tooltip.innerHTML = "She says 'Yes'.";
        }, clipOneUp.duration * 1000 - 3000);

        setTimeout(() => {
          buttonGo.style.pointerEvents = "initial";
          buttonGo.style.opacity = "1";
          tooltip.style.display = "none";
          gltf.scene.scale.set(0.01, 0.01, 0.01);
        }, clipOneUp.duration * 1000);
      } else if (decision >= 0.33 && decision < 0.66) {
        console.log(actionOneDown);
        actionOneDown.stop();
        actionOneDown.play();
        actionTwoDown.stop();
        actionTwoDown.play();
        setTimeout(() => {
          tooltip.style.display = "block";
          tooltip.innerHTML = "She says 'No'.";
        }, clipOneUp.duration * 1000 - 3000);

        setTimeout(() => {
          buttonGo.style.pointerEvents = "initial";
          buttonGo.style.opacity = "1";
          tooltip.style.display = "none";
          gltf.scene.scale.set(0.01, 0.01, 0.01);
        }, clipOneUp.duration * 1000);
      } else {
        console.log(actionOneUp);
        actionOneUp.stop();
        actionOneUp.play();
        actionTwoUp.stop();
        actionTwoUp.play();
        setTimeout(() => {
          tooltip.style.display = "block";
          tooltip.innerHTML = "She is laughing.";
        }, clipOneUp.duration * 1000 - 3000);

        setTimeout(() => {
          buttonGo.style.pointerEvents = "initial";
          buttonGo.style.opacity = "1";
          tooltip.style.display = "none";
          gltf.scene.scale.set(0.01, 0.01, 0.01);
        }, clipOneUp.duration * 1000);
      }
    });
  });

  const geometry = new THREE.BoxGeometry(100, 100, 100);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  const plane = new THREE.PlaneGeometry(500, 500);
  plane.rotateX(-Math.PI / 2);
  // plane.position.set(0, 10, 0);

  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Set the color of the box
    emissive: 0x0f0000, // Set the emissive color to yellow
    emissiveIntensity: 1, // Set the emissive intensity
  });

  const cube = new THREE.Mesh(geometry, material);
  const floor = new THREE.Mesh(plane, material);
  floor.position.set(0, 0.001 - 8, 0);
  scene.add(cube);
  scene.add(floor);

  // add gridHelper
  // let gridHelper = new THREE.GridHelper(25, 25);
  // scene.add(gridHelper);
}

function light() {
  // add light
  const light = new THREE.AmbientLight("white", 1);
  light.position.set(0, -10, 0);
  scene.add(light);

  const directLight = new THREE.DirectionalLight(0xffffff, 3.5);
  // directLight.rotateY(-Math.PI / 2);
  directLight.rotateX(-Math.PI / 4);
  // directLight.rotateZ(-Math.PI / 2);
  directLight.castShadow = true;
  scene.add(directLight);

  const B = new THREE.DirectionalLight(0xffffff, 2);
  // B.rotateY((-3 * Math.PI) / 4);
  B.rotateX(-Math.PI / 4);
  B.position.set(0, -2, 0);
  // B.rotateZ(-Math.PI / 3);
  B.castShadow = true;
  scene.add(B);

  const helper = new THREE.DirectionalLightHelper(directLight, 5);
  const helperB = new THREE.DirectionalLightHelper(B, 5);
  // scene.add(helper);
  // scene.add(helperB);
}

let cameraPathPosition = 0;

function setupScrollAlongPathControls() {
  // setup a path composed of multiple points
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-50, 50, -50),
    new THREE.Vector3(10, 15, -10),
    new THREE.Vector3(10, 5, 10),
    new THREE.Vector3(0, 5, 10),
  ]);

  // create a simple line to visualize the path
  const points = cameraPath.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: "yellow" });
  const line = new THREE.Line(geometry, material);
  line.position.set(0, -0.1, 0); // offset the line a bit so it remains visible
  scene.add(line);

  camera.position.set(-50, 50, -50);
  camera.lookAt(0, 0, 0);

  // then add our 'wheel' event listener
  renderer.domElement.addEventListener("wheel", (e) => {
    cameraPathPosition += e.deltaY * 0.0001;
    // constrain this value between 0 and 1, because that is what the following function expects
    cameraPathPosition = Math.max(0, Math.min(1, cameraPathPosition));
    const newCameraPosition = cameraPath.getPointAt(cameraPathPosition);
    camera.position.set(
      newCameraPosition.x,
      newCameraPosition.y,
      newCameraPosition.z
    );

    // create the button here
    if (newCameraPosition.distanceTo(new THREE.Vector3(0, 5, 10)) < 3) {
      console.log("reach end");
      const btnEl = document.getElementById("button_go");
      btnEl.style.display = "block";
    } else {
      const btnEl = document.getElementById("button_go");
      btnEl.style.display = "none";
    }
    camera.lookAt(0, 0, 0);
  });
}

function init() {
  // create a scene in which all other objects will exist
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xd64c42);
  scene.fog = new THREE.Fog(scene.background, 1, 5000);

  // create a camera and position it in space
  let aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 500);
  camera.position.set(0, 2, 13);
  camera.lookAt(0, 0, 0);

  // the renderer will actually show the camera view within our <canvas>
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  light();
  // setupScrollAlongPathControls();
  loadModel();
  loop();
}

const clock = new THREE.Clock();

function loop() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
}

init();
