import { registerGateways, registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";

import { deleteShipment as admin_deleteShipmentImpl0 } from "../../../../admin\\delete-shipment";
import { search as admin_searchImpl1 } from "../../../../admin\\search";
import { updateShipment as admin_updateShipmentImpl2 } from "../../../../admin\\update-shipment";
import { searchByQR as tracking_searchByQRImpl3 } from "../../../../tracking\\search-by-qr";
import { track as tracking_trackImpl4 } from "../../../../tracking\\track";
import { updateStatus as tracking_updateStatusImpl5 } from "../../../../tracking\\update-status";
import { checkStatus as vendor_checkStatusImpl6 } from "../../../../vendor\\check-status";
import { declare as vendor_declareImpl7 } from "../../../../vendor\\declare";
import { deleteShipment as vendor_deleteShipmentImpl8 } from "../../../../vendor\\delete-shipment";
import { getShipment as vendor_getShipmentImpl9 } from "../../../../vendor\\get-shipment";
import { list as vendor_listImpl10 } from "../../../../vendor\\list";
import { updateShipment as vendor_updateShipmentImpl11 } from "../../../../vendor\\update-shipment";
import * as frontend_service from "../../../../frontend\\encore.service";
import * as vendor_service from "../../../../vendor\\encore.service";
import * as tracking_service from "../../../../tracking\\encore.service";
import * as admin_service from "../../../../admin\\encore.service";

const gateways: any[] = [
];

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "admin",
            name:              "deleteShipment",
            handler:           admin_deleteShipmentImpl0,
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
            handler:           admin_searchImpl1,
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
            handler:           admin_updateShipmentImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "tracking",
            name:              "searchByQR",
            handler:           tracking_searchByQRImpl3,
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
            handler:           tracking_trackImpl4,
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
            handler:           tracking_updateStatusImpl5,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: tracking_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "vendor",
            name:              "checkStatus",
            handler:           vendor_checkStatusImpl6,
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
            handler:           vendor_declareImpl7,
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
            handler:           vendor_deleteShipmentImpl8,
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
            handler:           vendor_getShipmentImpl9,
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
            handler:           vendor_listImpl10,
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
            handler:           vendor_updateShipmentImpl11,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: vendor_service.default.cfg.middlewares || [],
    },
];

registerGateways(gateways);
registerHandlers(handlers);

await run(import.meta.url);
