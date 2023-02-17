import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";

import { Session } from "../model/";
import { Loader } from "../components/";
import { cache } from "../helpers/";

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
            cache.destroy();
            setRedirection("/login");
        }}>点击强制跳转到登录页</a></p> </div> );
    }
    return ( <Redirect to={redirection} /> );
}
