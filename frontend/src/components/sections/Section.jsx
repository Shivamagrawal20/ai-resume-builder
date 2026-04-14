export default function Section({ title, children, className = "" }) {
  if (!children) return null;
  return (
    <section className={className}>
      <h5>{title}</h5>
      {children}
    </section>
  );
}
