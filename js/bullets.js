function Bullets() {
  self = this;
}

//PLAYER1
Bullets.prototype.fire = (playerSpeed) => {

  
  let bulletsLBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  let bulletsLBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
  bulletsLBlock = new Physijs.BoxMesh(bulletsLBlockGeometry, bulletsLBlockMaterial); //MESH POINTS MAT TO GEOMETRY
  // console.log((player.rotation.y/ Math.PI) * 2);

  let wpVector2 = new THREE.Vector3();
  bulletsLBlock.name = 'bullet'
  bulletsLBlock.position.set(player.position.x + -8 * player.getWorldDirection(wpVector2).x, player.position.y, player.position.z - 8 * player.getWorldDirection(wpVector2).z);
  // bulletsLBlock.rotation.set(-rotateAngle);

  bulletsLBlock.createdAt = clock.getElapsedTime();
  // debugger
  
  scene.add(bulletsLBlock)

  bulletsLBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
    if (other_object.name === 'ground' || other_object.name === 'floorBlock' || other_object.name === 'target' || other_object.name === 'player2') {
      let selectedObject = scene.getObjectByName('bullet');
      if (selectedObject) {
        console.log(other_object.name)

        scene.remove(selectedObject);
      }

      if (other_object.name === 'player2') {
        winner = document.getElementById('winner');
        if (other_object.hp > 0) {
          other_object.hp -= 1;
        }
        opponent = document.getElementById('opponent')
        opponent.innerHTML = `Opponent HP: ${other_object.hp}`;
        if (other_object.hp <= 0) {
          winner.innerHTML = 'You win!'
        }
      }
    }
    // env3Block.visible = false; // make any mesh disappear on collision...
  });

}

//Player 2 fire
Bullets.prototype.p2fire = (playerSpeed) => {

  //PLAYER2
  let p2BulletsBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
  let p2BulletsBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
  p2BulletsBlock = new Physijs.BoxMesh(p2BulletsBlockGeometry, p2BulletsBlockMaterial); //MESH POINTS MAT TO GEOMETRY
  // console.log((player.rotation.y/ Math.PI) * 2);


  let wpVector = new THREE.Vector3();
  p2BulletsBlock.name = 'bullet'
  p2BulletsBlock.position.set(player2.position.x + -8 * player2.getWorldDirection(wpVector).x, player2.position.y, player2.position.z - 8 * player2.getWorldDirection(wpVector).z);
  // p2BulletsBlock.rotation.set(-rotateAngle);

  p2BulletsBlock.createdAt = clock.getElapsedTime();
  // debugger

  scene.add(p2BulletsBlock)


  p2BulletsBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
    // console.log(other_object)
    // console.log(linear_velocity)
    // console.log(angular_velocity)
    // env3Block.material.wireframe = true
    if (other_object.name === 'ground' || other_object.name === 'floorBlock' || other_object.name === 'target' || other_object.name === 'player2') {
      let selectedObject = scene.getObjectByName('bullet');
      if (selectedObject) {
        console.log(other_object.name)
        
        scene.remove(selectedObject);
      }

      if (other_object.name === 'player1') {
        winner = document.getElementById('winner');
        if (other_object.hp > 0) {
          other_object.hp -= 1;
        }
        opponent = document.getElementById('opponent')
        opponent.innerHTML = `Opponent HP: ${other_object.hp}`;
        if (other_object.hp <= 0) {
          winner.innerHTML = 'You win!'
        }
      }
    }
    // env3Block.visible = false; // make any mesh disappear on collision...
  });

}
