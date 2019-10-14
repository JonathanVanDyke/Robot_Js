
// const Hud = (player) => {
//   // We will use 2D canvas element to render our HUD.  
//   var hudCanvas = document.createElement('canvas');
//   hudCanvas.id = 'hud'
//   hudCanvas.style.position = 'absolute';
//   document.body.appendChild(hudCanvas);
//   // Again, set dimensions to fit the screen.
//   hudCanvas.width = 300;
//   hudCanvas.height = 300;
//   // console.log(player.points)
//   // player = player || {points: 0}
//   // Get 2D context and draw something supercool.
//   var hudBitmap = hudCanvas.getContext('2d');
//   hudBitmap.font = "Normal 40px Arial";
//   hudBitmap.textAlign = 'center';
//   hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
//   // hudBitmap.fillText(`Initializing...${player ? player.points : 0}` , 300 / 2, 300 / 2);

//   // Create the camera and set the viewport to match the screen dimensions.
//   cameraHUD = new THREE.Camera(-300 / 2, 300 / 2, 300 / 2, -300 / 2, 0, 30);

//   // Create also a custom scene for HUD.
//   sceneHUD = new THREE.Scene();

//   // Create texture from rendered graphics.
//   var hudTexture = new THREE.Texture(hudCanvas)
//   hudTexture.needsUpdate = true;

//   // Create HUD material.
//   var material = new THREE.MeshBasicMaterial({ map: hudTexture });
//   material.transparent = true;

//   // Create plane to render the HUD. This plane fill the whole screen.
//   var planeGeometry = new THREE.PlaneGeometry(300, 300);
//   var plane = new THREE.Mesh(planeGeometry, material);
//   sceneHUD.add(plane);
// }

// Hud()