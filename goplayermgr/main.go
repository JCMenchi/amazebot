package main

import (
	"os"

	log "github.com/sirupsen/logrus"
	"jc.org/playermgr/cmd"
)

func main() {
	log.SetFormatter(&log.TextFormatter{FullTimestamp: true})
	log.SetLevel(log.DebugLevel)
	log.SetOutput(os.Stdout)

	cmd.Execute()
}
