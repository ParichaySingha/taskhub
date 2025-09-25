import { useState, useEffect } from "react";

interface RealTimeClockProps {
  className?: string;
  showSeconds?: boolean;
  format?: "12h" | "24h";
}

export const RealTimeClock = ({ 
  className = "", 
  showSeconds = true, 
  format = "12h" 
}: RealTimeClockProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
      hour12: format === "12h",
    };

    return date.toLocaleTimeString(undefined, options);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <div className="text-sm font-medium text-foreground">
        {formatTime(currentTime)}
      </div>
      <div className="text-xs text-muted-foreground">
        {formatDate(currentTime)}
      </div>
    </div>
  );
};
