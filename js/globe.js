import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const container = document.querySelector("#globe");
if (container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 3.15;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.SphereGeometry(1, 72, 72);
      const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 12 });
      const earth = new THREE.Mesh(geometry, material);
      earth.rotation.y = -0.7;
      globeGroup.add(earth);
    },
    undefined,
    () => {
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x1764a0, wireframe: true })
      );
      globeGroup.add(earth);
    }
  );

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x4daeff, transparent: true, opacity: 0.09, side: THREE.BackSide })
  );
  globeGroup.add(atmosphere);

  scene.add(new THREE.AmbientLight(0xffffff, 1.45));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, 2, 5);
  scene.add(sun);

  let dragging = false;
  let previousX = 0;
  let previousY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;

  container.addEventListener("pointerdown", event => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    container.setPointerCapture(event.pointerId);
  });
  container.addEventListener("pointermove", event => {
    if (!dragging) return;
    targetRotationY += (event.clientX - previousX) * 0.006;
    targetRotationX += (event.clientY - previousY) * 0.004;
    previousX = event.clientX;
    previousY = event.clientY;
  });
  container.addEventListener("pointerup", () => dragging = false);
  container.addEventListener("pointercancel", () => dragging = false);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  new ResizeObserver(resize).observe(container);

  function animate() {
    requestAnimationFrame(animate);
    if (!dragging) targetRotationY += 0.0018;
    globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.035;
    globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.035;
    globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x, -0.7, 0.7);
    renderer.render(scene, camera);
  }
  animate();
}
