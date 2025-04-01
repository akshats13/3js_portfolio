import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
camera.position.setX(-10);

// Add loader handling
const loaderElement = document.getElementById('loader');
const mainContent = document.querySelector('main');
mainContent.style.visibility = 'hidden'; // Hide main content initially

// Once everything is loaded (or after a short delay)
window.addEventListener('load', () => {
  // Hide loader
  if (loaderElement) {
    loaderElement.classList.add('hidden');
  }
  // Show main content
  mainContent.style.visibility = 'visible';

  // Trigger initial animations for sections
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.slide-in').forEach(section => {
    observer.observe(section);
  });
});

renderer.render(scene, camera);

// Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x7a4988 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

// Background

const spaceTexture = new THREE.TextureLoader().load("space.jpg");
scene.background = spaceTexture;

// Avatar

const akshTexture = new THREE.TextureLoader().load("aksh.jpg");

const aksh = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: akshTexture })
);

scene.add(aksh);

// Moon

const moonTexture = new THREE.TextureLoader().load("moon.jpg");
const normalTexture = new THREE.TextureLoader().load("normal.jpg");

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 20;
moon.position.setX(-10);
moon.position.setY(0);

aksh.position.z = -5;
aksh.position.x = 2;

//EARTH

const earthTexture = new THREE.TextureLoader().load("earth.jpeg");
const normallTexture = new THREE.TextureLoader().load("normal.jpg");

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
    normalMap: normallTexture,
  })
);

scene.add(earth);

earth.position.z = 25;
earth.position.setX(-15);
earth.position.setY(0);

//SUN

const sunTexture = new THREE.TextureLoader().load("sun.png");

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(8, 32, 32),
  new THREE.MeshBasicMaterial({
    map: sunTexture,
  })
);

scene.add(sun);

sun.position.z = -20;
sun.position.setX(-35);
sun.position.y = 15;

const sunLight = new THREE.PointLight(0xffffff, 2, 100);
sunLight.position.copy(sun.position);
scene.add(sunLight);

aksh.position.z = -5;
aksh.position.x = 2;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  earth.rotation.x += 0.03;
  earth.rotation.y += 0.06;
  earth.rotation.z += 0.05;

  sun.rotation.x += 0.03;
  sun.rotation.y += 0.06;
  sun.rotation.z += 0.05;

  aksh.rotation.y += 0.01;
  aksh.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  // Smooth rotation for torus
  torus.rotation.x += 0.005;
  torus.rotation.y += 0.0075;
  torus.rotation.z += 0.005;

  // Earth rotation and gentle floating motion
  earth.rotation.y += 0.003;
  earth.position.y = 0 + Math.sin(Date.now() * 0.001) * 0.5;

  // Moon orbit around earth
  const time = Date.now() * 0.001;
  moon.position.x = Math.cos(time * 0.5) * 15 - 15;
  moon.position.z = Math.sin(time * 0.5) * 15 + 25;
  moon.rotation.y += 0.005;

  // Sun pulsing effect
  const scale = 1 + Math.sin(time) * 0.05;
  sun.scale.set(scale, scale, scale);
  sun.rotation.y += 0.002;
  
  // Update sun light intensity
  sunLight.intensity = 2 + Math.sin(time) * 0.5;

  // Add some stars twinkling
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isStar) {
      object.material.opacity = 0.5 + Math.sin(time + object.userData.randomOffset) * 0.5;
    }
  });

  renderer.render(scene, camera);
}

// Add twinkling stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.15, 12, 12);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  star.userData.isStar = true;
  star.userData.randomOffset = Math.random() * Math.PI * 2;
  scene.add(star);
}

Array(200).fill().forEach(addStar);

animate();
