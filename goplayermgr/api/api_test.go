package api_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/stretchr/testify/assert"
	"jc.org/playermgr/api"
	"jc.org/playermgr/model"
)

var InMemoryDSN = "file::memory:?cache=shared"
var router *gin.Engine
var bearerFullRight string

func createToken(user string) string {

	t := jwt.New(jwt.SigningMethodHS256)

	t.Claims = &api.KeycloakClaim{
		&jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Second * 60).Unix(),
		},
		[]string{""},
		user,
		api.KCRoles{Roles: []string{
			"ui.admin",
		}},
		map[string]api.KCRoles{
			"playermgr": {Roles: []string{
				"player.admin",
				"player.view",
				"player.edit",
			},
			},
		},
	}

	token, _ := t.SignedString(api.TokenSigningKey)

	return fmt.Sprintf("Bearer %v", token)
}

func init() {
	log.SetFormatter(&log.TextFormatter{FullTimestamp: true})
	log.SetLevel(log.DebugLevel)
	log.SetOutput(os.Stdout)

	db := model.ConnectToDB(InMemoryDSN)

	// add some data
	p := model.AddPlayer(db, "Jack")
	model.AddBot(db, p.Pid, "TheBot", "botfile.js", "// some code")
	model.AddBot(db, p.Pid, "TheBot2", "botfile2.js", "// some code")
	model.AddPlayer(db, "William")

	// create Bearer token
	bearerFullRight = createToken("Joe")

	// force debug during unit test
	gin.SetMode(gin.DebugMode)
	router = api.BuildRouter(InMemoryDSN)
}

func TestStatus(t *testing.T) {
	// test basic url
	req, _ := http.NewRequest("GET", "/info", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, httpStatus, 200)

	ans := resp.Body.String()
	assert.Equal(t, ans, "{\"status\":\"UP\"}")

	// test unknown url
	req, _ = http.NewRequest("GET", "/dummy", nil)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 404)

	ans = resp.Body.String()
	assert.Equal(t, ans, "404 page not found")

	// test unknown method
	req, _ = http.NewRequest("POST", "/info", nil)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 404)

	ans = resp.Body.String()
	assert.Equal(t, ans, "404 page not found")
}

func TestDbState(t *testing.T) {
	// test basic url
	req, _ := http.NewRequest("GET", "/info", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, httpStatus, 200)

	ans := resp.Body.String()
	assert.Equal(t, ans, "{\"status\":\"UP\"}")
}

type Player struct {
	Id   float64 `json:"id"`
	Name string  `json:"name"`
}

type Bot struct {
	Bid      int64  `json:"id"`
	Name     string `json:"name"`
	URL      string `json:"url,omitempty"`
	Filename string `json:"filename,omitempty"`
}

type BotCode struct {
	Bid      int64  `json:"id"`
	Name     string `json:"name"`
	URL      string `json:"url,omitempty"`
	Filename string `json:"filename,omitempty"`
	Botcode  string `json:"botcode,omitempty"`
}

