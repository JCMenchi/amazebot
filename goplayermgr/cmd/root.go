package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"

	homedir "github.com/mitchellh/go-homedir"
	"github.com/spf13/viper"
)

// package variable
// name of viper config file set as command line arg
var cfgFile string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:       "playermgr",
	Short:     "Player Database Manager",
	Long:      `Player Database manager and cli.`,
	Version:   "1.0.0",
	ValidArgs: []string{"create", "delete", "get", "serve"},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	cobra.OnInitialize(initConfig)

	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.playercli.yaml)")

	rootCmd.PersistentFlags().StringP("dsn-host", "H", "pgsql", "Player Database Hostname")
	viper.BindPFlag("dsn.host", rootCmd.PersistentFlags().Lookup("dsn-host"))
	viper.SetDefault("dsn.host", "pgsql")

	rootCmd.PersistentFlags().StringP("dsn-dbname", "d", "playerdb", "Player Database name")
	viper.BindPFlag("dsn.dbname", rootCmd.PersistentFlags().Lookup("dsn-dbname"))
	viper.SetDefault("dsn.dbname", "playerdb")

	rootCmd.PersistentFlags().IntP("dsn-port", "P", 5432, "Player Database port")
	viper.BindPFlag("dsn.port", rootCmd.PersistentFlags().Lookup("dsn-port"))
	viper.SetDefault("dsn.port", 5432)

	// PG_DB_USER, PG_DB_PASSWORD
	rootCmd.PersistentFlags().StringP("dsn-user", "u", "", "Player Database User Name")
	viper.BindPFlag("dsn.user", rootCmd.PersistentFlags().Lookup("dsn-user"))

	rootCmd.PersistentFlags().StringP("dsn-password", "p", "", "Player Database User password")
	viper.BindPFlag("dsn.password", rootCmd.PersistentFlags().Lookup("dsn-password"))

}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		cobra.CheckErr(err)

		// Search config in home directory with name ".playercli" (without extension).
		viper.AddConfigPath(home)
		viper.SetConfigName(".playercli")
		viper.SetConfigType("yaml")
	}

	viper.SetEnvPrefix("PLAYER")
	replacer := strings.NewReplacer(".", "_", "-", "_")
	viper.SetEnvKeyReplacer(replacer)
	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}

/* Build database connection string
e.g. postgres://playeruser:playeruser@pgsql:5432/playerdb?sslmode=disable
*/
func getDSN() string {
	dsn := "postgres://"
	dsn += viper.GetString("dsn.user") + ":"
	dsn += viper.GetString("dsn.password") + "@"
	dsn += viper.GetString("dsn.host") + ":"
	dsn += fmt.Sprint(viper.GetInt("dsn.port")) + "/"
	dsn += viper.GetString("dsn.dbname")
	dsn += "?sslmode=disable"
	return dsn
}
