import React from "react";
import { useHistory, useParams, useLocation, useRouteMatch } from "react-router-dom";

export const withRouter = (Component) => {
    const WithRouter = (props) => {
        const history = useHistory();
        return <Component {...props} history={history} />;
    }
    return WithRouter;
}

export const ElementWrapper = (props) => {
    const params = useParams();
    const locations = useLocation();
    const history = useHistory();
    const match = useRouteMatch();
    const Element = props.routeElement;
    return <Element params={params} locations={locations} history={history} match={match} {...props} />;
}
