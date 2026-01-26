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
  events: SystemEvent[];
  showTitle?: boolean;
}

export function SystemEvents({ events, showTitle = true }: SystemEventsProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {showTitle && (
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
          <h3 className="font-bold text-emerald-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              history
            </span>
            System Events & Activities
          </h3>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {events.length > 0 ? (
          events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))
        ) : (
          <div className="px-8 py-10 text-center text-slate-400 italic">
            No recent events recorded
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemEvents;
