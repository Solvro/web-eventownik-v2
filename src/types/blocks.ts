export interface Block {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  parentId: number | null;
  attributeId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  isRootBlock: boolean;
  children: Block[];
  meta: {
    participants: BlockParticipant[];
    participantsInBlockCount: number | undefined;
  };
}

export interface BlockParticipant {
  id: string;
  email: string;
  name?: string;
}

export interface PublicBlock extends Block {
  children: PublicBlock[];
  meta: {
    participantsInBlockCount: number | undefined;
    participants: BlockParticipant[];
  };
}
