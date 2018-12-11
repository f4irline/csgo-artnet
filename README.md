# CS:GO GSI - ArtNet Application

## An application to fetch data from CS:GO Game State Integration API and send ArtNet signals depending on the game events

### INTRODUCTION

The server side is made with **Node.js** utilizing the **Express** framework. The server side handles POST and GET requests from CS:GO API to process data and client side to process client side operations, such as setting configurations.

Basically the application listens to requests from the CS:GO Game State Integration, parses the data sent from it and sends ArtNet signal with a value of 255 to individual channels in the universe that the user has defined via web browser.

### FUNCTIONALITY

- Browser operations
  - Setting configurations such as the IP-address, port and universe to send the ArtNet signal in
  - Generating authentication tokens for the HTTP requests and saving them to server side
  - Testing ArtNet signal via tester buttons
- CS:GO GSI data processing, sending ArtNet signal on following events:
  - Bomb was planted
  - Bomb was defused
  - Bomb was exploded
  - CTs win
  - Ts win
  - Player scores an ace

### HOW TO USE

1. Clone this repository anywhere on your local machine
2. Run "npm install" via command line / terminal in the new local folder
3. Run "npm run setup". This part will help you initialize the app.
4. Run "npm start"
5. Open your web browser and go to the address:port which you defined during the "npm run setup" phase.
   - The command line will also tell you the correct address, e.g. "Listening at 127.0.0.1:3000"
6. Set IP-Address, Port and Universe where the ArtNet signal will be sent.
7. Set tokens
   - "Player Token" is used for fetching data from player side of the CS:GO GSI
   - "Observer Token" is used for fetching data from observer side of the CS:GO GSI (e.g. LAN tournament setting)
   - "Tester Token" is used for the web browser ArtNet tester buttons.
8. From the CS:GO gamestate_integration_x.cfg (whichever you're using) file, make sure that:
   - The tokens match the ones in the CS:GO gamestate_integration_x.cfg files
   - The "uri" is matches the IP address and port you defined during the "npm run setup" phase, plus /csgo.
     - e.g. "127.0.0.1:3000/csgo"
   - Check https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration for more information
9. Launch game and connect to a game server!

### TO BE IMPLEMENTED
- Sending ArtNet signal to individual channels when an individual player dies
- Setting events that will be listened to in the web browser
