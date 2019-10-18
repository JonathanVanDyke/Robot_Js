let camera, sceneHUD, cameraHUD, rotateAngle, renderer, scene, player, bullets, bulletsBlock, input, environment, _vector, clock, lastTimeStamp;
let player2 = { id: null, x: 0, y: 0, z: 0, ph: 0 };
let serverPackage = [];
let player2Data = {id: null, x: 0, y: 0, z: 0, ph: 0};
let bulletCount = 0;
let j = 0;
let radar;
let p1radar;
p1radar = {position: {x: 0, y: 0, z: 0}};
let p2radar;
p2radar = {position: {x: 0, y: 0, z: 0}};
let hpBar, hpTxt = { position: { x: 0, y: 0, z: 0 } };;
let hpBar2, hp2Txt = { position: { x: 0, y: 0, z: 0 } };;

let RELOAD = 1000; 

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(stats.dom);

function reset() {

  setTimeout(() => {
    player.hp = 20;
    player2.hp = 20;
    let pointEle = document.getElementById('points')
    player.points2 += 1;
    pointEle.innerHTML = `Score: ${player.points2}`
    // player.position.set(0, 20, 0);
    // player2.position.set(0, 20, 0);
    // location.reload()
    // animate().reset();
  }, 0);
  // animate();
  // requestAnimationFrame(animate);
}

function init() {
  //Crosshair
  crosshair = document.createElement('h1');
  crosshair.id = 'cross'
  crosshair.style.cssText = `
  position: absolute;
  left: 49.75%;
  font-size: 10px;
  font-family: fantasy;
  top: 40%;
  `;
  document.body.appendChild(crosshair);
  crosshair.innerHTML = 'X'
  

  // 201 
  Physijs.scripts.worker = './lib/physijs_worker.js';
  Physijs.scripts.ammo = './lib/ammo.js';

  // 02
  //RENDERER INPUT, SCENE (virtual environment)/CAMERA 
  // let scene = new THREE.Scene();
  scene = new Physijs.Scene;

  // let scene = new Physijs.Scene({ reportsize: 50, fixedTimeStep: 1 / 20 }); //Slow down scene to fix rotation bug
  scene.setGravity(new THREE.Vector3(0, -15, 0));
  {
    const color = 'black';  // white
    const near = 90;
    const far = 300;
    scene.fog = new THREE.Fog(color, near, far);
  }
  scene.background = new THREE.Color('skyblue');

  createCamera();
  createLights();
  createMeshes();
  createRenderer();


  //202
  //Bullets
  bullets = new Bullets();
  // let bulletsBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  // let bulletsBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
  // bulletsBlock = new Physijs.BoxMesh(bulletsBlockGeometry, bulletsBlockMaterial); //MESH POINTS MAT TO GEOMETRY

  // 101
  //INPUT OBJECT
  input = new Input();

  // 001
  // Environment
  environment = new Environment();



  // 05
  //MAKE WINDOW RESPONSIVE ON RESIZE
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
  })

  // 06
  //RAYCASTER => VECTOR 'RAY'... RAY === Array? (like vector array?)
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();


  // 09
  //RENDER LOOP
  // 102
  //Normalize animation loop
  lastTimeStamp = 0;

  clock = new THREE.Clock();
  _vector = new THREE.Vector3(0, 0, 0)


  // debugger
  socket.emit('init', {
    id: socket.id,
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
    h: player.rotation.y,
    pb: player.rotation.y
  });


}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    300
  );
  // debugger

  camera.position.set(0, 6, 10);
  camera.rotation.x = -.2
}

function createLights() {
  // 08
  //LIGHT ONE
  let light1 = new THREE.DirectionalLight(0xFFFFFF, 2);
  light1.position.set(0, 20, 25)
  scene.add(light1)

  //LIGHT TWO
  let light2 = new THREE.AmbientLight(0xaaaaaa, 1);
  light2.position.set(0, 0, 25)
  scene.add(light2)

  
  // const ambientLight = new THREE.HemisphereLight(
  //   0xddeeff,
  //   0x202020,
  //   .5,
  // );
  // scene.add(ambientLight)

}

