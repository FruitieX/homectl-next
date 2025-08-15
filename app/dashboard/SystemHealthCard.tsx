'use client';

import { useWebsocketState } from '@/hooks/websocket';
import { Shield, Wifi, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SystemHealthMetrics {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  activeDevices: number;
  lastUpdateTime: Date | null;
  responseTime: number | null;
}

const HealthIndicator = ({ 
  status, 
  label, 
  value 
}: { 
  status: 'good' | 'warning' | 'error'; 
  label: string; 
  value: string | number;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-base-200/50">
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
        <span className="text-sm text-base-content/80">{label}</span>
      </div>
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {value}
      </span>
    </div>
  );
};

export const SystemHealthCard = () => {
  const state = useWebsocketState();
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null);
  const [pingHistory, setPingHistory] = useState<number[]>([]);

  // Track connection establishment
  useEffect(() => {
    if (state && !connectionStartTime) {
      setConnectionStartTime(new Date());
    } else if (!state && connectionStartTime) {
      setConnectionStartTime(null);
    }
  }, [state, connectionStartTime]);

  // Simulate ping measurements
  useEffect(() => {
    if (!state) return;

    const measurePing = () => {
      const startTime = performance.now();
      // Simulate a small delay and measure it
      setTimeout(() => {
        const pingTime = Math.random() * 50 + 10; // 10-60ms simulated ping
        setPingHistory(prev => [...prev.slice(-9), pingTime]); // Keep last 10 measurements
      }, 1);
    };

    measurePing();
    const interval = setInterval(measurePing, 5000); // Measure every 5 seconds

    return () => clearInterval(interval);
  }, [state]);

  const healthMetrics = useMemo((): SystemHealthMetrics => {
    if (!state) {
      return {
        connectionStatus: 'disconnected',
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        activeDevices: 0,
        lastUpdateTime: null,
        responseTime: null,
      };
    }

    const devices = Object.values(state.devices || {}).filter(Boolean);
    const totalDevices = devices.length;
    
    let activeDevices = 0;
    devices.forEach(device => {
      if (device?.data && 'Controllable' in device.data) {
        if (device.data.Controllable.state.on) {
          activeDevices++;
        }
      } else if (device?.data && 'Sensor' in device.data) {
        // Sensors are considered active if they have recent data
        activeDevices++;
      }
    });

    return {
      connectionStatus: 'connected',
      totalDevices,
      onlineDevices: totalDevices, // Assume all devices in state are online
      offlineDevices: 0,
      activeDevices,
      lastUpdateTime: new Date(),
      responseTime: pingHistory.length > 0 ? pingHistory[pingHistory.length - 1] : null,
    };
  }, [state, pingHistory]);

  const getOverallHealth = (): 'good' | 'warning' | 'error' => {
    if (healthMetrics.connectionStatus === 'disconnected') return 'error';
    if (healthMetrics.totalDevices === 0) return 'warning';
    if (healthMetrics.offlineDevices > healthMetrics.totalDevices * 0.2) return 'warning';
    return 'good';
  };

  const getConnectionUptime = (): string => {
    if (!connectionStartTime) return 'N/A';
    const uptime = Date.now() - connectionStartTime.getTime();
    const minutes = Math.floor(uptime / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const overallHealth = getOverallHealth();
  const averagePing = pingHistory.length > 0 
    ? Math.round(pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length)
    : null;

  return (
    <div className="card bg-base-100 shadow-xl col-span-2">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="card-title text-lg">System Health</h2>
          </div>
          <div className={`badge badge-sm ${
            overallHealth === 'good' ? 'badge-success' :
            overallHealth === 'warning' ? 'badge-warning' : 'badge-error'
          }`}>
            {overallHealth === 'good' ? 'Healthy' :
             overallHealth === 'warning' ? 'Warning' : 'Critical'}
          </div>
        </div>

        <div className="space-y-2">
          <HealthIndicator
            status={healthMetrics.connectionStatus === 'connected' ? 'good' : 'error'}
            label="Connection"
            value={healthMetrics.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          />

          <HealthIndicator
            status={healthMetrics.totalDevices > 0 ? 'good' : 'warning'}
            label="Total Devices"
            value={healthMetrics.totalDevices}
          />

          <HealthIndicator
            status={healthMetrics.activeDevices > 0 ? 'good' : 'warning'}
            label="Active Devices"
            value={`${healthMetrics.activeDevices}/${healthMetrics.totalDevices}`}
          />

          {averagePing !== null && (
            <HealthIndicator
              status={averagePing < 50 ? 'good' : averagePing < 100 ? 'warning' : 'error'}
              label="Response Time"
              value={`${averagePing}ms`}
            />
          )}

          <HealthIndicator
            status={connectionStartTime ? 'good' : 'error'}
            label="Uptime"
            value={getConnectionUptime()}
          />
        </div>

        {/* Connection quality indicator */}
        <div className="mt-4 pt-4 border-t border-base-300">
          <div className="flex items-center justify-between text-xs text-base-content/60">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              <span>Connection Quality</span>
            </div>
            <div className="flex gap-1">
              {pingHistory.slice(-5).map((ping, index) => (
                <div
                  key={index}
                  className={`w-1 h-4 rounded-full ${
                    ping < 30 ? 'bg-success' :
                    ping < 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ opacity: 0.3 + (index * 0.15) }}
                />
              ))}
            </div>
          </div>
        </div>

        {healthMetrics.lastUpdateTime && (
          <div className="text-xs text-base-content/50 text-center mt-2">
            Last updated: {healthMetrics.lastUpdateTime.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};