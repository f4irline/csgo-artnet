const http = require('http');
const fs = require('fs');

const port = 3000;
const host = '192.168.10.52';

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
        eventInfo += processPayload(JSON.parse(data.toString()));
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
function processPayload(data) {
    // Ignore unauthenticated payloads
    if (!isAuthentic(data)) {
        return '';
    }

    const date = new Date(data.provider.timestamp * 1000);
    let output = '';

    detectBombPlant(data);

    if (output.length > 0) {
        output = `[${date.getFullYear()}-` +
            `${(date.getMonth() + 1)}-` +
            `${date.getDate()} ` +
            `${date.getHours()}:` +
            `${('00' + date.getMinutes()).substr(-2)}] `;
    }

    return output;
}

/**
 * Checks that the auth token from the correct CS:GO server matches the one defined in this software.
 *
 * @param {object} data - The payload from CS:GO observer as a JSON object
 * @return {boolean}
 */
function isAuthentic(data) {
    return readProperty(data, 'auth.token') === authToken;
}

/**
 * Checks if the data indicates that the bomb was planted and sends an ArtNet signal and full (255) value
 * to universe 1 channel 1 in the lighting console's address.
 * 
 * @param {object} data - The payload from CS:GO observer as a JSON object
 */

function detectBombPlant(data) {
    let output = '';

    if (readProperty(data, 'added.round.bomb')) {

        var options = {
            host: '192.168.10.52'
        }
         
        var artnet = require('artnet')(options);
         
        artnet.set(1, 255, function (err, res) {
            artnet.close();
        });        
        console.log("Bomb planted");
    }

    return output;
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

server.listen(port, host);

console.log('Monitoring CS:GO rounds');