function createMeshes() {
  // 07
  //ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)
  let playerGeometry = new THREE.BoxBufferGeometry(5, 8, 5, 0); //PRIMITIVE SHAPE AND SIZE (set 3rd val to 111 for cat paw)
  let playerMaterial = new THREE.MeshLambertMaterial({
    color: 0x22CAC2,
    opacity: 0.0,
    visible: false,
  }); //COLOR OF MESH
  //ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)

  // let player = new THREE.Mesh(playerGeometry, playerMaterial); //MESH POINTS MAT TO GEOMETRY
  player = new Physijs.BoxMesh(playerGeometry, playerMaterial); //MESH POINTS MAT TO GEOMETRY
  player.position.set(0, 1, 0);
  player.name = 'player';
  player.hp = 20;
  player.add(camera)
  player.points2 = 0;
  
  let player2Geometry = new THREE.CubeGeometry(5, 8, 5, 0);
  let player2Material = new THREE.MeshLambertMaterial({
    color: 0x22CAC2,
    opacity: 0.0,
  })

  player2 = new Physijs.BoxMesh(playerGeometry, playerMaterial);

  player2.hp = 20;
}

function createRenderer() {
  // 03
  //INSTANCE OF RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // renderer.gammaFactorw

  renderer.physicallyCorrectLights = true;
  // renderer.setClearColor("#e5e5e5"); //BACKGROUND COLOR
  
  //HUD
  hud = document.getElementById('hud');
  hud.style.cssText = `
    display: flex;
  `;

  

  //SCORE
  pointTally = document.createElement('h1');
  pointTally.id = 'points'
  pointTally.style.cssText = `
    position: absolute;
    bottom: 0;
    text-transform: uppercase;
    font-size: 20px;
    // margin-left: 20px;
    margin: 0 auto;
  `; 
  document.body.appendChild(pointTally);
  pointTally.innerHTML = 'Score: 0'

  //INSTRUCTIONS
  pointTally = document.createElement('h1');
  pointTally.id = 'instructions'
  pointTally.style.cssText = `
    position: absolute;
    bottom: 0px;
    font-family: monospace;
    right: 0px;
    text-transform: uppercase;
    font-size: 18px;
    /* margin: 0px auto; */
    margin: 10px;
  `; 
  document.body.appendChild(pointTally);
  pointTally.innerHTML = 'W/A/S/D: Move <br /> Q/E: Rotate <br /> J: Fire <br /> SPACE: Fly <br /> K: Descend'

  //P2 HP
  opponentHP = document.createElement('h1');
  opponentHP.id = 'opponent'
  opponentHP.style.position = 'absolute';
  opponentHP.style.marginTop = '70';
  opponentHP.style.cssText = `
    margin: 75px 20px 20px;
    position: absolute;
    transform: skewY(-9deg);
  `
  // document.body.appendChild(opponentHP);
  // hud.appendChild(opponentHP);
  opponentHP.innerHTML = `Opponent HP: ${player2.hp}`;

  //P1 HP
  playerHP = document.createElement('h1');
  playerHP.id = 'player'
  playerHP.style.position = 'absolute';
  playerHP.style.marginTop = '45';
  playerHP.style.cssText = `
    margin: 20px;
    position: absolute;
    transform: skewY(-9deg);
  `
  // hud.appendChild(playerHP);
  if (player.hp) {
    playerHP.innerHTML = `HP: ${player.hp}`;
  } else {
    playerHP.innerHTML = `HP: 20`;
  }

  // //P1 HP BAR
  // p1hpBar = document.createElement('div');
  // p1hpBar.id = 'p1hpbar';
  // p1hpBar.style.cssText = `
  //   margin: 55px 20px 45px;
  //   opacity: 0.75;
  //   height: 9px;
  //   border: 2px solid black;
  //   width: ${player.hp * 10}px;
  //   position: absolute;
  //   background-color: green;
  //   transform: skewY(-9deg);
  // `;

  // hud.appendChild(p1hpBar);


  //p2 HP BAR
  // p2hpBar = document.createElement('div');
  // p2hpBar.id = 'p2hpbar';
  // p2hpBar.style.cssText = `
  //   margin: 121px 20px 45px;
  //   opacity: 0.75;
  //   height: 9px;
  //   border: 2px solid black;
  //   width: ${player2.hp * 10}px;
  //   position: absolute;
  //   background-color: red;
  //   transform: skewY(-9deg);
  // `;
  // hud.appendChild(p2hpBar);

  // //Time...?
  // timeTally = document.createElement('h1');
  // timeTally.id = 'time'
  // timeTally.style.position = 'absolute';
  // timeTally.style.marginTop = '100';
  // document.body.appendChild(timeTally);
  // timeTally.innerHTML = 'Time: 0'

  //Winner text...
  winnerUI = document.createElement('h1');
  winnerUI.id = 'winner'
  winnerUI.style.position = 'absolute';
  winnerUI.style.marginTop = '130';
  // document.body.appendChild(winnerUI);
  winnerUI.style.cssText = `
    transform: skewY(-9deg);
    margin: 161px 20px;
    position: absolute;
  `
  winnerUI.innerHTML = 'FIGHT!'


  document.body.appendChild(renderer.domElement);
}




