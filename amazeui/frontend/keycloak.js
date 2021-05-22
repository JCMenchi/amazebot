import Keycloak from 'keycloak-js';

// Setup Keycloak instance
const keycloak = new Keycloak({
    url: 'http://localhost/auth/',
    realm: 'amazebot',
    clientId: 'amazeui',
    checkLoginIframe: false,
    checkLoginIframeInterval: 36000,
    enableLogging: true
});

export default keycloak;
