import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";

import { Session } from "../model/";
import { Loader } from "../components/";

export function HomePage() {
    const [redirection, setRedirection] = useState(null);

    useEffect(() => {
        Session.currentUser().then((res) => {
            if (res && res.is_authenticated === true) {
                setRedirection(res.home ? "/files" + res.home : "/files");
            } else {
                setRedirection("/login");
            }
        }).catch((err) => setRedirection("/login"));
    }, []);

    if (!redirection) {
        return ( <div> <Loader /> <p className="center"><a onClick={() => {
            Session.logout().then((res) => {
                window.location.reload();
            });
        }}>点击退出当前登录状态</a></p> </div> );
    }
    return ( <Redirect to={redirection} /> );
}
