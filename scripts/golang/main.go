package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	tg "github.com/amarnathcjd/gogram/telegram"
	dotenv "github.com/joho/godotenv"
)

type Entry struct {
	PeakSpeed string `json:"peak_speed"`
	AvgSpeed  string `json:"avg_speed"`
	TimeTaken int64  `json:"time_taken"`
	StartTime int64  `json:"start_time"`
	EndTime   int64  `json:"end_time"`
}

type Benchmark struct {
	Version  string `json:"version"`
	Layer    int    `json:"layer"`
	Download Entry  `json:"download"`
	Upload   Entry  `json:"upload"`
	FileSize int64  `json:"file_size"`
}

func main() {
	var benchmark = Benchmark{
		Version: tg.Version,
		Layer:   tg.ApiVersion,
	}

	dotenv.Load()
	var (
		APP_ID       = os.Getenv("TG_API_ID")
		APP_HASH     = os.Getenv("TG_API_HASH")
		BOT_TOKEN    = os.Getenv("TG_BOT_TOKEN")
		MESSAGE_LINK = os.Getenv("TG_MESSAGE_LINK")
		TG_SESSION   = os.Getenv("TG_SESSION")
	)

	appIdInt, _ := strconv.Atoi(APP_ID)

	cfg := tg.ClientConfig{
		AppID:         int32(appIdInt),
		AppHash:       APP_HASH,
		LogLevel:      tg.LogInfo,
		MemorySession: true,
		DisableCache:  true,
	}

	if TG_SESSION != "" {
		cfg.StringSession = TG_SESSION
	}

	client, _ := tg.NewClient(cfg)
	client.LoginBot(BOT_TOKEN)
	messageId, _ := strconv.Atoi(strings.Split(MESSAGE_LINK, "/")[4])
	message, _ := client.GetMessageByID(strings.Split(MESSAGE_LINK, "/")[3], int32(messageId))

	var prog = tg.NewProgressManager(2)
	var peakSpeed int64 = 0
	var startTime int64 = time.Now().Unix()
	var fileSize int64 = message.File.Size

	prog.Edit(func(totalSize, currentSize int64) {
		if time.Now().Unix()-startTime == 0 {
			return
		}
		var currSpeed = currentSize / (time.Now().Unix() - startTime)
		if currSpeed > peakSpeed {
			peakSpeed = currSpeed
		}
	})

	downloaded, _ := message.Download(&tg.DownloadOptions{
		ProgressManager: prog,
	})
	defer os.Remove(downloaded)

	var avgSpeed = float64(fileSize) / float64(time.Now().Unix()-startTime)

	benchmark.Download = Entry{
		PeakSpeed: HumanizeBytes(peakSpeed) + "/s",
		AvgSpeed:  HumanizeBytes(int64(avgSpeed)) + "/s",
		TimeTaken: time.Now().Unix() - startTime,
		StartTime: startTime,
		EndTime:   time.Now().Unix(),
	}

	prog = tg.NewProgressManager(2)
	peakSpeed = 0
	startTime = time.Now().Unix()
	fileSize = message.File.Size

	prog.Edit(func(totalSize, currentSize int64) {
		if time.Now().Unix()-startTime == 0 {
			return
		}
		var currSpeed = currentSize / (time.Now().Unix() - startTime)
		if currSpeed > peakSpeed {
			peakSpeed = currSpeed
		}
	})

	client.SendMedia(message.Chat, downloaded, &tg.MediaOptions{
		ProgressManager: prog,
		ForceDocument:   true,
		ReplyID:         message.ID,
		Caption:         "gogram",
		Attributes:      message.Document().Attributes,
	})

	avgSpeed = float64(fileSize) / float64(time.Now().Unix()-startTime)

	benchmark.Upload = Entry{
		PeakSpeed: HumanizeBytes(peakSpeed) + "/s",
		AvgSpeed:  HumanizeBytes(int64(avgSpeed)) + "/s",
		TimeTaken: time.Now().Unix() - startTime,
		StartTime: startTime,
		EndTime:   time.Now().Unix(),
	}

	benchmark.FileSize = fileSize

	jsonBenchmark, _ := json.MarshalIndent(benchmark, "", "  ")
	os.WriteFile("../../outputs/gogram.json", jsonBenchmark, 0644)
}

func HumanizeBytes(size int64) string {
	var units = []string{"B", "KB", "MB", "GB", "TB"}
	var i = 0
	for size > 1024 {
		size = size / 1024
		i++
	}
	return fmt.Sprintf("%.2f %s", float64(size), units[i])
}
