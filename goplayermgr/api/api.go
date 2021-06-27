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

}
