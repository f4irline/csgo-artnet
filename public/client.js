/**
 * For authentication purposes in the server side
 */
var authTokenArtnet = '';

/**
 * Waits until the document is ready and then requests the values from the 
 * server and the .json file.
 */
$(document).ready(function() {
  requestValues();
});

/**
 * Requests values from server for the settings.
 */
const requestValues = async () => {
  const response = await fetch('/settings');
  const json = await response.json();
  $('#ip').val(json.ip);
  $('#port').val(json.port);
  $('#uni').val(json.universe);
  $('#playertoken').val(json.playertoken);
  $('#observertoken').val(json.observertoken);
  $('#testertoken').val(json.testertoken);
  authTokenArtnet = json.testertoken;
}

/**
 * Validates given values in the form. Checks first if ip-address matches standard
 * ip-address conventions and then the port. If they were validated succesfully,
 * sends the POST request with configurations.
 */
function validate() {
    
  let array = $('form').serializeArray();
  let validated = true;

  if(!validateIpAddress(array[0].value)) {
    alert("IP-Address must match the IP-address standards.\ne.g. 192.168.10.52");
    validated = false;
  } else if (!validatePort(array[1].value)) {
    alert("Port must be a number between 0-65535");
    validated = false;
  }

  if (validated) {
    sendConfigRequest(array);
  }

  return validated;
}

/**
 * Checks that the IP address is appropriate.
 * 
 * @param {String} ip - IP address string
 */
function validateIpAddress(ip) {
  const ipBlocks = ip.split(".");
  let validated = true;

  if (ipBlocks.length > 4) {
    console.log("fail1");
    validated = false;
  }

  for (var i = 0; i < ipBlocks.length; i++) {
    if (ipBlocks[i].length > 3 || ipBlocks[i] > 255 || ipBlocks[i] < 0 || isNaN(ipBlocks[i])) {
      validated = false;
      console.log("fail2");
    }
  }
  return validated;
}

/**
 * Checks that the port number is appropriate.
 * 
 * @param {Integer} port - The port number
 */
function validatePort(port) {
  let validated = true;

  if (port > 65535 || port < 0 || isNaN(port)) {
    validated = false;
  }

  return validated;
}

/**
 * Sends a POST-request with the configurations taken from the form. Awaits
 * for a response, if the "200 OK" was fetched, exits the function.
 * 
 * @param {*} array 
 */
function sendConfigRequest(array) {
  fetch('/config', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ipaddress: array[0].value,
      port: array[1].value,
      universe: array[2].value,
      playertoken: array[3].value,
      observertoken: array[4].value,
      testertoken: array[5].value
    })
  })
  .then(function(response) {
    if(response.ok) {
      console.log("File written succesfully");
      return;
    }
    throw new Error('Request failed.');
  })
}

/**
 * Adds listeners to all buttons. Sends a POST-request with channel (which is defined in the button HTML id) 
 * and auth. Awaits for a response, if the "200 OK" was fetched, exits the function.
 */
$('.button').click(function (e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: e.currentTarget.id,
      auth: authTokenArtnet
    })
  })
  .then(function(response) {
    if(response.ok) {
      console.log('Artnet signal was sent succesfully');
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
});

/**
 * Generates random auth tokens on click.
 */
$('#tokenGenerator').click(function (e) {
  $('#playertoken').val(Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12));
  $('#observertoken').val(Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12));
  $('#testertoken').val(Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12));
})