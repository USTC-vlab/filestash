import React from "react";
import "./forkme.scss";
import { t } from "../../locales/";

export const PoweredByFilestash = () => {
    if (!window.CONFIG["fork_button"]) return null;
    return (
        <div className="component_poweredbyfilestash">
            { t("Powered by") } <strong><a href="https://www.filestash.app">Filestash</a>. </strong>
            <strong><a href="https://github.com/mickael-kerjean/filestash">{ t("Original code")}</a></strong>, and
            <strong> <a href="https://github.com/ustc-vlab/filestash">{ t("Modified code") }</a></strong>.
            <span> AGPL-3.0</span>
        </div>
    );
};
