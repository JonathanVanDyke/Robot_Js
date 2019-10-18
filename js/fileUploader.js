let MechLoader = new THREE.OBJLoader();
MechLoader.load(
  'assets/mech.obj',
  function (object) {
    mechMesh = object.children[0]
    mechMesh.position.set(0, -4, 0);
    mechMesh.rotation.y = Math.PI;

    let materials = mechMesh.material
    for (let i = 0; i < materials.length; i++) {
      if (i % 2 === 0) {
        // mechMesh.material[i].color.set(0x2f523e);
        mechMesh.material[i].envMap = scene.background
      } else {
        mechMesh.material[i].color.set(0xf5d742);
      }
    }
    player.points = 0;
    player.position.set(0, 10, 0);
    // player.material.wireframe = true;

    player.add(mechMesh)
    player.position.set(1, 4, 0)
    
    let mechMesh2 = mechMesh.clone();
    player2.add(mechMesh2)
    player2.name = 'player2';

    let lightPlayer = new THREE.DirectionalLight(0xFFFFFF, 1);
    lightPlayer.position.set(0, 200, 0)
    lightPlayer.target = player;
    scene.add(lightPlayer)
    scene.add(lightPlayer.target);

    scene.add(player)
    scene.add(player2)

    //RADAR
    let radarGeometry = new THREE.SphereGeometry(2, 20, 20);
    let radarMaterial = new THREE.MeshLambertMaterial({
      color: 0x22CAC2,
      opacity: 0.5,
      transparent: true,
      wireframe: true,
    })

    let radar = new THREE.Mesh(radarGeometry, radarMaterial); //MESH POINTS MAT TO GEOMETRY
    radar.position.set(7, 8, 0);
    player.add(radar);

    //P1 RADAR
    let p1radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
    let p1radarMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff6a,
      opacity: 0.5,
      transparent: true,
    })

    p1radar = new THREE.Mesh(p1radarGeometry, p1radarMaterial); //MESH POINTS MAT TO GEOMETRY
    p1radar.position.set(7, 8, 0);
    player.add(p1radar);
    
    //P2 RADAR
    let p2radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
    let p2radarMaterial = new THREE.MeshLambertMaterial({
      color: 0xff2a00,
      opacity: 0.5,
      transparent: true,
    })

    p2radar = new THREE.Mesh(p2radarGeometry, p2radarMaterial); //MESH POINTS MAT TO GEOMETRY
    p2radar.position.set(7, 8, 0);
    player.add(p2radar);
    
}
);

let TreeLoader = new THREE.OBJLoader();
for (let i = 0; i < 0; i++) {
  TreeLoader.load(
    'assets/tree.obj',
    function (object) {
      treeMesh = object.children[5]
      treeMesh.material.color.set(0x60a62e)
      treeMesh.scale.set(3, 3, 3)

      let treeGeometry = new THREE.BoxBufferGeometry(2, 60, 2); //PRIMITIVE SHAPE AND SIZE
      var treeMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }), 0, 0)
      // let treeMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
      let tree = new Physijs.BoxMesh(treeGeometry, treeMaterial, 0); //MESH POINTS MAT TO GEOMETRY
      tree.name = 'tree';
      tree.visible = false;
      // tree.position.set(-53.5, 0, -25.5)
      tree.position.set(-161.5, 0, -77)
 
      tree.add(treeMesh)
      // treeMesh.add(tree);
      // tree.add(treeMesh)

      treeMesh.position.set(0, -718*1.5, 0);
      // treeMesh.rotation.y = Math.PI/Math.random();
      // debugger
      let randX = (Math.random() - 0.5) * 600;;
      let randZ = (Math.random() - 0.5) * 600;
  
      // treeMesh.add(tree)
      // treeMesh.position.x = (Math.random() - 0.5) * 600;
      // treeMesh.position.y = -718 * 1.5
      // treeMesh.position.z = (Math.random() - 0.5) * 600;
      // scene.add(tree)

      treeMesh.position.x += randX
      tree.position.x += randX
      treeMesh.position.z += randZ
      tree.position.z += randZ

      scene.add(treeMesh)
      scene.add(tree)

      tree.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          player.points += 1;
          let pointEle = document.getElementById('points')
          pointEle.innerHTML = `Score: ${player.points}`
          // tree.visible = false;
          // scene.remove(this)
        }
      });
      
  }
  );
}

// //A huge city w/o colliders or physics 
// let cityLoader = new THREE.OBJLoader();
// cityLoader.load(
//   'assets/City.obj',
//   function (object) {

//     for (let i = 0; i < object.children.length; i++) {
//       cityMesh = object.children[i]
//       if (i % 2 === 0) {
//         debugger
//         cityMesh.material.color.set(0xa39f98);
//       } else {
//         cityMesh.material.color.set(0xc4b9a7);
//       }


//       cityMesh.position.set(0, 0, 400);
//       scene.add(cityMesh)
//     }
// }
// );