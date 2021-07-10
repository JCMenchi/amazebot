package model_test

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"jc.org/playermgr/model"
)

var InMemoryDSN = "file::memory:"
var db *gorm.DB

func init() {
	db = model.ConnectToDB(InMemoryDSN)

	// add some data
	p := model.AddPlayer(db, "Jack")
	model.AddBot(db, p.Pid, "TheBot", "botfile.js", "// some code")
	model.AddBot(db, p.Pid, "TheBot2", "botfile2.js", "// some code")
	model.AddPlayer(db, "William")
}

func TestSchema(t *testing.T) {

	if db == nil {
		t.Error("Cannot create sqlite in memory database")
	}

	// check if Player table exists
	var player *model.Player
	result := db.First(&player)
	if result.Error != nil && result.Error.Error() != "record not found" {
		t.Error("Player table does not exist")
	}

	// check if Bot table exists
	var bot *model.Bot
	result = db.First(&bot)
	if result.Error != nil && result.Error.Error() != "record not found" {
		t.Error("Bot table does not exist")
	}
}

// test query
func TestQuery(t *testing.T) {

	// query on player info
	players := model.GetPlayers(db)
	if len(players) != 2 {
		t.Errorf("Expected 2 players, found %v", len(players))
	}

	players = model.GetPlayersWithBots(db)
	if len(players) != 2 {
		t.Errorf("Expected 2 players with bots, found %v", len(players))
	}

	player := model.GetPlayer(db, 1)
	if player == nil {
		t.Error("Cannot get existing player")
	}

	player = model.GetPlayer(db, 1234)
	if player != nil {
		t.Error("Return non existing player")
	}

	player = model.GetPlayerByName(db, "Jack")
	if player == nil {
		t.Error("Cannot get existing player")
	}

	player = model.GetPlayerByName(db, "Averel")
	if player == nil {
		t.Error("Cannot get existing player")
	}

	// query bot info
	bots := model.GetPlayerBots(db, 1)
	if len(bots) != 2 {
		t.Errorf("Expected 2 bots, found %v", len(players))
	}

	bots = model.GetPlayerBots(db, 2)
	if len(bots) != 0 {
		t.Errorf("Expected 0 bots, found %v", len(players))
	}

	bot := model.GetBot(db, 1, 1)
	if bot == nil {
		t.Error("Cannot get existing bot")
	}

	bot = model.GetBot(db, 1, 1234)
	if bot != nil {
		t.Error("Return non existing bot")
	}

	bot = model.GetBot(db, 1234, 1)
	if bot != nil {
		t.Error("Return bot for non existing player")
	}

	botcode := model.GetBotCode(db, 1)
	if botcode == nil {
		t.Error("Cannot get bot code")
	}

	botcode = model.GetBotCode(db, 1234)
	if botcode != nil {
		t.Error("Return bot code for non existing bot")
	}

}

// test creation
func TestAddPlayer(t *testing.T) {
	p := model.AddPlayer(db, "Joe")

	if p == nil {
		t.Error("Cannot add player")
	}

	// cannot add 2 player with same name
	p = model.AddPlayer(db, "Joe")

	if p != nil {
		t.Error("Erronous creation of second player with same name")
	}
}

func TestAddBot(t *testing.T) {
	b := model.AddBot(db, 1, "NewBot", "nb.js", "// some code")

	if b == nil {
		t.Error("Cannot add bot")
	}

	b = model.AddBot(db, 1234, "NewBot", "nb.js", "// some code")

	if b != nil {
		t.Error("Erronous creation of bot for non existing player")
	}

	b = model.AddBot(db, 1, "NewBot", "nb.js", "")

	if b != nil {
		t.Error("Erronous creation of bot with non existing code")
	}

	b = model.AddBot(db, 1, "NewBot2", "../data/bots/bot1.js", "")
	if b == nil {
		t.Error("Cannot create bot from code file")
	}

}

// test deletion
func TestDelete(t *testing.T) {

	// delete player
	player := model.DeletePlayer(db, 1)
	if player == nil {
		t.Error("Cannot delete existing player")
	}

	player = model.DeletePlayer(db, 1234)
	if player != nil {
		t.Error("Return non existing player")
	}

	// delete bot
	bot := model.DeleteBot(db, 1)
	if bot == nil {
		t.Error("Cannot delete existing bot")
	}

	bot = model.DeleteBot(db, 1234)
	if bot != nil {
		t.Error("Return non existing bot")
	}
}

