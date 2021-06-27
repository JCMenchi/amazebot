package cmd

import (
	"fmt"

	"jc.org/playermgr/api"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Playermgr backend",
	Long:  `Player Manager REST API.`,
	Run: func(cmd *cobra.Command, args []string) {
		dsn := viper.GetString("player.dsn")
		fmt.Printf("serve called with DSN: %v\n", dsn)

		api.Serve(dsn)
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)

	serveCmd.Flags().StringP("playerId", "P", "", "ID of player to display")
}
