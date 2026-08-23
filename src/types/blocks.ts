export interface Block {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  capacity: number | null;
  order: number;
  name: string;
  description: string | null;
  parentUuid: string | null;
  attributeUuid: string | null;
  isRootBlock: boolean;
  blockParticipantCount?: number;
  children?: Block[];
}

export interface BlockParticipant {
  uuid: string;
  email: string;
  name?: string;
}
