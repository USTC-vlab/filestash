package plugin

import (
	. "github.com/mickael-kerjean/filestash/server/common"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_backblaze"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_dav"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_dropbox"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_ldap"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_mysql"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_local"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_vlab"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_backend_vlab_fast"

	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_editor_onlyoffice"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_handler_console"

	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_handler_syncthing"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_image_light"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_security_scanner"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_security_svg"
	_ "github.com/mickael-kerjean/filestash/server/plugin/plg_starter_http"
	// _ "github.com/mickael-kerjean/filestash/server/plugin/plg_video_transcoder"
)

func init() {
	Log.Debug("Plugin loader")
}
