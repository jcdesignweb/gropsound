import React from "react";
import { createRoot } from 'react-dom/client';

import { App } from "./App";

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

/*
const root = ReactDOM.createRoot(document.getElementById("root"));
console.log("SEEE index.js")
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/