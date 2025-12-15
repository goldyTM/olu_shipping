import { CallOpts } from "encore.dev/api";

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { deleteShipment as deleteShipment_handler } from "../../../../admin\\delete-shipment.js";
declare const deleteShipment: WithCallOpts<typeof deleteShipment_handler>;
export { deleteShipment };

import { search as search_handler } from "../../../../admin\\search.js";
declare const search: WithCallOpts<typeof search_handler>;
export { search };

import { updateShipment as updateShipment_handler } from "../../../../admin\\update-shipment.js";
declare const updateShipment: WithCallOpts<typeof updateShipment_handler>;
export { updateShipment };


