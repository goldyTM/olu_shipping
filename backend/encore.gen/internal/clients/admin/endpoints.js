import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";

const TEST_ENDPOINTS = typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test"
    ? await import("./endpoints_testing.js")
    : null;

export async function deleteShipment(params, opts) {
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.deleteShipment(params, opts);
    }

    return apiCall("admin", "deleteShipment", params, opts);
}
export async function search(params, opts) {
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.search(params, opts);
    }

    return apiCall("admin", "search", params, opts);
}
export async function updateShipment(params, opts) {
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.updateShipment(params, opts);
    }

    return apiCall("admin", "updateShipment", params, opts);
}
