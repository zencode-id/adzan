interface SystemEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "info" | "warning" | "error";
}

interface EventItemProps {
  event: SystemEvent;
}

const eventColors = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-[var(--primary-gold)]",
  error: "bg-red-500",
};

function EventItem({ event }: EventItemProps) {
  return (
    <div className="px-8 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${eventColors[event.type]}`} />
        <div>
          <p className="text-sm font-bold text-emerald-950">{event.title}</p>
          <p className="text-xs text-slate-500">{event.description}</p>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
        {event.timestamp}
      </span>
    </div>
  );
}

interface SystemEventsProps {
  events?: SystemEvent[];
}

export function SystemEvents({
  events = [
    {
      id: "1",
      title: "System rebooted successfully",
      description: "Manual restart initiated by Administrator",
      timestamp: "Today, 08:30 AM",
      type: "success",
    },
    {
      id: "2",
      title: "Content cache cleared",
      description: "Automated weekly maintenance task",
      timestamp: "Yesterday, 11:45 PM",
      type: "info",
    },
    {
      id: "3",
      title: "Firmware update available",
      description: "New version v2.5.0 ready for installation",
      timestamp: "2 days ago",
      type: "warning",
    },
  ],
}: SystemEventsProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12 card-hover">
      <div className="px-8 py-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Recent System Events
        </h3>
      </div>

      <div className="divide-y divide-slate-50">
        {events.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

export default SystemEvents;
