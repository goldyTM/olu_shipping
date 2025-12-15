import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { searchByQR as searchByQRImpl0 } from "../../../../../tracking\\search-by-qr";
import { track as trackImpl1 } from "../../../../../tracking\\track";
import { updateStatus as updateStatusImpl2 } from "../../../../../tracking\\update-status";
import * as tracking_service from "../../../../../tracking\\encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "tracking",
            name:              "searchByQR",
            handler:           searchByQRImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: tracking_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "tracking",
            name:              "track",
            handler:           trackImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: tracking_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "tracking",
            name:              "updateStatus",
            handler:           updateStatusImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: tracking_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
