// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { CycleScenesDescriptor } from "./CycleScenesDescriptor";
import type { IntegrationActionDescriptor } from "./IntegrationActionDescriptor";
import type { SceneDescriptor } from "./SceneDescriptor";

export type Action = { action: "ActivateScene" } & SceneDescriptor | { action: "CycleScenes" } & CycleScenesDescriptor | { action: "IntegrationAction" } & IntegrationActionDescriptor;