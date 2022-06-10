import {Level1} from '../js/Levels/Level1.js';
import {Level2} from '../js/Levels/Level2.js';
import {Level3} from '../js/Levels/Level3.js';
import {Level4} from '../js/Levels/Level4.js';

document.getElementById("btnMainP").onclick = function () {
    location.href = "index.html";
};

document.getElementById("btnMainL").onclick = function () {
    location.href = "index.html";
};

document.getElementById("btnMainW").onclick = function () {
    location.href = "index.html";
};

document.getElementById("btnMainW2").onclick = function () {
    location.href = "index.html";
};



document.getElementById("btnMainR4").onclick = function () {
    location.href = "buttonRestart4.html";
};




//go straight to certain level without having to go through menu
removeMenu();
Level4();

//need to add the menu items back when player exits level
function generateMenu() {
    
}

function removeMenu() {
    document.getElementById("GameName").remove();
    document.getElementById("Parent").remove();
}

function removeMenu2() {
    document.getElementById("Parent2").remove();
    
}