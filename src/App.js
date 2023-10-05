import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./styles/app.sass";
import "./styles/global.sass";
import Page from "./components/Page";
import Search01 from "./screens/CredentialList";
import Profile from "./screens/Profile";
import Item from "./screens/Item";
import Verification from "./screens/Item/verification";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Token from "./screens/Item/token";
import { PrivateRoute } from "./utils/PrivateRoute";
import LoaderCircle from "./components/LoaderCircle";
import { useAuthContext } from "./contexts/authContext";
import Import from "./screens/Import";

function App() {
    const { provider, user, authorizing } = useAuthContext();
    if( !provider && !user ) {
        return (
        <Router>
            <Switch>
                <Route
                    exact
                    path="/register"
                    render={props => (
                        <Page>
                            <Register {...props} />
                        </Page>
                    )}
                />
                <Route
                    exact
                    path="/import"
                    render={() => (
                        <Page>
                            <Import />
                        </Page>
                    )}
                />
                <Route
                    path="/"
                    render={() => (
                        <Page>
                            <Login />
                        </Page>
                    )}
                />
            </Switch>
        </Router> );
    } if( provider && authorizing ) {
		return (
            <div className="icons">
                <LoaderCircle className="loader" />
                <div className="label">Waiting for Metamask</div>
            </div>
        )
	}
    return (
        <Router>
            <Switch>
                <PrivateRoute
                    exact
                    path="/"
                    render={props => (
                        <Page>
                            <Search01 {...props} />
                        </Page>
                    )}/>
                <PrivateRoute
                    exact
                    path="/profile"
                    render={() => (
                        <Page>
                            <Profile/>
                        </Page>
                    )}
                />
                <Route
                    exact
                    path="/verification"
                    render={() => (
                        <Page>
                            <Verification/>
                        </Page>
                    )}
                />
                <Route
                    exact
                    path="/register"
                    render={props => (
                        <Page>
                            <Register {...props} />
                        </Page>
                    )}
                />
                <Route
                    exact
                    path="/import"
                    render={() => (
                        <Page>
                            <Import />
                        </Page>
                    )}
                />
                <PrivateRoute
                    path="/item/:id"
                    render={( props ) => (
                        <Page>
                            <Item {...props}/>
                        </Page>
                    )}
                />
                <PrivateRoute
                    path="/token/:id"
                    render={( props ) => (
                        <Page>
                            <Token {...props}/>
                        </Page>
                    )}
                />
            </Switch>
        </Router>
    );
}

export default App;
