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
    player.points2 = 0;
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
    player.hp = 20;
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

    radar = new THREE.Mesh(radarGeometry, radarMaterial); //MESH POINTS MAT TO GEOMETRY
    radar.position.set(7, 8, 0);
    player.add(radar);

    //P1 RADAR
    // let p1radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
    let p1radarGeometry = new THREE.ConeBufferGeometry(.1, .5, 4);
    let p1radarMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff6a,
      opacity: 0.5,
      transparent: true,
    })
    p1radarGeometry.rotateX(-Math.PI / 2)

    p1radar = new THREE.Mesh(p1radarGeometry, p1radarMaterial); //MESH POINTS MAT TO GEOMETRY
    p1radar.position.set(7, 8, 0);
    player.add(p1radar);
    
    //P2 RADAR
    // let p2radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
    let p2radarGeometry = new THREE.ConeBufferGeometry(.1, .5, 4);
    let p2radarMaterial = new THREE.MeshLambertMaterial({
      color: 0xff2a00,
      opacity: 0.5,
      transparent: true,
    })
    p2radarGeometry.rotateX(-Math.PI / 2)


    p2radar = new THREE.Mesh(p2radarGeometry, p2radarMaterial); //MESH POINTS MAT TO GEOMETRY
    p2radar.position.set(7, 8, 0);
    player.add(p2radar);

    // //HP TEXT
    // var loader = new THREE.FontLoader();

    // let hpTxt;
    // loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

    //   var hpgeometry = new THREE.TextGeometry('H P', {
    //     font: font,
    //     size: 40,
    //     height: 5,
    //     curveSegments: 12,
    //     bevelEnabled: true,
    //     bevelThickness: 10,
    //     bevelSize: 2,
    //     bevelOffset: 0,
    //     bevelSegments: 5
    //   });

    //   let hpBarMaterial = new THREE.MeshLambertMaterial({
    //     color: 0x00ff6a,
    //     opacity: 0.75,
    //     transparent: true,
    //   })

    //   hpTxt = new THREE.Mesh(hpgeometry, hpBarMaterial)
    //   // debugger
    //   hpTxt.scale.set(.01, .01, .01)
    //   hpTxt.position.set(-9, 9.5, 0)
    //   hpTxt.rotation.y = Math.PI / 2 * .5
    //   hpTxt.rotation.x = Math.PI / 2 * .25
    //   player.add(hpTxt)

    //   // scene.add(hpTxt);
    // });

    //P1 Health Bar
    let hpBarGeometry = new THREE.BoxGeometry(5, .5, .5);
    let hpBarMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff6a,
      opacity: 0.75,
      transparent: true,
    })

    hpBar = new THREE.Mesh(hpBarGeometry, hpBarMaterial); //MESH POINTS MAT TO GEOMETRY
    hpBar.position.set(-8, 9, 0);
    // let ResizeWidthRatio = - 8 / 626;
    // hpBar.position.x = ResizeWidthRatio * window.innerWidth
    // console.log(`X position: ${hpBar.position.x}`)
    hpBar.rotation.y = Math.PI/2 * .5
    hpBar.rotation.x = Math.PI/2 * .25
    player.add(hpBar);

    // //HP2 TEXT
    // var loader = new THREE.FontLoader();

    // let hp2Txt;
    // loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

    //   var hp2geometry = new THREE.TextGeometry('O P P O N E N T  H P :', {
    //     font: font,
    //     size: 40,
    //     height: 5,
    //     curveSegments: 12,
    //     bevelEnabled: true,
    //     bevelThickness: 10,
    //     bevelSize: 2,
    //     bevelOffset: 0,
    //     bevelSegments: 5
    //   });

    //   let hp2BarMaterial = new THREE.MeshLambertMaterial({
    //     color: 0xff2e2e,
    //     opacity: 0.75,
    //     transparent: true,
    //   })

    //   hp2Txt = new THREE.Mesh(hp2geometry, hp2BarMaterial)
    //   // debugger
    //   hp2Txt.scale.set(.01, .01, .01)
    //   hp2Txt.position.set(-9, 6, 0)
    //   hp2Txt.rotation.y = Math.PI / 2 * .5
    //   hp2Txt.rotation.x = Math.PI / 2 * .25
    //   player.add(hp2Txt)

    //   // scene.add(hpTxt);
    // });

    //P2 Health Bar
    let hp2BarGeometry = new THREE.BoxGeometry(5, .5, .5);
    let hp2BarMaterial = new THREE.MeshLambertMaterial({
      color: 0xff2e2e,
      opacity: 0.75,
      transparent: true,
    })

    hp2Bar = new THREE.Mesh(hp2BarGeometry, hp2BarMaterial); //MESH POINTS MAT TO GEOMETRY
    hp2Bar.position.set(-8, 6, 0);
    // let ResizeWidthRatio = - 8 / 626;
    // hp2Bar.position.x = ResizeWidthRatio * window.innerWidth
    // console.log(`X position: ${hp2Bar.position.x}`)
    hp2Bar.rotation.y = Math.PI/2 * .5
    hp2Bar.rotation.x = Math.PI/2 * .25
    player.add(hp2Bar);



    

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
          // player.points += 1;
          // let pointEle = document.getElementById('points')
          // pointEle.innerHTML = `Score: ${player.points}`
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

// //TEXT LOADING
// var loader = new THREE.FontLoader();

// loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

//   var hpgeometry = new THREE.TextGeometry('HP', {
//     font: font,
//     size: 80,
//     height: 5,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 10,
//     bevelSize: 8,
//     bevelOffset: 0,
//     bevelSegments: 5
//   });

//   let hpBarMaterial = new THREE.MeshLambertMaterial({
//     color: 0x00ff6a,
//     opacity: 0.75,
//     transparent: true,
//   })

//   hpTxt = new THREE.Mesh(hpgeometry, hpBarMaterial)
//   // hpTxt.scale.set(.01, .01, .01)
//   hpTxt.position.set(0,3,0)
  
//   scene.add(hpTxt);
// });