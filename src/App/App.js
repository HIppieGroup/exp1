import * as THREE from './three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import CoreApp from './CoreApp';
import MainObjects from './MainObjects';
import ParticlesGeometry from './ParticlesGeometry';

import particlesVs from './shaders/particlesVs.glsl';
import particlesFs from './shaders/particlesFs.glsl';

import particleTexture from 'assets/particle.jpg';
import textureInput from 'assets/img3.jpg';
import DoubleFBO from './DoubleFBO';

const TEXTURE_WIDTH = 512;

export default class AppGame extends CoreApp {
  constructor() {
    super();

    this.data = {
      // texture
      threshold: 0,
      smoothness: 1,
      strength: 0.32,

      // look & feel
      initialAttraction: 0,
      frictions: 0.0,
      resetStacked: false,
      stackSensibility: 0.8,

      // repulsion: false,
      // repulsionRadius: 3.0,
      // repulsionStrength: 0.0009,
      // repulsionSensibility: 0.80,

      velocityMax: 0.0013,
      mapStrength: 0.005,
      pointSize: 2,
      density: 1,
      alpha: 0.23,
      inverted: true,
      particlesColor: '#FFFFFF',
      bgColor: '#1e1e1e',
    };

    this.isLoaded = true;
    // new OrbitControls(this.camera, this.renderer.domElement);
    this.mainObjects = new MainObjects(this);

    this.renderer.sortObjects = false;

    this.createParticles();
    this._resetRenderTarget();
  }

  createParticles = () => {
    const geometry = new ParticlesGeometry(TEXTURE_WIDTH);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexturePosition: {
          type: 't',
          value: null,
        },
        uPointSize: { type: 'f', value: 2 },
        uDensity: { type: 'f', value: 1 },
        uAlpha: { type: 'f', value: 0.23 },
        uColor: { type: 'c', value: new THREE.Color('#FFFFFF') },
      },
      vertexShader: particlesVs,
      fragmentShader: particlesFs,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });

    this.meshPoints = new THREE.Points(geometry, material);
    this.sceneRender.add(this.meshPoints);

    this._copyMaterial = new THREE.MeshBasicMaterial({
      map: null,
      depthTest: false,
      depthWrite: false,
    });

    this._copyMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      this._copyMaterial
    );

    this.scene.add(this._copyMesh);

    console.log(this.mainObjects.curTexture);
    this._doubleFBO = new DoubleFBO(
      TEXTURE_WIDTH,
      this.renderer,
      this.mainObjects.curTexture
      // this._textureInput
    );
  };

  onUpdate = () => {
    if (this.isLoaded) {
      if (this._doubleFBO) {
        this.mainObjects.render();
        this._doubleFBO.render();

        //

        this.meshPoints.material.uniforms.uTexturePosition.value =
          this._doubleFBO.currentTexture;

        this.renderer.render(this.sceneRender, this.camera, this._rtOutput);
        this.renderer.render(this.scene, this.camera);
      }
    }
  };

  _resetRenderTarget() {
    if (this._rtOutput) this._rtOutput.dispose();
    this._rtOutput = new THREE.WebGLRenderTarget(this.wWidth, this.wHeight, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      anisotropy: 0,
      depthBuffer: false,
    });

    this._rtOutput.texture.generateMipmaps = false;
    this._copyMaterial.map = this._rtOutput.texture;

    this._doubleFBO.positionShader.uniforms.uTextureOutput.value =
      this._rtOutput.texture;
  }
}
