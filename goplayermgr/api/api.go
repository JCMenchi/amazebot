package api

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	ginprometheus "github.com/zsais/go-gin-prometheus"
	"gorm.io/gorm"
	"jc.org/playermgr/model"
)

// store Postgresql connection
var playerDB *gorm.DB
var playerDSN string

// Start HTTP server
func Serve(dsn string) {
	router := gin.Default()

	// add prometheus exporter to gin router
	p := ginprometheus.NewPrometheus("gin")
	p.ReqCntURLLabelMappingFn = func(c *gin.Context) string {
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
	p.Use(router)

	// connect to Database
	playerDSN = dsn
	playerDB = model.ConnectToDB(playerDSN)

	apigroup := router.Group("/api")
	addRoutes(apigroup)

	router.GET("/info", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP,"})
	})

	router.Run(":8081") // listen and serve on 0.0.0.0:8081
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
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		playername := ""
		tokens := c.Request.Header["Authorization"]
		if strings.HasPrefix(tokens[0], "Bearer") {
			tokenString := tokens[0][7:]

			parser := jwt.Parser{}
			claims := jwt.MapClaims{}
			parser.ParseUnverified(tokenString, claims)
			fmt.Printf("Get token: %v\n", claims["preferred_username"])
			var ok bool
			playername, ok = claims["preferred_username"].(string)
			if !ok {
				fmt.Println("cannot get preferred_username")
			}
		}

		player := model.GetPlayerByName(playerDB, playername)
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.POST("/players", func(c *gin.Context) {
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
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 0)
		if err != nil {
			log.Printf("Error in GET /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		player := model.GetPlayer(playerDB, pid)
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.DELETE("/players/:playerid", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 0)
		if err != nil {
			log.Printf("Error in DELETE /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		player := model.DeletePlayer(playerDB, pid)
		if player == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, player)
	})

	rg.GET("/players/:playerid/bot", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 0)
		if err != nil {
			log.Printf("Error in GET /players/:playerid: %v\n", err)
			c.JSON(500, "")
			return
		}
		bots := model.GetPlayerBots(playerDB, pid)
		if bots == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bots)
	})

	rg.POST("/players/:playerid/bot", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}
		pid, err := strconv.ParseInt(c.Param("playerid"), 10, 0)
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

		bots := model.AddBot(playerDB, pid, body.Name, body.Filename, body.Botcode)
		if bots == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bots)
	})

	rg.GET("/players/:playerid/bot/:botid", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 0)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot/:botid: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.GetBot(playerDB, bid)
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

	rg.GET("/players/:playerid/bot/:botid/code", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 0)
		if err != nil {
			log.Printf("Error in GET /players/:playerid/bot/:botid/code: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.GetBotCode(playerDB, bid)
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

	rg.DELETE("/players/:playerid/bot/:botid", func(c *gin.Context) {
		if playerDB == nil {
			playerDB = model.ConnectToDB(playerDSN)
		}

		bid, err := strconv.ParseInt(c.Param("botid"), 10, 0)
		if err != nil {
			log.Printf("Error in DELETE /players/:playerid/bot/:botid: %v\n", err)
			c.JSON(500, "")
			return
		}

		bot := model.DeleteBot(playerDB, bid)
		if bot == nil {
			c.JSON(500, "")
			return
		}
		c.JSON(200, bot)
	})

}
