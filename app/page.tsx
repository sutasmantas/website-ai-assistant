import { Storefront } from "./storefront";

export default function Home() {
  return (
    <>
      <Storefront />
      <script
        src="/assistant-widget.js"
        data-assistant-url="/widget"
        data-label="Ask Switchback"
        defer
      />
    </>
  );
}
