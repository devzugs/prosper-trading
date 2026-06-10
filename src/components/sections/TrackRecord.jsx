import CountUp from "react-countup";

const TrackRecord = () => {
  const stats = [
    {
      value: 50,
      suffix: "M+",
      label: "Assets Under Management",
    },
    {
      value: 350,
      suffix: "+",
      label: "Active Investors",
    },
    {
      value: 98,
      suffix: "%",
      label: "Client Retention Rate",
    },
    {
      value: 4,
      suffix: "+",
      label: "Years of Market Experience",
    },
  ];

  return (
    <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 mb-14 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">
            A Track Record Built on Discipline
            </h2>
        </div>
        <div className="w-full border-y border-white/10 py-16 px-6">
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
                <div
                key={index}
                className="text-center animate-fade-up"
                style={{
                    animationDelay: `${index * 150}ms`,
                }}
                >
                <div className="text-5xl lg:text-6xl font-bold text-accent">
                    <CountUp
                    end={stat.value}
                    duration={2.5}
                    enableScrollSpy
                    scrollSpyOnce
                    />
                    {stat.suffix}
                </div>

                <p className="mt-3 text-text-light font-medium">
                    {stat.label}
                </p>
                </div>
            ))}
            </div>
        </div>
    </section>
  );
};

export default TrackRecord;