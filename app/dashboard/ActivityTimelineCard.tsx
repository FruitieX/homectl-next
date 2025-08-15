'use client';

import { useWebsocketState } from '@/hooks/websocket';
import { Clock, Lightbulb, Thermometer, Zap, Home, Palette } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'device_state' | 'sensor_reading' | 'scene_activation' | 'group_control';
  deviceName: string;
  deviceId: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const ActivityEventItem = ({ event }: { event: ActivityEvent }) => {
  const IconComponent = event.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg transition-colors"
    >
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
        style={{ backgroundColor: event.color }}
      >
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-base-content truncate">
            {event.deviceName}
          </h4>
          <span className="text-xs text-base-content/60 ml-2">
            {formatTime(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-base-content/70 mt-1">
          {event.description}
        </p>
        <span className="text-xs text-base-content/50">
          {formatRelativeTime(event.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export const ActivityTimelineCard = () => {
  const state = useWebsocketState();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate mock activity data based on current device states
  const mockActivities = useMemo(() => {
    if (!state?.devices) return [];

    const events: ActivityEvent[] = [];
    const now = new Date();

    // Create mock recent activities
    const deviceEntries = Object.entries(state.devices);
    
    deviceEntries.forEach(([deviceId, device], index) => {
      if (!device) return;

      // Generate 1-3 recent activities per device
      const numActivities = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numActivities; i++) {
        const minutesAgo = Math.floor(Math.random() * 480) + (i * 20); // 0-8 hours ago
        const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
        
        let description = '';
        let icon: React.ComponentType<{ className?: string }> = Lightbulb;
        let color = '#3b82f6';
        let eventType: ActivityEvent['type'] = 'device_state';

        if (device.data && 'Controllable' in device.data) {
          const controllableDevice = device.data.Controllable;
          const isOn = controllableDevice.state.on;
          
          if (i === 0) {
            // Most recent event shows current state
            description = isOn ? 'Turned on' : 'Turned off';
            color = isOn ? '#10b981' : '#6b7280';
          } else {
            // Older events show state changes
            const wasOn = Math.random() > 0.5;
            description = wasOn ? 'Turned on' : 'Turned off';
            color = wasOn ? '#10b981' : '#6b7280';
          }
          
          if (controllableDevice.capabilities.color_temp || controllableDevice.capabilities.rgb) {
            if (Math.random() > 0.6) {
              description = 'Color changed';
              icon = Palette;
              color = '#8b5cf6';
            }
          }
          
          if (controllableDevice.capabilities.brightness && Math.random() > 0.7) {
            description = `Brightness set to ${Math.floor(Math.random() * 100)}%`;
            color = '#f59e0b';
          }
        } else if (device.data && 'Sensor' in device.data) {
          icon = Thermometer;
          eventType = 'sensor_reading';
          
          if (device.name.toLowerCase().includes('temp')) {
            const temp = (Math.random() * 10 + 18).toFixed(1);
            description = `Temperature: ${temp}°C`;
            color = '#ef4444';
          } else if (device.name.toLowerCase().includes('humidity')) {
            const humidity = Math.floor(Math.random() * 40 + 40);
            description = `Humidity: ${humidity}%`;
            color = '#06b6d4';
          } else {
            description = 'Sensor reading updated';
            color = '#8b5cf6';
          }
        }

        events.push({
          id: `${deviceId}-${i}-${timestamp.getTime()}`,
          timestamp,
          type: eventType,
          deviceName: device.name,
          deviceId,
          description,
          icon,
          color,
        });
      }
    });

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [state?.devices]);

  useEffect(() => {
    setActivities(mockActivities);
  }, [mockActivities]);

  const displayedActivities = isExpanded ? activities : activities.slice(0, 5);

  return (
    <div className="card bg-base-100 shadow-xl col-span-2 row-span-2">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="card-title text-lg">Recent Activity</h2>
          </div>
          <div className="badge badge-primary badge-sm">
            {activities.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-80">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-base-content/50">
              <Home className="w-8 h-8 mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {displayedActivities.map((activity) => (
                  <ActivityEventItem
                    key={activity.id}
                    event={activity}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {activities.length > 5 && (
          <div className="card-actions justify-center mt-4">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : `Show All (${activities.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};