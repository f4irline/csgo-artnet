const http = require('http');
const fs = require('fs');

const PORT = 3000;
const HOST = '192.168.10.52';

/**
 * Universe where the ArtNet signal is sent. Make sure to change this to match the universe you're using
 * for the signals.
 */
const UNIVERSE = 5;

/**
 * Host IP-address for the ArtNet signal.
 */
const options = {
    host: '192.168.10.52'
}

let roundOver = false;

/**
 * To be implemented:
 * [X] Send artnet signal when bomb is planted
 * [X] Send artnet signal when bomb is defused
 * [X] Send artnet signal when bomb has exploded
 * [ ] Send artnet signal when CTs win
 * [ ] Send artnet signal when Ts win
 * [ ] Send artnet signal when a player scores an ace
 * [ ] Send 10 different artnet signals when players die
 * [ ] Send 10 different artnet signals when players spawn
 * /

/*
 * Auth token. Make sure that this authToken is the same which is defined
 * in the CS:GO .cfg file (either gamestate_integration_observerspectator.cfg
 * or gamestate_integration_consolesample.cfg)
 */
const authToken = 'CCWJu64ZV3JHDT8hZc';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    let eventInfo = '';

    req.on('data', (data) => {
        eventInfo += processGameEvents(JSON.parse(data.toString()));
    });

    req.on('end', () => {
        if (eventInfo !== '') {
            console.log(eventInfo);
        }

        res.end('');
    });
});

/**
 * Processes payloads to parse game events
 *
 * @param {object} data - Payload as JSON object
 * @return {string}
 */
function processGameEvents(data) {
    // Ignore unauthenticated payloads
    if (!isAuthentic(data)) {
        return '';
    }

    const date = new Date(data.provider.timestamp * 1000);
    let output = '';

    if (!roundOver) {
        output += detectGameEvent(data);
    } else {
        output += detectGoingLive(data);
    }

    if (output.length > 0) {
        output = `[${date.getFullYear()}-` +
            `${(date.getMonth() + 1)}-` +
            `${date.getDate()} ` +
            `${date.getHours()}:` +
            `${('00' + date.getMinutes()).substr(-2)}] ` +
            output;
    }

    return output;
}

/**
 * Checks that the auth token from the CS:GO server matches the one defined in this software.
 *
 * @param {object} data - The payload from CS:GO observer as a JSON object
 * @return {boolean}
 */
function isAuthentic(data) {
    return readProperty(data, 'auth.token') === authToken;
}

function detectGoingLive(data) {
    let output ='';

    if (readProperty(data, 'round.phase') === "live") {
        roundOver = false;
        output = "Going live!";
    }

    return output;
}

/**
 * Checks if any of the events we're interested about happened.
 * 
 * @param {object} data - The payload from CS:GO observer as a JSON object
 */
function detectGameEvent(data) {
    let output = '';

    if (readProperty(data, 'added.round.bomb')) {
        output += bombPlanted();
    }

    if (readProperty(data, 'round.bomb') === "defused") {
        output += bombDefused();
        roundOver = true;
    } else if (readProperty(data, 'round.bomb') === "exploded") {
        output += bombExploded();
        roundOver = true;
    }

    return output;
}

/**
 * Sends an artnet signal to channel one of the defined universe when bomb was planted.
 * 
 * @return indication to console that bomb plant was detected.
 */
function bombPlanted() {    
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 1, 255, function (err, res) {
        artnet.close();
    });        

    return "Bomb planted";
}

/**
 * Sends an artnet signal to channel two of the defined universe when bomb was defused.
 * 
 * @return indication to console that bomb defusal was detected.
 */
function bombDefused() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 2, 255, function (err, res) {
        artnet.close();
    });
    
    return "Bomb defused";
}

/**
 * Sends an artnet signal to channel three of the defined universe when bomb was defused.
 * 
 * @return indication to console that bomb explosion was detected.
 */
function bombExploded() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 3, 255, function (err, res) {
        artnet.close();
    });
    
    return "Bomb exploded";
}

/**
 * Helper function to read values under nested paths from objects
 *
 * @param {object} container - Object container
 * @param {string} propertyPath - Path to the property in the container
 *                                separated by dots, e.g. 'map.phase'
 * @return {mixed} Null if the object has no requested property, property value
 *                 otherwise
 */
function readProperty(container, propertyPath) {
    let value = null;
    const properties = propertyPath.split('.');

    for (const p of properties) {
        if (!container.hasOwnProperty(p)) {
            return null;
        }

        value = container[p];
        container = container[p];
    }

    return value;
}

server.listen(PORT, HOST);

console.log('Monitoring CS:GO rounds');