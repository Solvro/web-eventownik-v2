export interface ReorderResult {
  success: boolean;
}

export type ReorderSave = (
  orderedIds: string[],
  previousIds: string[],
) => Promise<ReorderResult>;

interface ReorderQueueOptions {
  save: ReorderSave;
  /** Called with the last order the backend accepted, so the UI can roll back to it. */
  onFailure: (confirmedIds: string[]) => void;
  /** Called once every queued save has settled. */
  onIdle: () => void;
}

/**
 * Serializes reorder writes. Only one request is in flight at a time, each
 * request is based on the order the backend last accepted (not a possibly
 * stale server render), and drags made while saving collapse into one write.
 */
export function createReorderQueue({
  save,
  onFailure,
  onIdle,
}: ReorderQueueOptions) {
  let confirmed: string[] = [];
  let pending: string[] | null = null;
  let running = false;

  async function run() {
    running = true;
    while (pending !== null) {
      const next = pending;
      pending = null;
      let success = false;
      try {
        const result = await save(next, confirmed);
        success = result.success;
      } catch {
        success = false;
      }
      if (success) {
        confirmed = next;
      } else {
        pending = null;
        onFailure(confirmed);
        break;
      }
    }
    running = false;
    onIdle();
  }

  return {
    /** Replaces the accepted order; only call while the queue is idle. */
    setConfirmed(ids: string[]) {
      confirmed = ids;
    },
    enqueue(ids: string[]) {
      pending = ids;
      if (!running) {
        void run();
      }
    },
    isRunning() {
      return running;
    },
  };
}

/** Orders `items` by `ids`; items missing from `ids` keep their relative order at the end. */
export function orderByIds<T>(
  items: T[],
  ids: string[],
  getId: (item: T) => string,
): T[] {
  const position = new Map(ids.map((id, index) => [id, index]));
  return items.toSorted(
    (a, b) =>
      (position.get(getId(a)) ?? Number.MAX_SAFE_INTEGER) -
      (position.get(getId(b)) ?? Number.MAX_SAFE_INTEGER),
  );
}
