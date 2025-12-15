import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { deleteShipment as deleteShipmentImpl0 } from "../../../../../admin\\delete-shipment";
import { search as searchImpl1 } from "../../../../../admin\\search";
import { updateShipment as updateShipmentImpl2 } from "../../../../../admin\\update-shipment";
import * as admin_service from "../../../../../admin\\encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "admin",
            name:              "deleteShipment",
            handler:           deleteShipmentImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "search",
            handler:           searchImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "updateShipment",
            handler:           updateShipmentImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
