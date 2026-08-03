(function () {
  "use strict";
  if (document.getElementById("website-assistant-launcher")) return;

  var script = document.currentScript;
  if (!script) return;
  var widgetUrl = new URL(script.dataset.assistantUrl || "/widget", script.src);
  var targetOrigin = widgetUrl.origin;

  var launcher = document.createElement("button");
  launcher.id = "website-assistant-launcher";
  launcher.type = "button";
  launcher.textContent = script.dataset.label || "Ask us";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "website-assistant-frame");
  Object.assign(launcher.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: "2147483646",
    border: "0",
    borderRadius: "999px",
    background: "#1746d1",
    color: "#fff",
    padding: "13px 18px",
    font: "600 15px Arial, sans-serif",
    cursor: "pointer",
  });

  var frame = document.createElement("iframe");
  frame.id = "website-assistant-frame";
  frame.title = "Website assistant";
  frame.src = widgetUrl.toString();
  frame.hidden = true;
  frame.setAttribute("sandbox", "allow-forms allow-scripts allow-popups");
  Object.assign(frame.style, {
    position: "fixed",
    right: "20px",
    bottom: "76px",
    zIndex: "2147483646",
    width: "min(390px, calc(100vw - 24px))",
    height: "min(620px, calc(100vh - 100px))",
    border: "1px solid #aeb9b2",
    borderRadius: "4px",
    background: "#fff",
    boxShadow: "10px 10px 0 rgba(255, 77, 0, 0.9)",
  });

  function pageContext() {
    var selected = document.querySelectorAll("[data-assistant-context]");
    var nodes = selected.length ? Array.from(selected) : [document.body];
    return {
      url: window.location.href,
      title: document.title || "Current page",
      text: nodes.map(function (node) { return node.textContent || ""; }).join("\n").trim().slice(0, 6000),
    };
  }

  function sendContext() {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: "website-assistant:init", page_context: pageContext() },
      targetOrigin,
    );
  }

  function setOpen(open) {
    frame.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) sendContext();
  }

  launcher.addEventListener("click", function () {
    setOpen(frame.hidden);
  });
  frame.addEventListener("load", sendContext);
  window.addEventListener("message", function (event) {
    if (event.origin !== targetOrigin || event.source !== frame.contentWindow) return;
    if (event.data && event.data.type === "website-assistant:ready") sendContext();
    if (event.data && event.data.type === "website-assistant:close") setOpen(false);
  });

  document.body.appendChild(frame);
  document.body.appendChild(launcher);
})();
