function Environment() {

  //TERRAIN TEXTURES
  var Tmaterial = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/jotunheimen-texture.jpg')
  });

  //TERRAIN
  var terrainLoader = new THREE.TerrainLoader();
  terrainLoader.load('../assets/jotunheimen.bin', function (data) {
    var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
      geometry.vertices[i].z = data[i] / 65535 * 10;
    }
    // var material = new THREE.MeshPhongMaterial({
    //   color: 0xdddddd,
      // wireframe: true
    // });
    var plane = new Physijs.PlaneMesh(geometry, Tmaterial, 0, 0);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -120;
    plane.scale.set(12, 12, 12)
    scene.add(plane);
  });

  //CubeMap
  // var loader = new THREE.CubeTextureLoader();
  // loader.setPath('textures/cube/pisa/');

  // var textureCube = loader.load([
  //   'px.png', 'nx.png',
  //   'py.png', 'ny.png',
  //   'pz.png', 'nz.png'
  // ]);

  // var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube });
  // let sceneCube = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material);
  // scene.add(sceneCube);



  // const loader = new THREE.CubeTextureLoader();
  // const texture2 = loader.load([
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
  //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
  // ]);
  // scene.background = texture2;

  const loader = new THREE.CubeTextureLoader();
  const texture2 = loader.load([
    './textures/c2/px.png',
    './textures/c2/nx.png',
    './textures/c2/py.png',
    './textures/c2/ny.png',
    './textures/c2/pz.png',
    './textures/c2/nz.png',
]);
  scene.background = texture2;



  //Texture loader

  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load( 'textures/dirt.png' );

  texture.encoding = THREE.sRGBEncoding;

  texture.anisotropy = 16;

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.set(200, 200);

  // debugger
  const materialMap = new THREE.MeshStandardMaterial( {
    map: texture, 
  });

  //TARGET TEXTURE

  const Targettexture = textureLoader.load( 'textures/tron1.jpg' );

  Targettexture.encoding = THREE.sRGBEncoding;

  Targettexture.anisotropy = 16;

  Targettexture.wrapS = Targettexture.wrapT = THREE.RepeatWrapping;
  Targettexture.offset.set(0, 0);
  Targettexture.repeat.set(200, 200);

  // debugger
  const TargetMaterialMap = new THREE.MeshStandardMaterial( {
    map: Targettexture, 
  });

  //GROUND
  let groundGeometry = new THREE.PlaneGeometry(1000, 1000, 0); //PRIMITIVE SHAPE AND SIZE
  let groundMaterial = new THREE.MeshBasicMaterial({ color: 'black', visible: false }); //COLOR OF MESH
  // let ground = new THREE.Mesh(groundGeometry, groundMaterial); //MESH POINTS MAT TO GEOMETRY


  var friction = 0.8; // high friction
  var restitution = 0.3; // low restitution

  // var material = Physijs.createMaterial(
  //   new THREE.MeshBasicMaterial({ color: 0x888888 }),
  //   friction,
  //   restitution,
  // );

  let ground = new Physijs.PlaneMesh(groundGeometry, groundMaterial, 0, 0); //MESH POINTS MAT TO GEOMETRY
  ground.rotation.x = -0.5 * Math.PI;
  ground.name = 'ground'
  ground.receiveShadow = true;
  scene.add(ground); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

  // // 07c
  // // ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)
  // for (let i = 0; i < 100; i++) {
  //   let env2BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  //   let env2BlockMaterial = new THREE.MeshLambertMaterial({ color: 0x22CAC2 }); //COLOR OF MESH
  //   let env2Block = new THREE.Mesh(env2BlockGeometry, env2BlockMaterial); //MESH POINTS MAT TO GEOMETRY
  //   env2Block.position.x = (Math.random() - 0.5) * 400;
  //   env2Block.position.y = (Math.random() - 0.5) * 400;
  //   env2Block.position.z = (Math.random() - 0.5) * 300;
  //   // scene.add(env2Block); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT
  // }

  let _vector = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < 200; i++) {
    let env3BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    let env3BlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
    let env3Block = new Physijs.BoxMesh(env3BlockGeometry, env3BlockMaterial); //MESH POINTS MAT TO GEOMETRY
    env3Block.position.x = (Math.random() - 0.5) * 300;
    env3Block.position.y = 1
    env3Block.position.z = (Math.random() - 0.5) * 300;
    // debugger//
    env3Block.scale.set(2, 2, 2)
    env3Block.name = 'floorBlock'
    // scene.add(env3Block); //DROP ELEMENST INTO VIRTUAL ENVIRONMENT

    env3Block.setAngularFactor(_vector);
    env3Block.setAngularVelocity(_vector);

    env3Block.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        // player.points += 1;
        // let pointEle = document.getElementById('points')
        // pointEle.innerHTML = `Score: ${player.points}`
        env3Block.visible = false;
      }
    });
  }

  _vector = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < 100; i++) {
    
    let color;
    if (i % 2 === 0) {
      color = 0xfffff;
      rot = Math.PI / 2
      point = 100;
      scale = 1;
    } else {
      color = 0xb52626;
      rot = 0;
      point = 1000
      scale = .5;
    }
    
    let TargetBlockGeometry = new THREE.CylinderBufferGeometry(scale, scale, 1, 100); //PRIMITIVE SHAPE AND SIZE
    // let TargetBlockMaterial = new THREE.MeshLambertMaterial({ color: color }); //COLOR OF MESH
    let TargetBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: scene.background }); //COLOR OF MESH

    let TargetBlock = new Physijs.BoxMesh(TargetBlockGeometry, TargetBlockMaterial, 0, 0); //MESH POINTS MAT TO GEOMETRY
    TargetBlock.position.x = (Math.random() - 0.5) * 300;
    TargetBlock.position.y = (Math.random() - 0.5) * 300 + 200;
    TargetBlock.position.z = (Math.random() - 0.5) * 300;
    TargetBlock.rotation.x = Math.PI / 2;
    TargetBlock.rotation.z = rot;
    // debugger//
    TargetBlock.scale.set(10, 1, 10)
    TargetBlock.name = 'target'
    TargetBlock.points = point;
    scene.add(TargetBlock); //DROP ELEMENST INTO VIRTUAL ENVIRONMENT

    TargetBlock.setAngularFactor(_vector);
    TargetBlock.setAngularVelocity(_vector);

    TargetBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        // player.points += this.points;
        let pointEle = document.getElementById('points')
        // pointEle.innerHTML = `Score: ${player.points}`
        // TargetBlock.visible = false;
        scene.remove(this);
      }
    });
  }

  for (let i = 0; i < 200; i++) {
    // let BIGheight = (Math.random() - 0.5) * 10;
    let BIGheight = 1;
    let Trunkheight = 2.125
    let env1BIGBlockGeometry = new THREE.BoxBufferGeometry(1, BIGheight, 1); //PRIMITIVE SHAPE AND SIZE
    let env1BIGBlockMaterial = new THREE.MeshLambertMaterial({ color: 0x6bff42 }); //COLOR OF MESH
    let env1BIGBlock = new Physijs.BoxMesh(env1BIGBlockGeometry, env1BIGBlockMaterial, 0); //MESH POINTS MAT TO GEOMETRY
    let env1TrunkBlockGeometry = new THREE.BoxBufferGeometry(.25, Trunkheight, .25, 1); //PRIMITIVE SHAPE AND SIZE
    let env1TrunkBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); //COLOR OF MESH
    let env1TrunkBlock = new Physijs.BoxMesh(env1TrunkBlockGeometry, env1TrunkBlockMaterial, 0); //MESH POINTS MAT TO GEOMETRY

    env1TrunkBlock.position.x = env1BIGBlock.position.x;
    env1TrunkBlock.position.y = 1
    env1TrunkBlock.position.z = env1BIGBlock.position.z;

    env1BIGBlock.add(env1TrunkBlock)
    env1BIGBlock.hp = 100;
    env1BIGBlock.rotation.x = Math.PI

    env1BIGBlock.position.x = (Math.random() - 0.5) * 600;
    env1BIGBlock.position.y = 40
    env1BIGBlock.position.z = (Math.random() - 0.5) * 600;


    // debugger
    env1BIGBlock.scale.set(20, 20, 20)
    env1BIGBlock.name = 'floorBlock'
    env1TrunkBlock.name = 'floorBlock'
    
    // scene.add(env1BIGBlock); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT
    // scene.add(env1TrunkBlock); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

    env1BIGBlock.setAngularFactor(_vector);
    env1BIGBlock.setAngularVelocity(_vector);

    env1BIGBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        env1BIGBlock.hp -= 1;
        if (env1BIGBlock.hp === 0) {
          // player.points += 100;
          let pointEle = document.getElementById('points')
          pointEle.innerHTML = `Score: ${player.points}`
          scene.remove(this)
          // env1BIGBlock.visible = false;
        }
      }
    });

    env1TrunkBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        env1BIGBlock.hp -= 1;
        if (env1BIGBlock.hp === 0) {
          // player.points += 10;
          let pointEle = document.getElementById('points')
          pointEle.innerHTML = `Score: ${player.points}`
          env1BIGBlock.visible = false;
        }
      }
    });
  }

  const towerRow = (height, width, zPos) => {
    for (let i = 0; i < width; i++) {
      let env4BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
      var env4BlockMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xff00C2 }), 0, .1)
      // let env4BlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
      let env4Block = new Physijs.BoxMesh(env4BlockGeometry, env4BlockMaterial); //MESH POINTS MAT TO GEOMETRY
  
      env4Block.position.x = i*2.1 + 6;
      env4Block.position.y = height;
      env4Block.position.z = zPos;
      // debugger
      env4Block.scale.set(2, 2, 2)
      env4Block.name = 'floorBlock'
      scene.add(env4Block); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

      env4Block.setAngularFactor(_vector);
      env4Block.setAngularVelocity(_vector);

      env4Block.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          // player.points += 1;
          let pointEle = document.getElementById('points')
          pointEle.innerHTML = `Score: ${player.points}`
          // env4Block.visible = false;
          scene.remove(this)
        }
      });
    }
  }


  const towerBuilder = (numRows) => {
    zPos = (Math.random() - 0.5) * 300;
    width = 1;
    for (let i = 0; i < numRows; i++) {
      towerRow((i * 2 + 1), width, zPos)
    }
  }

  for (let i = 0; i < 0; i++) {
    towerBuilder(20)
  }

}
