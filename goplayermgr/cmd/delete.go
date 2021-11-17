package cmd

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/spf13/cobra"
	"jc.org/playermgr/model"
)

var playerId int32
var botId int32

// deleteCmd represents the delete command
var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a player or delete a bot from a player",
	Long: `Delete a player or delete a bot from a player.
When deleting a player its bot are deleted.`,
	Run: func(cmd *cobra.Command, args []string) {
		dsn := getDSN()
		fmt.Printf("delete called with DSN: %v\n", dsn)
		db := model.ConnectToDB(dsn)
		if playerId != -1 {
			player := model.DeletePlayer(db, playerId)
			prettyJSON, err := json.MarshalIndent(player, "", "    ")
			if err != nil {
				log.Fatal("Failed to generate json", err)
			}
			fmt.Printf("%s\n", string(prettyJSON))
		}

		if botId != -1 {
			bot := model.DeleteBot(db, playerId, botId)
			prettyJSON, err := json.MarshalIndent(bot, "", "    ")
			if err != nil {
				log.Fatal("Failed to generate json", err)
			}
			fmt.Printf("%s\n", string(prettyJSON))
		}
	},
}

func init() {
	deleteCmd.Flags().Int32Var(&playerId, "playerid", -1, "ID of player to delete")
	deleteCmd.Flags().Int32Var(&botId, "botid", -1, "ID of bot to delete")
	rootCmd.AddCommand(deleteCmd)
}
