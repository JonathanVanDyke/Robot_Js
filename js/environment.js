function Environment() {
  //Texture loader

  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load( 'textures/tron1.jpg' );

  texture.encoding = THREE.sRGBEncoding;

  texture.anisotropy = 16;

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.set(200, 200);

  // debugger
  const materialMap = new THREE.MeshStandardMaterial( {
    map: texture, 
  });

  //GROUND
  let groundGeometry = new THREE.PlaneGeometry(1000, 1000, 0); //PRIMITIVE SHAPE AND SIZE
  let groundMaterial = new THREE.MeshBasicMaterial({ color: 'black' }); //COLOR OF MESH
  // let ground = new THREE.Mesh(groundGeometry, groundMaterial); //MESH POINTS MAT TO GEOMETRY


  var friction = 0.8; // high friction
  var restitution = 0.3; // low restitution

  var material = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({ color: 0x888888 }),
    friction,
    restitution
  );

  let ground = new Physijs.PlaneMesh(groundGeometry, materialMap); //MESH POINTS MAT TO GEOMETRY
  ground.rotation.x = -0.5 * Math.PI;
  ground.name = 'ground'
  ground.receiveShadow = true;
  scene.add(ground); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

  // 07c
  // ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)
  for (let i = 0; i < 100; i++) {
    let env2BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    let env2BlockMaterial = new THREE.MeshLambertMaterial({ color: 0x22CAC2 }); //COLOR OF MESH
    let env2Block = new THREE.Mesh(env2BlockGeometry, env2BlockMaterial); //MESH POINTS MAT TO GEOMETRY
    env2Block.position.x = (Math.random() - 0.5) * 400;
    env2Block.position.y = (Math.random() - 0.5) * 400;
    env2Block.position.z = (Math.random() - 0.5) * 300;
    // scene.add(env2Block); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT
  }

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
    scene.add(env3Block); //DROP ELEMENST INTO VIRTUAL ENVIRONMENT

    env3Block.setAngularFactor(_vector);
    env3Block.setAngularVelocity(_vector);

    env3Block.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        player.points += 1;
        let pointEle = document.getElementById('points')
        pointEle.innerHTML = `Score: ${player.points}`
        env3Block.visible = false;
      }
    });
  }

  for (let i = 0; i < 20; i++) {
    let BIGheight = (Math.random() - 0.5) * 10;
    let env1BIGBlockGeometry = new THREE.BoxBufferGeometry(1, BIGheight, 1); //PRIMITIVE SHAPE AND SIZE
    let env1BIGBlockMaterial = new THREE.MeshLambertMaterial({ color: 0x6bff42 }); //COLOR OF MESH
    let env1BIGBlock = new Physijs.BoxMesh(env1BIGBlockGeometry, env1BIGBlockMaterial, 1, 0); //MESH POINTS MAT TO GEOMETRY
    env1BIGBlock.position.x = (Math.random() - 0.5) * 400;
    env1BIGBlock.position.y = 10
    env1BIGBlock.position.z = (Math.random() - 0.5) * 400;
    // debugger
    env1BIGBlock.scale.set(20, 20, 20)
    env1BIGBlock.name = 'floorBlock'
    // scene.add(env1BIGBlock); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

    env1BIGBlock.setAngularFactor(_vector);
    env1BIGBlock.setAngularVelocity(_vector);

    env1BIGBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'bullet') {
        player.points += 1;
        let pointEle = document.getElementById('points')
        pointEle.innerHTML = `Score: ${player.points}`
        env1BIGBlock.visible = false;
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
          player.points += 1;
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
