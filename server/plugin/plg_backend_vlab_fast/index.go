package plg_backend_vlab_fast

import (
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"strings"

	. "github.com/mickael-kerjean/filestash/server/common"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

var SftpCache AppCache

type Sftp struct {
	SSHClient  *ssh.Client
	SFTPClient *sftp.Client
}

func init() {
	Backend.Register("vlab-fast", Sftp{})

	SftpCache = NewAppCache()
	SftpCache.OnEvict(func(key string, value interface{}) {
		c := value.(*Sftp)
		c.Close()
	})
}

func (s Sftp) Init(params map[string]string, app *App) (IBackend, error) {
	p := struct {
		username string
		password string
	}{
		params["username"],
		params["password"],
	}

	if params["vlab_sessionid"] == "" {
		return nil, errors.New("未登录管理页面，请先前往 vlab.ustc.edu.cn/vm 登录。")
	}

	hostname := "vlab.ustc.edu.cn"
	port := "22"

	c := SftpCache.Get(params)
	if c != nil {
		d := c.(*Sftp)
		return d, nil
	}

	addr := hostname + ":" + port
	var auth []ssh.AuthMethod

	challenge := func(user, instruction string, questions []string, echos []bool) (answers []string, err error) {
		answers = make([]string, len(questions))
		for i, q := range questions {
			if strings.Contains(q, "Vlab username") {
				if params["vlab_vmid"] != "" {
					answers[i] = ":" + params["vlab_vmid"]
				} else {
					answers[i] = ""
				}
			} else if strings.Contains(q, "Vlab password") {
				answers[i] = params["vlab_sessionid"]
			} else if strings.Contains(q, "Unix password") {
				answers[i] = p.password
			} else {
				fmt.Println(q)
				return nil, errors.New("unsupported challenge")
			}
		}
		return answers, nil
	}

	auth = []ssh.AuthMethod{ssh.KeyboardInteractive(challenge)}

	config := &ssh.ClientConfig{
		User: p.username,
		Auth: auth,
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			if params["hostkey"] == "" {
				return nil
			}
			hostKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(params["hostkey"]))
			if err != nil {
				return err
			}
			return ssh.FixedHostKey(hostKey)(hostname, remote, key)
		},
	}

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		fmt.Println(err)
		return &s, ErrAuthenticationFailed
	}
	s.SSHClient = client

	session, err := sftp.NewClient(s.SSHClient)
	if err != nil {
		return &s, err
	}
	s.SFTPClient = session
	SftpCache.Set(params, &s)
	return &s, nil
}

func (b Sftp) LoginForm() Form {
	return Form{
		Elmnts: []FormElement{
			FormElement{
				Name:  "type",
				Type:  "hidden",
				Value: "vlab 快速登录",
			},
			FormElement{
				Name:        "vlab_vmid",
				Type:        "number",
				Placeholder: "虚拟机 ID（可选，如果仅有一台虚拟机则不需要填写）",
			},
			FormElement{
				Id:          "vlab_sessionid",
				Name:        "vlab_sessionid",
				Type:        "password",
				Placeholder: "Vlab SESSION ID（不可见）",
				Opts:        []string{"hidden"},
			},
			FormElement{
				Name:        "username",
				Type:        "text",
				Placeholder: "Linux 用户名",
			},
			FormElement{
				Name:        "advanced",
				Type:        "enable",
				Placeholder: "若无法使用无 Linux 密码登录，请选择此项",
				Target:      []string{"password"},
			},
			FormElement{
				Id:          "password",
				Name:        "password",
				Type:        "password",
				Placeholder: "Linux 密码",
			},
		},
	}
}

func (b Sftp) Home() (string, error) {
	cwd, err := b.SFTPClient.Getwd()
	if err != nil {
		return "", b.err(err)
	}
	length := len(cwd)
	if length > 0 && cwd[length-1:] != "/" {
		return cwd + "/", nil
	}
	return cwd, nil
}

func (b Sftp) Ls(path string) ([]os.FileInfo, error) {
	files, err := b.SFTPClient.ReadDir(path)
	return files, b.err(err)
}

