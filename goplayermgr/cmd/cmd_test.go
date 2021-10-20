package cmd

import (
	"bytes"
	"io/ioutil"
	"strings"
	"testing"

	"jc.org/playermgr/model"
)

func init() {
	db := model.ConnectToDB("file::memory:?cache=shared")

	// add some data
	p := model.AddPlayer(db, "Jack")
	model.AddBot(db, p.Pid, "TheBot", "botfile.js", "// some code")
	model.AddBot(db, p.Pid, "TheBot2", "botfile2.js", "// some code")
	model.AddPlayer(db, "William")
}

func Test_CommandHelpMsg(t *testing.T) {

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{})
	Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res := string(out)
	if !strings.HasPrefix(res, "Player Database manager and cli.") {
		t.Errorf("expected \"%s\" got \"%s\"", "Player Database manager and cli.", string(out))
	}
}

func Test_GetCommandPGSQL(t *testing.T) {

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"get"})
	rootCmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res := string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "Usage:", string(out))
	}
}

func Test_GetCommandSQLITE(t *testing.T) {

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "get"})
	rootCmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res := string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "get", "1"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "get", "1234"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "get", "Jack"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}
}

func Test_DeleteCommandSQLITE(t *testing.T) {

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "delete", "--playerid", "1"})
	rootCmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res := string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "delete", "--botid", "1"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}
}

func Test_CreateCommandSQLITE(t *testing.T) {

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "create", "player", "Jane"})
	rootCmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res := string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "create", "player"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "create", "bot", "Jane"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "create", "bot", "joe", "bot", "bot.js"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}

	rootCmd.SetArgs([]string{"--config", "../data/conf.yaml", "create", "bot", "1", "bot", "../data/bots/bot1.js"})
	rootCmd.Execute()
	out, err = ioutil.ReadAll(b)
	if err != nil {
		t.Error(err)
	}
	res = string(out)
	if !strings.HasPrefix(res, "") {
		t.Errorf("expected \"%s\" got \"%s\"", "", string(out))
	}
}
