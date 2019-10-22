// const { Board, Stepper } = require("johnny-five");
// const keypress = require("keypress");

// keypress(process.stdin);

// const board = new Board({
//   port: "/dev/cu.usbmodem14101"
// });

// board.on("ready", () => {
//   /**
//    * In order to use the Stepper class, your board must be flashed with
//    * either of the following:
//    *
//    * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
//    * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
//    *
//    */

//   const stepper = new Stepper({
//     type: Stepper.TYPE.FOUR_WIRE,
//     stepsPerRev: 200,
//     pins: {
//       motor1: 10,
//       motor2: 12,
//       motor3: 11,
//       motor4: 13
//     }
//   });

//   // set stepper to 180 rpm, CCW, with acceleration and deceleration
//   stepper.rpm(180).direction(Stepper.DIRECTION.CCW).accel(1600).decel(1600);

//   process.stdin.resume();
//   process.stdin.setEncoding("utf8");
//   process.stdin.setRawMode(true);

//   process.stdin.on("keypress", (ch, key) => {
//     if (!key) {
//       return;
//     }

//     if (key.name === "q") {
//       console.log("Quitting");
//       process.exit();
//     } else if (key.name === "up") {
//       console.log("CW");
//       stepper.step({
//         steps: 200,
//         direction: Stepper.DIRECTION.CW
//       }, () => console.log(stepper.DIRECTION));
//     } else if (key.name === "down") {
//       console.log("CCW");
//       stepper.step({
//         steps: 200,
//         direction: Stepper.DIRECTION.CCW
//       }, () => console.log(stepper.DIRECTION));
//     } else if (key.name === "space") {
//       console.log("Stopping");
//       servo.stop();
//     }

//     // make 10 full revolutions 
//     // stepper.step(2000, () => {
//     //   console.log("done moving CCW");
//     //   console.log(stepper)
//     // once first movement is done, make 10 revolutions clockwise at previously
//     //      defined speed, accel, and decel by passing an object into stepper.step
//     // stepper.step({
//     //   steps: 2000,
//     //   direction: Stepper.DIRECTION.CW
//     // }, () => console.log(stepper.DIRECTION));
//   });
// });
