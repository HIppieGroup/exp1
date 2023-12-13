import { gsap } from 'gsap';
import * as THREE from './three';

export default class CoreApp {
  constructor() {
    this.wWidth = 0;
    this.wHeight = 0;
    this.camera = null;
    this.scene = null;
    this.renderer = null;

    this.__onCalcSize();
    this.__onCreateApp();
    this.__addEvents();

    gsap.ticker.add(this.__onUpdate);
  }

  __onCreateApp = () => {
    this.scene = new THREE.Scene();
    this.sceneRender = new THREE.Scene();
    this.camera = new THREE.Camera();

    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setClearColor(0x202020);
    this.renderer.sortObjects = false;
    this.renderer.setSize(this.wWidth, this.wHeight);

    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  };

  onUpdate = () => {};

  onResize = () => {};

  onDestroy = () => {};

  __onUpdate = () => {
    this.onUpdate();
    // this.renderer.render(this.scene, this.camera);
  };

  __onCalcSize = () => {
    this.wWidth = window.innerWidth;
    this.wHeight = window.innerHeight;
  };

  __onResize = () => {
    this.__onCalcSize();

    this.camera.aspect = this.wWidth / this.wHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.wWidth, this.wHeight);

    this.onResize();
  };

  __addEvents = () => {
    window.addEventListener('resize', this.__onResize);
  };

  destroy = () => {
    this.onDestroy();

    gsap.ticker.remove(this.__onUpdate);
    window.removeEventListener('resize', this.__onResize);
  };
}
