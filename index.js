/**
 * Basic express configuration
 */
var express = require('express');
var app = express();
var router = express.Router();

/**
 * Extracts the entire body portion of an incoming request and
 * exposes it on req.body
 */
var bodyParser = require('body-parser')

/**
 * Used to serve the index.html file from the "public" directory"
 */
router.use(express.static('public'));

/**
 * Holds configurations for the app, such as auth keys,
 * IP-address, port etc.
 */
var config = require('./config.js');

/**
 * Make sure to configure your config.js file to match your desired settings!
 */

const HOST = config.HOST;
const PORT = config.PORT;

/**
 * Universe where the ArtNet signal is sent.
 */
const UNIVERSE = config.UNIVERSE;

/**
 * Host IP-address for the ArtNet signal.
 */
const options = {
    host: config.HOST
}

/**
 * Is the round over or not? Used to avoid duplicate method calls.
 */
let roundOver = true;

/**
 * Has the ace been already called or not? Used to avoid duplicate method calls.
 */
let aceCalled = false;

/**
 * To be implemented:
 * [X] Send artnet signal when bomb is planted - Channel 1
 * [X] Send artnet signal when bomb is defused - Channel 2
 * [X] Send artnet signal when bomb has exploded - Channel 3
 * [X] Send artnet signal when CTs win - Channel 4
 * [X] Send artnet signal when Ts win - Channel 5
 * [X] Send artnet signal when a player scores an ace - Channel 6
 * [/] Send 10 different artnet signals when players die
 * [ ] Simple HTML controls to test that Artnet works properly.
 * /

/*
 * Auth token. Make sure that this authToken is the same which is defined
 * in the CS:GO .cfg file (either gamestate_integration_observerspectator.cfg
 * or gamestate_integration_consolesample.cfg)
 */
const authTokenPlayer = config.AUTHPLAYER;
const authTokenObserver = config.AUTHOBSERVER;
const authTokenArtnet = config.ARTNETAUTH;

/**
 * Configure the router handler to use bodyParser to parse the req.body
 */
router.use(bodyParser.urlencoded({ extended: true}));
router.use(bodyParser.json());

/**
 * Send the index.html from the public folder to the browser when requested
 */
router.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');

    req.on('data', (data) => {
        console.log(data);
    })
});

/**
 * Handles the POST requests from the button clicks. When a button click
 * and the request has been received, it first validates the request 
 * (with an auth key), and then sends an artnet signal to the channel that 
 * was given in the request body.
 */
router.post('/clicked', (req, res) => {
    const AUTH = req.body.auth;
    const CHANNEL = req.body.channel;

    if (AUTH === authTokenArtnet) { 
        res.writeHead(200, { "Content-Type": "text/html" });

        let artnet = require('artnet')(options);

        artnet.set(UNIVERSE, CHANNEL, 255, function (err, res) {
            artnet.close();
        });       

        res.end('ok');
    } else {
        res.writeHead(401, { "Content-Type": "text/html" });
        res.end('authfail');
    }
});

router.post('/', function(req, res, next) {

    res.writeHead(200, { 'Content-Type': 'text/html' });

    let body = '';

    req.on('data', (data) => {
        body += data;
    });

    req.on('end', () => {
        let eventInfo = processGameEvents(JSON.parse(body));
        console.log(body);
        if (eventInfo !== '') {
            console.log(eventInfo);
        }

        res.end('');
    });

    next();
});

/**
 * Processes payloads to parse game events
 *
 * @param {object} data - Payload as JSON object
 * @return {string} - The string and the date and time of the game event if a desired game event was detected
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
 * Checks that the auth token from the CS:GO observer or player matches the one defined in this software.
 *
 * @param {object} data - The payload from CS:GO observer as a JSON object
 * @return {boolean}
 */
function isAuthentic(data) {
    let authenticated = false;
    if (readProperty(data, 'auth.token') === authTokenPlayer || readProperty(data, 'auth.token') === authTokenObserver) {
        authenticated = true;
    }
    return authenticated;
}

/**
 * Called if round is over. Checks when the round starts and returns indication of that.
 * 
 * @param {Object} data - The payload from CS:GO observer as a JSON object
 * @return {String} - Indication of going live when going live.
 */
