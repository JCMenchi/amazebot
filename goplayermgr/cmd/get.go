package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"jc.org/playermgr/model"

	"github.com/spf13/cobra"
)

// getCmd represents the get command
var getCmd = &cobra.Command{
	Use:   "get [playerid|playername]",
	Short: "Get Player",
	Long:  `Get Player info.`,
	Run: func(cmd *cobra.Command, args []string) {
		dsn := getDSN()
		fmt.Printf("get called with DSN: %v\n", dsn)

		db := model.ConnectToDB(dsn)
		if len(args) == 0 {
			players := model.GetPlayersWithBots(db)
			fmt.Printf("result: %v\n", players)

			prettyJSON, err := json.MarshalIndent(players, "", "    ")
			if err != nil {
				log.Fatal("Failed to generate json", err)
			}
			fmt.Printf("%s\n", string(prettyJSON))
		} else {
			pid, err := strconv.ParseInt(args[0], 10, 0)
			if err != nil {
				// not a number it is a player name
				player := model.GetPlayerByName(db, args[0])
				prettyJSON, err := json.MarshalIndent(player, "", "    ")
				if err != nil {
					log.Fatal("Failed to generate json", err)
				}
				fmt.Printf("%s\n", string(prettyJSON))
			} else {
				player := model.GetPlayer(db, pid)
				prettyJSON, err := json.MarshalIndent(player, "", "    ")
				if err != nil {
					log.Fatal("Failed to generate json", err)
				}
				fmt.Printf("%s\n", string(prettyJSON))
			}
		}

	},
}

func init() {
	rootCmd.AddCommand(getCmd)
}