let animate = function (timeStamp) {
  // let p1bar = document.getElementById('p1hpbar')
  // p1bar.style.width = `${player.hp * 10}px`
  // let p2bar = document.getElementById('p2hpbar')
  // p2bar.style.width = `${player2.hp * 10}px`
  stats.begin();

  
  player.setAngularFactor(_vector);
  player.setAngularVelocity(_vector);
  // player.setLinearVelocity(new THREE.Vector3(0, 0, 0));

  let delta = clock.getDelta(); // seconds
  // console.log(clock.getElapsedTime())
  let moveDistance = 200 * delta; // 200 pixels per second
  rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 deg) per sec

  let time = document.getElementById('time')
  // time.innerHTML = `Time: ${Math.floor(clock.elapsedTime * 100)}`
  // let socketData = 'nope';
  // time.innerHTML = `Time: ${socketData}`

  let start = requestAnimationFrame(animate);

  //!Comment in for time challenge!!!
  // if (Math.floor(clock.elapsedTime * 100) >= RELOAD) {
  //   let pointEle = document.getElementById('points')
  //   // pointEle.className= 'finalpoint';
  //   pointEle.style = 'color: red; position: absolute; top: 20%; left: 40%; padding: 10px; border: 5px solid black;';
  //   pointEle.innerHTML = `Final Score: ${player.points}`
  //   // pointEle.style = `align: center;`
  //   cancelAnimationFrame(start);
  //   reset(animate);
  // }

  let timeDelta = (timeStamp - lastTimeStamp)/1000;
  lastTimeStamp = timeStamp;

  let movementSpeed = 12 * timeDelta;


  //BOOST
  let boost = 1;
  if (input.isShiftPressed) {
    boost = 10 * movementSpeed;
    // boost = 1
  }

  let playerSpeed = movementSpeed * boost * 2;
  
  //LEFT
  if (input.isLeftPressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    player.setLinearVelocity(_vector);
    player.translateOnAxis(new THREE.Vector3(playerSpeed * 100, 0, 0), -rotateAngle)

    // player.position.x -= Math.sin(player.rotation.y + Math.PI / 2) * playerSpeed;
    // player.position.z -= Math.cos(player.rotation.y + Math.PI / 2) * playerSpeed;
  }
  //RIGHT
  if (input.isRightPressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    player.setLinearVelocity(_vector);
    player.translateOnAxis(new THREE.Vector3(-playerSpeed * 100, 0, 0), -rotateAngle)

    // player.position.x += Math.sin(player.rotation.y + Math.PI / 2) * playerSpeed;
    // player.position.z += Math.cos(player.rotation.y + Math.PI / 2) * playerSpeed;
  }
  //JUMP  
  if (input.isSpacePressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    player.setLinearVelocity(_vector);
    player.setAngularFactor(_vector);
    player.setAngularVelocity(_vector);
    player.translateOnAxis(new THREE.Vector3(0, -movementSpeed * 100, 0), -rotateAngle)
    // player.position.y += playerSpeed*2;
  }

  if(input.isXPressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    if (player.position.y > 4.5) {
      player.translateOnAxis(new THREE.Vector3(0, movementSpeed * 100, 0), -rotateAngle)
      player.setAngularFactor(_vector);
      player.setAngularVelocity(_vector);
    }
  }

  //FWD 


  if (input.isFwdPressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    player.setAngularFactor(_vector);
    player.setAngularVelocity(_vector);
    player.setAngularFactor(_vector);
    player.setLinearVelocity(_vector);

    player.translateOnAxis(new THREE.Vector3(0, 0, playerSpeed*100), -rotateAngle)
    // console.log(player.getWorldQuaternion())
 


    // delete3DOBJ('bullet');
    
    // player.position.x -= Math.sin(player.rotation.y) * playerSpeed;
    // player.position.z -= Math.cos(player.rotation.y) * playerSpeed;
  }
  //BACK 
  if (input.isBwdPressed) {
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
    player.setLinearVelocity(_vector);
    player.translateOnAxis(new THREE.Vector3(0, 0, -playerSpeed * 100), -rotateAngle)

    // player.position.x += Math.sin(player.rotation.y) * playerSpeed;
    // player.position.z += Math.cos(player.rotation.y) * playerSpeed;
  }
  //RotLeft
  if (input.isRLPressed) {
    // player.rotation.y += playerSpeed/4;
    player.rotateOnAxis(new THREE.Vector3(0, 1, 0), +0.05); 
    player.setLinearVelocity(_vector);
    // console.log(player.rotateOnAxis)
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
  }
  //RotRight
  if (input.isRRPressed) {

    player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -0.05); 
    player.setLinearVelocity(_vector);
    player.__dirtyPosition = true;
    player.__dirtyRotation = true;
  }

  
  //Player BULLETS
  if (input.isFirePressed) {
    
    if (j % 2 === 0) {
      // console.log(j)
      bullets.fire()
    }
    j += 1;
    let xCompensator = ((player.rotation.y / Math.PI) * -2) * 100
    let zCompensator = 100 / (xCompensator + 1)

    let wpVector2 = new THREE.Vector3();
    if (bulletsLBlock.name = 'bullet') {
      bulletsLBlock.setLinearVelocity(new THREE.Vector3(-player.getWorldDirection(wpVector2).x * 500, 0, player.getWorldDirection(wpVector2).z * -500))
    }

    //LIMITED BULLET COUNT
    for (let i = 0; i < scene.children.length; i++) {
      if (scene.children[i].name === 'bullet') {
        // debugger
        bulletCount += 1
        if (bulletCount > 200) {
          // debugger
          for (let i = 0; i < scene.children.length; i++) {
            if (scene.children[i].name === 'bullet') {
              scene.remove(scene.children[i])
            }
          }
          bulletCount = 0;
        }
      }
    }
    player.setAngularFactor(_vector);
    player.setAngularVelocity(_vector);
  }

  //Player2 BULLETS
  if (player2.firing) {
    // if (j % 10 === 0) {
      bullets.p2fire()
    // }

    let wpVector2 = new THREE.Vector3();
    if (p2BulletsBlock.name === 'bullet') {
      p2BulletsBlock.setLinearVelocity(new THREE.Vector3(-player2.getWorldDirection(wpVector2).x * 400, 0, player2.getWorldDirection(wpVector2).z * -400))
    }

    //LIMITED BULLET COUNT
    for (let i = 0; i < scene.children.length; i++) {
      if (scene.children[i].name === 'bullet') {
        // debugger
        bulletCount += 1
        if (bulletCount > 100) {
          // debugger
          for (let i = 0; i < scene.children.length; i++) {
            if (scene.children[i].name === 'bullet') {
              scene.remove(scene.children[i])
            }
          }
          bulletCount = 0;
        }
      }
    }
    player2.setAngularFactor(_vector);
    player2.setAngularVelocity(_vector);
  }


  // //GRAVITY...fix this please
  // if (player.position.y <= 1) {
  //   player.translateOnAxis(new THREE.Vector3(0, 0, 0), -rotateAngle)
  // } else {
  //   player.translateOnAxis(new THREE.Vector3(0, playerSpeed * 50, 0), -rotateAngle)
  // }
  // camera.lookAt(player.position)


  function delete3DOBJ(objName) {
    let selectedObject = scene.getObjectByName(objName);
    if (selectedObject) {
      scene.remove(selectedObject);
    }
    
    // animate();
  }

  // socket.emit('spawn', {
  //   id: socket.id,
  //   x: player.position.x,
  //   y: player.position.y,
  //   z: player.position.z,
  //   h: player.rotation.y,
  //   pb: player.rotation.x
  // });

  let wpVector2 = new THREE.Vector3();
  player.getWorldDirection(wpVector2).y

  if (player.hp <= 0 || player2.hp <= 0) {
    reset();
    // player.hp = 200;
    // player2.hp = 200;
    // debugger
  }

  // if (player2.hp <= 0) {
  //   // player.hp = 200;
  //   // player2.hp = 200;
  //   // debugger
  //   reset();
  // }

  //PLAYER 2 UPDATE
  var tquaternion = new THREE.Quaternion()
  if (player2Data.h) {
    player2Data.h = player2Data.h
  } else {
    player2Data.h = tquaternion
  }
  player2.position.x = player2Data.x;
  player2.position.y = player2Data.y;
  player2.position.z = player2Data.z;
  player2.rotation.setFromQuaternion(player2Data.h);
  player2.firing = player2Data.firing;
  player.hp = player2Data.hp || 20;
  // debugger
  scene.add(player2)
  
  let adjustRot = THREE.Math.degToRad(20)
  //PLAYER EMIT
  socket.emit('updatedPos', {
    id: socket.id,
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
    h: player.getWorldQuaternion(tquaternion),
    firing: input.isFirePressed,
    hp: player2.hp,
    pb: player.position.y,
  });
 
  
  socket.on('otherSpawn', (serverPack) => {
    serverPackage = serverPack
  })
  // debugger
  for (let i = 0; i < serverPackage.length; i++) {
    if (serverPackage[i].id !== socket.id) {
      player2Data = serverPackage[i];
    }
  }

  
  // opponent = document.getElementById('player')
  // opponent.innerHTML = `HP: ${player.hp}`;

  let ResizeWidthRatio = 8 / 626;
  //RADAR_P1
  let radarX = player.position.x / 300 + 7;
  let radarY = player.position.y / 300 + 8;
  let radarZ = player.position.z / 300;
  // radar.position.x = ResizeWidthRatio * window.innerWidth - 3;

  
  if (radarX > 5 && radarX < 8 && radarY > 6 && radarY < 9 && radarZ > -2 && radarZ < 2) {
    p1radar.position.x = radarX;
    p1radar.position.y = radarY;
    p1radar.position.z = radarZ;
  }
  p1radar.rotation.setFromQuaternion(player.getWorldQuaternion(tquaternion));
  
  let radarX2 = player2.position.x / 300 + 7;
  let radarY2 = player2.position.y / 300 + 8;
  let radarZ2 = player2.position.z / 300;

  //RADAR_P1
  if (radarX2 > 5 && radarX2 < 8 && radarY2 > 6 && radarY2 < 9 && radarZ2 > -2 && radarZ2 < 2) {
    p2radar.position.x = radarX2;
    p2radar.position.y = radarY2;
    p2radar.position.z = radarZ2;
  }
  p2radar.rotation.setFromQuaternion(player2.getWorldQuaternion(tquaternion));

  //HPBAR
  hpBar.scale.x = (.25 * player.hp) / 5
  // hpBar.position.x = - ResizeWidthRatio * window.innerWidth + 4;
  // hpBar.position.x = 4;

  // //HPTEXT
  // hpTxt.position.x = - ResizeWidthRatio * window.innerWidth + 4;
  // hpTxt.position.x = 4;
  
  //HP2BAR
  hp2Bar.scale.x = (.25 * player2.hp) / 5
  // hp2Bar.position.x = - ResizeWidthRatio * window.innerWidth + 4;

  // //HP2TEXT
  // hp2Txt.position.x = - ResizeWidthRatio * window.innerWidth + 4;


  scene.simulate();
  // renderer.render(sceneHUD, cameraHUD)
  renderer.render(scene, camera);
  stats.end();


};

init();

// 11 
//...10 is mouse event listener, 12 is adding listener to window)...
// CALL RENDER LOOP
animate();