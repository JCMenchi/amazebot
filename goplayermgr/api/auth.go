package api

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
	log "github.com/sirupsen/logrus"
)

// Define structure to decode keycloak JWT claim
type KCRoles struct {
	Roles []string `json:"roles"`
}

type KeycloakClaim struct {
	*jwt.StandardClaims
	Audience          []string           `json:"aud,omitempty"` //
	PreferredUsername string             `json:"preferred_username"`
	RealmRoles        KCRoles            `json:"realm_access"`
	ResourceAccess    map[string]KCRoles `json:"resource_access"`
}

// define structure to get Keycloak siging key to validate JWT token
type KCRealmInfo struct {
	Realm           string `json:"realm"`
	PublicKey       string `json:"public_key"`
	TokenService    string `json:"token-service,omitempty"`
	AccountService  string `json:"account-service,omitempty"`
	TokensNotBefore int64  `json:"tokens-not-before,omitempty"`
}

// keycloak pub key of our realm
var KeycloakTokenSigningKey *rsa.PublicKey

// simple HMAC signing key, used for unit test
var TokenSigningKey []byte

// URL to get keycloak public key to check JWT
var KeycloakAuthURL string

var SecurityMode string

// map with already decoded and validated token
var validTokenMap map[string]*KeycloakClaim

// initialize globals
func init() {
	TokenSigningKey = []byte("abcdefghijklmnopqrst")
	validTokenMap = make(map[string]*KeycloakClaim)
	SecurityMode = "secured"
}

/*
	Check if JWT in request has the role <role>
*/
func CheckRole(req *http.Request, role string) bool {

	if SecurityMode == "open" {
		return true
	}

	log.Debugf("Checking role %v", role)
	claim := getClaim(req, KeycloakAuthURL)

	if claim != nil {
		// check role
		for _, value := range claim.ResourceAccess {
			for _, r := range value.Roles {
				if r == role {
					return true
				}
			}
		}
	} else {
		log.Errorf("Cannot get claim from token.")
	}

	return false
}

func GetUserName(req *http.Request) string {

	if SecurityMode == "open" {
		return getUserFromClaim(req)
	}

	claim := getClaim(req, KeycloakAuthURL)

	if claim != nil {
		return claim.PreferredUsername
	}

	return ""
}

/*
	Extract claim from http request
*/
func getClaim(req *http.Request, authurl string) *KeycloakClaim {

	// get authorization header
	tokens := req.Header["Authorization"]
	if len(tokens) > 0 && strings.HasPrefix(tokens[0], "Bearer") {
		tokenString := tokens[0][7:]

		// first search in cache
		claim, ok := validTokenMap[tokenString]
		if ok {
			log.Debugf("Use parsed token from cache.")
			v := checkClaimValidity(claim)
			if !v {
				log.Debugf("Remove expired token from cache.")
				// clean cache
				delete(validTokenMap, tokenString)
				return nil
			}
		} else {
			claim = convertToClaim(tokenString, authurl)
		}

		return claim
	} else {
		log.Errorf("Cannot find token in request.")
	}

	return nil
}

func getUserFromClaim(req *http.Request) string {

	// get authorization header
	tokens := req.Header["Authorization"]
	if len(tokens) > 0 && strings.HasPrefix(tokens[0], "Bearer") {
		tokenString := tokens[0][7:]

		parser := jwt.Parser{}
		token, _, err := parser.ParseUnverified(tokenString, &KeycloakClaim{})
		if err != nil {
			log.Errorf("Error cannot parse token: %v\n", err)
			return ""
		}

		claims, ok := token.Claims.(*KeycloakClaim)

		if !ok {
			log.Errorf("Cannot get claim from token.")
			return ""
		}

		return claims.PreferredUsername
	}

	return ""
}

func convertToClaim(tokenAsString string, authurl string) *KeycloakClaim {

	parser := jwt.Parser{}

	token, err := parser.ParseWithClaims(tokenAsString, &KeycloakClaim{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); ok {
			log.Debugf("Parse token using HMAC signing key.")
			return TokenSigningKey, nil
		}

		if _, ok := token.Method.(*jwt.SigningMethodRSA); ok {
			log.Debugf("Parse token using keycloak signing key.")
			return getKeycloakSigningKey(authurl), nil
		}

		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	})

	if err != nil {
		log.Errorf("Error cannot parse token: %v\n", err)
		return nil
	}

	if !token.Valid {
		log.Errorf("Error invalid token: %v\n", token)
		return nil
	}

	claims, ok := token.Claims.(*KeycloakClaim)

	if !ok {
		log.Errorf("Cannot get claim from token.")
		return nil
	}

	validTokenMap[tokenAsString] = claims

	return claims
}

/*
	Retrieve keycloak pubic key to check JWT
*/
func getKeycloakSigningKey(authurl string) *rsa.PublicKey {

	if KeycloakTokenSigningKey == nil {
		log.Debugf("Retrieve keycloak signing key: %v", authurl)
		resp, err := http.Get(authurl)
		if err != nil {
			return nil
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil
		}
		var info KCRealmInfo
		err = json.Unmarshal(body, &info)
		if err != nil {
			return nil
		}
		pubkeyPEM := "-----BEGIN PUBLIC KEY-----\n" + info.PublicKey + "\n-----END PUBLIC KEY-----\n"
		KeycloakTokenSigningKey, err = jwt.ParseRSAPublicKeyFromPEM([]byte(pubkeyPEM))
		if err != nil {
			return nil
		}
	}

	return KeycloakTokenSigningKey
}

// check if token is still valid
func checkClaimValidity(claim *KeycloakClaim) bool {

	err := claim.Valid()

	if err != nil {
		log.Errorf("Invalid claim: %v\n", err)
		return false
	}

	return true
}
