import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import CoreApp from './CoreApp';






export default class AppGame extends CoreApp {
  constructor() {
    super();

    this.isLoaded = true;
    new OrbitControls(this.camera, this.renderer.domElement);
  }

  onUpdate = () => {
    if (this.isLoaded) {

    }
  };
}
