/* eslint-disable */
import App from './App';

class ThreeJsScene {
  constructor(idContainer) {
    this.rootNode = document.querySelector(idContainer);
    const threeApp = new App();

    this.rootNode.appendChild(threeApp.renderer.domElement);
    // threeApp.renderer.domElement.style.position = 'absolute';
    // threeApp.renderer.domElement.style.top = '0';
    // threeApp.renderer.domElement.style.left = '0';
    // threeApp.renderer.domElement.style.width = '100%';
    // threeApp.renderer.domElement.style.height = '100vh';
  }
}

// '#scene-scroll'

window.ThreeJsScene = ThreeJsScene;
