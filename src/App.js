import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import history from "./utils/history";
import ExternalApi from "./views/ExternalApi";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "./components/Loading";
import { useEffect } from 'react';

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const saveAccessTokenAsCookie = async (getAccessTokenSilently) => {
  try {
    const accessToken = await getAccessTokenSilently();
    document.cookie = `access_token=${accessToken}; path=/; Secure`;
  } catch (e) {
    console.error(e);
  }
};

const App = () => {

  const { isLoading, error, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      saveAccessTokenAsCookie(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);


  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }


  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
