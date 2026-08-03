import React from "react";
import { createRoot } from "react-dom/client";
import { Storefront } from "../app/storefront";
import "../app/globals.css";

function Workspace() {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "./assistant-widget.js";
    script.dataset.assistantUrl = "./widget.html?static=1";
    script.dataset.label = "Ask Switchback";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <Storefront />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><Workspace /></React.StrictMode>,
);
