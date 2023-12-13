import * as THREE from './three';

import copyVs from './shaders/copyVs.glsl';
import copyFs from './shaders/copyFs.glsl';
import positionFs from './shaders/positionFs.glsl';

const _getInitPositionsTexture = (particlesCount, { width, height }) => {
  const entries = 4;
  const a = new Float32Array(particlesCount * entries);

  for (let i = 0, l = a.length; i < l; i += entries) {
    const x = (Math.random() * width) / width;
    const y = (Math.random() * height) / height;

    const ratio = 0.001;
    const vx = (Math.random() - 0.5) * ratio;
    const vy = (Math.random() - 0.5) * ratio;

    a[i + 0] = x;
    a[i + 1] = y;
    a[i + 2] = vx;
    a[i + 3] = vy;
  }

  const texture = new THREE.DataTexture(
    a,
    Math.sqrt(particlesCount),
    Math.sqrt(particlesCount),
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  texture.flipY = false;

  return texture;
};

const getRenderTarget = (type, width, height) => {
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    // wrapS: THREE.ClampToEdgeWrapping,
    // wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: type,
    type: THREE.FloatType,
    stencilBuffer: false,
    depthBuffer: false,
  });
  renderTarget.texture.generateMipmaps = false;

  return renderTarget;
};

export default class DoubleFBO {
  constructor(width, renderer, textureInput) {
    this._width = width; // particle count side
    this._particles = width * width; // all particles count
    this._renderer = renderer;

    this._scene = new THREE.Scene();
    this._camera = new THREE.Camera();
    this._camera.position.z = 1;
    this._textureInput = textureInput;

    console.log(textureInput.image);

    this._pingPong = true;

    this.init();
  }

  init = () => {
    // короче это только для проверки потери коонтекста
    const gl = this._renderer.getContext();

    // //TODO better errors management
    // if (!gl.getExtension('OES_texture_float')) {
    //   alert('No OES_texture_float support for float textures!');
    //   return;
    // }
    // if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
    //   alert('No support for vertex shader textures!');
    //   return;
    // }
    // // короче это только для проверки потери коонтекста

    // Create position textures
    this._dtPosition = _getInitPositionsTexture(this._particles, {
      width: 1000,
      height: 1000,
    });

    // невидемый буфер для рисования
    this._rtPosition1 = getRenderTarget(
      THREE.RGBAFormat,
      this._width,
      this._width
    );

    // клон буфер для рисования
    this._rtPosition2 = this._rtPosition1.clone();

    // по сути дефолтный шейдер для прямой отрисовки текстуры
    this._copyShader = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { type: 't', value: null },
      },
      vertexShader: copyVs,
      fragmentShader: copyFs,
      depthTest: false,
    });

    this.positionShader = new THREE.ShaderMaterial({
      uniforms: {
        uResolutionInput: {
          type: 'v2',
          value: new THREE.Vector2(1000, 1000),
        },
        uResolutionOutput: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },

        uTexturePosition: { type: 't', value: null },
        uTexturePositionInit: { type: 't', value: this._dtPosition }, // дефолтное положение частиц
        uTextureInput: { type: 't', value: this._textureInput }, // оригинальная картинка
        uTextureOutput: { type: 't', value: null },

        uStrength: { type: 'f', value: null },
        uFrictions: { type: 'f', value: null },
        uSpring: { type: 'f', value: null },
        uVelocityMax: { type: 'f', value: null },
        uAttraction: { type: 'f', value: null },
        uResetStacked: { type: 'i', value: null },
        uStackSensibility: { type: 'f', value: null },
        uRepulsion: { type: 'i', value: null },
        uRepulsionStrength: { type: 'f', value: null },
        uRepulsionSensibility: { type: 'f', value: null },
        uInvert: { type: 'i', value: null },

        uMapStrength: { type: 'f', value: 0.1 },
      },
      vertexShader: copyVs, // дефолтный вертекс
      fragmentShader: positionFs, // самый главный шейдер
      depthTest: false,
    });

    // пустой дефолтный прямоугольник
    this._mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      this._copyShader
    );
    this._scene.add(this._mesh);

    this._renderTexture(
      this._dtPosition, // изначально созданая текстура рандомных точек
      this._rtPosition1 // невидемый буфер для рисования
    );
  };

  _renderTexture(input, output) {
    this._mesh.material = this._copyShader; // устанавливаем зачем то в материал пустой шейдер он там изначально установлен
    this._copyShader.uniforms.uTexture.value = input; // в качестве текстуры прокидываем изначально созданая текстура рандомных точек
    this._renderer.render(this._scene, this._camera, output); // рендерим в созданый буфер
  }

  _renderShader(input, output) {
    this._mesh.material = this.positionShader; // основной шедер устанавливает в пустой меш

    this.positionShader.uniforms.uTexturePosition.value = input.texture; // скрытый буфер гре отрендорили точки
    this.currentTexture = input.texture; // скрытый буфер гре отрендорили точки

    this._renderer.render(this._scene, this._camera, output); // рендерим в созданый буфер
  }

  render() {
    if (this._pingPong) {
      this._renderShader(this._rtPosition1, this._rtPosition2);
    } else {
      this._renderShader(this._rtPosition2, this._rtPosition1);
    }

    this._pingPong = !this._pingPong;
  }
}
