import { describe, expect, it, vi } from "vitest";

import { createReorderQueue, orderByIds } from "@/lib/reorder-queue";
import type { ReorderResult } from "@/lib/reorder-queue";

function ignore() {
  return null;
}

function deferred() {
  let resolve: (value: ReorderResult) => void = ignore;
  const promise = new Promise<ReorderResult>((resolve_) => {
    resolve = resolve_;
  });
  return { promise, resolve };
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("reorder queue", () => {
  it("bases each save on the last accepted order, not a stale server render", async () => {
    const first = deferred();
    const save = vi
      .fn<(ordered: string[], previous: string[]) => Promise<ReorderResult>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue({ success: true });
    const onIdle = vi.fn();
    const queue = createReorderQueue({ save, onFailure: vi.fn(), onIdle });
    queue.setConfirmed(["a", "b", "c"]);

    queue.enqueue(["b", "a", "c"]);
    // A second drag while the first save is still in flight.
    queue.enqueue(["b", "c", "a"]);
    expect(save).toHaveBeenCalledTimes(1);

    first.resolve({ success: true });
    await flush();

    expect(save.mock.calls).toEqual([
      [
        ["b", "a", "c"],
        ["a", "b", "c"],
      ],
      [
        ["b", "c", "a"],
        ["b", "a", "c"],
      ],
    ]);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("collapses drags made during a save into a single follow-up write", async () => {
    const first = deferred();
    const save = vi
      .fn<(ordered: string[], previous: string[]) => Promise<ReorderResult>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue({ success: true });
    const queue = createReorderQueue({
      save,
      onFailure: vi.fn(),
      onIdle: vi.fn(),
    });
    queue.setConfirmed(["a", "b", "c"]);
    queue.enqueue(["b", "a", "c"]);
    queue.enqueue(["c", "a", "b"]);
    queue.enqueue(["c", "b", "a"]);
    first.resolve({ success: true });
    await flush();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0]).toEqual(["c", "b", "a"]);
  });

  it.each([
    [
      "an unsuccessful response",
      vi
        .fn<() => Promise<ReorderResult>>()
        .mockResolvedValue({ success: false }),
    ],
    [
      "a thrown error",
      vi
        .fn<() => Promise<ReorderResult>>()
        .mockRejectedValue(new Error("network")),
    ],
  ])(
    "rolls back to the last accepted order and drops queued drags after %s",
    async (_, failingSave) => {
      const onFailure = vi.fn();
      const onIdle = vi.fn();
      const save = vi
        .fn<(ordered: string[], previous: string[]) => Promise<ReorderResult>>()
        .mockResolvedValueOnce({ success: true })
        .mockImplementationOnce(failingSave)
        .mockResolvedValue({ success: true });
      const queue = createReorderQueue({ save, onFailure, onIdle });
      queue.setConfirmed(["a", "b"]);

      queue.enqueue(["b", "a"]);
      await flush();
      queue.enqueue(["a", "b"]);
      await flush();

      expect(onFailure).toHaveBeenCalledWith(["b", "a"]);
      expect(queue.isRunning()).toBe(false);
      expect(onIdle).toHaveBeenCalledTimes(2);

      // Recovery: the next drag is based on the rolled-back order.
      queue.enqueue(["a", "b"]);
      await flush();
      expect(save.mock.calls.at(-1)).toEqual([
        ["a", "b"],
        ["b", "a"],
      ]);
    },
  );

  it("orders items by id and keeps unknown items at the end", () => {
    const items = [{ id: "x" }, { id: "a" }, { id: "b" }];
    expect(orderByIds(items, ["b", "a"], (item) => item.id)).toEqual([
      { id: "b" },
      { id: "a" },
      { id: "x" },
    ]);
  });
});
