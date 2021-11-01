package api

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
)

var TokenSigningKey []byte
var KeycloakTokenSigningKey *rsa.PublicKey
var validTokenMap map[string]*KeycloakClaim

func init() {
	TokenSigningKey = []byte("abcdef")
	validTokenMap = make(map[string]*KeycloakClaim)
}

// Define keycloak like claim
type KCRoles struct {
	Roles []string `json:"roles"`
}

type KeycloakClaim struct {
	*jwt.StandardClaims
	Audience          []string           `json:"aud,omitempty"`
	PreferredUsername string             `json:"preferred_username"`
	RealmRoles        KCRoles            `json:"realm_access"`
	ResourceAccess    map[string]KCRoles `json:"resource_access"`
}

type KCRealmInfo struct {
	Realm           string `json:"realm"`
	PublicKey       string `json:"public_key"`
	TokenService    string `json:"token-service,omitempty"`
	AccountService  string `json:"account-service,omitempty"`
	TokensNotBefore int64  `json:"tokens-not-before,omitempty"`
}

/**
To retrieve keycloak pubkey

GET http://localhost/auth/realms/<realmname>

{"realm":"amazebot",
 "public_key":"MIIBI.....",
 "token-service":"http://localhost/auth/realms/amazebot/protocol/openid-connect",
 "account-service":"http://localhost/auth/realms/amazebot/account",
 "tokens-not-before":1619555853
}

 eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJIZlpzamUwNVo0TE5iNm1KX3pnTzRNMDRfYl9QRmpIeWcwWGRjWGhLWDBZIn0.eyJleHAiOjE2MzU3MTM5ODcsImlhdCI6MTYzNTcxMzY4NywiYXV0aF90aW1lIjoxNjM1NzEzNjM5LCJqdGkiOiIzOTJjZDgyNy1jZGM4LTQyYTAtYmIwOS0wODkzZTZhMDYwZTEiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2F1dGgvcmVhbG1zL2FtYXplYm90IiwiYXVkIjpbImdhbWVtZ3IiLCJwbGF5ZXJtZ3IiLCJtYXplbWdyIiwiYWNjb3VudCJdLCJzdWIiOiIyYTk4NmIyYi1lMWMxLTQwZTItOGY0My04OGQwNjIwMjNiNzMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhbWF6ZXVpIiwibm9uY2UiOiJiZGZiYTg4Ni1jNTYzLTQ3YjYtOGY1MC0yMWJjZGNiYjBmODciLCJzZXNzaW9uX3N0YXRlIjoiMTFmMWE5ODItYjk5OS00ODNiLWFhMDctZjBkMzEwNThlOTIxIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vamNtYXRlIiwiaHR0cHM6Ly9sb2NhbGhvc3QiLCJodHRwczovL2pjbWF0ZSIsImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSIsImh0dHA6Ly8xMjcuMC4wLjEiLCJodHRwczovLzEyNy4wLjAuMSIsImh0dHA6Ly9sb2NhbGhvc3QiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVpLnBsYXllciIsIm9mZmxpbmVfYWNjZXNzIiwidWkuYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImdhbWVtZ3IiOnsicm9sZXMiOlsiZ2FtZS5lZGl0IiwiZ2FtZS5hZG1pbiIsImdhbWUudmlldyJdfSwicGxheWVybWdyIjp7InJvbGVzIjpbInBsYXllci5hZG1pbiIsInBsYXllci52aWV3IiwicGxheWVyLmVkaXQiXX0sIm1hemVtZ3IiOnsicm9sZXMiOlsibWF6ZS52aWV3IiwibWF6ZS5lZGl0IiwibWF6ZS5hZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcm9sZXMgZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkpvZSBEYWx0b24iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqb2UiLCJnaXZlbl9uYW1lIjoiSm9lIiwiZmFtaWx5X25hbWUiOiJEYWx0b24iLCJlbWFpbCI6ImpvZUBmb28ub3JnIn0.Yp0pS25a9BMIcDPF7kaSVTnX-39nWvZ5SL7NeMbtwAGAVmfITTt52Tv26iTB_b1MAHVdZ2LqqsW9X4A8Cc-dsfwqC-P1_3GrdRx9ER2AhlnU0WU6VdJ7T4yKolrwQxxInoZaHjuKtWNwPSkdFx51MYEIhHCgz-yatZfBZzr73nCiYQV7eifyPemFMeNLkliE83GVpAwqZtx-nf-EyQ-0NeK4sobVxe9-Z93muiTUHhIRZy-ZNYntSBvgQoPBpHkOZEc2xqvlLmF13hc94FJP09b1ITlBz5oV9Wsc8ZJXIk_O0l6PuNlTRKUMVCdX6TpaG8r1xp-1VtzBDA_N2vCorw


 {
  "alg": "RS256",
  "typ": "JWT",
  "kid": "HfZsje05Z4LNb6mJ_zgO4M04_b_PFjHyg0XdcXhKX0Y"
 }
 {
  "exp": 1635713987,
  "iat": 1635713687,
  "auth_time": 1635713639,
  "jti": "392cd827-cdc8-42a0-bb09-0893e6a060e1",
  "iss": "http://localhost/auth/realms/amazebot",
  "aud": [
    "gamemgr",
    "playermgr",
    "mazemgr",
    "account"
  ],
  "sub": "2a986b2b-e1c1-40e2-8f43-88d062023b73",
  "typ": "Bearer",
  "azp": "amazeui",
  "nonce": "bdfba886-c563-47b6-8f50-21bcdcbb0f87",
  "session_state": "11f1a982-b999-483b-aa07-f0d31058e921",
  "acr": "0",
  "allowed-origins": [
    "http://jcmate",
    "https://localhost",
    "https://jcmate",
    "http://localhost:8081",
    "http://127.0.0.1",
    "https://127.0.0.1",
    "http://localhost",
    "http://localhost:3000"
  ],
  "realm_access": {
    "roles": [
      "ui.player",
      "offline_access",
      "ui.admin",
      "uma_authorization"
    ]
  },
  "resource_access": {
    "gamemgr": {
      "roles": [
        "game.edit",
        "game.admin",
        "game.view"
      ]
    },
    "playermgr": {
      "roles": [
        "player.admin",
        "player.view",
        "player.edit"
      ]
    },
    "mazemgr": {
      "roles": [
        "maze.view",
        "maze.edit",
        "maze.admin"
      ]
    },
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "openid roles email profile",
  "email_verified": false,
  "name": "Joe Dalton",
  "preferred_username": "joe",
  "given_name": "Joe",
  "family_name": "Dalton",
  "email": "joe@foo.org"
 }

*/

