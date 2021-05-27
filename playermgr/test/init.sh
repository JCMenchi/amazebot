#!/bin/bash

curl -X POST -H "content-type: application/json" \
     -d "{\"name\":\"joe\"}" http://localhost:8081/api/players

curl -X POST -H "content-type: application/json" \
     -d "{\"name\":\"jack\"}" http://localhost:8081/api/players

curl -X POST -H "content-type: application/json" \
     -d "{\"name\":\"william\"}" http://localhost:8081/api/players

curl -X POST -H "content-type: application/json" \
     -d "{\"name\":\"averel\"}" http://localhost:8081/api/players

curl http://localhost:8081/api/players

curl -X POST -H "content-type: application/json" \
     -d "{\"playerid\":49,\"url\":\"data/bots/bot1.js\",\"name\":\"bot1\"}" http://localhost:8081/api/bots

curl -X POST -H "content-type: application/json" \
     -d "{\"playerid\":49,\"url\":\"data/bots/bot2.js\",\"name\":\"bot2\"}" http://localhost:8081/api/players/49/bot

curl -X POST -H "content-type: application/json" \
     -d "{\"url\":\"data/bots/bot3.js\",\"name\":\"bot3\"}" http://localhost:8081/api/players/50/bot

curl -X DELETE http://localhost:8081/api/players/49/bot/5