import React from "react";
import { createRoot } from "react-dom/client";
import { AssistantWidget } from "../app/widget/widget";
import "../app/widget/widget.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><AssistantWidget /></React.StrictMode>,
);
