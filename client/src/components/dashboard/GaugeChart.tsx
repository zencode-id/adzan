interface GaugeChartProps {
  value: number;
  maxValue?: number;
  label: string;
  unit?: string;
  description: string;
  color?: "emerald" | "gold" | "blue" | "orange" | "red";
}

const colorClasses = {
  emerald: "text-emerald-600",
  gold: "text-[var(--primary-gold)]",
  blue: "text-blue-500",
  orange: "text-orange-500",
  red: "text-red-500",
};

export function GaugeChart({
  value,
  maxValue = 100,
  label,
  unit = "%",
  description,
  color = "emerald",
}: GaugeChartProps) {
  // Calculate stroke offset (full circle = 251.2)
  const circumference = 251.2;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center card-hover">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
        {label}
      </p>

      <div className="gauge-container mb-4">
        <svg className="w-full h-full gauge-circle" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-slate-100 stroke-current"
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            className={`${colorClasses[color]} stroke-current transition-all duration-1000 ease-out`}
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-emerald-950">
            {value}
            {unit}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-600">{description}</p>
    </div>
  );
}

export default GaugeChart;
