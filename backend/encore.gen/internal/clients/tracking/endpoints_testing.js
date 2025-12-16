import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as tracking_service from "../../../../tracking\\encore.service";

export async function searchByQR(params, opts) {
    const handler = (await import("../../../../tracking\\search-by-qr")).searchByQR;
    registerTestHandler({
        apiRoute: { service: "tracking", name: "searchByQR", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: tracking_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("tracking", "searchByQR", params, opts);
}

export async function track(params, opts) {
    const handler = (await import("../../../../tracking\\track")).track;
    registerTestHandler({
        apiRoute: { service: "tracking", name: "track", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: tracking_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("tracking", "track", params, opts);
}

export async function updateStatus(params, opts) {
    const handler = (await import("../../../../tracking\\update-status")).updateStatus;
    registerTestHandler({
        apiRoute: { service: "tracking", name: "updateStatus", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: tracking_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("tracking", "updateStatus", params, opts);
}

