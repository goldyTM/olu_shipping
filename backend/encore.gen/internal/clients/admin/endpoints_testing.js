import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as admin_service from "../../../../admin\\encore.service";

export async function deleteShipment(params, opts) {
    const handler = (await import("../../../../admin\\delete-shipment")).deleteShipment;
    registerTestHandler({
        apiRoute: { service: "admin", name: "deleteShipment", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "deleteShipment", params, opts);
}

export async function search(params, opts) {
    const handler = (await import("../../../../admin\\search")).search;
    registerTestHandler({
        apiRoute: { service: "admin", name: "search", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "search", params, opts);
}

export async function updateShipment(params, opts) {
    const handler = (await import("../../../../admin\\update-shipment")).updateShipment;
    registerTestHandler({
        apiRoute: { service: "admin", name: "updateShipment", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "updateShipment", params, opts);
}

