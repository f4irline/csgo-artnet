/**
 * For authentication purposes in the server side
 */
var authTokenArtnet = 'ARTNET TESTER AUTH KEY HERE';

/**
 * For creating event listeners
 */
const buttonOne = document.getElementById('channelOne');
const buttonTwo = document.getElementById('channelTwo');
const buttonThree = document.getElementById('channelThree');
const buttonFour = document.getElementById('channelFour');
const buttonFive = document.getElementById('channelFive');

/**
 * Sends a POST-request with channel and auth. Awaits for a response,
 * if the "200 OK" was fetched, exits the function.
 */
buttonOne.addEventListener('click', function(e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: 1,
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
 * Sends a POST-request with channel and auth. Awaits for a response,
 * if the "200 OK" was fetched, exits the function.
 */
buttonTwo.addEventListener('click', function(e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: 2,
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
 * Sends a POST-request with channel and auth. Awaits for a response,
 * if the "200 OK" was fetched, exits the function.
 */
buttonThree.addEventListener('click', function(e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: 3,
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
 * Sends a POST-request with channel and auth. Awaits for a response,
 * if the "200 OK" was fetched, exits the function.
 */
buttonFour.addEventListener('click', function(e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: 4,
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
 * Sends a POST-request with channel and auth. Awaits for a response,
 * if the "200 OK" was fetched, exits the function.
 */
buttonFive.addEventListener('click', function(e) {
  fetch('/clicked', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: 5,
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
