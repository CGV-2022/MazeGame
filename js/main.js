import {Level0} from './Levels/Level0.js';
import {Level1} from './Levels/Level1.js'; //placeholder for when they are added
import {Level2} from './Levels/Level2.js';
import {Level3} from './Levels/Level3.js';


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
    Level1();
}

document.getElementById("2").onclick = function () {
    removeMenu2();
    Level2();
}

document.getElementById("3").onclick = function () {
    removeMenu2();
    Level3();
}

function togglePopup(){
    document.getElementById("popup-1").classList.toggle("active");
}

function closePopup(){
    document.getElementById("popup-1").remove();
   
}

document.getElementById("closePopup").addEventListener("click", (event) => {
    closePopup();
    Level0();

}, false);

document.getElementById("3").addEventListener("click", (event) => {
    removeMenu();
    Level3();

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



    





