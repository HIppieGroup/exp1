import * as THREE from './three';

const createObj = (geometryType, geometryProps) => {
  const geometry = new THREE[geometryType](...geometryProps);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.35,
  });

  return new THREE.Mesh(geometry, material);
};

export default class MainObjects {
  constructor(context) {
    this.context = context;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      30,
      context.wWidth / context.wHeight,
      0.1,
      1000 // 400
    );
    this.camera.position.z = 10;
    this.renderTarget = new THREE.WebGLRenderTarget(
      context.wWidth,
      context.wHeight,
      {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        anisotropy: 0,
        depthBuffer: false,
      }
    );

    this.sphere = createObj('SphereGeometry', [1, 32, 32]);
    this.cube = createObj('BoxGeometry', [1.8, 1.8, 1.8]);

    this.sphere.position.x = -1;
    this.cube.position.x = 1.5;
    this.cube.position.z = -1.5;
    this.cube.rotation.set(0.8, 0.7, 0);

    // this.sphere.castShadow = true;
    // this.sphere.receiveShadow = true;

    // this.cube.castShadow = true;
    // this.cube.receiveShadow = true;

    this.scene.add(this.sphere);
    this.scene.add(this.cube);

    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.ambientLight.intensity = 1;

    const dirLight = new THREE.DirectionalLight(0xfefefe, 4);
    dirLight.position.set(-5, -1.4, 4);
    // dirLight.castShadow = true;

    const dirLight2 = new THREE.DirectionalLight(0xfefefe, 4);
    dirLight2.position.set(5, -1.4, 2);

    this.scene.add(this.ambientLight);
    this.scene.add(dirLight);

    this.render();
  }

  render = () => {
    this.context.renderer.render(this.scene, this.camera, this.renderTarget);
    // this.context.renderer.render(this.scene, this.camera);
    this.curTexture = this.renderTarget.texture;
  };
}
