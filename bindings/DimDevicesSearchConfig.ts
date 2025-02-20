// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { DimDeviceConfig } from "./DimDeviceConfig";
import type { IntegrationId } from "./IntegrationId";

/**
 * Device "search" config as used directly in the configuration file. We use device names instead of device id as key.
 */
export type DimDevicesSearchConfig = { [key in IntegrationId]?: { [key in string]?: DimDeviceConfig } };
