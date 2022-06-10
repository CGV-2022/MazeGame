import {Level1} from '../js/Levels/Level1.js';
import {Level2} from '../js/Levels/Level2.js';
import {Level3} from '../js/Levels/Level3.js';
import {Level4} from '../js/Levels/Level4.js';


//document.getElementById("0").addEventListener("click", (event) => {
  //  removeMenu2();
    //Level0();
        
//}, false); 
document.getElementById("0").onclick = function () {
    removeMenu2();
    togglePopup();
}

document.getElementById("1").onclick = function () {
    removeMenu2();
    Level2();
}

document.getElementById("2").onclick = function () {
    removeMenu2();
    Level3();
}

document.getElementById("3").onclick = function () {
    removeMenu2();
    Level4();
}

function togglePopup(){
    document.getElementById("popup-1").classList.toggle("active");
}

function closePopup(){
    document.getElementById("popup-1").remove();
   
}

document.getElementById("closePopup").addEventListener("click", (event) => {
    closePopup();
    Level1();

}, false);

document.getElementById("3").addEventListener("click", (event) => {
    removeMenu();
    Level4();

}, false);




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
    location.href = "buttonRestart1.html";
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

document.getElementById("btnMainLR").onclick = function () {
    location.href = "buttonRestart1.html";
};

document.getElementById("btnMainLR2").onclick = function () {
    location.href = "buttonRestart2.html";
};

document.getElementById("btnMainLR3").onclick = function () {
    location.href = "buttonRestart3.html";
};

document.getElementById("btnMainLR4").onclick = function () {
    location.href = "buttonRestart4.html";
};


//go straight to certain level without having to go through menu
//removeMenu();
//Level0();

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



    





