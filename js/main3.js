import {Level0} from './Levels/Level0.js';
import {Level1} from './Levels/Level1.js';
import {Level2} from './Levels/Level2.js';



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

document.getElementById("btnMainR").onclick = function () {
    location.href = "buttonRestart1.html"
};

document.getElementById("btnMainR2").onclick = function () {
    location.href = "buttonRestart2.html";
};

document.getElementById("btnMainR3").onclick = function () {
    location.href = "buttonRestart3.html";
};

document.getElementById("btnMainR4").onclick = function () {
    location.href = "buttonRestart4.html";
};




//go straight to certain level without having to go through menu
removeMenu();
Level2();

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