package cmd

import (
	"jc.org/playermgr/api"

	"github.com/spf13/cobra"
)

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Playermgr backend",
	Long:  `Player Manager REST API.`,
	Run: func(cmd *cobra.Command, args []string) {
		dsn := getDSN()
		api.Serve(dsn)
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
