'use client';

import { ClockCard } from './ClockCard';
import { ControlsCard } from './ControlsCard';
import { SensorsCard } from './SensorsCard';
import { SpotPriceCard } from './SpotPriceCard';
import { TrainScheduleCard } from './TrainScheduleCard';
import { WeatherCard } from './WeatherCard';

export default function Page() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 overflow-y-auto mx-2 py-2">
      <WeatherCard />
      <ClockCard />
      <SensorsCard />
      {/* <ControlsCard /> */}
      <SpotPriceCard />
      <TrainScheduleCard />
    </div>
  );
}
