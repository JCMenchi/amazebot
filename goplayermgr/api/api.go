package api

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	ginprometheus "github.com/zsais/go-gin-prometheus"
	"gorm.io/gorm"
	"jc.org/playermgr/model"
)

// store Postgresql connection
var playerDB *gorm.DB
var playerDSN string

// Start HTTP server
func Serve(dsn string) {
	router := BuildRouter(dsn)

	router.Run(":8081") // listen and serve on 0.0.0.0:8081
}

func BuildRouter(dsn string) *gin.Engine {
	engine := gin.New()
	engine.Use(gin.Logger())
	engine.Use(gin.Recovery())

	// add prometheus exporter to gin router
	prom := ginprometheus.NewPrometheus("gin")
	prom.ReqCntURLLabelMappingFn = func(c *gin.Context) string {
		url := c.Request.URL.Path
		for _, p := range c.Params {
			if p.Key == "playerid" {
				url = strings.Replace(url, p.Value, ":playerid", 1)
			} else if p.Key == "botid" {
				url = strings.Replace(url, p.Value, ":botid", 1)
			}
		}
		return url
	}
	prom.Use(engine)

	// connect to Database
	playerDSN = dsn
	playerDB = model.ConnectToDB(playerDSN)

	apigroup := engine.Group("/api")
	addRoutes(apigroup)

	engine.GET("/info", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP"})
	})

	return engine
}

type AddPlayerBody struct {
	Name string `json:"name" binding:"required"`
}

type AddBotBody struct {
	Name     string `json:"name" binding:"required"`
	Filename string `json:"filename" binding:"required"`
	Botcode  string `json:"botcode" binding:"required"`
}

func addRoutes(rg *gin.RouterGroup) {

	rg.GET("/players", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		players := model.GetPlayers(playerDB)
		if players == nil {
			c.JSON(500, "[]")
			return
		}
		c.JSON(200, players)
	})

	rg.GET("/players/my/info", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}

		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		playername := GetUserName(c.Request)

		player := model.GetPlayerByName(playerDB, playername)
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.POST("/players", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.admin")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		var body AddPlayerBody
		err := c.BindJSON(&body)
		if err != nil {
			log.Printf("Error in POST /players: %v\n", err)
			c.JSON(500, "")
			return
		}
		player := model.AddPlayer(playerDB, body.Name)
		if player == nil {
			c.JSON(500, "[]")
			return
		}
		c.JSON(200, player)
	})

	rg.GET("/players/:playerid", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		player := model.GetPlayer(playerDB, int32(pid))
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.DELETE("/players/:playerid", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.admin")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in DELETE /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		player := model.DeletePlayer(playerDB, int32(pid))
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.GET("/players/:playerid/bot", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		bots := model.GetPlayerBots(playerDB, int32(pid))
		if bots == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bots)
	})

	rg.POST("/players/:playerid/bot", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.edit")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot: %v\n", err)
			c.JSON(500, "")
			return
		}

		var body AddBotBody
		err = c.BindJSON(&body)
		if err != nil {
			log.Printf("Error in POST /players/:playerid/bot: %v\n", err)
			c.JSON(500, "")
			return
		}

		bots := model.AddBot(playerDB, int32(pid), body.Name, body.Filename, body.Botcode)
		if bots == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bots)
	})

	rg.GET("/players/:playerid/bot/:botid", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot: %v\n", err)
			c.JSON(500, "")
			return
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot/:botid: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.GetBot(playerDB, int32(pid), int32(bid))
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

	rg.GET("/players/:playerid/bot/:botid/code", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.view")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot/:botid/code: %v\n", err)
			c.JSON(500, "")
			return
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 32)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot/:botid/code: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.GetBotCode(playerDB, int32(pid), int32(bid))
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

	rg.DELETE("/players/:playerid/bot/:botid", func(c *gin.Context) {
		authorized := CheckRole(c.Request, "player.edit")
		if !authorized {
			c.String(401, "unauthorized")
			return
		}
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 32)
		if err != nil {
			log.Printf("Error in DELETE /players/:playerid/bot/:botid/code: %v\n", err)
			c.JSON(500, "")
			return
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 32)
		if err != nil {
			log.Printf("Error in DELETE /players/:playerid/bot/:botid: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.DeleteBot(playerDB, int32(pid), int32(int32(bid)))
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

}
