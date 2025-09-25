import { useState, useEffect } from "react";
import { Clock, Play, Pause, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  useStartTimeTrackingMutation, 
  usePauseTimeTrackingMutation, 
  useStopTimeTrackingMutation,
  useUpdateTimeTrackingMutation 
} from "~/hooks/use-task";
import { toast } from "sonner";
import type { EstimatedTime } from "~/types";

interface EstimatedTimeDisplayProps {
  estimatedTime?: EstimatedTime;
  taskId: string;
  timeTracking?: {
    isTracking: boolean;
    startTime?: Date;
    elapsedTime: number;
  };
}

export const EstimatedTimeDisplay = ({ 
  estimatedTime, 
  taskId,
  timeTracking 
}: EstimatedTimeDisplayProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [savedTime, setSavedTime] = useState(0);

  const { mutate: startTracking, isPending: isStarting } = useStartTimeTrackingMutation();
  const { mutate: pauseTracking, isPending: isPausing } = usePauseTimeTrackingMutation();
  const { mutate: stopTracking, isPending: isStopping } = useStopTimeTrackingMutation();
  const { mutate: updateTimeTracking } = useUpdateTimeTrackingMutation();

  // Load saved tracking state from database first, then localStorage as fallback
  useEffect(() => {
    if (timeTracking) {
      // Use database state if available
      setIsTracking(timeTracking.isTracking);
      setElapsedTime(timeTracking.elapsedTime);
      setSavedTime(timeTracking.elapsedTime); // Set saved time from database
      if (timeTracking.isTracking && timeTracking.startTime) {
        setStartTime(new Date(timeTracking.startTime));
      }
    } else {
      // Fallback to localStorage if no database state
      const savedState = localStorage.getItem(`timeTracking_${taskId}`);
      if (savedState) {
        const { isTracking: savedIsTracking, startTime: savedStartTime, elapsedTime: savedElapsedTime } = JSON.parse(savedState);
        setIsTracking(savedIsTracking);
        setElapsedTime(savedElapsedTime);
        setSavedTime(savedElapsedTime); // Set saved time from localStorage
        if (savedIsTracking && savedStartTime) {
          setStartTime(new Date(savedStartTime));
        }
      }
    }
  }, [taskId, timeTracking]);

  // Update elapsed time every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let saveInterval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const sessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        // Add saved time to current session
        const totalElapsed = sessionElapsed + savedTime;
        setElapsedTime(totalElapsed);
      }, 1000);

      // Save to database every 30 seconds
      saveInterval = setInterval(() => {
        const now = new Date();
        const sessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const totalElapsed = sessionElapsed + savedTime;
        updateTimeTracking(
          { taskId, elapsedTime: totalElapsed },
          {
            onError: (error: any) => {
              console.error("Failed to save time tracking:", error);
            },
          }
        );
      }, 30000); // Save every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isTracking, startTime, taskId, updateTimeTracking, savedTime]);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      isTracking,
      startTime: startTime?.toISOString(),
      elapsedTime
    };
    localStorage.setItem(`timeTracking_${taskId}`, JSON.stringify(state));
  }, [isTracking, startTime, elapsedTime, taskId]);

  // Handle page visibility changes and beforeunload to ensure timer continues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTracking && startTime) {
        // Page is hidden, save current state to database
        const now = new Date();
        const sessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const totalElapsed = sessionElapsed + savedTime;
        
        updateTimeTracking(
          { taskId, elapsedTime: totalElapsed },
          {
            onError: (error: any) => {
              console.error("Failed to save time tracking on visibility change:", error);
            },
          }
        );
      } else if (!document.hidden && isTracking && startTime) {
        // Page is visible again, update the start time to current time
        // This ensures the timer continues from where it left off
        const now = new Date();
        setStartTime(now);
      }
    };

    const handleBeforeUnload = () => {
      if (isTracking && startTime) {
        // Save current state before page unloads
        const now = new Date();
        const sessionElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const totalElapsed = sessionElapsed + savedTime;
        
        // Use synchronous XMLHttpRequest to ensure the request completes
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `/api/task/${taskId}/time-tracking/update`, false); // false = synchronous
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ elapsedTime: totalElapsed }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTracking, startTime, taskId, updateTimeTracking, savedTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEstimatedTime = (estimated: EstimatedTime) => {
    const { value, unit } = estimated;
    const unitText = unit === "minutes" ? "min" : unit === "hours" ? "hr" : "day";
    const pluralUnit = value > 1 ? unitText + "s" : unitText;
    return `${value} ${pluralUnit}`;
  };

  const handleStartTracking = () => {
    startTracking(
      { taskId },
      {
        onSuccess: () => {
          setIsTracking(true);
          setStartTime(new Date());
          // Reset elapsed time to show only current session, but keep saved time
          setElapsedTime(savedTime);
          toast.success("Time tracking started");
        },
        onError: (error: any) => {
          toast.error("Failed to start time tracking");
          console.error(error);
        },
      }
    );
  };

  const handlePauseTracking = () => {
    // Save current elapsed time before pausing
    const now = new Date();
    const sessionElapsed = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : 0;
    const totalElapsed = sessionElapsed + savedTime;
    
    updateTimeTracking(
      { taskId, elapsedTime: totalElapsed },
      {
        onSuccess: () => {
          pauseTracking(
            { taskId },
            {
              onSuccess: () => {
                setIsTracking(false);
                setSavedTime(totalElapsed); // Save the total elapsed time
                setElapsedTime(totalElapsed); // Keep the display showing total time
                toast.success("Time tracking paused and saved");
              },
              onError: (error: any) => {
                toast.error("Failed to pause time tracking");
                console.error(error);
              },
            }
          );
        },
        onError: (error: any) => {
          console.error("Failed to save time before pause:", error);
          // Still try to pause even if save failed
          pauseTracking(
            { taskId },
            {
              onSuccess: () => {
                setIsTracking(false);
                setSavedTime(totalElapsed); // Save the total elapsed time
                setElapsedTime(totalElapsed); // Keep the display showing total time
                toast.success("Time tracking paused and saved");
              },
              onError: (error: any) => {
                toast.error("Failed to pause time tracking");
                console.error(error);
              },
            }
          );
        },
      }
    );
  };

  const handleStopTracking = () => {
    // Save current elapsed time before stopping
    const now = new Date();
    const sessionElapsed = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : 0;
    const totalElapsed = sessionElapsed + savedTime;
    
    updateTimeTracking(
      { taskId, elapsedTime: totalElapsed },
      {
        onSuccess: () => {
          stopTracking(
            { taskId },
            {
              onSuccess: () => {
                setIsTracking(false);
                setStartTime(null);
                setSavedTime(totalElapsed); // Save the total elapsed time
                setElapsedTime(totalElapsed); // Keep the display showing total time
                localStorage.removeItem(`timeTracking_${taskId}`);
                toast.success("Time tracking stopped and saved");
              },
              onError: (error: any) => {
                toast.error("Failed to stop time tracking");
                console.error(error);
              },
            }
          );
        },
        onError: (error: any) => {
          console.error("Failed to save time before stop:", error);
          // Still try to stop even if save failed
          stopTracking(
            { taskId },
            {
              onSuccess: () => {
                setIsTracking(false);
                setStartTime(null);
                setSavedTime(totalElapsed); // Save the total elapsed time
                setElapsedTime(totalElapsed); // Keep the display showing total time
                localStorage.removeItem(`timeTracking_${taskId}`);
                toast.success("Time tracking stopped and saved");
              },
              onError: (error: any) => {
                toast.error("Failed to stop time tracking");
                console.error(error);
              },
            }
          );
        },
      }
    );
  };

  const getProgressPercentage = () => {
    if (!estimatedTime) return 0;
    
    const estimatedSeconds = estimatedTime.unit === "minutes" 
      ? estimatedTime.value * 60
      : estimatedTime.unit === "hours" 
      ? estimatedTime.value * 3600
      : estimatedTime.value * 86400; // days to seconds
    
    return Math.min((elapsedTime / estimatedSeconds) * 100, 100);
  };

  if (!estimatedTime) {
    return null;
  }

  const progressPercentage = getProgressPercentage();
  const isOverEstimate = progressPercentage > 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Time Tracking
          </div>
          {savedTime > 0 && !isTracking && (
            <div className="text-xs text-muted-foreground font-mono">
              {formatTime(savedTime)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Estimated Time and Progress */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Estimated: {formatEstimatedTime(estimatedTime)}
          </div>
          <Badge variant={isOverEstimate ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">
            {progressPercentage.toFixed(0)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              isOverEstimate ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {/* Elapsed Time Display */}
        <div className="text-center">
          <div className="text-lg font-mono font-bold">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            Elapsed Time
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-1 justify-center">
          {!isTracking ? (
            <Button
              onClick={handleStartTracking}
              size="sm"
              className="flex items-center gap-1 text-xs px-2 py-1 h-7"
              disabled={isStarting}
            >
              <Play className="size-3" />
              {isStarting ? "Starting..." : "Start"}
            </Button>
          ) : (
            <Button
              onClick={handlePauseTracking}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-xs px-2 py-1 h-7"
              disabled={isPausing}
            >
              <Pause className="size-3" />
              {isPausing ? "Pausing..." : "Pause"}
            </Button>
          )}
          
          <Button
            onClick={handleStopTracking}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs px-2 py-1 h-7"
            disabled={isStopping}
          >
            <Square className="size-3" />
            {isStopping ? "Stopping..." : "Stop"}
          </Button>
        </div>

        {/* Status Message */}
        {isOverEstimate && (
          <div className="text-xs text-destructive text-center">
            ⚠️ Over estimated time
          </div>
        )}
      </CardContent>
    </Card>
  );
};
