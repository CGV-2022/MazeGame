(function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/GlitchPass.js';

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { Water } from '../../Resources/objects/Water2.js';

import { KeyDisplay } from '../KeyboardUtility.js';
import { Player } from '../Player.js';
import { Enemy } from '../Enemy.js';


export function Level2() {
    RAPIER.init().then(() => {
        Level2Init();
    });

}
function Level2Init() {
    //INIT UI ELEMENTS
    var ps = document.getElementById('Pause12');
    var lt = document.getElementById('LevelTimer');
    const dub = document.getElementById('Win1');
    const loss = document.getElementById('Lose1');

    //TIMER
    var timeLeft = 120;
    var str = "Time remaining: " + timeLeft;
    lt.textContent = str;

    function decrementSeconds() {
        timeLeft = timeLeft - 1;
        str = "Time remaining: " + timeLeft;
        lt.textContent = str;
    }
    var intervalID;
    function startLevelTimer() {
        intervalID = setInterval(decrementSeconds, 1000);
    }
    function stopLevelTimer() {
        clearInterval(intervalID);
    }


    //INIT PHYSICS
    var gravity = { x: 0.0, y: -9.81, z: 0.0 };
    var world = new RAPIER.World(gravity);


    //SHADER
    const _VS = `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    uniform vec2 uFrequency;
    uniform float uTime;
    uniform vec3 mouse;
    
    attribute vec3 position;
    attribute float aRandom;
    attribute vec2 uv;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vTime;
    varying vec3 fMouse;
    
    void main()
    {
      vec4 modelPosition = modelMatrix * vec4(position, 1);
      modelPosition.y += cos(modelPosition.x * 0.61592 +( mouse.x * 2.0375)) * mouse.x * 0.054;
      modelPosition.x += sin(modelPosition.y * 0.61592 +( mouse.y * 2.0375)) * mouse.y * 0.054;
    

      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
    
      gl_Position = projectedPosition;
      vRandom = aRandom;
      vUv = uv;
      vTime = uTime;
      fMouse = mouse;
    }
    `;

    const _FS = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec3 uColor;
    varying float vTime;
    varying vec3 fMouse;
    uniform sampler2D displacement;
    
    varying float vRandom;
    varying vec2 vUv;
    
    void main()
    {
      // gl_FragColor = vec4(0.1+fMouse.x,0.1+fMouse.y, 0.1+ (fMouse.y * fMouse.x), 0.65);
      vec4 displace = texture2D(displacement, vUv.yx);
      vec2 displaceUv = vec2(
        vUv.x,
        vUv.y
        );
    
      displaceUv.y = mix(vUv.y,displace.r - 0.4,fMouse.x);
    
      vec4 textureColor = texture2D(uTexture, displaceUv);
    
      textureColor.r = texture2D(uTexture,displaceUv + vec2(0.,10. * 0.005) * fMouse.yx).r;
      textureColor.g = texture2D(uTexture,displaceUv + vec2(0.,10. * 0.01) * fMouse.yx).g;
      textureColor.b = texture2D(uTexture,displaceUv + vec2(0.,10. * 0.025) * fMouse.yx).b;
    
    
      gl_FragColor = textureColor;
    }
    `;


    //SCENE
    const scene = new THREE.Scene();

    //Skybox
    //used cube geometry to be able to rotate the skybox
    var skyGeo = new THREE.CubeGeometry(1000, 1000, 1000);

    //loading images for the skybox
    var skyMat = [

        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_ft.jpg"), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_bk.jpg"), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_up.jpg"), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_dn.jpg"), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_rt.jpg"), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("Resources/textures/skyboxes/Level2/sleepy/sleepyhollow_lf.jpg"), side: THREE.DoubleSide }),
    ];
    var skyMaterial = new THREE.MeshFaceMaterial(skyMat);
    var sky = new THREE.Mesh(skyGeo, skyMaterial);
    scene.add(sky);


    //CAMERA
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    //camera.position.set(0, 5, 6);                                
    //camera.position.set(0, 150, 0);                            

    //RENDERER
    var options = { antialias: false };
    const renderer = new THREE.WebGLRenderer(options);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;            

    //CONTROLS
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;                        
    orbitControls.enablePan = false;                            
    orbitControls.maxPolarAngle = Math.PI / 1.9;                   
    orbitControls.minDistance = 6;                                  
    orbitControls.maxDistance = 6;                                             
    orbitControls.update();


    //MINIMAP
    const camera2 = new THREE.OrthographicCamera(-10, 10, 10, -10, 0, 100);
    camera2.position.set(0, 20, 0);
    camera2.lookAt(0, 0, 0);
    const renderer2 = new THREE.WebGLRenderer();
    renderer2.setSize(200, 200);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = '70%';
    renderer2.domElement.style.left = '85%';

    const composer = new EffectComposer(renderer2);
    const renderPass = new RenderPass(scene, camera2);
    composer.addPass(renderPass);
    const glitchPass = new GlitchPass();
    composer.addPass(glitchPass);


    //AUDIO
    const listener = new THREE.AudioListener();
    camera.add(listener);

    var levelMusic = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("Resources/media/LevelMusic.mp3", function (buffer) {
        levelMusic.setBuffer(buffer);
        levelMusic.setLoop(true);
        levelMusic.setVolume(0.2);
        levelMusic.play();
    });

    var battleMusic = new THREE.Audio(listener);
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load("Resources/media/BattleMusic.mp3", function (buffer) {
        battleMusic.setBuffer(buffer);
        battleMusic.setLoop(true);
        battleMusic.setVolume(0.2);
    });


    //LIGHTS
    mainLighting();


    //MOON SHADER
    const texLoad = new THREE.TextureLoader();
    const textureS = texLoad.load('Resources/textures/moon/moonColourMap.jpeg');
    const textureD = texLoad.load('Resources/textures/moon/moonBumpMap.jpeg');
    const material1 = new THREE.RawShaderMaterial({
        vertexShader: _VS,
        fragmentShader: _FS,
        transparent: true,
        uniforms:
        {
            uFrequency: { value: new THREE.Vector2(10, 5) },
            uTime: { value: 0 },
            mouse: { value: new THREE.Vector3() },
            uTexture: { value: textureS },
            displacement: { value: textureD },
            uColor: { value: new THREE.Color('#ffffff') }
        }
    });
    textureD.wrapS = textureD.wrapT = THREE.RepeatWrapping;
    textureS.wrapS = textureS.wrapT = THREE.RepeatWrapping;

    //moon shape and material
    const moonGeo = new THREE.SphereGeometry(15, 40, 20);
    const moonMesh = new THREE.Mesh(moonGeo, material1);
    moonMesh.position.set(50, 30, 40);
    moonMesh.castShadow = true;
    sky.add(moonMesh);

    //planet
    const planetLoad = new THREE.TextureLoader();
    //planet image load
    const planetTexture = planetLoad.load('Resources/textures/sphere/galaxy.jpeg');
    //planet size
    const planetGeom = new THREE.SphereGeometry(6, 32, 32);
    //sphere material
    const planetMat = new THREE.MeshStandardMaterial({ map: planetTexture });
    //creation on planet
    var Planet = new THREE.Mesh(planetGeom, planetMat);
    Planet.position.set(-30, 25, -50);
    Planet.castShadow = true;
    //added to sky to be able to rotate with skybox
    sky.add(Planet);


    //OBJECTS
    var rigidBodies = [];  //contains dynamic rigid bodies whose mesh needs to be updated


    //ramp
    const sandTextureLoader = new THREE.TextureLoader();
    const sandTexture = sandTextureLoader.load("Resources/textures/floors/ground_sand.jpg");

    const WIDTH = 10;
    const HEIGHT = 1;
    const LENGTH = 40;
    const geomRamp = new THREE.BoxGeometry(WIDTH, HEIGHT, LENGTH);
    const matRamp = new THREE.MeshStandardMaterial({ map: sandTexture });
    wrapAndRepeatTextureRamp(matRamp.map);


    //Floor
    floor();

    //Water
    waterFeature();

    //Walls
    //texture
    const textureLoader = new THREE.TextureLoader();
    const marble = textureLoader.load("Resources/textures/walls/ancient.jpg");
    const materialWall = new THREE.MeshStandardMaterial({ map: marble, side: THREE.DoubleSide });
    wrapAndRepeatTextureWall(materialWall.map);

    //maze walls
    //outer
    wall(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 10, -49));
    wall(new THREE.Vector3(50, 0, -49), new THREE.Vector3(49, 10, 50));
    wall(new THREE.Vector3(49, 0, 50), new THREE.Vector3(-50, 10, 49));
    wall(new THREE.Vector3(-50, 0, 49), new THREE.Vector3(-49, 10, -49));

    //inner
    //vertical
    wall(new THREE.Vector3(-35, 0, -40), new THREE.Vector3(-34, 5, 50));

    wall(new THREE.Vector3(-18, 0, -17), new THREE.Vector3(-17, 5, 1));
    wall(new THREE.Vector3(-18, 0, 40), new THREE.Vector3(-17, 5, 20));

    wall(new THREE.Vector3(0, 0, -50), new THREE.Vector3(1, 5, -16));

    wall(new THREE.Vector3(18, 0, 50), new THREE.Vector3(19, 5, 40));
    wall(new THREE.Vector3(18, 0, -40), new THREE.Vector3(19, 5, 0));

    wall(new THREE.Vector3(35, 0, 40), new THREE.Vector3(36, 5, 0));


    //horizontal
    wall(new THREE.Vector3(-35, 0, -40), new THREE.Vector3(-15, 5, -39));
    wall(new THREE.Vector3(18, 0, -40), new THREE.Vector3(40, 5, -39));

    wall(new THREE.Vector3(-18, 0, -18), new THREE.Vector3(0, 5, -16));
    wall(new THREE.Vector3(30, 0, -18), new THREE.Vector3(50, 5, -16));

    wall(new THREE.Vector3(-17, 0, 0), new THREE.Vector3(35, 5, 1));

    wall(new THREE.Vector3(0, 0, 18), new THREE.Vector3(36, 5, 16));

    wall(new THREE.Vector3(-17, 0, 39), new THREE.Vector3(19, 5, 40));



    //player model with animations
    var player;
    const loaderPlayer = new FBXLoader();
    loaderPlayer.setPath('Resources/models/Rosales/');

    loaderPlayer.load('Kachujin_G_Rosales.fbx', (fbx) => {
        //mesh
        const model = fbx;
        fbx.scale.setScalar(0.01);
        fbx.traverse(c => {
            c.castShadow = true;
        });
        model.rotation.y = -Math.PI;
        scene.add(model);

        //rigid body                                                               
        //player initial position
        var bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(20, 0.9, 30);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, model.rotation.y, 0, 'XYZ'));
        bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
        var rigidBody = world.createRigidBody(bodyDesc);
        var dynamicCollider = RAPIER.ColliderDesc.ball(0.9);
        world.createCollider(dynamicCollider, rigidBody);



        //load animations, store in map and add to mixer
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map();

        const manager = new THREE.LoadingManager();
        manager.onLoad = function () { //when all animations have been loaded
            //pass model, mixer and animations to character controller
            player = new Player(model, mixer, animationsMap, orbitControls, camera, camera2, rigidBody,
                new RAPIER.Ray(
                    rigidBody.translation(),
                    { x: 0, y: -1, z: 0 }
                ),
                new RAPIER.Ray(
                    rigidBody.translation(),
                    { x: 0, y: 0, z: -1 }
                )
            );
            startLevelTimer();
        };


        //load animations
        const loaderAnimations = new FBXLoader(manager);
        loaderAnimations.setPath('Resources/models/Rosales/');
        loaderAnimations.load('Idle.fbx', (a) => { OnLoad('Idle', a); });
        loaderAnimations.load('Walk.fbx', (a) => { OnLoad('Walk', a); });
        loaderAnimations.load('Run.fbx', (a) => { OnLoad('Run', a); });
        loaderAnimations.load('Punch.fbx', (a) => { OnLoad('Punch', a); });
        loaderAnimations.load('OnHit.fbx', (a) => { OnLoad('OnHit', a); });
        loaderAnimations.load('Death.fbx', (a) => { OnLoad('Death', a); });

        const OnLoad = (animName, anim) => {
            const clip = anim.animations[0];
            const animAction = mixer.clipAction(clip);

            //make death animation not loop when it's done
            if (animName == 'Death') {
                animAction.loop = THREE.LoopOnce;
                animAction.clampWhenFinished = true;
            }

            animationsMap.set(animName, animAction);
        };
    });



    //enemy model with animations
    var enemy;
    const loaderEnemy = new FBXLoader();
    loaderEnemy.setPath('Resources/models/Paladin/');

    loaderEnemy.load('WProp_J_Nordstrom.fbx', (fbx) => {
        //mesh
        const model = fbx;
        fbx.scale.setScalar(0.015);
        fbx.traverse(c => {
            c.castShadow = true;
        });
        scene.add(model);


        //rigid body                                                                
        //enemy initial position
        var bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-10, 0.5, -10);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, model.rotation.y, 0, 'XYZ'));
        bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
        var rigidBody = world.createRigidBody(bodyDesc);
        var dynamicCollider = RAPIER.ColliderDesc.ball(1.1);
        world.createCollider(dynamicCollider, rigidBody);



        //load animations, store in map and add to mixer
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map();

        //load animations
        const loaderAnimations = new FBXLoader();
        loaderAnimations.setPath('Resources/models/Paladin/');
        loaderAnimations.load('Idle.fbx', (a) => { OnLoad('Idle', a); });
        loaderAnimations.load('Walk.fbx', (a) => { OnLoad('Walk', a); });
        loaderAnimations.load('Slash.fbx', (a) => { OnLoad('Slash', a); });
        loaderAnimations.load('Impact.fbx', (a) => { OnLoad('OnHit', a); });
        loaderAnimations.load('Death.fbx', (a) => { OnLoad('Death', a); });

        const OnLoad = (animName, anim) => {
            const clip = anim.animations[0];
            const animAction = mixer.clipAction(clip);
            //make death animation not loop when it's done
            if (animName == 'Death') {
                animAction.loop = THREE.LoopOnce;
                animAction.clampWhenFinished = true;
            }


            animationsMap.set(animName, animAction);
            if (animName == 'Death') { //if all animations have been loaded
                //make enemy object
                enemy = new Enemy(model, mixer, animationsMap, rigidBody,
                    new RAPIER.Ray(
                        rigidBody.translation(),
                        { x: 0, y: -1, z: 0 }
                    ),
                    new RAPIER.Ray(
                        rigidBody.translation(),
                        { x: 0, y: 0, z: 1 }
                    )
                );
            }
        };
    });



    //PLAYER CONTROLS
    const keysPressed = { 'w': false, 'a': false, 's': false, 'd': false, 'q': false, 'e': false };
    const keyDisplayQueue = new KeyDisplay();

    document.addEventListener('keydown', (event) => {
        keyDisplayQueue.down(event.key);
        keysPressed[event.key.toLowerCase()] = true;

    }, false);
    document.addEventListener('keyup', (event) => {
        keyDisplayQueue.up(event.key);
        keysPressed[event.key.toLowerCase()] = false;

    }, false);


    //3RD AND 1ST PERSON
    var firstPerson = false;
    document.addEventListener('keypress', (event) => {
        if (event.key.toLowerCase() == 't' && player) {
            firstPerson = !firstPerson;

            if (firstPerson == true) {
                camera.position.set(player.model.position.x, player.model.position.y + 3, player.model.position.z - 1.5);
                orbitControls.minDistance = 0;
                orbitControls.maxDistance = 0.6;
                player.firstPerson = true;

            }
            else {
                camera.position.set(0, 5, 6);
                orbitControls.minDistance = 6;
                orbitControls.maxDistance = 7;
                player.firstPerson = false;
            }
        }

        if (event.key.toLowerCase() == 'r' && player) {


        }
    }, false);


    //PAUSE CONTROLS AND CLOCK INITIALIZATION
    const clock = new THREE.Clock();
    var paused = false;
    document.addEventListener('keypress', (event) => {
        if (event.key.toLowerCase() == 'p') {
            paused = !paused;

            if (paused) {
                stopLevelTimer();
                clock.stop();
                ps.style.display = 'flex';

            }
            else {
                startLevelTimer();
                clock.start();
                ps.style.display = 'none';
            }
        }

    }, false);

    
    //WHAT HAPPENS ON EACH UPDATE
    function animate() {
        if (!paused) {
            var deltaTime = clock.getDelta();
            sky.rotation.y += 0.002;


            if (enemy && player) {
                player.update(world, deltaTime, keysPressed, enemy);
                enemy.update(world, deltaTime, player);

                if (enemy.death == true) {                                          //if player kills enemy, they win and are invincible
                    stopLevelTimer();
                    dub.style.display = 'flex';

                    player.win = true;

                    battleMusic.pause();
                    levelMusic.pause();
                }
                if (timeLeft <= 0 || player.death == true) {                         //if time runs out or they were killed they die
                    stopLevelTimer();
                    player.death = true; //if timer runs out need to do this

                    loss.style.display = 'flex';

                    battleMusic.pause();
                    levelMusic.pause();
                }

                //if spawn point must change when player reaches a certain location
                if (player.model.position.z < -50) {
                    player.spawnPoint.set(0, 0.9, -52);
                }

                //play battle music when enemy is close
                if(player.model.position.distanceTo(enemy.model.position) < 20 && levelMusic.isPlaying) {
                    levelMusic.pause();
                    battleMusic.play();
                }
            }

            world.step(); //run physics simulation
            for (let i = 0; i < rigidBodies.length; i++) {
                //update the mesh to match the new position of the rigid body
                let position = rigidBodies[i].rigid.translation();
                let rotation = rigidBodies[i].rigid.rotation();

                rigidBodies[i].mesh.position.x = position.x;
                rigidBodies[i].mesh.position.y = position.y;
                rigidBodies[i].mesh.position.z = position.z;
                rigidBodies[i].mesh.setRotationFromQuaternion(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w));
            }
        }


        orbitControls.update();
        renderer.render(scene, camera);
        composer.render();
        requestAnimationFrame(animate);
    }
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(renderer2.domElement);
    animate();



    //HELPER FUNCTIONS
    //RESIZE HANDLER
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);


    //LIGHTS
    function mainLighting() {
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


    //REPEATING TEXTURES
    function wrapAndRepeatTextureFloor(map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.x = map.repeat.y = 20;
    }

    function wrapAndRepeatTextureWall(map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.x = 3;
        map.repeat.y = 1;
    }

    function wrapAndRepeatTextureRamp(map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.x = 3;
        map.repeat.y = 3;
    }


    //FLOOR
    function floor() {
        //textures
        const textureLoader = new THREE.TextureLoader();
        //const texture = textureLoader.load("Resources/textures/floors/placeholder.png");
        const texture = textureLoader.load("Resources/textures/floors/clay.jpg");

        //dimensions
        const WIDTH = 100;
        const HEIGHT = 1;
        const LENGTH = 100;

        const geometry = new THREE.BoxGeometry(WIDTH, HEIGHT, LENGTH);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        wrapAndRepeatTextureFloor(material.map);


        //mesh
        const meshFloor = new THREE.Mesh(geometry, material);
        meshFloor.position.y = -0.5;
        meshFloor.receiveShadow = true;
        scene.add(meshFloor);

        //rigid body
        var bodyDesc = RAPIER.RigidBodyDesc.fixed();
        bodyDesc.setCanSleep(true);
        bodyDesc.setTranslation(meshFloor.position.x, meshFloor.position.y, meshFloor.position.z);
        const rigidBody = world.createRigidBody(bodyDesc);
        var collider = RAPIER.ColliderDesc.cuboid(WIDTH * 0.5, HEIGHT * 0.5, LENGTH * 0.5);
        world.createCollider(collider, rigidBody);
    }


    //WALLS
    function wall(startPoint, endPoint) {
        const wallSize = new THREE.Vector3(Math.abs(endPoint.x - startPoint.x), Math.abs(endPoint.y - startPoint.y), Math.abs(endPoint.z - startPoint.z));
        const wallPos = new THREE.Vector3((endPoint.x + startPoint.x) / 2, (endPoint.y + startPoint.y) / 2, (endPoint.z + startPoint.z) / 2);

        const geometry = new THREE.BoxGeometry(wallSize.x, wallSize.y, wallSize.z);

        //mesh
        const meshWall = new THREE.Mesh(geometry, materialWall);
        meshWall.position.copy(wallPos);
        meshWall.castShadow = true;
        meshWall.receiveShadow = true;
        scene.add(meshWall);

        //rigid body
        var bodyDesc = RAPIER.RigidBodyDesc.fixed();
        bodyDesc.setCanSleep(true);
        bodyDesc.setTranslation(meshWall.position.x, meshWall.position.y, meshWall.position.z);
        const rigidBody = world.createRigidBody(bodyDesc);
        var collider = RAPIER.ColliderDesc.cuboid(wallSize.x * 0.5, wallSize.y * 0.5, wallSize.z * 0.5);
        world.createCollider(collider, rigidBody);
    }



    //Water feature
    function waterFeature() {
        //water geometry shape
        const waterGeometry = new THREE.BoxGeometry(20, 19, 1);

        //flow map used to navigate the direction on water flow
        const flowTextureLoader = new THREE.TextureLoader();
        const flowMap = flowTextureLoader.load('Resources/textures/water/flowmap.jpeg');


        //properties for water feature
        const water = new Water(waterGeometry, {
            scale: 1,
            color: 0x09F9F0,
            textureWidth: 512,
            textureHeight: 512,
            flowMap: flowMap,

        });

        //setting feature position
        water.position.y = 0.2;
        water.position.x = -7;
        water.position.z = 30;
        water.rotation.x = Math.PI * - 0.5;

        scene.add(water);
    }   
}