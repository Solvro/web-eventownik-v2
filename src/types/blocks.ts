export interface Block {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  capacity: number | null;
  order: number | null;
  name: string;
  description: string | null;
  parentUuid: string | null;
  attributeUuid: string | null;
  isRootBlock: boolean;
  blockParticipantCount?: number;
  children: Block[];
}

/** A block occupant, named by the block attribute's participant fields. Empty if none are set */
export interface BlockParticipant {
  name: string;
}
