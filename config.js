/**
 * Which IP-address and port the app listens from?
 */
exports.HOST = '192.168.10.52';
exports.PORT = 3000;

/**
 * Universe where the ArtNet signal is sent. Make sure to set this to be the
 * desired universe where the ArtNet signal is hoped to be sent.
 */
exports.UNIVERSE = 5;

/*
 * Auth token. Make sure that these are the same which are defined in the
 * CS:GO .cfg files (either gamestate_integration_observerspectator.cfg
 * or gamestate_integration_consolesample.cfg)
 */
exports.AUTHPLAYER = 'CCWJu64ZV3JHDT8hZc';
exports.AUTHOBSERVER = 'Q79v5tcxVQ8u';