import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import { KeyDisplay} from '/js/KeyboardUtility.js';
import { Player } from '/js/Player.js';
import { Enemy } from '/js/Enemy.js';

//Level0 setup
export function Level0() {
    //INIT UI ELEMENTS
    var ps = document.getElementById('Pause');
    ps.textContent = "";
    var lt = document.getElementById('LevelTimer');
    lt.textContent = "";
    const dub = document.getElementById('Win');
    dub.textContent = "";
    const loss = document.getElementById('Lose');
    loss.textContent = "";

    //TIMER
    var timeLeft = 20;
    var str = "Time remaining: " + timeLeft;
    lt.textContent = str;
    
    function decrementSeconds(){
        timeLeft = timeLeft - 1;
        str = "Time remaining: " + timeLeft;
        lt.textContent = str;
    }
    var intervalID;
    function startLevelTimer() {
        intervalID = setInterval(decrementSeconds, 1000);
    }
    
    function stopLevelTimer(){
        clearInterval(intervalID);
    }


    
    //SCENE
    const scene = new THREE.Scene();

    //Skybox
    const loaderSky = new THREE.CubeTextureLoader();
    loaderSky.setPath('./Resources/textures/skyboxes/heaven/');
    const texture = loaderSky.load([
        'ft.jpg',
        'bk.jpg',
        'up.jpg',
        'dn.jpg',
        'rt.jpg',
        'lf.jpg',
    ]);
    scene.background = texture;

    //CAMERA
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    //camera.position.set(0, 20, 40); //for player
    camera.position.set(0, 200, 0);   //for level editing

    //RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //CONTROLS
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    /*orbitControls.enableDamping = true; //leave these lines commented and set the position of the player model to (0, 0, 0)
    orbitControls.minDistance = 5;         //to have a full view of the level
    orbitControls.maxDistance = 5;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 1.9;*/
    orbitControls.update();

    //LIGHTS
    lighting();

    //FLOOR
    floor();



    //OBJECTS
    var boundingBoxes = [];     //any object that's not the player and needs collision detection should be in here

    //Walls
    //texture
    const textureLoader = new THREE.TextureLoader();
    const brick = textureLoader.load("./resources/textures/walls/brick_medieval.jpg");
    const materialWall = new THREE.MeshStandardMaterial(
        {
            map: brick
        })
    wrapAndRepeatTextureWall(materialWall.map);

    //surrounding walls
    wall(new THREE.Vector3(-100, 0, -100), new THREE.Vector3(100, 16, -99));
    wall(new THREE.Vector3(100, 0, -99), new THREE.Vector3(99, 16, 100));
    wall(new THREE.Vector3(99, 0, 100), new THREE.Vector3(-100, 16, 99));
    wall(new THREE.Vector3(-100, 0, 99), new THREE.Vector3(-99, 16, -99));
    
    
    //maze walls
    //outer
    wall(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(-5, 10, -49));
    wall(new THREE.Vector3(5, 0, -50), new THREE.Vector3(50, 10, -49));
    wall(new THREE.Vector3(50, 0, -49), new THREE.Vector3(49, 10, 50));
    wall(new THREE.Vector3(49, 0, 50), new THREE.Vector3(-50, 10, 49));
    wall(new THREE.Vector3(-50, 0, 49), new THREE.Vector3(-49, 10, -49));
    
    //inner
    wall(new THREE.Vector3(-30, 0, -49), new THREE.Vector3(-29, 10, 30));
    wall(new THREE.Vector3(-10, 0, 30), new THREE.Vector3(30, 10, 29));
    wall(new THREE.Vector3(30, 0, 29), new THREE.Vector3(29, 10, -10));
    wall(new THREE.Vector3(29, 0, -10), new THREE.Vector3(10, 10, -9));
    wall(new THREE.Vector3(10, 0, -9), new THREE.Vector3(11, 10, 10));
    wall(new THREE.Vector3(10, 0, 10), new THREE.Vector3(-29, 10, 9));

    wall(new THREE.Vector3(10, 0, -49), new THREE.Vector3(11, 10, -30));
    wall(new THREE.Vector3(30, 0, -30), new THREE.Vector3(-10, 10, -29));
    wall(new THREE.Vector3(-10, 0, -29), new THREE.Vector3(-9, 10, -10));
    
    
    //Win Circle
    //mesh
    const geoCircle = new THREE.CircleGeometry(5, 32 );
    const matCircle = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    const meshCircle = new THREE.Mesh( geoCircle, matCircle );
    meshCircle.rotation.x = -Math.PI / 2;
    meshCircle.position.set(0, 0.05, -70);
    meshCircle.receiveShadow = true;
    scene.add(meshCircle);

    //bounding sphere
    const bsCircle = new THREE.Sphere(meshCircle.position, 5);



    //TORCHES
    var torchModel;

    const managerTorch = new THREE.LoadingManager();
    managerTorch.onLoad = function() { //when torch model has been loaded. Can clone a bunch of torches in here
        torch(new THREE.Vector3( 0, 5, 30.5));
        //torch(new THREE.Vector3( 0, 5, 40));
        //torch(new THREE.Vector3( something, something, something));
        //...
    }

    const loaderTorch = new FBXLoader(managerTorch);
    loaderTorch.setPath('./Resources/models/Torch/');
    loaderTorch.load('Torch.fbx', (fbx) => {
      const model = fbx;
      fbx.scale.setScalar(0.02);

      torchModel = model;
    });


    
    //MODEL WITH ANIMATIONS
    var player;

    const loaderPlayer = new FBXLoader();
    loaderPlayer.setPath('./Resources/models/Rosales/');
    loaderPlayer.load('Kachujin_G_Rosales.fbx', (fbx) => {
      //load main model
      const model = fbx;
      fbx.scale.setScalar(0.01);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      model.rotation.y = -Math.PI;
      model.position.set(0, 0, 40);
      scene.add(model);


      //load animations, store in map and add to mixer
      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = new Map();

      const manager = new THREE.LoadingManager();
      manager.onLoad = function() { //when all animations have been loaded
          //pass model, mixer and animations to character controller
          player = new Player(model, mixer, animationsMap, orbitControls, camera, boundingBoxes);
          
          startLevelTimer();
      }


      //load animations
      const loaderAnimations = new FBXLoader(manager);
      loaderAnimations.setPath('./Resources/models/Rosales/');
      loaderAnimations.load('Walk.fbx', (a) => { OnLoad('Walk', a); });
      loaderAnimations.load('Run.fbx', (a) => { OnLoad('Run', a); });
      loaderAnimations.load('Idle.fbx', (a) => { OnLoad('Idle', a); });
      loaderAnimations.load('Punch.fbx', (a) => { OnLoad('Punch', a); });
      loaderAnimations.load('OnHit.fbx', (a) => { OnLoad('OnHit', a); });
      loaderAnimations.load('Death.fbx', (a) => { OnLoad('Death', a); });

      
      const OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const animAction = mixer.clipAction(clip);
        
        //make death animation not loop when its done
        if (animName == 'Death') {
            animAction.loop = THREE.LoopOnce;
            animAction.clampWhenFinished=true;
        }

        animationsMap.set(animName, animAction);
      };

    });



    //PLAYER CONTROLS
    const keysPressed = {'w': false, 'a': false, 's': false, 'd': false, 'q': false, 'e': false};
    const keyDisplayQueue = new KeyDisplay();
    document.addEventListener('keydown', (event) => {
        keyDisplayQueue.down(event.key)                 //just used for displaying
        keysPressed[event.key.toLowerCase()] = true     //used for actual calculations
        
    }, false);
    document.addEventListener('keyup', (event) => {
        keyDisplayQueue.up(event.key);                  //just used for displaying
        keysPressed[event.key.toLowerCase()] = false    //used for actual calculations

    }, false);


    //PAUSE CONTROLS AND CLOCK INITIALIZATION
    const clock = new THREE.Clock();
    var paused = false;
    document.addEventListener('keypress', (event) => {
        if (event.key.toLowerCase()=='p') {
            paused = !paused;

            if(paused) {
                stopLevelTimer();
                clock.stop();
                ps.textContent="PAUSED";
                
            }
            else {
                startLevelTimer();
                clock.start();
                ps.textContent="";
            }
        }
        
    }, false);
    


    //WHAT HAPPENS ON EACH UPDATE
    function animate() {
        if (!paused) {
            var mixerUpdateDelta = clock.getDelta();
        
            if (player) {
                player.update(mixerUpdateDelta, keysPressed);
                var bbPlayer = player.bbPlayer;

                if(bbPlayer.intersectsSphere(bsCircle)) {                        //if player gets to circle, they win and are invincible
                    stopLevelTimer();
                    dub.textContent = "YOU WIN!";

                    player.win = true;

                }

                if (timeLeft<=0 || player.death==true) {                         //if time runs out they die
                    stopLevelTimer();
                    player.death=true; //if timer runs out need to do this

                    loss.textContent = 'YOU DIED';
                }
            }
        }
        
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    document.body.appendChild(renderer.domElement);
    animate();



    //RESIZE HANDLER
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);



    //THE FLOOR IS MADE OUT OF FLOOR
    function floor() {
        //textures
        const textureLoader = new THREE.TextureLoader();
        //const texture = textureLoader.load("./resources/textures/floors/placeholder.png");
        const texture = textureLoader.load("./resources/textures/floors/ground_grass.jpg");
        
        //dimensions
        const WIDTH = 200;
        const LENGTH = 200;
        const HEIGHT = 1;

        const geometry = new THREE.BoxGeometry(WIDTH, LENGTH, HEIGHT);
        const material = new THREE.MeshStandardMaterial(
        {
            map: texture
        })
        wrapAndRepeatTextureFloor(material.map);

        
        //mesh
        const meshFloor = new THREE.Mesh(geometry, material);
        meshFloor.position.y=-0.5;
        meshFloor.receiveShadow = true;
        meshFloor.rotation.x = -Math.PI / 2;
        scene.add(meshFloor);
    }

    function wrapAndRepeatTextureFloor (map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.x = map.repeat.y = 20;
    }



    //LIGHTS
    function lighting() {
        //ambient light
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        //directional light
        const dirLight = new THREE.DirectionalLight(0xDD8B41, 0.8);
        dirLight.position.set(-120, 80, 0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = - 50;
        dirLight.shadow.camera.left = - 50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        scene.add(dirLight);
    }

    //MORE LIGHTS
    function torch(lightPos) {
        //mesh
        var model = torchModel.clone();
        model.position.set(lightPos.x, lightPos.y-1, lightPos.z);   //struggling to generalize z so the light is always inside the torch
        //model.position.set(0, 4, 30);
        scene.add(model);

        //light
        const light = new THREE.PointLight( 'orange', 1, 10, 2);
        light.castShadow = true;
        light.position.copy(lightPos);
        scene.add(light); 
    }


    //WALL MAKER
    function wall(startPoint, endPoint) {
        const wallSize = new THREE.Vector3(Math.abs(endPoint.x-startPoint.x), Math.abs(endPoint.y-startPoint.y), Math.abs(endPoint.z-startPoint.z));
        const wallPos = new THREE.Vector3((endPoint.x+startPoint.x)/2, (endPoint.y+startPoint.y)/2, (endPoint.z+startPoint.z)/2);


        const geometry = new THREE.BoxGeometry(wallSize.x, wallSize.y, wallSize.z);
        //const materialWall = new THREE.MeshBasicMaterial( { color: 0x404040} ); //placeholder if no texture
        
        //mesh
        const meshWall = new THREE.Mesh(geometry, materialWall);
        meshWall.position.copy(wallPos);
        meshWall.castShadow = true;
        meshWall.receiveShadow = true;
        scene.add(meshWall);

        //bounding box
        const bbWall = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        bbWall.setFromObject(meshWall);

        boundingBoxes.push({mesh: meshWall, boundingBox: bbWall});
    }

    function wrapAndRepeatTextureWall (map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.x = 3;
        map.repeat.y = 1;
    }
}