function detectGoingLive(data) {
    let output ='';

    if (readProperty(data, 'round.phase') === "live") {
        roundOver = false;
        aceCalled = false;
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

    if (readProperty(data, 'round.phase') === "over") {
        output += checkWinningTeam(data);
        roundOver = true;
    } else {
        if (readProperty(data, 'added.round.bomb')) {
            output += bombPlanted();
        }

        if (monitorPlayers(readProperty(data, 'allplayers'))) {
            output += ace();
        }
    }

    return output;
}

/**
 * Checks which team won the round and checks if either bomb defusal or explosion happened as well.
 * 
 * @param {String} winningTeam - The team which won.
 */
function checkWinningTeam(data) {
    let output = "";
    if (readProperty(data, 'round.win_team') === 'CT') {
        output += CTWin();

        if (readProperty(data, 'round.bomb') === "defused") {
            output += ", "+bombDefused();
        }
    } else {
        output += TWin();

        if (readProperty(data, 'round.bomb') === "exploded") {
            output += ", "+bombExploded();
        }
    }
    return output;
}

/**
 * Iterates constantly through all players and checks whether a player has made an ace (killed 5 enemies) or
 * is dead.
 * 
 * @param {Object} players - object which consists all the players and their information.
 * @return {boolean} - true if an ace is found, false if an ace was not found.
 */
function monitorPlayers(players) {
    let aceFound = false;

    Object.keys(players).forEach(function(key) {
        const player = players[key];
        if (checkKillsAndHealth(player)) {
            aceFound = true;
        }
    });
    return aceFound;
}

/**
 * Checks the amount of kills and health that a single player has.
 * 
 * @param {Object} player - the player object which holds information from a single player.
 * @return {boolean} - true if an ace was found, false if an ace was not found.
 */
function checkKillsAndHealth(player) {
    let aceFound = false;

    Object.keys(player).forEach(function(key) {
        const state = player[key];
        if (state.hasOwnProperty('round_kills')) {
            const kills = state['round_kills'];
            if (kills === 5 && !aceCalled) {
                aceFound = true;
            }
        }

        if (state.hasOwnProperty('health')) {
            if (state['health'] == 0) {
                playerDead(player);
            }
        }
    })

    return aceFound;
}

/**
 * Called if a player dies. Later I will implement a solution to dim out a single light, which is focused on a player,
 * when the player dies.
 * 
 * @param {Object} player - the player object which holds information from a single player.
 */
function playerDead(player) {
    console.log(player['name'] + " is dead.");
}

/**
 * Sends an artnet signal to channel one of the defined universe when bomb was planted.
 * 
 * @return {String} - indication to console that bomb plant was detected.
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
 * @return {String} - indication to console that bomb defusal was detected.
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
 * @return {String} - indication to console that bomb explosion was detected.
 */
function bombExploded() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 3, 255, function (err, res) {
        artnet.close();
    });
    
    return "Bomb exploded";
}

/**
 * Sends an artnet signal to channel four of the defined universe when Counter-Terrorists win.
 * 
 * @return {String} - indication to console that CTs victory was detected.
 */
function CTWin() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 4, 255, function (err, res) {
        artnet.close();
    });
    
    return "CTs win";
}

/**
 * Sends an artnet signal to channel five of the defined universe when Terrorists win.
 * 
 * @return {String} - indication to console that Ts victory was detected.
 */
function TWin() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 5, 255, function (err, res) {
        artnet.close();
    });
    
    return "Ts win";
}

/**
 * Sends an artnet signal to channel six of the defined universe when someone has made an ace.
 * Sets aceCalled to be true to avoid calling ace() method multiple times.
 * 
 * @return {String} - indication to console that an ace has bene done.
 */
function ace() {
    let artnet = require('artnet')(options);

    artnet.set(UNIVERSE, 6, 255, function (err, res) {
        artnet.close();
    });

    aceCalled = true;

    return "A player has aced.";
}

/**
 * Helper function to read values under nested paths from objects
 *
 * @param {object} container - Object container
 * @param {string} propertyPath - Path to the property in the container
 *                                separated by dots, e.g. 'map.phase'
 * @return {mixed} - Null if the object has no requested property, property value
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

app.use('/', router);

app.listen(PORT, HOST);

console.log('Monitoring CS:GO rounds');