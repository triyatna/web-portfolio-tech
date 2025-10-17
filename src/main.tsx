import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./modules/App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
