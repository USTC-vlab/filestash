import React from "react";
import { Redirect } from "react-router";

import { Share } from "../model/";
import { notify, basename, filetype, findParams } from "../helpers/";
import { Loader, Input, Button, Container, ErrorPage, Icon } from "../components/";
import { t } from "../locales/";
import "./error.scss";
import "./sharepage.scss";

@ErrorPage
export class SharePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            path: null,
            key: null,
            error: null,
            loading: false,
        };
        this.input = React.createRef();
    }

    componentDidMount() {
        this._proofQuery(this.props.match.params.id).then(() => {
            if (this.input) {
                this.input.ref.focus();
            }
        });
    }

    submitProof(e, type, value) {
        e.preventDefault();
        this.setState({ loading: true });
        this._proofQuery(this.props.match.params.id, { type: type, value: value });
    }

    _proofQuery(id, data = {}) {
        this.setState({ loading: true });
        return Share.proof(id, data).then((res) => {
            if (this.input) {
                this.input.ref.value = "";
            }
            const st = {
                key: res.key,
                path: res.path || null,
                share: res.id,
                loading: false,
            };
            if (res.message) {
                notify.send(res.message, "info");
            } else if (res.error) {
                st.error = res.error;
                window.setTimeout(() => this.setState({ error: null }), 500);
            }
            return new Promise((done) => {
                this.setState(st, () => done());
            });
        }).catch((err) => this.props.error(err));
    }

    render() {
        const marginTop = () => {
            return {
                marginTop: parseInt(window.innerHeight / 3)+"px",
            };
        };

        const className = this.state.error ? "error rand-"+Math.random().toString() : "";

        if (this.state.path !== null) {
            if (findParams("next")) {
                const url = findParams("next");
                if (url[0] === "/") {
                    requestAnimationFrame(() => {
                        window.location.pathname = url;
                    });
                    return (
                        <div style={marginTop()}>
                            <Loader />
                        </div>
                    );
                }
                notify.send(t("You can't do that :)"), "error");
            } else if (filetype(this.state.path) === "directory") {
                return ( <Redirect to={`/files/?share=${this.state.share}`} /> );
            } else {
                return ( <Redirect to={`/view/${basename(this.state.path)}?nav=false&share=${this.state.share}`} /> );
            }
        } else if (this.state.key === null) {
            return (
                <div style={marginTop()}>
                    <Loader />
                </div>
            );
        } else if (this.state.key === "code") {
            return (
                <Container maxWidth="300px" className="sharepage_component">
                    <form className={className} onSubmit={(e) => this.submitProof(e, "code", this.input.ref.value)} style={marginTop()}>
                        <Input ref={this.input} type="text" placeholder={ t("Code") } />
                        <Button theme="transparent">
                            <Icon name={this.state.loading ? "loading" : "arrow_right"}/>
                        </Button>
                    </form>
                </Container>
            );
        } else if (this.state.key === "password") {
            return (
                <Container maxWidth="300px" className="sharepage_component">
                    <form className={className} onSubmit={(e) => this.submitProof(e, "password", this.input.ref.value)} style={marginTop()}>
                        <Input ref={this.input} type="password" placeholder={ t("Password") } />
                        <Button theme="transparent">
                            <Icon name={this.state.loading ? "loading" : "arrow_right"}/>
                        </Button>
                    </form>
                </Container>
            );
        } else if (this.state.key === "email") {
            return (
                <Container maxWidth="300px" className="sharepage_component">
                    <form className={className} onSubmit={(e) => this.submitProof(e, "email", this.input.ref.value)} style={marginTop()}>
                        <Input ref={this.input} type="text" placeholder={ t("Your email address") } />
                        <Button theme="transparent">
                            <Icon name={this.state.loading ? "loading" : "arrow_right"}/>
                        </Button>
                    </form>
                </Container>
            );
        }

        return (
            <div className="error-page">
                <h1>{ t("Oops!") }</h1>
                <h2>{ t("There is nothing in here") }</h2>
            </div>
        );
    }
}
