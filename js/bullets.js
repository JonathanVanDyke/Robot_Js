function Bullets() {
  self = this;
}

Bullets.prototype.fire = (playerSpeed) => {
  // bullets = new Bullets();

  // //RIGHT
  // let bulletsRBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  // let bulletsRBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
  // bulletsRBlock = new Physijs.BoxMesh(bulletsRBlockGeometry, bulletsRBlockMaterial); //MESH POINTS MAT TO GEOMETRY

  // bulletsRBlock.name = 'bullet'
  // bulletsRBlock.position.set(player.position.x + 2, player.position.y, player.position.z - 2);
  
  // // bulletsRBlock.rotation.set(-rotateAngle);
  // bulletsRBlock.createdAt = clock.getElapsedTime();
  // debugger
  // console.log(THREE.Math.radToDeg(player.rotation.y));
  // console.log(player.getWorldDirection().z);
  // console.log((player.rotation.y/ Math.PI) * 2);
  // scene.add(bulletsRBlock)

  // bulletsRBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
  //   if (other_object.name === 'ground') {
  //     let selectedObject = scene.getObjectByName('bullet');
  //     if (selectedObject) {
  //       scene.remove(selectedObject);
  //     }
  //   }
  // });


  //LEFT
  let bulletsLBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  let bulletsLBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
  bulletsLBlock = new Physijs.BoxMesh(bulletsLBlockGeometry, bulletsLBlockMaterial); //MESH POINTS MAT TO GEOMETRY
  // console.log((player.rotation.y/ Math.PI) * 2);


  let wpVector = new THREE.Vector3();
  bulletsLBlock.name = 'bullet'
  bulletsLBlock.position.set(player.position.x + -8 * player.getWorldDirection(wpVector).x, player.position.y, player.position.z - 8 * player.getWorldDirection(wpVector).z);
  // bulletsLBlock.rotation.set(-rotateAngle);

  bulletsLBlock.createdAt = clock.getElapsedTime();
  // debugger
  
  scene.add(bulletsLBlock)


  bulletsLBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
    // console.log(other_object)
    // console.log(linear_velocity)
    // console.log(angular_velocity)
    // env3Block.material.wireframe = true
    if (other_object.name === 'ground' || other_object.name === 'floorBlock' || other_object.name === 'target') {
      let selectedObject = scene.getObjectByName('bullet');
      if (selectedObject) {
        console.log(other_object.name)
        
        scene.remove(selectedObject);
      }
    }
    // env3Block.visible = false; // make any mesh disappear on collision...
  });




}
