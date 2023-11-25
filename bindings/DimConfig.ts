// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { DimDevicesSearchConfig } from './DimDevicesSearchConfig';
import type { DimGroupsConfig } from './DimGroupsConfig';

export interface DimConfig {
  name: string;
  devices: DimDevicesSearchConfig | null;
  groups: DimGroupsConfig | null;
  hidden: boolean | null;
}
