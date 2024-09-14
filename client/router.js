import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { NotFoundPage, ConnectPage, HomePage, LogoutPage, FilesPage, ViewerPage } from "./pages/";
import { URL_HOME, URL_FILES, URL_VIEWER, URL_LOGIN, URL_LOGOUT, URL_ADMIN } from "./helpers/";
import { ModalPrompt, ModalAlert, ModalConfirm, Notification, UploadQueue, LoadingPage } from "./components/";
import { ElementWrapper } from "./helpers/routerhook";


const LazyAdminPage = React.lazy(() => import(/* webpackChunkName: "admin" */"./pages/adminpage"));
const AdminPage = () => (
    <Suspense fallback={<LoadingPage/>}>
        <LazyAdminPage/>
    </Suspense>
);

export default class AppRouter extends React.Component {
    render() {
        return (
            <div style={{ height: "100%" }}>
                <BrowserRouter>
                    <Switch>
                        <Route exact path={URL_HOME} children={<HomePage />} />
                        {/* <Route path={`${URL_SHARE}/:id*`} component={SharePage} /> */}
                        <Route path={URL_LOGIN} children={<ElementWrapper routeElement={ConnectPage} /> } />
                        <Route path={`${URL_FILES}/:path*`} children={<ElementWrapper routeElement={FilesPage} /> } />
                        <Route path={`${URL_VIEWER}/:path*`} children={<ElementWrapper routeElement={ViewerPage} /> } />
                        <Route path={URL_LOGOUT} children={<ElementWrapper routeElement={LogoutPage} /> } />
                        <Route path={URL_ADMIN} children={<AdminPage />} />
                        <Route children={<NotFoundPage />} />
                    </Switch>
                </BrowserRouter>
                <ModalPrompt /> <ModalAlert /> <ModalConfirm />
                <Notification /> <UploadQueue/>
            </div>
        );
    }
}