func TestRead(t *testing.T) {
	// get all player
	req, _ := http.NewRequest("GET", "/api/players", nil)
	req.Header.Add("Authorization", bearerFullRight)

	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, 200, httpStatus)

	var objs []Player
	json.Unmarshal(resp.Body.Bytes(), &objs)
	if len(objs) != 2 {
		ans := resp.Body.String()
		t.Errorf("expected a list of 2 players got \"%s\"", ans)
	}

	// get one player
	req, _ = http.NewRequest("GET", "/api/players/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, 200, httpStatus)

	var obj Player
	json.Unmarshal(resp.Body.Bytes(), &obj)
	if obj.Name != "Jack" {
		ans := resp.Body.String()
		t.Errorf("expected a list of 2 players got \"%s\"", ans)
	}

	// get my info - first time will create user
	req, _ = http.NewRequest("GET", "/api/players/my/info", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, 200, httpStatus)

	// get my info - second time find user
	req, _ = http.NewRequest("GET", "/api/players/my/info", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, 200, httpStatus)

	// get bots for player 1
	req, _ = http.NewRequest("GET", "/api/players/1/bot", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, 200, httpStatus)

	var bots []Bot
	json.Unmarshal(resp.Body.Bytes(), &bots)
	if len(bots) != 2 {
		ans := resp.Body.String()
		t.Errorf("expected a list of 2 bots got \"%s\"", ans)
	}

	// get bot 1
	req, _ = http.NewRequest("GET", "/api/players/1/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 200)

	var bot Bot
	json.Unmarshal(resp.Body.Bytes(), &bot)
	if bot.Bid != 1 || bot.Name != "TheBot" {
		ans := resp.Body.String()
		t.Errorf("expected a bot got \"%s\"", ans)
	}

	// get bot 1 code
	req, _ = http.NewRequest("GET", "/api/players/1/bot/1/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 200)

	var botc BotCode
	json.Unmarshal(resp.Body.Bytes(), &botc)
	if botc.Botcode != "// some code" {
		ans := resp.Body.String()
		t.Errorf("expected a bot code got \"%s\"", ans)
	}

}

func TestReadError(t *testing.T) {

	// get one non existing player
	req, _ := http.NewRequest("GET", "/api/players/1234", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/foo", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	// get bots for non existing player
	req, _ = http.NewRequest("GET", "/api/players/1234/bot", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/foo/bot", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	// get non existing bot
	req, _ = http.NewRequest("GET", "/api/players/1/bot/1234", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/1/bot/foo", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/2/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/1234/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/foo/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	// get code for non existing bot
	req, _ = http.NewRequest("GET", "/api/players/1/bot/1234/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/1/bot/foo/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/1234/bot/1/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/foo/bot/1/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("GET", "/api/players/2/bot/1/code", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

}

func TestDelete(t *testing.T) {

	// add some data to delete
	db := model.ConnectToDB(InMemoryDSN)
	p := model.AddPlayer(db, "John")
	model.AddBot(db, p.Pid, "JohnBot", "botfile.js", "// some code")
	model.AddBot(db, p.Pid, "JohnBot2", "botfile2.js", "// some code")

	// delete one bot
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/players/%v/bot/3", p.Pid), nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, httpStatus, 200)

	var bot Bot
	json.Unmarshal(resp.Body.Bytes(), &bot)
	if bot.Bid != 3 {
		ans := resp.Body.String()
		t.Errorf("delete did not return deleted bot \"%s\"", ans)
	}

	// delete one player
	req, _ = http.NewRequest("DELETE", fmt.Sprintf("/api/players/%v", p.Pid), nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 200)

	var obj Player
	json.Unmarshal(resp.Body.Bytes(), &obj)
	if obj.Id != float64(p.Pid) {
		ans := resp.Body.String()
		t.Errorf("delete did not return deleted player \"%s\"", ans)
	}
}

func TestDeleteError(t *testing.T) {
	// delete non existing player
	req, _ := http.NewRequest("DELETE", "/api/players/1234", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus := resp.Code
	assert.Equal(t, httpStatus, 500)

	// delete non existing player
	req, _ = http.NewRequest("DELETE", "/api/players/foo", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	// delete non existing bot
	req, _ = http.NewRequest("DELETE", "/api/players/1/bot/1234", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("DELETE", "/api/players/1/bot/foo", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("DELETE", "/api/players/1234/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("DELETE", "/api/players/foo/bot/1", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	req, _ = http.NewRequest("DELETE", "/api/players/2/bot/2", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)

	// check double delete
	req, _ = http.NewRequest("GET", "/api/players/1/bot", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 200)

	var bots []Bot
	json.Unmarshal(resp.Body.Bytes(), &bots)
	if len(bots) != 2 {
		ans := resp.Body.String()
		t.Errorf("expected a list of 2 bots got \"%s\"", ans)
	}

	req, _ = http.NewRequest("DELETE", "/api/players/1/bot/2", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 200)

	req, _ = http.NewRequest("DELETE", "/api/players/1/bot/2", nil)
	req.Header.Add("Authorization", bearerFullRight)
	resp = httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	httpStatus = resp.Code
	assert.Equal(t, httpStatus, 500)
}

func TestCreate(t *testing.T) {

}

func TestCreateError(t *testing.T) {

}
