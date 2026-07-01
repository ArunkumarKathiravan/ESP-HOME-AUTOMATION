/* =========================================================
   SMART HOME AUTOMATION V2
   PREMIUM SCRIPT.JS
   ---------------------------------------------------------
   This JavaScript file connects the website to Firebase,
   updates device switches, shows weather fallback,
   updates DHT11 values, and controls activity history.
========================================================= */

/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDOWMHv22hZjSDP1EwVGuJM8Oj5NIzAIpo",
    authDomain: "esp-32-home-automation-f158c.firebaseapp.com",
    databaseURL: "https://esp-32-home-automation-f158c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "esp-32-home-automation-f158c",
    storageBucket: "esp-32-home-automation-f158c.firebasestorage.app",
    messagingSenderId: "1029711889803",
    appId: "1:1029711889803:web:69d4dd39dcde60ebb71b8e"
};

/* Start Firebase */
firebase.initializeApp(firebaseConfig);

/* Realtime Database object */
const database = firebase.database();

/* =========================================================
   FIREBASE DATABASE REFERENCES
========================================================= */

const rootRef = database.ref("SmartHome");
const deviceRef = rootRef.child("devices");
const systemRef = rootRef.child("system");
const environmentRef = rootRef.child("environment");
const historyRef = rootRef.child("history");

/* =========================================================
   DEVICE CONFIGURATION
   These IDs must match index.html element IDs.
========================================================= */

const devices = {
    fan: {
        name: "Fan",
        card: "fanCard",
        sw: "fanSwitch",
        state: "fanState",
        source: "fanSource",
        time: "fanTime",
        runtime: "fanRuntime",
        count: "fanCount",
        switchCount: "fanSwitchCount",
        webCount: "fanWebCount",
        progress: "fanProgress"
    },

    light1: {
        name: "Light 1",
        card: "light1Card",
        sw: "light1Switch",
        state: "light1State",
        source: "light1Source",
        time: "light1Time",
        runtime: "light1Runtime",
        count: "light1Count",
        switchCount: "light1SwitchCount",
        webCount: "light1WebCount",
        progress: "light1Progress"
    },

    socket: {
        name: "Socket",
        card: "socketCard",
        sw: "socketSwitch",
        state: "socketState",
        source: "socketSource",
        time: "socketTime",
        runtime: "socketRuntime",
        count: "socketCount",
        switchCount: "socketSwitchCount",
        webCount: "socketWebCount",
        progress: "socketProgress"
    },

    light2: {
        name: "Light 2",
        card: "light2Card",
        sw: "light2Switch",
        state: "light2State",
        source: "light2Source",
        time: "light2Time",
        runtime: "light2Runtime",
        count: "light2Count",
        switchCount: "light2SwitchCount",
        webCount: "light2WebCount",
        progress: "light2Progress"
    }
};

/* =========================================================
   LOCAL STATE VARIABLES
========================================================= */

let localState = {
    fan: false,
    light1: false,
    socket: false,
    light2: false
};

let runtime = {
    fan: 0,
    light1: 0,
    socket: 0,
    light2: 0
};

let onCount = {
    fan: 0,
    light1: 0,
    socket: 0,
    light2: 0
};

let sourceCount = {
    fan: {
        web: 0,
        switch: 0
    },

    light1: {
        web: 0,
        switch: 0
    },

    socket: {
        web: 0,
        switch: 0
    },

    light2: {
        web: 0,
        switch: 0
    }
};

let totalOperations = 0;
let previousState = {};
let latestSensorData = null;

/* =========================================================
   SMALL HELPER FUNCTION
   Example: $("fanSwitch") means document.getElementById("fanSwitch")
========================================================= */

function $(id) {
    return document.getElementById(id);
}

/* =========================================================
   TIME HELPERS
========================================================= */

function nowTime() {
    return new Date().toLocaleTimeString("en-IN");
}

function formatRuntime(seconds) {
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return minutes + " Min";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return hours + "h " + remainingMinutes + "m";
}

/* =========================================================
   UPDATE DATE AND TIME
========================================================= */

