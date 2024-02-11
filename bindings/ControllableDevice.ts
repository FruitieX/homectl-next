// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { Capabilities } from './Capabilities';
import type { ControllableState } from './ControllableState';
import type { ManageKind } from './ManageKind';
import type { SceneId } from './SceneId';

export interface ControllableDevice {
  scene: SceneId | null;
  capabilities: Capabilities;
  state: ControllableState;
  managed: ManageKind;
}
