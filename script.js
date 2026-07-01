/*=========================================================
 SMART HOME AUTOMATION V2
 SCRIPT.JS
 PART A
 Developed for Arunkumar
=========================================================*/

/*=========================================================
 FIREBASE CONFIGURATION
=========================================================*/

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_AUTH_DOMAIN",

    databaseURL: "YOUR_DATABASE_URL",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_STORAGE_BUCKET",

    messagingSenderId: "YOUR_SENDER_ID",

    appId: "YOUR_APP_ID"

};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

/*=========================================================
 PROJECT INFORMATION
=========================================================*/

const PROJECT_NAME="ESP32 Smart Home V2";

const VERSION="2.0.0";

console.log(PROJECT_NAME);

console.log("Version :",VERSION);

/*=========================================================
 DEVICE INFORMATION
=========================================================*/

const DEVICES={

    fan:"fan",

    light1:"light1",

    socket:"socket",

    light2:"light2"

};

/*=========================================================
 DATABASE REFERENCES
=========================================================*/

const rootRef=database.ref("SmartHome");

const deviceRef=rootRef.child("devices");

const systemRef=rootRef.child("system");

const statisticsRef=rootRef.child("statistics");

const historyRef=rootRef.child("history");

/*=========================================================
 DEVICE REFERENCES
=========================================================*/

const fanRef=deviceRef.child("fan");

const light1Ref=deviceRef.child("light1");

const socketRef=deviceRef.child("socket");

const light2Ref=deviceRef.child("light2");

/*=========================================================
 HTML ELEMENTS
=========================================================*/

const fanSwitch=document.getElementById("fanSwitch");

const light1Switch=document.getElementById("light1Switch");

const socketSwitch=document.getElementById("socketSwitch");

const light2Switch=document.getElementById("light2Switch");

const fanState=document.getElementById("fanState");

const light1State=document.getElementById("light1State");

const socketState=document.getElementById("socketState");

const light2State=document.getElementById("light2State");

const espStatus=document.getElementById("espStatus");

const firebaseStatus=document.getElementById("firebaseStatus");

const wifiStatus=document.getElementById("wifiStatus");

const runningCount=document.getElementById("runningCount");

const operationCount=document.getElementById("operationCount");

const historyContainer=document.getElementById("historyContainer");

const notificationContainer=document.getElementById("notificationContainer");

/*=========================================================
 GLOBAL VARIABLES
=========================================================*/

let fan=false;

let light1=false;

let socket=false;

let light2=false;

let totalRunning=0;

let totalOperations=0;

let firebaseConnected=false;

let espConnected=false;

/*=========================================================
 FIREBASE CONNECTION
=========================================================*/

database.ref(".info/connected").on("value",(snap)=>{

    firebaseConnected=snap.val();

    if(firebaseConnected){

        firebaseStatus.innerHTML="Connected";

        firebaseStatus.style.color="#22c55e";

    }else{

        firebaseStatus.innerHTML="Disconnected";

        firebaseStatus.style.color="#ef4444";

    }

});

/*=========================================================
 ESP STATUS
=========================================================*/

systemRef.child("espOnline").on("value",(snap)=>{

    if(snap.exists()){

        espConnected=snap.val();

        if(espConnected){

            espStatus.innerHTML="Online";

            espStatus.style.color="#22c55e";

        }else{

            espStatus.innerHTML="Offline";

            espStatus.style.color="#ef4444";

        }

    }

});

/*=========================================================
 WIFI STATUS
=========================================================*/

systemRef.child("wifiRSSI").on("value",(snap)=>{

    if(!snap.exists()) return;

    const rssi=snap.val();

    wifiStatus.innerHTML=rssi+" dBm";

});

/*=========================================================
 STARTUP
=========================================================*/

console.log("Firebase Ready");

console.log("Realtime Database Ready");

console.log("Part A Loaded");

/*=========================================================
 SMART HOME AUTOMATION V2
 SCRIPT.JS
 PART B
 DEVICE SYNCHRONIZATION
=========================================================*/

/*=========================================================
 DEVICE UI UPDATE
=========================================================*/

