package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"github.com/spf13/cobra"
	"jc.org/playermgr/model"
)

// createCmd represents the create command
var createCmd = &cobra.Command{
	Use:   "create",
	Short: "Create new Player or Bot for a Player",
	Long:  `Use create to add a new player or add a new bot to an existing player.`,
}

// playerCmd represents the player command
var createPlayerCmd = &cobra.Command{
	Use:   "player player_name",
	Short: "Create a new player",
	Long:  `Create a new player`,
	Run: func(cmd *cobra.Command, args []string) {

		if len(args) == 1 {
			dsn := getDSN()
			fmt.Printf("get called with DSN: %v\n", dsn)

			db := model.ConnectToDB(dsn)
			player := model.AddPlayer(db, args[0])
			if player != nil {
				prettyJSON, err := json.MarshalIndent(player, "", "    ")
				if err != nil {
					log.Fatal("Failed to generate json", err)
				}
				fmt.Printf("%s\n", string(prettyJSON))
			}
		} else {
			fmt.Printf("create player needs one argument\n")
		}
	},
}

var createBotCmd = &cobra.Command{
	Use:   "bot playerid botname botcodefile",
	Short: "Create a new bot",
	Long:  `Create a new bot for player playerid`,
	Run: func(cmd *cobra.Command, args []string) {

		if len(args) == 3 {
			dsn := getDSN()
			fmt.Printf("get called with DSN: %v\n", dsn)

			db := model.ConnectToDB(dsn)
			pid, err := strconv.ParseInt(args[0], 10, 32)
			if err != nil {
				fmt.Printf("create bot cannot read playerid: %v\n", err)
			} else {
				bot := model.AddBot(db, int32(pid), args[1], args[2], "")
				if bot != nil {
					prettyJSON, err := json.MarshalIndent(bot, "", "    ")
					if err != nil {
						log.Fatal("Failed to generate json", err)
					}
					fmt.Printf("%s\n", string(prettyJSON))
				}
			}
		} else {
			fmt.Printf("create bot needs 3 arguments\n")
		}
	},
}

func init() {
	rootCmd.AddCommand(createCmd)
	createCmd.AddCommand(createPlayerCmd)
	createCmd.AddCommand(createBotCmd)
}
