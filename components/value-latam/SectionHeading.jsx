export default function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="sec-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="serif">{title}</h2>
      {children}
    </div>
  );
}
