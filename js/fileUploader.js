

let MechLoader = new THREE.OBJLoader();
MechLoader.load(
  'assets/mech.obj',
  function (object) {
    mechMesh = object.children[0]
    mechMesh.position.set(0, -4, 0);
    mechMesh.rotation.y = Math.PI;
    // debugger


    let materials = mechMesh.material
    for (let i = 0; i < materials.length; i++) {
      if (i % 2 === 0) {
        mechMesh.material[i].color.set(0x2f523e);
      } else {
        mechMesh.material[i].color.set(0xf5d742);
      }
    }
    player.points = 0;
    player.position.set(0, 10, 0);
    player.material.wireframe = true;

    player.add(mechMesh)
    player.position.set(1, 4, 0)
    

    // socket.emit('spawn', {
    //   x: player.position.x,
    //   y: player.position.y,
    //   z: player.position.z,
    //   h: player.rotation.y,
    //   pb: player.rotation.x
    // });
    

   

    player2 = player.clone();
    player2.name = 'player2';
    // player2.position.set(-20, 4, 0)
    scene.add(player)
    scene.add(player2)
    
}
);

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