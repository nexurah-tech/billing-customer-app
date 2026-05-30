"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var db_1 = require("@/lib/db");
var api_1 = require("@/lib/api");
var auth_1 = require("@/lib/auth");
var Invoice_1 = require("@/models/Invoice");
var Settings_1 = require("@/models/Settings");
var Product_1 = require("@/models/Product");
function getNextInvoiceSequence(shopId) {
    return __awaiter(this, void 0, void 0, function () {
        var latest, match;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Invoice_1.default.findOne({ shop: shopId })
                        .sort({ createdAt: -1 })
                        .select('invoiceNumber')
                        .lean()];
                case 1:
                    latest = _a.sent();
                    if (!(latest === null || latest === void 0 ? void 0 : latest.invoiceNumber)) {
                        return [2 /*return*/, 1000];
                    }
                    match = /-(\d+)$/.exec(latest.invoiceNumber);
                    return [2 /*return*/, match ? Number(match[1]) + 1 : 1000];
            }
        });
    });
}
function generateInvoiceNumber(shopId) {
    return __awaiter(this, void 0, void 0, function () {
        var settings, nextSequence, updated, sequence;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Settings_1.default.findOne({ shop: shopId })];
                case 1:
                    settings = _a.sent();
                    if (!!settings) return [3 /*break*/, 4];
                    return [4 /*yield*/, getNextInvoiceSequence(shopId)];
                case 2:
                    nextSequence = _a.sent();
                    return [4 /*yield*/, Settings_1.default.create({
                            shop: shopId,
                            invoicePrefix: 'INV',
                            invoiceStartNumber: nextSequence,
                            invoiceAutoSequence: true,
                            taxSystem: 'GST',
                            taxRates: { standard: 18, reduced: 5 },
                            notificationPreferences: {
                                emailNotifications: true,
                                whatsappNotifications: true,
                                lowStockAlert: true,
                            },
                        })];
                case 3:
                    settings = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!settings.invoiceAutoSequence) return [3 /*break*/, 6];
                    return [4 /*yield*/, Settings_1.default.findOneAndUpdate({ shop: shopId }, { $inc: { invoiceStartNumber: 1 } }, { new: true })];
                case 5:
                    updated = _a.sent();
                    sequence = updated ? updated.invoiceStartNumber - 1 : settings.invoiceStartNumber;
                    return [2 /*return*/, "".concat(settings.invoicePrefix, "-").concat(sequence)];
                case 6: return [2 /*return*/, "".concat(settings.invoicePrefix, "-").concat(settings.invoiceStartNumber)];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, searchParams, page, limit, status_1, customerId, query, skip, invoices, total, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _a.sent();
                    auth = (0, auth_1.extractAuthFromRequest)(request);
                    if (!auth) {
                        return [2 /*return*/, (0, api_1.errorResponse)('Unauthorized', 401)];
                    }
                    searchParams = new URL(request.url).searchParams;
                    page = parseInt(searchParams.get('page') || '1');
                    limit = parseInt(searchParams.get('limit') || '50');
                    status_1 = searchParams.get('status');
                    customerId = searchParams.get('customerId');
                    query = { shop: auth.shopId };
                    if (status_1) {
                        query.paymentStatus = status_1;
                    }
                    if (customerId) {
                        query.customer = customerId;
                    }
                    skip = (page - 1) * limit;
                    return [4 /*yield*/, Invoice_1.default.find(query)
                            .populate('customer')
                            .populate('items.product')
                            .limit(limit)
                            .skip(skip)
                            .sort({ createdAt: -1 })];
                case 2:
                    invoices = _a.sent();
                    return [4 /*yield*/, Invoice_1.default.countDocuments(query)];
                case 3:
                    total = _a.sent();
                    return [2 /*return*/, (0, api_1.successResponse)({
                            invoices: invoices,
                            pagination: {
                                total: total,
                                page: page,
                                limit: limit,
                                pages: Math.ceil(total / limit),
                            },
                        })];
                case 4:
                    error_1 = _a.sent();
                    console.error('Get invoices error:', error_1);
                    return [2 /*return*/, (0, api_1.errorResponse)(error_1.message || 'Failed to get invoices', 500)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, body, customerId, items, paymentMethod, paymentStatus, discountAmount, notes, settings, _a, taxRate, subtotal, taxAmount, processedItems, _i, items_1, item, product, itemSubtotal, itemTax, total, invoiceNumber, invoice, attempt, error_2, error_3;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 22, , 23]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _e.sent();
                    auth = (0, auth_1.extractAuthFromRequest)(request);
                    if (!auth) {
                        return [2 /*return*/, (0, api_1.errorResponse)('Unauthorized', 401)];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _e.sent();
                    customerId = body.customerId, items = body.items, paymentMethod = body.paymentMethod, paymentStatus = body.paymentStatus, discountAmount = body.discountAmount, notes = body.notes;
                    // Validation
                    if (!customerId || !items || items.length === 0) {
                        return [2 /*return*/, (0, api_1.errorResponse)('Customer and items are required', 400)];
                    }
                    return [4 /*yield*/, Settings_1.default.findOne({ shop: auth.shopId })];
                case 3:
                    _a = (_e.sent());
                    if (_a) return [3 /*break*/, 5];
                    return [4 /*yield*/, Settings_1.default.create({
                            shop: auth.shopId,
                            invoicePrefix: 'INV',
                            invoiceStartNumber: 1000,
                            invoiceAutoSequence: true,
                            taxSystem: 'GST',
                            taxRates: { standard: 18, reduced: 5 },
                            notificationPreferences: {
                                emailNotifications: true,
                                whatsappNotifications: true,
                                lowStockAlert: true,
                            },
                        })];
                case 4:
                    _a = (_e.sent());
                    _e.label = 5;
                case 5:
                    settings = _a;
                    taxRate = ((_c = (_b = settings.taxRates) === null || _b === void 0 ? void 0 : _b.standard) !== null && _c !== void 0 ? _c : 18) / 100;
                    subtotal = 0;
                    taxAmount = 0;
                    processedItems = [];
                    _i = 0, items_1 = items;
                    _e.label = 6;
                case 6:
                    if (!(_i < items_1.length)) return [3 /*break*/, 10];
                    item = items_1[_i];
                    return [4 /*yield*/, Product_1.default.findOne({
                            _id: item.productId,
                            shop: auth.shopId,
                        })];
                case 7:
                    product = _e.sent();
                    if (!product) {
                        return [2 /*return*/, (0, api_1.errorResponse)("Product ".concat(item.productId, " not found"), 404)];
                    }
                    if (product.stock < item.quantity) {
                        return [2 /*return*/, (0, api_1.errorResponse)("Insufficient stock for ".concat(product.name), 400)];
                    }
                    itemSubtotal = product.unitPrice * item.quantity;
                    itemTax = 0;
                    subtotal += itemSubtotal;
                    processedItems.push({
                        product: product._id,
                        quantity: item.quantity,
                        price: product.unitPrice,
                        tax: itemTax,
                        subtotal: itemSubtotal,
                    });
                    // Update product stock
                    product.stock -= item.quantity;
                    return [4 /*yield*/, product.save()];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 6];
                case 10:
                    total = subtotal - (discountAmount || 0);
                    return [4 /*yield*/, generateInvoiceNumber(auth.shopId)];
                case 11:
                    invoiceNumber = _e.sent();
                    invoice = void 0;
                    attempt = 0;
                    _e.label = 12;
                case 12:
                    if (!(attempt < 3)) return [3 /*break*/, 19];
                    _e.label = 13;
                case 13:
                    _e.trys.push([13, 15, , 18]);
                    invoice = new Invoice_1.default({
                        invoiceNumber: invoiceNumber,
                        customer: customerId,
                        items: processedItems,
                        subtotal: subtotal,
                        taxAmount: taxAmount,
                        discountAmount: discountAmount || 0,
                        total: Math.max(0, total),
                        paymentMethod: paymentMethod || 'cash',
                        paymentStatus: paymentStatus || 'unpaid',
                        notes: notes || '',
                        shop: auth.shopId,
                    });
                    return [4 /*yield*/, invoice.save()];
                case 14:
                    _e.sent();
                    return [3 /*break*/, 19];
                case 15:
                    error_2 = _e.sent();
                    if (!((error_2 === null || error_2 === void 0 ? void 0 : error_2.code) === 11000 &&
                        ((_d = error_2.message) === null || _d === void 0 ? void 0 : _d.includes('invoiceNumber')) &&
                        attempt < 2)) return [3 /*break*/, 17];
                    return [4 /*yield*/, generateInvoiceNumber(auth.shopId)];
                case 16:
                    invoiceNumber = _e.sent();
                    return [3 /*break*/, 18];
                case 17: throw error_2;
                case 18:
                    attempt += 1;
                    return [3 /*break*/, 12];
                case 19:
                    if (!invoice) {
                        return [2 /*return*/, (0, api_1.errorResponse)('Failed to create invoice after retrying', 500)];
                    }
                    return [4 /*yield*/, invoice.populate('customer')];
                case 20:
                    _e.sent();
                    return [4 /*yield*/, invoice.populate('items.product')];
                case 21:
                    _e.sent();
                    return [2 /*return*/, (0, api_1.successResponse)(invoice, 201)];
                case 22:
                    error_3 = _e.sent();
                    console.error('Create invoice error:', error_3);
                    return [2 /*return*/, (0, api_1.errorResponse)(error_3.message || 'Failed to create invoice', 500)];
                case 23: return [2 /*return*/];
            }
        });
    });
}
