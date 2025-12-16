import { CallOpts } from "encore.dev/api";

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { searchByQR as searchByQR_handler } from "../../../../tracking\\search-by-qr.js";
declare const searchByQR: WithCallOpts<typeof searchByQR_handler>;
export { searchByQR };

import { track as track_handler } from "../../../../tracking\\track.js";
declare const track: WithCallOpts<typeof track_handler>;
export { track };

import { updateStatus as updateStatus_handler } from "../../../../tracking\\update-status.js";
declare const updateStatus: WithCallOpts<typeof updateStatus_handler>;
export { updateStatus };


