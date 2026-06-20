// Injects a floating launcher + draggable panel that frames the Chess Outplay
// app. The app runs inside an extension-origin <iframe>, so its Stockfish
// Web Worker / WASM use the EXTENSION's CSP and work on any page.
(() => {
  if (window.__chessOutplayInjected) return;
  window.__chessOutplayInjected = true;

  const PANEL_W = 720;
  const PANEL_H = 540;

  const host = document.createElement("div");
  host.id = "chess-outplay-root";
  const shadow = host.attachShadow({ mode: "open" });
  (document.documentElement || document.body).appendChild(host);

  // --- launcher ------------------------------------------------------------
  const launcher = document.createElement("button");
  launcher.title = "Chess Outplay";
  launcher.textContent = "♞";
  Object.assign(launcher.style, {
    position: "fixed",
    top: "14px",
    right: "14px",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #232833",
    background: "#6C8CFF",
    color: "#0E1116",
    fontSize: "24px",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,.45)",
    zIndex: "2147483647",
  });

  // --- panel ---------------------------------------------------------------
  const panel = document.createElement("div");
  Object.assign(panel.style, {
    position: "fixed",
    top: "14px",
    right: "14px",
    width: PANEL_W + "px",
    height: PANEL_H + "px",
    maxWidth: "96vw",
    maxHeight: "94vh",
    background: "#0E1116",
    border: "1px solid #2c3445",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(0,0,0,.6)",
    display: "none",
    flexDirection: "column",
    zIndex: "2147483647",
  });

  const header = document.createElement("div");
  Object.assign(header.style, {
    flex: "0 0 auto",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6px 0 12px",
    background: "#171A21",
    borderBottom: "1px solid #232833",
    cursor: "move",
    userSelect: "none",
    fontFamily: "Inter, system-ui, sans-serif",
  });
  const title = document.createElement("div");
  title.textContent = "♞ Chess Outplay";
  Object.assign(title.style, { fontSize: "12px", fontWeight: "600", color: "#E8EAED" });
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.title = "Zamknij";
  Object.assign(closeBtn.style, {
    border: "none",
    background: "transparent",
    color: "#9AA3AF",
    fontSize: "15px",
    lineHeight: "1",
    cursor: "pointer",
    padding: "6px 8px",
  });
  header.appendChild(title);
  header.appendChild(closeBtn);

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("index.html");
  Object.assign(iframe.style, {
    flex: "1",
    width: "100%",
    border: "none",
    background: "#0E1116",
  });

  panel.appendChild(header);
  panel.appendChild(iframe);
  shadow.appendChild(launcher);
  shadow.appendChild(panel);

  // --- open / close --------------------------------------------------------
  const open = () => {
    panel.style.display = "flex";
    launcher.style.display = "none";
  };
  const close = () => {
    panel.style.display = "none";
    launcher.style.display = "block";
  };
  const toggle = () => (panel.style.display === "none" ? open() : close());
  launcher.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "chess-outplay-toggle") toggle();
  });

  // --- drag by header ------------------------------------------------------
  let dragging = false;
  let sx = 0;
  let sy = 0;
  let top0 = 0;
  let right0 = 0;
  header.addEventListener("mousedown", (e) => {
    dragging = true;
    sx = e.clientX;
    sy = e.clientY;
    const r = panel.getBoundingClientRect();
    top0 = r.top;
    right0 = window.innerWidth - r.right;
    iframe.style.pointerEvents = "none"; // keep mousemove flowing during drag
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    panel.style.top = Math.max(0, top0 + (e.clientY - sy)) + "px";
    panel.style.right = Math.max(0, right0 - (e.clientX - sx)) + "px";
  });
  window.addEventListener("mouseup", () => {
    dragging = false;
    iframe.style.pointerEvents = "auto";
  });
})();
