import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { checkStatus as checkStatusImpl0 } from "../../../../../vendor\\check-status";
import { declare as declareImpl1 } from "../../../../../vendor\\declare";
import { deleteShipment as deleteShipmentImpl2 } from "../../../../../vendor\\delete-shipment";
import { getShipment as getShipmentImpl3 } from "../../../../../vendor\\get-shipment";
import { list as listImpl4 } from "../../../../../vendor\\list";
import { updateShipment as updateShipmentImpl5 } from "../../../../../vendor\\update-shipment";
import * as vendor_service from "../../../../../vendor\\encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "vendor",
            name:              "checkStatus",
            handler:           checkStatusImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "declare",
            handler:           declareImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "deleteShipment",
            handler:           deleteShipmentImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "getShipment",
            handler:           getShipmentImpl3,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "list",
            handler:           listImpl4,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "updateShipment",
            handler:           updateShipmentImpl5,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
