package model

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Player struct {
	Pid  int64  `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
	Bots []Bot  `gorm:"foreignKey:PlayerId" json:"bots,omitempty"`
}

func (Player) TableName() string {
	return "player"
}

type BotBase struct {
	Bid      int64  `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	PlayerId int64  `json:"-"`
}

func (BotBase) TableName() string {
	return "bot"
}

type Bot struct {
	Bid      int64  `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	URL      string `json:"url,omitempty"`
	Filename string `json:"filename,omitempty"`
	PlayerId int64  `json:"-"`
}

func (Bot) TableName() string {
	return "bot"
}

type BotCode struct {
	Bid      int64  `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	Filename string `json:"filename,omitempty"`
	Botcode  string `json:"botcode,omitempty"`
	PlayerId int64  `json:"-"`
}

func (BotCode) TableName() string {
	return "bot"
}

func GetPlayers(db *gorm.DB) []Player {
	if db == nil {
		return nil
	}
	var players []Player
	result := db.Find(&players)
	if result.Error != nil {
		fmt.Printf("err: %v\n", result.Error)
		return nil
	}

	return players
}

func GetPlayer(db *gorm.DB, pid int64) *Player {
	if db == nil {
		return nil
	}
	var player *Player
	result := db.Preload("Bots").First(&player, pid)
	if result.Error != nil {
		fmt.Printf("Error GetPlayer(%v): %v\n", pid, result.Error)
		return nil
	}

	return player
}

func AddPlayer(db *gorm.DB, name string) *Player {
	if db == nil {
		return nil
	}

	player := &Player{Name: name}

	result := db.Create(player)
	if result.Error != nil {
		fmt.Printf("Error AddPlayer(%v): %v\n", name, result.Error)
		return nil
	}
	return player
}

func DeletePlayer(db *gorm.DB, pid int64) *Player {
	if db == nil {
		return nil
	}

	player := &Player{Pid: pid}

	result := db.Delete(player)
	if result.Error != nil {
		fmt.Printf("Error DeletePlayer(%v): %v\n", pid, result.Error)
		return nil
	}
	return player
}

func DeleteBot(db *gorm.DB, bid int64) *BotBase {
	if db == nil {
		return nil
	}

	bot := &BotBase{Bid: bid}

	result := db.Delete(bot)
	if result.Error != nil {
		fmt.Printf("Error DeleteBot(%v): %v\n", bid, result.Error)
		return nil
	}
	return bot
}

func GetPlayerByName(db *gorm.DB, name string) *Player {
	if db == nil {
		return nil
	}
	var player *Player
	result := db.Preload("Bots").Where("name = ?", name).First(&player)
	if result.Error != nil {
		fmt.Printf("Error GetPlayerByName(%v): %v\n", name, result.Error)
		return nil
	}

	return player
}

func GetPlayersWithBots(db *gorm.DB) []Player {
	if db == nil {
		return nil
	}
	var players []Player
	result := db.Preload("Bots").Find(&players)
	if result.Error != nil {
		fmt.Printf("err: %v\n", result.Error)
	}

	return players
}

func AddBot(db *gorm.DB, pid int64, botname string, codefilename string) *BotBase {
	if db == nil {
		return nil
	}

	dat, err := ioutil.ReadFile(codefilename)
	if err != nil {
		fmt.Printf("Error AddBot(%v): %v\n", botname, err)
		return nil
	}

	bot := &BotCode{Name: botname, Filename: filepath.Base(codefilename), Botcode: string(dat), PlayerId: pid}

	result := db.Create(bot)
	if result.Error != nil {
		fmt.Printf("Error AddBot(%v): %v\n", botname, result.Error)
		return nil
	}
	return &BotBase{Bid: bot.Bid, Name: bot.Name}
}

func ConnectToDB(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.New(postgres.Config{DSN: dsn, PreferSimpleProtocol: true}),
		&gorm.Config{Logger: logger.Default.LogMode(logger.Info)})

	if err != nil {
		fmt.Printf("ConnectToDB error: %v\n", err)
		return nil
	}

	return db
}
