import { Button, Card, Modal } from 'react-daisyui';
import { useToggle } from 'usehooks-ts';
import { X } from 'lucide-react';
import { useTempSensorsQuery } from '@/hooks/influxdb';
import { XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import clsx from 'clsx';

export const SensorsCard = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [detailsModalOpen, toggleDetailsModal] = useToggle(false);

  const tempSensors = useTempSensorsQuery();

  const latestBackyardTemp = tempSensors?.findLast(
    (row) => row.device_id === 'D9353438450D',
  );

  // const latestFrontyardTemp = tempSensors?.findLast(
  //   (row) => row.device_id === 'D83534387029',
  // )?._value;

  const latestPatioTemp = tempSensors?.findLast(
    (row) => row.device_id === 'D4343037362D',
  );

  const latestLivingRoomTemp = tempSensors?.findLast(
    (row) => row.device_id === 'D7353530665A',
  );

  const latestCarTemp = tempSensors?.findLast(
    (row) => row.device_id === 'C76A0246647E',
  );

  const patioTemp = tempSensors
    ?.filter((row) => row.device_id === 'D4343037362D')
    .map((row) => ({
      time: new Date(row._time),
      temp: row._value,
    }));

  return (
    <>
      <Card
        compact
        className="col-span-2 flex-row justify-around bg-base-300 overflow-x-auto overflow-y-hidden min-h-16"
      >
        <Button
          color="ghost"
          className="h-full px-0"
          onClick={toggleDetailsModal}
        >
          <Card.Body>
            <div
              className={clsx(
                'stat-title',
                (latestBackyardTemp?._time ?? 0) <
                  new Date(Date.now() - 15 * 60 * 1000)
                  ? 'text-stone-500'
                  : '',
              )}
            >
              Backyard: {latestBackyardTemp?._value.toFixed(1)} °C
            </div>
          </Card.Body>
        </Button>
        <Button
          color="ghost"
          className="h-full px-0"
          onClick={toggleDetailsModal}
        >
          <Card.Body>
            <div
              className={clsx(
                'stat-title',
                (latestPatioTemp?._time ?? 0) <
                  new Date(Date.now() - 15 * 60 * 1000)
                  ? 'text-stone-500'
                  : '',
              )}
            >
              Patio: {latestPatioTemp?._value.toFixed(1)} °C
            </div>
          </Card.Body>
        </Button>
        <Button
          color="ghost"
          className="h-full px-0"
          onClick={toggleDetailsModal}
        >
          <Card.Body>
            <div
              className={clsx(
                'stat-title',
                (latestCarTemp?._time ?? 0) <
                  new Date(Date.now() - 15 * 60 * 1000)
                  ? 'text-stone-500'
                  : '',
              )}
            >
              Car: {latestCarTemp?._value.toFixed(1)} °C
            </div>
          </Card.Body>
        </Button>
        <Button
          color="ghost"
          className="h-full px-0"
          onClick={toggleDetailsModal}
        >
          <Card.Body>
            <div
              className={clsx(
                'stat-title',
                (latestLivingRoomTemp?._time ?? 0) <
                  new Date(Date.now() - 15 * 60 * 1000)
                  ? 'text-stone-500'
                  : '',
              )}
            >
              Indoors: {latestLivingRoomTemp?._value.toFixed(1)} °C
            </div>
          </Card.Body>
        </Button>
      </Card>
      <Modal.Legacy
        open={false}
        onClickBackdrop={toggleDetailsModal}
        responsive
        className="pt-0"
      >
        <Modal.Header className="sticky w-auto top-0 p-6 m-0 -mx-6 z-10 bg-base-100 bg-opacity-75 backdrop-blur">
          <div className="flex items-center justify-between font-bold">
            <div className="mx-4 text-center">Historical data</div>
            <Button onClick={toggleDetailsModal} variant="outline">
              <X />
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          {/* <ResponsiveContainer width="100%" height="300px"> */}
          <AreaChart
            width={500}
            height={300}
            data={patioTemp}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              scale="time"
              tickFormatter={(date) =>
                new Date(date).toLocaleTimeString('en-FI', {
                  second: undefined,
                  timeStyle: 'short',
                })
              }
            />
            <YAxis />
            <Area
              type="step"
              dataKey="temp"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorTemp)"
            />
          </AreaChart>
          {/* </ResponsiveContainer> */}
        </Modal.Body>
      </Modal.Legacy>
    </>
  );
};