function updateClock() {
    const now = new Date();

    if ($("date")) {
        $("date").innerHTML = now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    if ($("time")) {
        $("time").innerHTML = now.toLocaleTimeString("en-IN");
    }

    if ($("lastUpdate")) {
        $("lastUpdate").innerHTML = now.toLocaleTimeString("en-IN");
    }

    if ($("lastUpdateTime")) {
        $("lastUpdateTime").innerHTML = now.toLocaleTimeString("en-IN");
    }
}

/* Run clock every second */
setInterval(updateClock, 1000);
updateClock();

/* =========================================================
   STATUS TEXT UPDATE
========================================================= */

function setStatusText(id, text, className) {
    const element = $(id);

    if (!element) {
        return;
    }

    element.innerHTML = text;
    element.className = className || "";
}

/* =========================================================
   NOTIFICATION UPDATE
========================================================= */

function addNotification(text) {
    if ($("notificationText")) {
        $("notificationText").innerHTML = text;
    }
}

/* =========================================================
   ADD ACTIVITY LOG
========================================================= */

function addEventLog(title, subtitle) {
    const eventLog = $("eventLog");

    if (!eventLog) {
        return;
    }

    const item = document.createElement("article");

    item.className = "history-item";

    item.innerHTML = `
        <div class="history-icon">
            <i class="fa-solid fa-bolt"></i>
        </div>

        <div>
            <h4>${title}</h4>
            <p>${subtitle}</p>
        </div>

        <span>${nowTime()}</span>
    `;

    eventLog.prepend(item);

    while (eventLog.children.length > 6) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

/* =========================================================
   UPDATE SUMMARY AND STATISTICS
========================================================= */

function updateSummary() {
    let running = 0;
    let totalRuntime = 0;

    Object.keys(devices).forEach((key) => {
        if (localState[key]) {
            running++;
        }

        totalRuntime += runtime[key];

        const device = devices[key];

        if ($(device.runtime)) {
            $(device.runtime).innerHTML = formatRuntime(runtime[key]);
        }

        if ($(device.count)) {
            $(device.count).innerHTML = onCount[key];
        }

        if ($(device.switchCount)) {
            $(device.switchCount).innerHTML = sourceCount[key].switch;
        }

        if ($(device.webCount)) {
            $(device.webCount).innerHTML = sourceCount[key].web;
        }

        if ($(device.progress)) {
            const percent = Math.min(100, Math.floor((runtime[key] / 3600) * 100));
            $(device.progress).style.width = percent + "%";
        }
    });

    if ($("runningCount")) {
        $("runningCount").innerHTML = running;
    }

    if ($("operationCount")) {
        $("operationCount").innerHTML = totalOperations;
    }

    if ($("totalOperations")) {
        $("totalOperations").innerHTML = totalOperations;
    }

    if ($("todayRuntime")) {
        $("todayRuntime").innerHTML = formatRuntime(totalRuntime);
    }
}

/* =========================================================
   UPDATE DEVICE CARD UI
========================================================= */

function updateDeviceUI(key, data) {
    const device = devices[key];

    if (!device) {
        return;
    }

    const state = data && data.state === true;
    const source = data && data.source ? data.source : "web";
    const lastUpdated = data && data.lastUpdated ? data.lastUpdated : Date.now();

    localState[key] = state;

    if ($(device.sw)) {
        $(device.sw).checked = state;
    }

    if ($(device.state)) {
        $(device.state).innerHTML = state ? "ON" : "OFF";
    }

    if ($(device.source)) {
        $(device.source).innerHTML = "Last: " + source;
    }

    if ($(device.time)) {
        $(device.time).innerHTML = new Date(lastUpdated).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    const card = $(device.card);

    if (card) {
        if (state) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    }

    if (previousState[key] !== undefined && previousState[key] !== state) {
        totalOperations++;

        if (state) {
            onCount[key]++;
        }

        if (source === "switch") {
            sourceCount[key].switch++;
        } else {
            sourceCount[key].web++;
        }

        addEventLog(device.name + " " + (state ? "ON" : "OFF"), "Changed by " + source);

        addNotification(device.name + " turned " + (state ? "ON" : "OFF") + " by " + source);

        historyRef.push({
            device: device.name,
            state: state,
            source: source,
            time: Date.now()
        });
    }

    previousState[key] = state;

    updateSummary();
}

/* =========================================================
   WRITE DEVICE STATE TO FIREBASE
========================================================= */

function setDevice(key, state) {
    const device = devices[key];

    if (!device) {
        return;
    }

    updateDeviceUI(key, {
        state: state,
        source: "web",
        lastUpdated: Date.now()
    });

    deviceRef.child(key).update({
        state: state,
        source: "web",
        lastUpdated: Date.now()
    });
}

/* =========================================================
   FIREBASE DEVICE LISTENERS
========================================================= */

Object.keys(devices).forEach((key) => {
    const device = devices[key];

    if ($(device.sw)) {
        $(device.sw).addEventListener("change", function () {
            setDevice(key, this.checked);
        });
    }

    deviceRef.child(key).on("value", (snapshot) => {
        const data = snapshot.val();

        if (data) {
            updateDeviceUI(key, data);
        }
    });
});

/* =========================================================
   RUNTIME COUNTER
   Runtime increases every second for ON devices.
========================================================= */

setInterval(() => {
    Object.keys(localState).forEach((key) => {
        if (localState[key]) {
            runtime[key]++;
        }
    });

    updateSummary();
}, 1000);

/* =========================================================
   FIREBASE CONNECTION STATUS
========================================================= */

database.ref(".info/connected").on("value", (snapshot) => {
    if (snapshot.val() === true) {
        setStatusText("firebaseStatus", "Connected", "connected");
    } else {
        setStatusText("firebaseStatus", "Disconnected", "disconnected");
    }
});

/* =========================================================
   BROWSER INTERNET STATUS
========================================================= */

function updateBrowserNetwork() {
    if (navigator.onLine) {
        setStatusText("wifiStatus", "Online", "online");
    } else {
        setStatusText("wifiStatus", "Offline", "offline");
    }
}

window.addEventListener("online", updateBrowserNetwork);
window.addEventListener("offline", updateBrowserNetwork);

updateBrowserNetwork();

/* =========================================================
   ESP32 ONLINE STATUS
   ESP32 firmware should update SmartHome/system/lastSeen.
========================================================= */

systemRef.child("lastSeen").on("value", (snapshot) => {
    const lastSeen = Number(snapshot.val() || 0);
    const difference = Date.now() - lastSeen;

    if (lastSeen > 0 && difference < 20000) {
        setStatusText("espStatus", "Online", "online");
    } else {
        setStatusText("espStatus", "Offline", "offline");
    }
});

/* Website heartbeat for debugging */
setInterval(() => {
    systemRef.update({
        websiteLastSeen: Date.now()
    });
}, 10000);

/* =========================================================
   WEATHER FALLBACK SETTINGS
========================================================= */

const KONGALNAGARAM = {
    latitude: 10.6759,
    longitude: 77.1909
};

/* =========================================================
   WEATHER MOOD TEXT
========================================================= */

function getWeatherMood(temp) {
    if (isNaN(temp)) {
        return "Checking...";
    }

    if (temp < 20) {
        return "🥶 Cold";
    }

    if (temp < 30) {
        return "😊 Normal";
    }

    if (temp < 35) {
        return "🌤 Warm";
    }

    return "🔥 Hot";
}

/* =========================================================
   UPDATE ENVIRONMENT UI
========================================================= */

function updateEnvironmentUI(data, source) {
    const temp = Number(data.temperature);
    const hum = Number(data.humidity);
    const feels = Number(data.heatIndex);

    if ($("temperatureValue")) {
        $("temperatureValue").innerHTML = isNaN(temp) ? "-- °C" : temp.toFixed(1) + " °C";
    }

    if ($("humidityValue")) {
        $("humidityValue").innerHTML = isNaN(hum) ? "-- %" : Math.round(hum) + " %";
    }

    if ($("heatIndexValue")) {
        $("heatIndexValue").innerHTML = isNaN(feels) ? "-- °C" : feels.toFixed(1) + " °C";
    }

    if ($("topTemperatureValue")) {
        $("topTemperatureValue").innerHTML = isNaN(temp) ? "-- °C" : temp.toFixed(1) + " °C";
    }

    if ($("temperatureStatus")) {
        $("temperatureStatus").innerHTML = source === "sensor" ? "From DHT11 sensor" : "From online weather";
    }

    if ($("humidityStatus")) {
        $("humidityStatus").innerHTML = source === "sensor" ? "From DHT11 sensor" : "From online weather";
    }

    if ($("heatIndexStatus")) {
        $("heatIndexStatus").innerHTML = source === "sensor" ? "DHT11 calculated value" : "Online feels-like value";
    }

    if ($("sensorStatus")) {
        $("sensorStatus").innerHTML = source === "sensor" ? "DHT11 Online" : "Online Weather";
        $("sensorStatus").className = source === "sensor" ? "sensor-online" : "sensor-warning";
    }

    if ($("sensorLastUpdated")) {
        $("sensorLastUpdated").innerHTML = "Last updated: " + nowTime();
    }

    const displayTemp = isNaN(feels) ? temp : feels;

    if ($("weatherMood")) {
        $("weatherMood").innerHTML = getWeatherMood(displayTemp);
    }

    if ($("weatherMiniData")) {
        const tempText = isNaN(temp) ? "-- °C" : temp.toFixed(1) + " °C";
        const humText = isNaN(hum) ? "-- %" : Math.round(hum) + " %";

        $("weatherMiniData").innerHTML = tempText + " | " + humText;
    }
}

/* =========================================================
   CHECK IF DHT11 DATA IS FRESH
========================================================= */

function isFreshDHT(data) {
    if (!data) {
        return false;
    }

    if (data.temperature === undefined || data.humidity === undefined) {
        return false;
    }

    const lastUpdated = Number(data.lastUpdated || 0);

    if (lastUpdated === 0) {
        return false;
    }

    return Date.now() - lastUpdated < 120000;
}

/* =========================================================
   LOAD KONGALNAGARAM ONLINE WEATHER
   Free API used: Open-Meteo
========================================================= */

async function loadOnlineWeather() {
    try {
        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + KONGALNAGARAM.latitude +
            "&longitude=" + KONGALNAGARAM.longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature" +
            "&timezone=auto";

        const response = await fetch(url);

        const weather = await response.json();

        const current = weather.current;

        updateEnvironmentUI({
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            heatIndex: current.apparent_temperature,
            lastUpdated: Date.now()
        }, "online");

    } catch (error) {
        console.log("Weather API Error:", error);

        if ($("sensorStatus")) {
            $("sensorStatus").innerHTML = "No Data";
            $("sensorStatus").className = "sensor-offline";
        }

        if ($("sensorLastUpdated")) {
            $("sensorLastUpdated").innerHTML = "DHT11 and online weather unavailable";
        }
    }
}

/* =========================================================
   FIREBASE ENVIRONMENT LISTENER
========================================================= */

environmentRef.on("value", (snapshot) => {
    const data = snapshot.val();

    latestSensorData = data;

    if (isFreshDHT(data)) {
        updateEnvironmentUI(data, "sensor");
    } else {
        loadOnlineWeather();
    }
});

/* Refresh online weather every 60 seconds if DHT11 is offline */
setInterval(() => {
    if (isFreshDHT(latestSensorData)) {
        updateEnvironmentUI(latestSensorData, "sensor");
    } else {
        loadOnlineWeather();
    }
}, 60000);

/* =========================================================
   COLLAPSIBLE ACTIVITY HISTORY
========================================================= */

const historyToggle = $("historyToggle");
const historyPanel = $("historyPanel");
const historyArrow = $("historyArrow");

if (historyToggle && historyPanel) {
    historyToggle.addEventListener("click", () => {
        historyPanel.classList.toggle("open");

        if (historyArrow) {
            historyArrow.classList.toggle("rotate");
        }
    });
}

/* =========================================================
   STARTUP
========================================================= */

if ($("systemStartTime")) {
    $("systemStartTime").innerHTML = nowTime();
}

addNotification("Dashboard loaded successfully");

console.log("Smart Home Automation V2 Premium loaded successfully");
