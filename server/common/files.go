package common

import (
	"os"
	"path/filepath"
	"strings"
)

var MOCK_CURRENT_DIR string

func GetCurrentDir() string {
	if MOCK_CURRENT_DIR != "" {
		return MOCK_CURRENT_DIR
	}
	ex, _ := os.Executable()
	return filepath.Dir(ex)
}

func GetAbsolutePath(p string) string {
	return filepath.Join(GetCurrentDir(), p)
}

func IsDirectory(path string) bool {
	if path == "" {
		return false
	}
	if path[len(path)-1:] != "/" {
		return false
	}
	return true
}

/*
 * Join 2 path together, result has a file
 */
func JoinPath(base, file string) string {
	filePath := filepath.Join(base, file)
	// sanitize user-given path (file), thus this is a safe function.
	if strings.HasPrefix(filePath, base) == false {
		return base
	}
	return filePath
}

func EnforceDirectory(path string) string {
	if path == "" {
		return "/"
	} else if path[len(path)-1:] == "/" {
		return path
	}
	return path + "/"
}

func SplitPath(path string) (root string, filename string) {
	if path == "" {
		path = "/"
	}
	if IsDirectory(path) == false {
		filename = filepath.Base(path)
	}
	if root = strings.TrimSuffix(path, filename); root == "" {
		root = "/"
	}
	return root, filename
}
