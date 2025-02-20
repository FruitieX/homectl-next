// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { ActivateSceneDescriptor } from "./ActivateSceneDescriptor";
import type { DeviceKey } from "./DeviceKey";
import type { GroupId } from "./GroupId";

export type CycleScenesDescriptor = { scenes: Array<ActivateSceneDescriptor>, nowrap: boolean | null, 
/**
 * Optionally only detect current scene from these devices
 */
device_keys: Array<DeviceKey> | null, 
/**
 * Optionally only detect current scene from these groups
 */
group_keys: Array<GroupId> | null, };
