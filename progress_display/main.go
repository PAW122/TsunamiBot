package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// IgnoredFolders to lista nazw folderów, które mają być ignorowane
var IgnoredFolders = []string{"vendor", "node_modules", "package.json", "package-lock.json", "db"} // Możesz dostosować tę listę według własnych potrzeb

func main() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: ./plik.exe <path>")
		return
	}

	path := os.Args[1]

	totalLines := 0
	filesProcessed := 0

	err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("Error accessing path: %v\n", err)
			return nil
		}

		if info.IsDir() && shouldIgnoreFolder(filePath) {
			return filepath.SkipDir // Pomija cały katalog, jeśli jest na liście ignorowanych
		}

		if info.IsDir() {
			return nil // Pomija katalogi
		}

		ext := filepath.Ext(filePath)
		if ext == ".js" || ext == ".ts" || ext == ".json" {
			lines, err := countLines(filePath)
			if err != nil {
				fmt.Printf("Error counting lines in file %s: %v\n", filePath, err)
				return nil
			}
			totalLines += lines
			filesProcessed++
		}

		return nil
	})

	if err != nil {
		fmt.Printf("Error walking path: %v\n", err)
		return
	}

	fmt.Printf("Total files processed: %d, Total lines of code: %d\n", filesProcessed, totalLines)
}

func countLines(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lines := 0
	for scanner.Scan() {
		lines++
	}

	if err := scanner.Err(); err != nil {
		return 0, err
	}

	return lines, nil
}

func shouldIgnoreFolder(folderPath string) bool {
	for _, ignoredFolder := range IgnoredFolders {
		if strings.Contains(folderPath, ignoredFolder) {
			return true
		}
	}
	return false
}
