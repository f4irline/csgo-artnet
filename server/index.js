/**
 * Basic express configuration
 */
var express = require('express');
var app = express();
var router = express.Router();

/**
 * Filesystem module for reading and writing to .json file
 */
const fs = require('fs');

/**
 * Config file path
 */
const path = './config.json';

/**
 * Extracts the entire body portion of an incoming request and
 * exposes it on req.body
 */
var bodyParser = require('body-parser')

/**
 * IP-address and port where the ArtNet signals are sent.
 */
let options = {
    host: "",
    port: ""
}

/**
 * Universe where the ArtNet signal is sent.
 */
let UNIVERSE = "";

/**
 * Auth tokens for player, observer and artnet tester.
 */
let authTokenPlayer = "";
let authTokenObserver = "";
let authTokenArtnet = "";

/**
 * Used to serve the index.html file from the "public" directory"
 */
router.use(express.static('public'));

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
});

/**
 * JSON Object (which will be parsed from the config.json file)
 */
let obj = {};

router.get('/settings', (req, res) => {
    res.setHeader("Content-Type", "application/json");

    try {
        if (fs.existsSync(path)) {
            obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
            UNIVERSE = obj.universe;
            options = {
                host: obj.ip,
                port: obj.port
            }
            authTokenPlayer = obj.playertoken;
            authTokenObserver = obj.observertoken;
            authTokenArtnet = obj.testertoken;
        }
      } catch(err) {
        console.error(err)
    }

    res.json(obj);
})

/**
 * Handles the POST requests from the button clicks. When a button click
 * and the request has been received, it first validates the request 
 * (with an auth key), and then sends an artnet signal to the channel that 
 * was given in the request body (depending on the button).
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

/**
 * Handles the POST request from the form submit. Pushes everything
 * in the request to an object and writes the object to a .json file.
 */
router.post('/config', (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html"});

    let obj = {
        ip: req.body.ipaddress,
        port: req.body.port,
        universe: req.body.universe,
        playertoken: req.body.playertoken,
        observertoken: req.body.observertoken,
        testertoken: req.body.testertoken
    }

    fs.writeFile("./config.json", JSON.stringify(obj, null, 2), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });

    res.end('ok');
})

/**
 * Is the round over or not? Used to avoid duplicate method calls.
 */
let roundOver = true;

/**
 * Has the ace been already called or not? Used to avoid duplicate method calls.
 */
let aceCalled = false;

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

app.listen("3000", "localhost");

console.log('Monitoring CS:GO rounds');