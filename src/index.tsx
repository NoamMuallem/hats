import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./store/index";
import "./index.css";
import App from "./App";
import MobileNotification from "./components/MobileNotification";
import { SUBGRAPH_URI } from "./settings";
import { isMobile } from "./utils";
import HttpsRedirect from "react-https-redirect";

const client = new ApolloClient({
  uri: SUBGRAPH_URI
});

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <HttpsRedirect>
        <Router>
          {isMobile() ? <MobileNotification /> : <App />}
        </Router>
      </HttpsRedirect>
    </ApolloProvider>
  </Provider>,
  document.getElementById("root"),
);
