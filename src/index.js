import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import WithAuthContextProvider from "./higherOrderComponents/WithAuthContextProvider";

ReactDOM.render(
  <React.StrictMode>
      <WithAuthContextProvider>
          <App />
      </WithAuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
