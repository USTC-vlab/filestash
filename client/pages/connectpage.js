import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "./connectpage.scss";
import { Session } from "../model/";
import { Container, NgIf, NgShow, Loader, ErrorPage } from "../components/";
import { PoweredByFilestash, Form } from "./connectpage/";
import { cache, notify, urlParams } from "../helpers/";


@ErrorPage
export class ConnectPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            doing_a_third_party_login: false,
        };
    }

    componentDidMount() {
        const urlData = urlParams();
        const get_params = Object.keys(urlData);
        if (get_params.length === 0) {
            return;
        } else if (get_params.length === 1 && !!urlData["next"]) {
            return;
        }

        if (!urlData.type) {
            urlData.type = urlData.state;
        }
        this.setState({
            doing_a_third_party_login: true,
            loading: true,
        }, () => this.authenticate(urlData));
    }

    authenticate(params) {
        Session.authenticate(params)
            .then(Session.currentUser)
            .then((user) => {
                if (location.search.indexOf("?next=") === 0) {
                    location = urlParams()["next"];
                }
                let url = "/files/";
                let path = user.home;
                if (path) {
                    path = path.replace(/^\/?(.*?)\/?$/, "$1");
                    if (path !== "") {
                        url += path + "/";
                    }
                }
                cache.destroy();
                this.props.history.push(url);
            })
            .catch((err) => {
                this.setState({ loading: false });
                notify.send(err, "error");
            });
    }

    onFormSubmit(data) {
        if ("oauth2" in data) {
            this.setState({ loading: true });
            Session.oauth2(data.oauth2).then((url) => {
                window.location.href = url;
            });
            return;
        }
        this.setState({
            loading: true,
        }, () => this.authenticate(data));
    }

    setLoading(value) {
        if (this.state.doing_a_third_party_login !== true) {
            this.setState({ loading: value });
        }
    }

    onError(err) {
        this.props.error(err);
    }

    render() {
        return (
            <div className="component_page_connect">
                <Container maxWidth="565px">
                    <NgIf cond={this.state.loading === true}>
                        <Loader/>
                    </NgIf>
                    <NgShow cond={this.state.loading === false}>
                        <TransitionGroup>
                            <CSSTransition classNames="form" exit={false} enter={false}
                                appear={true} timeout={{ appear: 5000 }}>
                                <Form onLoadingChange={this.setLoading.bind(this)}
                                    onError={this.onError.bind(this)}
                                    onSubmit={this.onFormSubmit.bind(this)} />
                            </CSSTransition>
                        </TransitionGroup>
                        <TransitionGroup>
                            <CSSTransition classNames="remember" exit={false} enter={false}
                                appear={true} timeout={{ appear: 5000 }}>
                                <PoweredByFilestash />
                            </CSSTransition>
                        </TransitionGroup>
                    </NgShow>
                </Container>
            </div>
        );
    }
}
