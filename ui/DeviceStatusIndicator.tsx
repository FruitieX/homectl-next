'use client';

import { Device } from '@/bindings/Device';
import { Lightbulb, Thermometer, Zap, Wifi, WifiOff, Power } from 'lucide-react';
import { clsx } from 'clsx';

interface DeviceStatusIndicatorProps {
  device: Device;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getDeviceIcon = (device: Device) => {
  if (device.data && 'Controllable' in device.data) {
    return Lightbulb;
  } else if (device.data && 'Sensor' in device.data) {
    if (device.name.toLowerCase().includes('temp')) {
      return Thermometer;
    }
    return Zap;
  }
  return Power;
};

const getDeviceStatus = (device: Device) => {
  if (device.data && 'Controllable' in device.data) {
    const controllableDevice = device.data.Controllable;
    return {
      isOnline: true, // Assume online if we have data
      isActive: controllableDevice.state.on,
      brightness: controllableDevice.state.brightness,
      color: controllableDevice.state.rgb ? 
        `rgb(${controllableDevice.state.rgb.r}, ${controllableDevice.state.rgb.g}, ${controllableDevice.state.rgb.b})` : 
        undefined
    };
  } else if (device.data && 'Sensor' in device.data) {
    return {
      isOnline: true,
      isActive: true, // Sensors are always "active" when reporting
      value: device.data.Sensor.value
    };
  }
  
  return {
    isOnline: false,
    isActive: false
  };
};

export const DeviceStatusIndicator = ({
  device,
  size = 'md',
  showLabel = false,
  className
}: DeviceStatusIndicatorProps) => {
  const IconComponent = getDeviceIcon(device);
  const status = getDeviceStatus(device);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-error';
    if (status.isActive) {
      if (status.color) return status.color;
      return 'bg-success';
    }
    return 'bg-base-300';
  };

  const getIconColor = () => {
    if (!status.isOnline) return 'text-error-content';
    if (status.isActive) return 'text-success-content';
    return 'text-base-content/50';
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx(
        'rounded-full flex items-center justify-center relative overflow-hidden',
        containerSizeClasses[size]
      )}>
        {/* Background with status color or device color */}
        <div 
          className={clsx(
            'absolute inset-0 transition-all duration-200',
            !status.color && getStatusColor()
          )}
          style={status.color ? { backgroundColor: status.color } : undefined}
        />
        
        {/* Brightness overlay for controllable devices */}
        {status.brightness !== undefined && status.isActive && (
          <div 
            className="absolute inset-0 bg-black transition-all duration-200"
            style={{ 
              opacity: Math.max(0, (100 - status.brightness) / 100 * 0.7)
            }}
          />
        )}
        
        {/* Connection status indicator */}
        {!status.isOnline && (
          <WifiOff className={clsx(sizeClasses[size], 'text-error-content relative z-10')} />
        )}
        
        {/* Device icon */}
        {status.isOnline && (
          <IconComponent className={clsx(
            sizeClasses[size], 
            getIconColor(),
            'relative z-10 transition-colors duration-200'
          )} />
        )}
      </div>
      
      {showLabel && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-base-content truncate">
            {device.name}
          </span>
          <span className="text-xs text-base-content/60">
            {!status.isOnline ? 'Offline' : 
             status.isActive ? 'Active' : 'Inactive'}
            {status.brightness !== undefined && status.isActive && 
              ` • ${status.brightness}%`}
          </span>
        </div>
      )}
    </div>
  );
};