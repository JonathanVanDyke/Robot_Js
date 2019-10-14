* RoboFight_3JS

* Background and Overview
    * Motivation for project
      This project makes use of the three js api along with physijs api and includes imported 3D object files as well as rigid body physics.

      
    * High level overview
      The player controls a robot on a 3D stage and is able to manipulate it's position in all three dimensions.
      The player character also has the ability to fire projectiles with an incrementing score based on the number of items on collision. The app may make use of websockets to provide multiplayer functionality for robotic dog fights.
* Functionality and MVP Features
    * 1. A three dimensional environment including:
        > A player model with input controls
        > Destructable objects
        > Projectile Tracking
        > Gravity
        > HUD (Hp, on-hit message, etc)
        # Scene
        <img src="https://thingyverse-public.s3.amazonaws.com/Scene.png"/>
        # Projectile
        <img src="https://thingyverse-public.s3.amazonaws.com/projectile.png"/>
        
        
* Architecture and Technologies
    * Technology 1
        * Three Js
        * A library that allows for 3D graphics in the browser.
        * Physijs
        * A physics library for rigid bodies
    * Technology 2
        * Sockets.io
        * Library for creating/using websockets for real-time multiplayer
    ...
Implementation Timeline
    * Implementation of three dimensional environment (Saturday)
    * Import of 3D models (Saturday)
    * Physics added to 3D models (Saturday)
    * Navigation in three dimensional space (Sunday)
    * Spawn projectiles and track with user model (Sunday)
    * Create git readme documentation (Monday)
    * Research websockets (Monday)
    * Continue websocket research (Tuesday)
    * Integrate websockets into app (Wednesday)
    * Get multiplayer online (Thursday)
    * Optimize graphics for render (Thursday)
    * HUD implementation (Friday)