// test defensive prog
func TestErrorCase(t *testing.T) {
	var badDB *gorm.DB = nil

	p := model.GetPlayer(badDB, 1)
	if p != nil {
		t.Error("Do something with not existing DB")
	}

	ps := model.GetPlayers(badDB)
	if ps != nil {
		t.Error("Do something with not existing DB")
	}

	p = model.GetPlayerByName(badDB, "Jack")
	if p != nil {
		t.Error("Do something with not existing DB")
	}

	bs := model.GetPlayerBots(badDB, 1)
	if bs != nil {
		t.Error("Do something with not existing DB")
	}

	ps = model.GetPlayersWithBots(badDB)
	if ps != nil {
		t.Error("Do something with not existing DB")
	}

	b := model.GetBot(badDB, 1, 1)
	if b != nil {
		t.Error("Do something with not existing DB")
	}

	bc := model.GetBotCode(badDB, 1)
	if bc != nil {
		t.Error("Do something with not existing DB")
	}

	p = model.AddPlayer(badDB, "")
	if p != nil {
		t.Error("Do something with not existing DB")
	}

	p = model.DeletePlayer(badDB, 1)
	if p != nil {
		t.Error("Do something with not existing DB")
	}

	bp := model.AddBot(badDB, 1, "", "", "// some code")
	if bp != nil {
		t.Error("Do something with not existing DB")
	}

	bb := model.DeleteBot(badDB, 1)
	if bb != nil {
		t.Error("Do something with not existing DB")
	}
}

// Define struct to create a test database with a bad schema
type SimplePlayer struct {
	Pid  int64  `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique" json:"name"`
}

func (SimplePlayer) TableName() string {
	return "player"
}

type SimpleBot struct {
	Id       int64 `gorm:"primaryKey"`
	PlayerId int64
}

func (SimpleBot) TableName() string {
	return "bot"
}

func TestBadSchema(t *testing.T) {

	dbWithBadSchema, _ := gorm.Open(sqlite.Open(InMemoryDSN),
		&gorm.Config{Logger: logger.Default.LogMode(logger.Info)})

	p := model.GetPlayer(dbWithBadSchema, 1)
	if p != nil {
		t.Error("Do something with bad schema")
	}

	ps := model.GetPlayers(dbWithBadSchema)
	if ps != nil {
		t.Error("Do something with bad schema")
	}

	p = model.GetPlayerByName(dbWithBadSchema, "Jack")
	if p != nil {
		t.Error("Do something with bad schema")
	}

	bs := model.GetPlayerBots(dbWithBadSchema, 1)
	if bs != nil {
		t.Error("Do something with bad schema")
	}

	ps = model.GetPlayersWithBots(dbWithBadSchema)
	if ps != nil {
		t.Error("Do something with bad schema")
	}

	b := model.GetBot(dbWithBadSchema, 1, 1)
	if b != nil {
		t.Error("Do something with bad schema")
	}

	bc := model.GetBotCode(dbWithBadSchema, 1)
	if bc != nil {
		t.Error("Do something with bad schema")
	}

	p = model.AddPlayer(dbWithBadSchema, "")
	if p != nil {
		t.Error("Do something with bad schema")
	}

	p = model.DeletePlayer(dbWithBadSchema, 1)
	if p != nil {
		t.Error("Do something with bad schema")
	}

	// add Player table to test error related to Bot
	dbWithBadSchema.AutoMigrate(&SimplePlayer{}, &SimpleBot{})
	model.AddPlayer(dbWithBadSchema, "Jack")

	bp := model.AddBot(dbWithBadSchema, 1, "bot", "bot.js", "// some code")
	if bp != nil {
		t.Error("Do something with bad schema")
	}

	bb := model.DeleteBot(dbWithBadSchema, 1)
	if bb != nil {
		t.Error("Do something with bad schema")
	}
}

func TestDBConnectionError(t *testing.T) {

	dbtest := model.ConnectToDB("xxxx")
	if dbtest != nil {
		t.Error("Return non nil DB connection from unknown DSN")
	}

	dbtest = model.ConnectToDB("file:/dummy.db")
	if dbtest != nil {
		t.Error("Return non nil sqlite DB connection from unallowed file")
	}

	dbtest = model.ConnectToDB("postgres:")
	if dbtest != nil {
		t.Error("Return non nil DB connection from invalid postgres DSN")
	}

	dbtest = model.ConnectToDB("postgres://playeruser:playeruser@pgsql:5432/playerdb?sslmode=disable")
	if dbtest != nil {
		t.Error("Return non nil DB connection from invalid postgres DSN")
	}
}
