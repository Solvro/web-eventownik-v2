export interface Block {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  parentId: number | null;
  attributeId: number;
  createdAt: string;
  updatedAt: string;
  isRootBlock: boolean;
  children: Block[];
  meta: {
    participants: BlockParticipant[];
    participantsInBlockCount: number | undefined;
  };
}

export type BlockParticipant = Record<string, string | number>;

export interface PublicBlock extends Block {
  children: PublicBlock[];
  meta: {
    participantsInBlockCount: number | undefined;
    participants: BlockParticipant[];
  };
}
