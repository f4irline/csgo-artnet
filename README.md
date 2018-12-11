# CS:GO GSI - ArtNet Application

## An application to fetch data from CS:GO Game State Integration API and turn it to ArtNet signal

### Introduction

The server side is made with **Node.js** utilizing the **Express** framework. The server side handles POST and GET requests from CS:GO API to process data and client side to process client side operations, such as setting configurations.

### Functionality

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
3. Run "npm start"
4. Open your web browser and go to "127.0.0.1:3000"
5. Set IP-Address, Port and Universe where the ArtNet signal will be sent.
6. Set tokens
   - "Player Token" is used for fetching data from player side of the CS:GO GSI
   - "Observer Token" is used for fetching data from observer side of the CS:GO GSI (e.g. LAN tournament setting)
   - "Tester Token" is used for the web browser ArtNet tester buttons.
7. Make sure that the tokens match the ones in the CS:GO gamestate_integration_x.cfg files (check https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration)
8. Launch game and connect to a game server!