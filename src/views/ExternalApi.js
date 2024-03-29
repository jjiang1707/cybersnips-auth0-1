import React, { useState, useEffect } from "react";
import { Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import monkey2 from "../assets/monkey2.png";
import monkey3 from "../assets/monkey3.png";


export const ExternalApiComponent = () => {
  const { apiOrigin = "http://localhost:3001" } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      console.log(token)
      const response = await fetch(`${apiOrigin}/api/external`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); 

      const responseData = await response.json();
      console.log(responseData)

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };
  
  useEffect(() => {
    callApi();
  }, []);


  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        {state.showResult ? (
          <div className="result-block-container" data-testid="api-result">
            <div className="result-block" data-testid="api-result">
              <h6 className="muted">Result</h6>
              <Highlight>
                <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
              </Highlight>
              <br></br>
              <img className="top-secret" src={monkey2} alt="m4"/>
            </div>
          </div>
        ) : (
          <div>
            <p>Nice Try - insufficient privileges.</p>
            <br></br>
            <img className="top-secret" src={monkey3} alt="m3"/>
          </div>
        )}      
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
