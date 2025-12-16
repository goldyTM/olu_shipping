import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as vendor_service from "../../../../vendor\\encore.service";

export async function checkStatus(params, opts) {
    const handler = (await import("../../../../vendor\\check-status")).checkStatus;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "checkStatus", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "checkStatus", params, opts);
}

export async function declare(params, opts) {
    const handler = (await import("../../../../vendor\\declare")).declare;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "declare", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "declare", params, opts);
}

export async function deleteShipment(params, opts) {
    const handler = (await import("../../../../vendor\\delete-shipment")).deleteShipment;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "deleteShipment", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "deleteShipment", params, opts);
}

export async function getShipment(params, opts) {
    const handler = (await import("../../../../vendor\\get-shipment")).getShipment;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "getShipment", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "getShipment", params, opts);
}

export async function list(params, opts) {
    const handler = (await import("../../../../vendor\\list")).list;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "list", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "list", params, opts);
}

export async function updateShipment(params, opts) {
    const handler = (await import("../../../../vendor\\update-shipment")).updateShipment;
    registerTestHandler({
        apiRoute: { service: "vendor", name: "updateShipment", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: vendor_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("vendor", "updateShipment", params, opts);
}