func (b Sftp) Cat(path string) (io.ReadCloser, error) {
	remoteFile, err := b.SFTPClient.OpenFile(path, os.O_RDONLY)
	if err != nil {
		return nil, b.err(err)
	}
	return remoteFile, nil
}

func (b Sftp) Mkdir(path string) error {
	err := b.SFTPClient.Mkdir(path)
	return b.err(err)
}

func (b Sftp) Rm(path string) error {
	if IsDirectory(path) {
		list, err := b.SFTPClient.ReadDir(path)
		if err != nil {
			return b.err(err)
		}
		for _, entry := range list {
			p := path + entry.Name()
			if entry.IsDir() {
				p += "/"
				err := b.Rm(p)
				if err != nil {
					return b.err(err)
				}
			} else {
				err := b.SFTPClient.Remove(p)
				if err != nil {
					return b.err(err)
				}
			}
		}
		err = b.SFTPClient.RemoveDirectory(path)
		if err != nil {
			return b.err(err)
		}
	} else {
		err := b.SFTPClient.Remove(path)
		return b.err(err)
	}
	return nil
}

func (b Sftp) Mv(from string, to string) error {
	err := b.SFTPClient.Rename(from, to)
	return b.err(err)
}

func (b Sftp) Touch(path string) error {
	file, err := b.SFTPClient.Create(path)
	if err != nil {
		return b.err(err)
	}
	_, err = file.ReadFrom(strings.NewReader(""))
	return b.err(err)
}

func (b Sftp) Save(path string, file io.Reader) error {
	remoteFile, err := b.SFTPClient.Create(path)
	if err != nil {
		return b.err(err)
	}
	_, err = io.Copy(remoteFile, file)
	remoteFile.Close()
	return b.err(err)
}

func (b Sftp) Stat(path string) (os.FileInfo, error) {
	f, err := b.SFTPClient.Stat(path)
	return f, b.err(err)
}

func (b Sftp) Close() error {
	err0 := b.SFTPClient.Close()
	err1 := b.SSHClient.Close()

	if err0 != nil {
		return err0
	}
	return err1
}

func (b Sftp) err(e error) error {
	f, ok := e.(*sftp.StatusError)
	if ok == false {
		if e == os.ErrNotExist {
			return ErrNotFound
		}
		return e
	}
	switch f.Code {
	case 0:
		return nil
	case 1:
		return NewError("There's nothing more to see", 404)
	case 2:
		return NewError("Does not exist", 404)
	case 3:
		return NewError("Permission denied", 403)
	case 4:
		return NewError("Failure", 409)
	case 5:
		return NewError("Not Compatible", 400)
	case 6:
		return NewError("No Connection", 503)
	case 7:
		return NewError("Connection Lost", 503)
	case 8:
		return NewError("Operation not supported", 501)
	case 9:
		return NewError("Not valid", 400)
	case 10:
		return NewError("No such path", 404)
	case 11:
		return NewError("File already exists", 409)
	case 12:
		return NewError("Write protected", 403)
	case 13:
		return NewError("No media", 404)
	case 14:
		return NewError("No space left", 400)
	case 15:
		return NewError("Quota exceeded", 400)
	case 16:
		return NewError("Unknown", 400)
	case 17:
		return NewError("Lock conflict", 409)
	case 18:
		return NewError("Directory not empty", 400)
	case 19:
		return NewError("Not a directory", 400)
	case 20:
		return NewError("Invalid filename", 400)
	case 21:
		return NewError("Link loop", 508)
	case 22:
		return NewError("Cannot delete", 400)
	case 23:
		return NewError("Invalid query", 400)
	case 24:
		return NewError("File is a directory", 400)
	case 25:
		return NewError("Lock conflict", 409)
	case 26:
		return NewError("Lock refused", 400)
	case 27:
		return NewError("Delete pending", 400)
	case 28:
		return NewError("File corrupt", 400)
	case 29:
		return NewError("Invalid owner", 400)
	case 30:
		return NewError("Invalid group", 400)
	case 31:
		return NewError("Lock wasn't granted", 400)
	default:
		return NewError("Oops! Something went wrong", 500)
	}
}
