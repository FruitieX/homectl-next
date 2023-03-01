import { useWebsocketState } from '@/hooks/websocket';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { Device } from '@/bindings/Device';
import { useCallback, useRef } from 'react';
import { useElementSize } from 'usehooks-ts';
import { getDeviceKey } from '@/lib/device';
import { ViewportDevice } from '@/ui/ViewportDevice';
import { konvaStageMultiTouchScale } from '@/lib/konvaStageMultiTouchScale';
import { useSelectedDevices } from '@/hooks/selectedDevices';

const scale = { x: 0.265, y: 0.265 };

const Floorplan = () => {
  const [image] = useImage('/floorplan.svg');
  return <Image image={image} />;
};

export const Viewport = () => {
  const state = useWebsocketState();

  const devices: Device[] = Object.values(state?.devices ?? {});

  const [containerRef, { width, height }] = useElementSize();

  const touchRegistersAsTap = useRef(true);
  const deviceTouchTimer = useRef<NodeJS.Timeout | null>(null);
  const [selectedDevices] = useSelectedDevices();

  const onDragStart = useCallback(() => {
    if (deviceTouchTimer.current !== null) {
      clearTimeout(deviceTouchTimer.current);
      deviceTouchTimer.current = null;
    }

    touchRegistersAsTap.current = false;
  }, []);

  return (
    <div ref={containerRef} className="absolute top-0 left-0 h-screen w-screen">
      <Stage
        width={width}
        height={height}
        scale={scale}
        offsetY={-800}
        draggable
        onDragStart={onDragStart}
        ref={(stage) => {
          if (stage !== null) {
            konvaStageMultiTouchScale(stage, onDragStart);
          }
        }}
      >
        <Layer name="bottom-layer" />
        <Layer>
          <Floorplan />

          {devices.map((device) => (
            <ViewportDevice
              key={getDeviceKey(device)}
              device={device}
              touchRegistersAsTap={touchRegistersAsTap}
              deviceTouchTimer={deviceTouchTimer}
              selected={
                selectedDevices.find(
                  (deviceKey) => deviceKey === getDeviceKey(device),
                ) !== undefined
              }
              interactive
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Viewport;