func CheckRole(req *http.Request, role string) bool {

	tokens := req.Header["Authorization"]
	if len(tokens) > 0 && strings.HasPrefix(tokens[0], "Bearer") {
		tokenString := tokens[0][7:]

		claims, ok := validTokenMap[tokenString]
		if ok {
			v := checkClaimValidity(claims)
			if !v {
				return false
			}
		} else {
			parser := jwt.Parser{}

			token, err := parser.ParseWithClaims(tokenString, &KeycloakClaim{}, func(token *jwt.Token) (interface{}, error) {
				// Don't forget to validate the alg is what you expect:
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); ok {
					return TokenSigningKey, nil
				}

				if _, ok := token.Method.(*jwt.SigningMethodRSA); ok {
					return getKeycloakSigningKey(), nil
				}

				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			})

			if err != nil {
				log.Printf("Error cannot parse token: %v\n", err)
				return false
			}

			if !token.Valid {
				log.Printf("Error invalid token: %v\n", token)
				return false
			}

			claims, ok = token.Claims.(*KeycloakClaim)

			if !ok {
				log.Println("Cannot get claim from token.")
				return false
			}
			validTokenMap[tokenString] = claims
			log.Printf("Token: %v\n", claims)
		}

		if claims != nil {
			playername := claims.PreferredUsername
			fmt.Printf("Get token: user=%v roles=%v\n", playername, claims.ResourceAccess)
			// check role
			for _, value := range claims.ResourceAccess {
				for _, r := range value.Roles {
					if r == role {
						return true
					}
				}
			}
		}
	}

	return false
}

func getKeycloakSigningKey() *rsa.PublicKey {

	if KeycloakTokenSigningKey == nil {
		resp, err := http.Get("http://localhost/auth/realms/amazebot")
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

func checkClaimValidity(claim *KeycloakClaim) bool {

	v := claim.Valid()

	if v != nil {
		log.Printf("Invalid claim: %v\n", v)
		return false
	}
	return true
}
