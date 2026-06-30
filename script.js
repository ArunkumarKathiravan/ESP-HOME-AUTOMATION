/*=========================================================
 SMART HOME AUTOMATION V2
 Part 3A
 Developed by Arunkumar
=========================================================*/

/*==========================
 Firebase Configuration
==========================*/

const firebaseConfig = {

  apiKey: "AIzaSyDOWMHv22hZjSDP1EwVGuJM8Oj5NIzAIpo",

  authDomain: "esp-32-home-automation-f158c.firebaseapp.com",

  databaseURL: "https://esp-32-home-automation-f158c-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "esp-32-home-automation-f158c",

  storageBucket: "esp-32-home-automation-f158c.firebasestorage.app",

  messagingSenderId: "1029711889803",

  appId: "1:1029711889803:web:69d4dd39dcde60ebb71b8e"

};

/*==========================
 Initialize Firebase
==========================*/

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

/*==========================
 HTML Elements
==========================*/

// Fan

const fanSwitch = document.getElementById("fanSwitch");
const fanState = document.getElementById("fanState");

// Light 1

const light1Switch = document.getElementById("light1Switch");
const light1State = document.getElementById("light1State");

// Socket

const socketSwitch = document.getElementById("socketSwitch");
const socketState = document.getElementById("socketState");

// Light 2

const light2Switch = document.getElementById("light2Switch");
const light2State = document.getElementById("light2State");

// Status

const wifiStatus = document.getElementById("wifiStatus");
const firebaseStatus = document.getElementById("firebaseStatus");
const espStatus = document.getElementById("espStatus");
const lastUpdate = document.getElementById("lastUpdate");

// Summary

const runningCount = document.getElementById("runningCount");
const operationCount = document.getElementById("operationCount");

/*==========================
 Live Date & Time
==========================*/

function updateClock(){

    const now = new Date();

    document.getElementById("date").innerHTML =
        now.toDateString();

    document.getElementById("time").innerHTML =
        now.toLocaleTimeString();

}

setInterval(updateClock,1000);

updateClock();

/*==========================
 Firebase Status
==========================*/

firebaseStatus.innerHTML="Connecting...";

database.ref(".info/connected").on("value",(snap)=>{

    if(snap.val()){

        firebaseStatus.innerHTML="Connected";

        firebaseStatus.style.color="#22c55e";

    }

    else{

        firebaseStatus.innerHTML="Disconnected";

        firebaseStatus.style.color="red";

    }

});

/*==========================
 WiFi Status
==========================*/

wifiStatus.innerHTML="Online";

wifiStatus.style.color="#22c55e";

/*==========================
 ESP32 Online Detection
==========================*/

database.ref("system/espOnline").on("value",(snapshot)=>{

    if(snapshot.exists()){

        if(snapshot.val()==true){

            espStatus.innerHTML="Online";

            espStatus.style.color="#22c55e";

        }

        else{

            espStatus.innerHTML="Offline";

            espStatus.style.color="red";

        }

    }

    else{

        espStatus.innerHTML="Unknown";

        espStatus.style.color="orange";

    }

});

/*==========================
 Update Time
==========================*/

function updateLastTime(){

    const t=new Date();

    lastUpdate.innerHTML=t.toLocaleTimeString();

}

/*==========================
 Running Devices
==========================*/

let running=0;

function calculateRunning(){

running=0;

if(fanSwitch.checked) running++;

if(light1Switch.checked) running++;

if(socketSwitch.checked) running++;

if(light2Switch.checked) running++;

runningCount.innerHTML=running;

}

/*==========================
 Console
==========================*/

console.log("Smart Home Automation V2 Loaded");

console.log("Firebase Connected");

/*==========================
 End Part 3A
==========================*/

/*==========================
 Hide Loading Screen
==========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

        }, 500);

    }

});

/*==========================================================
 SMART HOME AUTOMATION V2
 Part 4D
 WEBSITE SIMULATION MODE
==========================================================*/

const SIMULATION_MODE = true;

/*=========================
 SIMULATE ESP32
=========================*/

if (SIMULATION_MODE) {

    console.log("Simulation Mode Enabled");

    database.ref("SmartHome/system").update({

        espOnline: true,
        firmwareVersion: "Simulation V1.0",
        wifiRSSI: -45,
        uptime: 0,
        lastSeen: Date.now()

    });

}

/*=========================
 UPDATE LAST SEEN
=========================*/

setInterval(() => {

    if (SIMULATION_MODE) {

        database.ref("SmartHome/system").update({

            lastSeen: Date.now(),

            uptime: Math.floor(Date.now()/1000)

        });

    }

},5000);
