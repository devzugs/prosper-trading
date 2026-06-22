const MiniSparkline = ({ prices = [], positive = true }) => {
  if (!prices || prices.length < 2) return <div className="w-24 h-8" />;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 27 - ((p - min) / range) * 25;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" className="w-24 h-8 overflow-visible">
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "stroke-success" : "stroke-danger"}
      />
    </svg>
  );
};

export default MiniSparkline;