import Keycloak from 'keycloak-js';

const location = window.location;

// Setup Keycloak instance
const keycloak = new Keycloak({
    url: `${location.origin}/auth/`,
    realm: 'amazebot',
    clientId: 'amazeui',
    checkLoginIframe: false,
    checkLoginIframeInterval: 36000,
    enableLogging: true
});

export default keycloak;
