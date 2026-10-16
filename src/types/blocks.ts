import type { V3Block } from "./v3";

export type Block = V3Block;
export type PublicBlock = V3Block;
export interface BlockParticipant {
  uuid: string;
  email: string;
}
