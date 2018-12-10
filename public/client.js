/**
 * For authentication purposes in the server side
 */
var authTokenArtnet = 'UQnXUDLjpmBCzaOXUb';

/**
 * For creating event listeners
 */
const buttonOne = document.getElementById('channelOne');
const buttonTwo = document.getElementById('channelTwo');
const buttonThree = document.getElementById('channelThree');
const buttonFour = document.getElementById('channelFour');
const buttonFive = document.getElementById('channelFive');

function validate() {
    
    let array = $('form').serializeArray();

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
