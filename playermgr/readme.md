# Player Manager

How to test playermgr API with curl.

- Get a token for user joe

```bash
BTOKEN=$(curl -X POST \
  http://keycloak:8080/auth/realms/amazebot/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=joe&password=dalton&grant_type=password&client_id=amazeui' | jq -r '.access_token')

BTOKEN=$(curl -X POST \
  http://localhost/auth/realms/amazebot/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=joe&password=dalton&grant_type=password&client_id=amazeui' | jq -r '.access_token')
```

- Test API with bearer token

```bash
  curl -X GET -H "Authorization: Bearer ${BTOKEN}" http://localhost:8081/service/secured
```