function updateDeviceUI(deviceName, state){

    switch(deviceName){

        case "fan":

            fan = state;
            fanSwitch.checked = state;
            fanState.innerHTML = state ? "ON" : "OFF";

        break;

        case "light1":

            light1 = state;
            light1Switch.checked = state;
            light1State.innerHTML = state ? "ON" : "OFF";

        break;

        case "socket":

            socket = state;
            socketSwitch.checked = state;
            socketState.innerHTML = state ? "ON" : "OFF";

        break;

        case "light2":

            light2 = state;
            light2Switch.checked = state;
            light2State.innerHTML = state ? "ON" : "OFF";

        break;

    }

    calculateRunningDevices();

}

/*=========================================================
 RUNNING DEVICES
=========================================================*/

function calculateRunningDevices(){

    let count = 0;

    if(fan) count++;

    if(light1) count++;

    if(socket) count++;

    if(light2) count++;

    totalRunning = count;

    runningCount.innerHTML = count;

}

/*=========================================================
 FIREBASE WRITE
=========================================================*/

function setDevice(deviceName,state,source="web"){

    updateDeviceUI(deviceName,state);

    deviceRef.child(deviceName).update({

        state:state,

        source:source,

        lastUpdated:Date.now()

    });

}

/*=========================================================
 REALTIME LISTENERS
=========================================================*/

fanRef.child("state").on("value",(snap)=>{

    if(snap.exists()){

        updateDeviceUI("fan",snap.val());

    }

});

light1Ref.child("state").on("value",(snap)=>{

    if(snap.exists()){

        updateDeviceUI("light1",snap.val());

    }

});

socketRef.child("state").on("value",(snap)=>{

    if(snap.exists()){

        updateDeviceUI("socket",snap.val());

    }

});

light2Ref.child("state").on("value",(snap)=>{

    if(snap.exists()){

        updateDeviceUI("light2",snap.val());

    }

});

/*=========================================================
 SWITCH EVENTS
=========================================================*/

fanSwitch.addEventListener("change",()=>{

    setDevice("fan",fanSwitch.checked,"web");

});

light1Switch.addEventListener("change",()=>{

    setDevice("light1",light1Switch.checked,"web");

});

socketSwitch.addEventListener("change",()=>{

    setDevice("socket",socketSwitch.checked,"web");

});

light2Switch.addEventListener("change",()=>{

    setDevice("light2",light2Switch.checked,"web");

});

/*=========================================================
 OPERATION COUNTER
=========================================================*/

function increaseOperationCounter(){

    totalOperations++;

    operationCount.innerHTML = totalOperations;

}

fanSwitch.addEventListener("change",increaseOperationCounter);

light1Switch.addEventListener("change",increaseOperationCounter);

socketSwitch.addEventListener("change",increaseOperationCounter);

light2Switch.addEventListener("change",increaseOperationCounter);

console.log("Part B Loaded");
/*=========================================================
 SMART HOME AUTOMATION V2
 SCRIPT.JS
 PART C
 HISTORY • STATISTICS • NOTIFICATIONS
=========================================================*/

/*=========================================================
 DEVICE RUNTIME
=========================================================*/

const runtime={

    fan:0,

    light1:0,

    socket:0,

    light2:0

};

const onCounter={

    fan:0,

    light1:0,

    socket:0,

    light2:0

};

/*=========================================================
 NOTIFICATION
=========================================================*/

function showNotification(message){

    console.log(message);

    if(notificationContainer){

        const div=document.createElement("div");

        div.className="notification";

        div.innerHTML=message;

        notificationContainer.prepend(div);

        setTimeout(()=>{

            div.remove();

        },5000);

    }

}

/*=========================================================
 HISTORY
=========================================================*/

function addHistory(device,state,source){

    const data={

        device:device,

        state:state?"ON":"OFF",

        source:source,

        time:Date.now()

    };

    historyRef.push(data);

    if(historyContainer){

        const card=document.createElement("div");

        card.className="historyCard";

        card.innerHTML=`

        <strong>${device}</strong><br>

        ${state?"ON":"OFF"}<br>

        ${source}<br>

        ${new Date().toLocaleTimeString()}

        `;

        historyContainer.prepend(card);

    }

}

/*=========================================================
 SAVE STATISTICS
=========================================================*/

function saveStatistics(){

    statisticsRef.set({

        runningDevices:totalRunning,

        totalOperations:totalOperations,

        runtime:runtime,

        onCounter:onCounter,

        updated:Date.now()

    });

}

