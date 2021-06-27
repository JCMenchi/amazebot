package cmd

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"jc.org/playermgr/model"
)

var playerId int64
var botId int64

// deleteCmd represents the delete command
var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a player or delete a bot from a player",
	Long: `Delete a player or delete a bot from a player.
When deleting a player its bot are deleted.`,
	Run: func(cmd *cobra.Command, args []string) {
		dsn := viper.GetString("player.dsn")
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
			bot := model.DeleteBot(db, botId)
			prettyJSON, err := json.MarshalIndent(bot, "", "    ")
			if err != nil {
				log.Fatal("Failed to generate json", err)
			}
			fmt.Printf("%s\n", string(prettyJSON))
		}
	},
}

func init() {
	deleteCmd.Flags().Int64VarP(&playerId, "playerid", "P", -1, "ID of player to delete")
	deleteCmd.Flags().Int64VarP(&botId, "botid", "B", -1, "ID of bot to delete")
	rootCmd.AddCommand(deleteCmd)
}
