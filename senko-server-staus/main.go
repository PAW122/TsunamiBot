package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gen2brain/beeep"
	"github.com/tawesoft/golib/v2/dialog"
)

const testLink = "http://localhost:3000/actions/server_status"
const senkoLink = "https://senko.pagekite.me/actions/server_status"
const sleep_time = 60

// max 1 alert na raz
func main() {
	// Pętla sprawdzająca serwer co 10 sekund
	for {
		start := time.Now() // Zapisanie czasu rozpoczęcia żądania
		err := checkServer(senkoLink)
		if err != nil {
			alert("senko server not responding")
		} else {
			duration := time.Since(start) // Obliczenie czasu, jaki upłynął od wysłania żądania do otrzymania odpowiedzi
			fmt.Printf("senko server response time: %s\n", duration)
		}
		time.Sleep(sleep_time * time.Second) // Oczekiwanie 10 sekund przed następną próbą sprawdzenia serwera
	}
}

func checkServer(url string) error {
	// Ustawienie timeoutu dla żądania HTTP
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	// Wykonanie żądania GET
	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Sprawdzenie kodu statusu odpowiedzi
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server returned non-OK status: %d", resp.StatusCode)
	}

	return nil
}

func alert(message string) {
	dialog.Alert(message)

	err := beeep.Notify("Senko server", message, "senko.webp")
	if err != nil {
		panic(err)
	}
}
