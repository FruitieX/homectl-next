import { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-daisyui';
import { useInterval, useTimeout, useToggle } from 'usehooks-ts';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { useTempSensorsQuery } from '@/hooks/influxdb';
import useIdle from '@/hooks/useIdle';

type WeatherTimeSeries = {
  time: Date;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
      };
    };
    next_1_hours: {
      details: {
        probability_of_precipitation: number;
      };
      summary: {
        symbol_code: string;
      };
    };
  };
};
type WeatherResponse = {
  properties: {
    meta: {
      updated_at: string;
    };
    timeseries: WeatherTimeSeries[];
  };
};

const fetchWeather = async (): Promise<WeatherResponse> => {
  const res = await fetch('/api/weather');
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.status}`);
  }
  const json: WeatherResponse = await res.json();
  return json;
};

export const WeatherCard = () => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  const isIdle = useIdle();
  const [detailsModalOpen, toggleDetailsModal, setDetailsModalOpen] =
    useToggle(false);

  const tempSensors = useTempSensorsQuery();

  const latestFrontyardTemp = tempSensors?.findLast(
    (row) => row.device_id === 'D83534387029',
  )?._value;

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      const weather = await fetchWeather();
      if (isSubscribed === true) {
        setWeather(weather);
      }
    };
    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  useInterval(async () => {
    const weather = await fetchWeather();
    setWeather(weather);
  }, 60 * 1000);

  useTimeout(
    () => {
      setDetailsModalOpen(false);
    },
    detailsModalOpen && isIdle ? 10 * 1000 : null,
  );

  const roundToHour = (date: Date) => {
    const p = 60 * 60 * 1000; // milliseconds in an hour
    return new Date(Math.round(date.getTime() / p) * p);
  };
  const currentAndFutureSeries = weather?.properties.timeseries.filter(
    (series) => {
      return new Date(series.time) >= roundToHour(new Date());
    },
  );

  // const weatherData = currentAndFutureSeries?.filter(series => {
  //   new Date(series.time).getTime() < new Date().getTime() + 24 * 60 * 60 * 1000;
  // }).map((series) => {
  //   const rainProbability =
  //     series.data.next_1_hours?.details.probability_of_precipitation;
  //   return {
  //     time: series.time,
  //     temp: series.data.instant.details.air_temperature,
  //     rainProbability: rainProbability,
  //   };
  // });

  // console.log(weatherData);

  return (
    <>
      <Card compact className="col-span-1 bg-base-300">
        <Button color="ghost" className="h-full" onClick={toggleDetailsModal}>
          <Card.Body>
            {renderWeatherDetail(
              currentAndFutureSeries && currentAndFutureSeries[0],
              true,
              latestFrontyardTemp ? latestFrontyardTemp.toFixed(1) : undefined,
            )}
          </Card.Body>
        </Button>
      </Card>
      <Modal.Legacy
        open={detailsModalOpen}
        onClickBackdrop={toggleDetailsModal}
        responsive
        className="pt-0"
      >
        <Modal.Header className="sticky w-auto top-0 p-6 m-0 -mx-6 z-10 bg-base-100 bg-opacity-75 backdrop-blur-sm">
          <div className="flex items-center justify-between font-bold">
            <div className="mx-4 text-center">Weather forecast</div>
            <Button onClick={toggleDetailsModal} variant="outline">
              <X />
            </Button>
          </div>
          {/* <ResponsiveContainer width="100%" height="300px"> */}
          {/* <LineChart
            width={500}
            height={300}
            data={weatherData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString('en-FI')
              }
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
            <Line type="monotone" dataKey="rainProbability" stroke="#8884d8" />
          </LineChart> */}
          {/* </ResponsiveContainer> */}
          <div className="flex flex-row pt-6 text-base">
            <span className="stat-title w-24">Time</span>
            <span className="stat-title">Forecast</span>
            <span className="stat-title flex-1 text-right">
              Probability of rain
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          {currentAndFutureSeries &&
            currentAndFutureSeries
              .map((series, index) => {
                const rainProbability =
                  series.data.next_1_hours?.details
                    .probability_of_precipitation;
                return (
                  <div key={index} className="flex flex-row">
                    <span className="w-24 text-2xl flex items-center">
                      {new Date(series.time).toLocaleTimeString('fi-FI', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {renderWeatherDetail(series, false)}
                    <span className="flex-1" />
                    <span
                      className={clsx(
                        'flex items-center',
                        rainProbability > 20
                          ? rainProbability > 50
                            ? 'text-red-500'
                            : 'text-yellow-500'
                          : 'text-green-500',
                      )}
                    >
                      {rainProbability} %
                    </span>
                  </div>
                );
              })
              .slice(0, 24)}
        </Modal.Body>
      </Modal.Legacy>
    </>
  );
};

const renderWeatherDetail = (
  series?: WeatherTimeSeries,
  horizontal?: boolean,
  overrideTemp?: string | number,
) => {
  if (series === undefined) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center',
        horizontal ? 'flex-col' : 'gap-3',
      )}
    >
      <img
        className="w-16"
        src={`/weathericons/${series.data.next_1_hours?.summary.symbol_code}.svg`}
      />
      <div className={clsx('flex flex-col', horizontal ? 'items-center' : '')}>
        <span className="whitespace-nowrap text-2xl">
          {overrideTemp !== undefined
            ? overrideTemp
            : series.data.instant.details.air_temperature}{' '}
          °C
        </span>
        <span className="stat-title">
          {series.data.instant.details.wind_speed} m/s
        </span>
      </div>
    </div>
  );
};
