import { CallOpts } from "encore.dev/api";

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { checkStatus as checkStatus_handler } from "../../../../vendor\\check-status.js";
declare const checkStatus: WithCallOpts<typeof checkStatus_handler>;
export { checkStatus };

import { declare as declare_handler } from "../../../../vendor\\declare.js";
declare const declare: WithCallOpts<typeof declare_handler>;
export { declare };

import { deleteShipment as deleteShipment_handler } from "../../../../vendor\\delete-shipment.js";
declare const deleteShipment: WithCallOpts<typeof deleteShipment_handler>;
export { deleteShipment };

import { getShipment as getShipment_handler } from "../../../../vendor\\get-shipment.js";
declare const getShipment: WithCallOpts<typeof getShipment_handler>;
export { getShipment };

import { list as list_handler } from "../../../../vendor\\list.js";
declare const list: WithCallOpts<typeof list_handler>;
export { list };

import { updateShipment as updateShipment_handler } from "../../../../vendor\\update-shipment.js";
declare const updateShipment: WithCallOpts<typeof updateShipment_handler>;
export { updateShipment };


