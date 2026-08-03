export function Storefront() {
  return (
    <main>
      <section className="hero" data-assistant-context>
        <p className="eyebrow">Switchback Cycle Co. · sample storefront</p>
        <h1>Ride farther. Get a straight answer before you buy.</h1>
        <p>
          Standard delivery takes 2–4 business days. Unused products may be
          returned within 30 days, and bicycles include a two-year warranty for
          manufacturing defects.
        </p>
      </section>

      <section className="facts" data-assistant-context aria-labelledby="help-heading">
        <h2 id="help-heading">Customer information</h2>
        <article><h3>Shipping</h3><p>Orders receive a tracking link after dispatch.</p></article>
        <article><h3>Returns</h3><p>Refunds return to the original payment method after inspection.</p></article>
        <article><h3>Warranty</h3><p>Crash damage and ordinary wear are not covered.</p></article>
      </section>

      <section className="demo-note">
        <h2>Embedded assistant</h2>
        <p>
          The “Ask Switchback” control passes bounded current-page context into
          the assistant and keeps unsupported questions on a human handoff path.
        </p>
      </section>
    </main>
  );
}