/*=========================================================
 RUNTIME TIMER
=========================================================*/

setInterval(()=>{

    if(fan) runtime.fan++;

    if(light1) runtime.light1++;

    if(socket) runtime.socket++;

    if(light2) runtime.light2++;

    saveStatistics();

},1000);

/*=========================================================
 DEVICE EVENT
=========================================================*/

function deviceChanged(device,state,source){

    if(state){

        onCounter[device]++;

    }

    addHistory(device,state,source);

    showNotification(

        device.toUpperCase()+" "+

        (state?"ON":" OFF")+" via "+source

    );

    saveStatistics();

}

/*=========================================================
 LISTEN FOR SOURCE
=========================================================*/

fanRef.on("value",(snap)=>{

    if(!snap.exists()) return;

    const d=snap.val();

    deviceChanged("fan",d.state,d.source);

});

light1Ref.on("value",(snap)=>{

    if(!snap.exists()) return;

    const d=snap.val();

    deviceChanged("light1",d.state,d.source);

});

socketRef.on("value",(snap)=>{

    if(!snap.exists()) return;

    const d=snap.val();

    deviceChanged("socket",d.state,d.source);

});

light2Ref.on("value",(snap)=>{

    if(!snap.exists()) return;

    const d=snap.val();

    deviceChanged("light2",d.state,d.source);

});

/*=========================================================
 DASHBOARD SUMMARY
=========================================================*/

setInterval(()=>{

    runningCount.innerHTML=totalRunning;

    operationCount.innerHTML=totalOperations;

},500);

console.log("Part C Loaded");

/*=========================================================
 SMART HOME AUTOMATION V2
 SCRIPT.JS
 PART D
 PERFORMANCE • CONNECTION • UI
 Developed for Arunkumar
=========================================================*/

/*=========================================================
 CONNECTION MONITOR
=========================================================*/

let internetConnected = navigator.onLine;

window.addEventListener("online",()=>{

    internetConnected=true;

    showNotification("Internet Connected");

    firebaseStatus.innerHTML="Connected";

    firebaseStatus.style.color="#22c55e";

});

window.addEventListener("offline",()=>{

    internetConnected=false;

    showNotification("Internet Disconnected");

    firebaseStatus.innerHTML="Offline";

    firebaseStatus.style.color="#ef4444";

});

/*=========================================================
 ESP HEARTBEAT
=========================================================*/

let lastHeartbeat=0;

systemRef.child("lastSeen").on("value",(snap)=>{

    if(!snap.exists()) return;

    lastHeartbeat=snap.val();

});

setInterval(()=>{

    const now=Date.now();

    if(now-lastHeartbeat<15000){

        espStatus.innerHTML="Online";

        espStatus.style.color="#22c55e";

    }

    else{

        espStatus.innerHTML="Offline";

        espStatus.style.color="#ef4444";

    }

},3000);

/*=========================================================
 WIFI SIGNAL
=========================================================*/

systemRef.child("wifiRSSI").on("value",(snap)=>{

    if(!snap.exists()) return;

    const rssi=snap.val();

    wifiStatus.innerHTML=rssi+" dBm";

    if(rssi>-60){

        wifiStatus.style.color="#22c55e";

    }

    else if(rssi>-75){

        wifiStatus.style.color="#f59e0b";

    }

    else{

        wifiStatus.style.color="#ef4444";

    }

});

/*=========================================================
 CARD ANIMATION
=========================================================*/

function animateCard(card){

    if(!card) return;

    card.style.transform="scale(0.97)";

    setTimeout(()=>{

        card.style.transform="scale(1)";

    },120);

}

/*=========================================================
 FAST DEVICE UPDATE
=========================================================*/

function fastUI(device,state){

    updateDeviceUI(device,state);

    switch(device){

        case "fan":

            animateCard(document.getElementById("fanCard"));

        break;

        case "light1":

            animateCard(document.getElementById("light1Card"));

        break;

        case "socket":

            animateCard(document.getElementById("socketCard"));

        break;

        case "light2":

            animateCard(document.getElementById("light2Card"));

        break;

    }

}

/*=========================================================
 LOADING ANIMATION
=========================================================*/

