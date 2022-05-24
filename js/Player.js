import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { A, D, DIRECTIONS, S, W} from './KeyboardUtility.js';

export class Player {
    //3D WORLD
    orbitControl;
    camera;
    model;
    mixer;
    animationsMap = new Map(); // Walk, Run, Punch, OnHit, Death, Idle
    
    //GAME LOGIC
    bbPlayer;
    boundingBoxes;
    onHit = false;
    onHitCounter = 0;
    death = false;
    win = false;
    ImSoUnstoppable = false;
    
    //ANIMATION STATE
    currentAction = 'Idle';
    isPunching = false;
    punchTimer = 0;
    onHitTimer = 0;
    
    //TEMPORARY DATA
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuarternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();
    
    //CONSTANTS
    fadeDuration = 0.1;
    runVelocity = 10;
    walkVelocity = 5;


    constructor(model, mixer, animationsMap, orbitControl, camera, boundingBoxes) {
        this.orbitControl = orbitControl;
        this.camera = camera;

        this.model = model;
        this.updateCameraTarget(model.position.x, model.position.z);
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        var idle = this.animationsMap.get('Idle');
        idle.play();

        this.boundingBoxes = boundingBoxes;
        this.bbPlayer = new THREE.Box3().setFromObject(this.model);
    }

    update(delta, keysPressed /*,hitBoxes*/) {                                      //hitboxes will be for when enemies are added
        //if player has been hit, hit counter increases and onHit animation plays
        /*if(this.collides(hitBoxes) && this.ImSoUnstoppable == false) {
                this.onHit = true;
                this.onHitCounter = this.onHitCounter + 1;
        }*/
        
        if(this.onHitCounter>=3) {
            this.death = true;
        }

        if(this.win) {
            this.ImSoUnstoppable = true;
        }


        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true);
        const runKey = 'q';
        const punchKey = 'e';

        var play = 'Idle';                                             //if not about to punch        and    not currently punching
        if (directionPressed == true && keysPressed[runKey] == true && keysPressed[punchKey] == false && this.isPunching==false) {
            play = 'Run';
        } 
        if (directionPressed == true && keysPressed[runKey] == false && keysPressed[punchKey] == false && this.isPunching==false) {
            play = 'Walk';
        } 
        if (keysPressed[punchKey] == true || this.isPunching==true) {
            play = 'Punch';
            this.isPunching=true;
        } 
        if (directionPressed == false && keysPressed[runKey] == false && keysPressed[runKey] == false && this.isPunching==false){
            play = 'Idle';
            this.isPunching=false;
        }
        
        if (this.onHit) {
            play = 'OnHit';
            this.isPunching=false;
        }
        if (this.death) {
            play = 'Death';
            this.isPunching=false;
        }


        //if any animation is interrupted, blend it into the new animation
        if (this.currentAction != play) {
            const toPlay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAction);

            current.fadeOut(this.fadeDuration);
            toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play;
        }

        //if punch animation active
        if (this.isPunching==true) {
            //if punch in progress, do nothing
            if (this.punchTimer < this.animationsMap.get('Punch').getClip().duration) {
                this.punchTimer = this.punchTimer + delta;
            }
            
            //punch done, swap to idle
            else {
                this.punchTimer = 0;
                this.isPunching=false;
                this.animationsMap.get('Punch').reset();
                
                const toPlay = this.animationsMap.get('Idle');
                const current = this.animationsMap.get('Punch');
                
                current.fadeOut(this.fadeDuration);
                toPlay.reset().fadeIn(this.fadeDuration).play();
                this.currentAction = 'Idle';
            }
        }

        //if player was hit
        if (this.currentAction=='OnHit' && this.currentAction!='Death') {
            //if onHit in progress, do nothing
            if (this.onHitTimer < this.animationsMap.get('OnHit').getClip().duration) {
                this.onHitTimer = this.onHitTimer + delta;
            }
            
            //onHit done, swap to idle
            else {
                this.onHitTimer = 0;
                this.onHit = false;
                this.animationsMap.get('OnHit').reset();
                
                const toPlay = this.animationsMap.get('Idle');
                const current = this.animationsMap.get('OnHit');
                
                current.fadeOut(this.fadeDuration);
                toPlay.reset().fadeIn(this.fadeDuration).play();
                this.currentAction = 'Idle';
            }
        }

        this.mixer.update(delta);

        
        if (this.currentAction == 'Run' || this.currentAction == 'Walk') {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z));
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed);

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            // run/walk velocity
            var velocity = 0;
            if (this.currentAction=='Run') {
                velocity = this.runVelocity;
            }

            else {
                velocity = this.walkVelocity;
            }

            // move model & camera
            var moveX = -this.walkDirection.x * velocity * delta;
            var moveZ = -this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            this.bbPlayer = new THREE.Box3().setFromObject(this.model);
            

            //if player is now colliding with another object, move them back
            if (this.collides(this.boundingBoxes)) {
                this.model.position.x -= moveX;
                this.model.position.z -= moveZ;
                this.bbPlayer = new THREE.Box3().setFromObject(this.model);

                moveX = 0;
                moveZ = 0;
            }
             
            this.updateCameraTarget(moveX, moveZ);
        }
    }


    collides(boxes) {
        for (let i = 0; i < boxes.length; i++) {
            var bb = boxes[i].boundingBox;
            
            if (this.bbPlayer.intersectsBox(bb)) {
                return true;
            }
        }
        return false;
    }


    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.position.x += moveX;
        this.camera.position.z += moveZ;

        // update camera target
        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 1;
        this.cameraTarget.z = this.model.position.z;
        this.orbitControl.target = this.cameraTarget;
    }


    directionOffset(keysPressed) {
        var directionOffset = Math.PI; // w

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2; // w+a
            } else if (keysPressed[D]) {
                directionOffset = Math.PI / 4 + Math.PI / 2; // w+d
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = -Math.PI / 4; // s+a
            } else if (keysPressed[D]) {
                directionOffset = Math.PI / 4; // s+d
            } else {
                directionOffset = 0; // s
            }
        } else if (keysPressed[A]) {
            directionOffset = -Math.PI / 2; // a
        } else if (keysPressed[D]) {
            directionOffset = Math.PI / 2; // d
        }

        return directionOffset;
    }
}