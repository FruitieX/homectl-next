'use client';

import { useWebsocketState } from '@/hooks/websocket';
import { Power, Lightbulb, Moon, Sun, Home, Palette, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
  isActive?: boolean;
  description: string;
}

export const QuickActionsCard = () => {
  const state = useWebsocketState();
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const executeAction = async (actionId: string, action: () => void) => {
    setIsExecuting(actionId);
    try {
      await action();
      // Simulate action execution time
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsExecuting(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'all-lights-on',
      label: 'All Lights On',
      icon: Lightbulb,
      color: 'bg-warning',
      description: 'Turn on all controllable lights',
      action: () => {
        console.log('Turning on all lights');
        // Implementation would send WebSocket command to turn on all lights
      }
    },
    {
      id: 'all-lights-off',
      label: 'All Lights Off',
      icon: Power,
      color: 'bg-base-300',
      description: 'Turn off all lights',
      action: () => {
        console.log('Turning off all lights');
        // Implementation would send WebSocket command to turn off all lights
      }
    },
    {
      id: 'night-mode',
      label: 'Night Mode',
      icon: Moon,
      color: 'bg-primary',
      description: 'Dim lights and activate night scene',
      action: () => {
        console.log('Activating night mode');
        // Implementation would activate night scene
      }
    },
    {
      id: 'morning-mode',
      label: 'Morning Mode',
      icon: Sun,
      color: 'bg-accent',
      description: 'Bright warm lights for morning routine',
      action: () => {
        console.log('Activating morning mode');
        // Implementation would activate morning scene
      }
    },
    {
      id: 'movie-mode',
      label: 'Movie Mode',
      icon: Volume2,
      color: 'bg-secondary',
      description: 'Dim lights for movie watching',
      action: () => {
        console.log('Activating movie mode');
        // Implementation would activate movie scene
      }
    },
    {
      id: 'party-mode',
      label: 'Party Mode',
      icon: Palette,
      color: 'bg-success',
      description: 'Colorful dynamic lighting',
      action: () => {
        console.log('Activating party mode');
        // Implementation would activate party scene
      }
    }
  ];

  const getDeviceStats = () => {
    if (!state?.devices) return { total: 0, active: 0 };
    
    const devices = Object.values(state.devices).filter(Boolean);
    const controllableDevices = devices.filter(device => 
      device?.data && 'Controllable' in device.data
    );
    
    const activeDevices = controllableDevices.filter(device =>
      device?.data && 'Controllable' in device.data && device.data.Controllable.state.on
    );

    return {
      total: controllableDevices.length,
      active: activeDevices.length
    };
  };

  const stats = getDeviceStats();

  return (
    <div className="card bg-base-100 shadow-xl col-span-2 row-span-2">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <h2 className="card-title text-lg">Quick Actions</h2>
          </div>
          <div className="text-xs text-base-content/60">
            {stats.active}/{stats.total} devices on
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const executing = isExecuting === action.id;
            
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative overflow-hidden rounded-lg p-3 text-left transition-all duration-200
                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${executing ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'}
                `}
                onClick={() => !executing && executeAction(action.id, action.action)}
                disabled={executing}
              >
                {/* Background color */}
                <div className={`absolute inset-0 ${action.color} opacity-10`} />
                
                {/* Executing animation overlay */}
                {executing && (
                  <motion.div
                    className="absolute inset-0 bg-primary/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: 'linear'
                    }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-start gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white
                    ${action.color}
                  `}>
                    {executing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-base-content">
                      {action.label}
                    </h3>
                    <p className="text-xs text-base-content/60 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Status indicator */}
        <div className="mt-4 pt-4 border-t border-base-300">
          <div className="flex items-center justify-between text-xs text-base-content/60">
            <span>System Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                state ? 'bg-success animate-pulse' : 'bg-error'
              }`} />
              <span>{state ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};