window.addEventListener("load",()=>{

    document.body.style.opacity="0";

    document.body.style.transition="0.5s";

    setTimeout(()=>{

        document.body.style.opacity="1";

    },100);

});

/*=========================================================
 AUTO REFRESH CLOCK
=========================================================*/

setInterval(()=>{

    const now=new Date();

    if(document.getElementById("time"))

        document.getElementById("time").innerHTML=

        now.toLocaleTimeString();

    if(document.getElementById("date"))

        document.getElementById("date").innerHTML=

        now.toDateString();

},1000);

/*=========================================================
 DATABASE CONNECTION TEST
=========================================================*/

database.ref(".info/connected").on("value",(snap)=>{

    if(snap.val()){

        console.log("Realtime Database Connected");

    }

    else{

        console.log("Realtime Database Disconnected");

    }

});

/*=========================================================
 KEEP WEBSITE ALIVE
=========================================================*/

setInterval(()=>{

    systemRef.child("websiteLastSeen").set(Date.now());

},10000);

/*=========================================================
 STARTUP MESSAGE
=========================================================*/

console.log("====================================");

console.log("SMART HOME AUTOMATION V2");

console.log("Performance Module Loaded");

console.log("Realtime Sync Enabled");

console.log("Waiting for ESP32...");

console.log("====================================");


/*=========================================================
 SMART HOME AUTOMATION V2
 SCRIPT.JS
 PART E
 FINAL INITIALIZATION & OPTIMIZATION
 Developed for Arunkumar
=========================================================*/

/*=========================================================
 PROJECT SETTINGS
=========================================================*/

const APP = {

    version: "2.0.0",

    developer: "Arunkumar",

    simulation: true,

    autoReconnect: true,

    refreshRate: 200,

    heartbeatInterval: 5000

};

/*=========================================================
 PERFORMANCE
=========================================================*/

let refreshTimer = null;

function startRealtimeEngine(){

    if(refreshTimer!=null){

        clearInterval(refreshTimer);

    }

    refreshTimer = setInterval(()=>{

        calculateRunningDevices();

    },APP.refreshRate);

}

/*=========================================================
 MEMORY CLEANUP
=========================================================*/

window.addEventListener("beforeunload",()=>{

    console.log("Closing Smart Home Dashboard...");

    if(refreshTimer!=null){

        clearInterval(refreshTimer);

    }

});

/*=========================================================
 ERROR LOGGER
=========================================================*/

window.onerror=function(message,source,line,column,error){

    console.log("========== ERROR ==========");

    console.log(message);

    console.log(source);

    console.log(line);

    console.log(column);

    console.log(error);

    console.log("===========================");

};

/*=========================================================
 DATABASE CHECK
=========================================================*/

function verifyDatabase(){

    rootRef.once("value")

    .then(()=>{

        console.log("Database OK");

    })

    .catch((err)=>{

        console.log(err);

        showNotification("Database Error");

    });

}

/*=========================================================
 INITIALIZE DASHBOARD
=========================================================*/

function initializeDashboard(){

    console.log("Initializing Dashboard...");

    verifyDatabase();

    startRealtimeEngine();

    runningCount.innerHTML="0";

    operationCount.innerHTML="0";

    firebaseStatus.innerHTML="Checking...";

    espStatus.innerHTML="Waiting...";

    wifiStatus.innerHTML="Waiting...";

}

/*=========================================================
 SIMULATION MODE
=========================================================*/

if(APP.simulation){

    console.log("Simulation Mode Enabled");

    systemRef.update({

        espOnline:true,

        firmwareVersion:"Simulation",

        wifiRSSI:-48,

        uptime:0,

        lastSeen:Date.now()

    });

}

/*=========================================================
 WEBSITE HEARTBEAT
=========================================================*/

setInterval(()=>{

    if(APP.simulation){

        systemRef.update({

            lastSeen:Date.now(),

            uptime:Math.floor(Date.now()/1000)

        });

    }

},APP.heartbeatInterval);

/*=========================================================
 START APPLICATION
=========================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    initializeDashboard();

    console.log("================================");

    console.log(" SMART HOME AUTOMATION V2 ");

    console.log(" Dashboard Ready ");

    console.log(" Version :",APP.version);

    console.log(" Developer :",APP.developer);

    console.log("================================");

});

console.log("Part E Loaded");
