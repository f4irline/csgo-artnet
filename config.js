/**
 * Which IP-address and port the app listens from?
 */
exports.HOST = 'IP ADDRESS TO LISTEN FROM HERE';
exports.PORT = 'PORT TO LISTEN TO HERE';

/**
 * Universe where the ArtNet signal is sent. Make sure to set this to be the
 * desired universe where the ArtNet signal is hoped to be sent.
 */
exports.UNIVERSE = 'UNIVERSE TO SEND THE ARTNET SIGNALS TO HERE';

/*
 * Auth token. Make sure that these are the same which are defined in the
 * CS:GO .cfg files (either gamestate_integration_observerspectator.cfg
 * or gamestate_integration_consolesample.cfg). If you're using the 
 * ArtNet tester buttons (via web browser), make sure that the ARTNETAUTH 
 * matches the key that is sent in the client.js file.
 */
exports.AUTHPLAYER = 'PLAYER AUTH KEY HERE';
exports.AUTHOBSERVER = 'OBSERVER AUTH KEY HERE';
exports.ARTNETAUTH = 'ARTNET TESTER AUTH KEY HERE';