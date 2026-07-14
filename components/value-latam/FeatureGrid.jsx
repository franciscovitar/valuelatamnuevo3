export default function FeatureGrid({ items, className = 'fin-grid reveal reveal-grid', initial = 3 }) {
  return (
    <div className={className} data-initial={initial}>
      {items.map(([title, text, highlight]) => (
        <div className={highlight ? 'feat feat-hl' : 'feat'} key={title}>
          <div className="fh"><span className="dot" /><h4>{title}</h4></div>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
