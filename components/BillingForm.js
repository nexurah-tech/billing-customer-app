'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingForm = BillingForm;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
function BillingForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess;
    var _b = (0, react_1.useState)([]), customers = _b[0], setCustomers = _b[1];
    var _c = (0, react_1.useState)([]), products = _c[0], setProducts = _c[1];
    var _d = (0, react_1.useState)([]), categories = _d[0], setCategories = _d[1];
    var _e = (0, react_1.useState)(''), selectedCustomer = _e[0], setSelectedCustomer = _e[1];
    var _f = (0, react_1.useState)([]), lineItems = _f[0], setLineItems = _f[1];
    var _g = (0, react_1.useState)('cash'), paymentMethod = _g[0], setPaymentMethod = _g[1];
    var _h = (0, react_1.useState)(0), discountAmount = _h[0], setDiscountAmount = _h[1];
    var _j = (0, react_1.useState)(''), notes = _j[0], setNotes = _j[1];
    var _k = (0, react_1.useState)(false), loading = _k[0], setLoading = _k[1];
    // Bill Preview modal state
    var _l = (0, react_1.useState)(null), billPreview = _l[0], setBillPreview = _l[1];
    // Search & Filter state
    var _m = (0, react_1.useState)(''), searchQuery = _m[0], setSearchQuery = _m[1];
    var _o = (0, react_1.useState)(''), customerSearchQuery = _o[0], setCustomerSearchQuery = _o[1];
    var _p = (0, react_1.useState)('all'), selectedCategory = _p[0], setSelectedCategory = _p[1];
    // Quick Customer Dialog state
    var _q = (0, react_1.useState)(false), showCustomerModal = _q[0], setShowCustomerModal = _q[1];
    var _r = (0, react_1.useState)({
        name: '',
        phone: '',
        email: '',
        customerType: 'retail',
    }), newCustomer = _r[0], setNewCustomer = _r[1];
    var _s = (0, react_1.useState)(false), customerModalLoading = _s[0], setCustomerModalLoading = _s[1];
    // Helper: open modal pre-filled from search query
    var openRegisterModal = function (query) {
        var isPhone = /^[0-9\s\-+()]{6,}$/.test(query.trim());
        setNewCustomer({
            name: isPhone ? '' : query.trim(),
            phone: isPhone ? query.replace(/[^0-9]/g, '') : '',
            email: '',
            customerType: 'retail',
        });
        setShowCustomerModal(true);
    };
    (0, react_1.useEffect)(function () {
        fetchCustomers();
        fetchProducts();
        fetchCategories();
    }, []);
    var fetchCustomers = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/customers', {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setCustomers(data.data.customers);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error fetching customers:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchProducts = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/products', {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setProducts(data.data.products);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error fetching products:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchCategories = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/categories', {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setCategories(data.data.categories);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error fetching categories:', err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Add item by clicking catalog card
    var addCatalogueItem = function (product) {
        if (product.stock <= 0) {
            alert('Product is out of stock!');
            return;
        }
        var existingIndex = lineItems.findIndex(function (item) { return item.productId === product._id; });
        if (existingIndex > -1) {
            var updated = __spreadArray([], lineItems, true);
            if (updated[existingIndex].quantity >= product.stock) {
                alert("Cannot add more than available stock (".concat(product.stock, " units)!"));
                return;
            }
            updated[existingIndex].quantity += 1;
            setLineItems(updated);
        }
        else {
            setLineItems(__spreadArray(__spreadArray([], lineItems, true), [
                { productId: product._id, quantity: 1, price: product.unitPrice },
            ], false));
        }
    };
    // Stepper handlers
    var incrementQty = function (index, stockLimit) {
        var updated = __spreadArray([], lineItems, true);
        if (updated[index].quantity >= stockLimit) {
            alert("Cannot exceed active stock of ".concat(stockLimit, " units!"));
            return;
        }
        updated[index].quantity += 1;
        setLineItems(updated);
    };
    var decrementQty = function (index) {
        var updated = __spreadArray([], lineItems, true);
        if (updated[index].quantity > 1) {
            updated[index].quantity -= 1;
            setLineItems(updated);
        }
        else {
            removeLineItem(index);
        }
    };
    var removeLineItem = function (index) {
        setLineItems(lineItems.filter(function (_, i) { return i !== index; }));
    };
    var createCustomer = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!newCustomer.name || !newCustomer.phone) {
                        alert('Name and Phone are required!');
                        return [2 /*return*/];
                    }
                    setCustomerModalLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/customers', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify(newCustomer),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setCustomers(__spreadArray([data.data], customers, true));
                        setSelectedCustomer(data.data._id);
                        setShowCustomerModal(false);
                        setNewCustomer({ name: '', phone: '', email: '', customerType: 'retail' });
                        alert('Customer registered successfully!');
                    }
                    else {
                        alert(data.error || 'Failed to create customer');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_4 = _a.sent();
                    console.error('Error creating customer:', err_4);
                    alert('Error creating customer');
                    return [3 /*break*/, 6];
                case 5:
                    setCustomerModalLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var subtotal = lineItems.reduce(function (sum, item) { return sum + item.quantity * item.price; }, 0);
    var total = Math.max(0, subtotal - discountAmount);
    var filteredCustomers = customers.filter(function (c) {
        var query = customerSearchQuery.trim().toLowerCase();
        if (!query)
            return true;
        return ((c.name && c.name.toLowerCase().includes(query)) ||
            (c.phone && c.phone.includes(query)));
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!selectedCustomer) {
                        alert('Please select or register a customer');
                        return [2 /*return*/];
                    }
                    if (lineItems.length === 0) {
                        alert('Please add at least one item to checkout');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/invoices', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify({
                                customerId: selectedCustomer,
                                items: lineItems.map(function (item) { return ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                }); }),
                                paymentMethod: paymentMethod,
                                paymentStatus: 'paid',
                                discountAmount: discountAmount,
                                notes: notes,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setBillPreview(data.data);
                    }
                    else {
                        alert(data.error || 'Failed to create invoice');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_5 = _a.sent();
                    alert('Error creating invoice');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Filter products by search and category selection
    var filteredProducts = products.filter(function (product) {
        var _a;
        var matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        var catId = typeof product.category === 'object' ? (_a = product.category) === null || _a === void 0 ? void 0 : _a._id : product.category;
        var matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    return (<div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start relative select-none">
      {/* LEFT COLUMN: 60% Width - Catalogue Grid */}
      <div className="xl:col-span-7 space-y-4">
        <card_1.Card className="p-4 border-slate-200/80 shadow-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <lucide_react_1.Package className="text-indigo-500 size-4.5"/>
                Inventory Catalogue
              </h2>
              <p className="text-[11px] text-slate-500">Tap items to add to POS ticket</p>
            </div>

            {/* Live Counter */}
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200/40">
              {filteredProducts.length} items shown
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search catalogue */}
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4"/>
              <input type="text" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} placeholder="Quick search by name or SKU..." className="w-full bg-slate-50 border border-slate-200/60 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2 text-xs placeholder:text-slate-400 focus:outline-none transition-all"/>
            </div>

            {/* Category Select filter */}
            <div className="w-full sm:w-48">
              <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <select_1.SelectTrigger className="rounded-xl border-slate-200/60 bg-slate-50 h-9.5 text-xs text-slate-700">
                  <select_1.SelectValue placeholder="All Categories"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent className="rounded-xl">
                  <select_1.SelectItem value="all" className="text-xs">All Categories</select_1.SelectItem>
                  {categories.map(function (c) { return (<select_1.SelectItem key={c._id} value={c._id} className="text-xs">
                      {c.name}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.Card>

        {/* Catalog grid */}
        {filteredProducts.length === 0 ? (<card_1.Card className="p-12 text-center border-dashed border-slate-300">
            <lucide_react_1.AlertCircle className="size-8 text-slate-400 mx-auto mb-3"/>
            <p className="text-sm font-semibold text-slate-700">No matching products found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search query or categories filter</p>
          </card_1.Card>) : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(function (p) {
                var _a;
                var isOutOfStock = p.stock <= 0;
                var isLowStock = p.stock < 10;
                var itemsInCart = ((_a = lineItems.find(function (item) { return item.productId === p._id; })) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
                return (<div key={p._id} onClick={function () { return !isOutOfStock && addCatalogueItem(p); }} className={"group bg-white border rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer select-none border-slate-200/70 hover:border-indigo-500/30 hover:-translate-y-1 ".concat(isOutOfStock ? 'opacity-65 cursor-not-allowed bg-slate-50/65' : '')}>
                  <div className="flex gap-2.5 items-start">
                    {p.imageUrl ? (<img src={p.imageUrl} alt={p.name} className="size-11 rounded-xl object-cover border border-slate-200/60 shadow-3xs shrink-0"/>) : (<div className="size-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <lucide_react_1.Package size={16} className="stroke-[1.5]"/>
                      </div>)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <span className="text-[9px] text-slate-400 font-mono tracking-tight truncate">{p.sku}</span>
                        {itemsInCart > 0 && (<span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse shrink-0">
                            {itemsInCart}
                          </span>)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Selling Price</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">₹{p.unitPrice.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (<span className="text-[9px] bg-red-50 text-red-600 border border-red-200/40 px-2 py-0.5 rounded-full font-bold">
                          Sold Out
                        </span>) : isLowStock ? (<span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200/40 px-2 py-0.5 rounded-full font-bold">
                          Stock: {p.stock}
                        </span>) : (<span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200/40 px-2 py-0.5 rounded-full font-bold">
                          Stock: {p.stock}
                        </span>)}
                    </div>
                  </div>
                </div>);
            })}
          </div>)}
      </div>

      {/* RIGHT COLUMN: 40% Width - POS checkout terminal */}
      <div className="xl:col-span-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection & Quick Add */}
          <card_1.Card className="p-4 border-slate-200/80 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Customer Details
              </h3>
              <button_1.Button type="button" variant="ghost" onClick={function () { return setShowCustomerModal(true); }} className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold gap-1 px-2.5 h-8 rounded-lg cursor-pointer">
                <lucide_react_1.UserPlus size={15}/>
                Quick Register
              </button_1.Button>
            </div>

            {selectedCustomer ? ((function () {
            var activeCust = customers.find(function (c) { return c._id === selectedCustomer; });
            return (<div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="size-8.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">
                        {(activeCust === null || activeCust === void 0 ? void 0 : activeCust.name) ? activeCust.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2) : 'RG'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{(activeCust === null || activeCust === void 0 ? void 0 : activeCust.name) || 'Retail Guest'}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{(activeCust === null || activeCust === void 0 ? void 0 : activeCust.phone) || 'No phone registered'}</p>
                      </div>
                    </div>
                    <button_1.Button type="button" variant="ghost" onClick={function () { return setSelectedCustomer(''); }} className="text-[10px] text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold h-7.5 px-2.5 rounded-lg cursor-pointer transition-colors">
                      Change
                    </button_1.Button>
                  </div>);
        })()) : (<div className="relative">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5"/>
                  <input_1.Input type="text" placeholder="Search active customer by name or mobile number..." value={customerSearchQuery} onChange={function (e) { return setCustomerSearchQuery(e.target.value); }} className="pl-9 h-10.5 rounded-xl border-slate-200 text-xs placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"/>
                </div>

                {customerSearchQuery.trim() && (<div className="absolute top-11.5 inset-x-0 bg-white border border-slate-200/80 rounded-2xl shadow-lg max-h-56 overflow-y-auto z-50 divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredCustomers.length === 0 ? (<div className="p-4 flex flex-col items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-700">
                            No customer found
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            &ldquo;{customerSearchQuery}&rdquo; is not in the registry
                          </p>
                        </div>
                        <button type="button" onClick={function () {
                        setCustomerSearchQuery('');
                        openRegisterModal(customerSearchQuery);
                    }} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                          <lucide_react_1.UserPlus size={13}/>
                          Register &ldquo;{customerSearchQuery}&rdquo;
                        </button>
                      </div>) : (filteredCustomers.map(function (c) { return (<div key={c._id} onClick={function () {
                        setSelectedCustomer(c._id);
                        setCustomerSearchQuery('');
                    }} className="px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors group">
                          <div>
                            <p className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{c.phone}</p>
                          </div>
                          <span className="text-[9px] bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors select-none">
                            Select
                          </span>
                        </div>); }))}
                  </div>)}
              </div>)}
          </card_1.Card>

          {/* Active Cart Line Items */}
          <card_1.Card className="p-4 border-slate-200/80 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>2. POS Ticket Cart</span>
              <lucide_react_1.ShoppingCart className="text-slate-400 size-4.5"/>
            </h3>

            {lineItems.length === 0 ? (<div className="py-10 text-center border border-dashed rounded-xl border-slate-200">
                <lucide_react_1.ShoppingCart className="size-7 text-slate-300 mx-auto mb-2"/>
                <p className="text-xs font-bold text-slate-500">POS Ticket is empty</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Click catalogue items on the left to add them here
                </p>
              </div>) : (<div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                {lineItems.map(function (item, index) {
                var product = products.find(function (p) { return p._id === item.productId; });
                if (!product)
                    return null;
                return (<div key={index} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">{product.sku}</span>
                          <span className="text-[10px] font-semibold text-slate-600">₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center bg-slate-100/90 border border-slate-200/40 rounded-xl p-1 shrink-0">
                        <button type="button" onClick={function () { return decrementQty(index); }} className="size-6 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/45 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                          <lucide_react_1.Minus size={11} strokeWidth={3}/>
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button type="button" onClick={function () { return incrementQty(index, product.stock); }} className="size-6 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/45 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                          <lucide_react_1.Plus size={11} strokeWidth={3}/>
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="text-right w-20 shrink-0">
                        <p className="text-xs font-black text-slate-950">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>

                      <button type="button" onClick={function () { return removeLineItem(index); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                        <lucide_react_1.Trash2 size={14}/>
                      </button>
                    </div>);
            })}
              </div>)}
          </card_1.Card>

          {/* Payment Method Selector Grid */}
          <card_1.Card className="p-4 border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Payment Channel
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
            { value: 'cash', label: 'Cash', icon: lucide_react_1.Banknote },
            { value: 'card', label: 'Card Swipe', icon: lucide_react_1.CreditCard },
            { value: 'online', label: 'UPI / QR', icon: lucide_react_1.QrCode },
            { value: 'credit', label: 'Store Credit', icon: lucide_react_1.UserCheck },
        ].map(function (method) {
            var Icon = method.icon;
            var isSelected = paymentMethod === method.value;
            return (<div key={method.value} onClick={function () { return setPaymentMethod(method.value); }} className={"flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-300 select-none ".concat(isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600')}>
                    <div className={"p-2 rounded-lg transition-colors ".concat(isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500')}>
                      <Icon size={16}/>
                    </div>
                    <span className="text-xs font-bold tracking-wide">{method.label}</span>
                  </div>);
        })}
            </div>
          </card_1.Card>

          {/* Adjustments & Notes */}
          <card_1.Card className="p-4 border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>4. Adjustments & Notes</span>
              <lucide_react_1.FileText size={15} className="text-slate-400"/>
            </h3>

            {/* Discount amount field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cash Discount (₹)
              </label>
              <div className="relative">
                <input_1.Input type="number" min="0" value={discountAmount || ''} onChange={function (e) { return setDiscountAmount(parseFloat(e.target.value) || 0); }} placeholder="0.00" className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"/>
                <lucide_react_1.Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none"/>
              </div>
            </div>

            {/* POS terminal Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Terminal Receipt Notes
              </label>
              <textarea value={notes} onChange={function (e) { return setNotes(e.target.value); }} placeholder="Print notes on customer invoice receipt..." className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors" rows={2}/>
            </div>
          </card_1.Card>

          {/* Checkout Breakdown Totals */}
          <card_1.Card className="p-4 bg-slate-900 text-white rounded-2xl border-none shadow-md space-y-3">
            <div className="space-y-1.5 border-b border-slate-800 pb-3.5 text-xs select-none">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (items sum)</span>
                <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (<div className="flex justify-between text-red-400 font-semibold">
                  <span>Special Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>)}
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Bill Amount</p>
                <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">₹{total.toFixed(2)}</p>
              </div>

              {/* Status Operational badge */}
              <span className="text-[9px] bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full text-slate-300 font-bold uppercase tracking-wider">
                Retail Invoice
              </span>
            </div>

            <button_1.Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all shadow-glow cursor-pointer mt-4" disabled={loading}>
              {loading ? ('Publishing Invoice...') : (<>
                  <lucide_react_1.Sparkles size={16} className="animate-pulse"/>
                  Finalize POS Ticket
                </>)}
            </button_1.Button>
          </card_1.Card>
        </form>
      </div>

      {/* QUICK ADD CUSTOMER DIALOG BACKDROP & MODAL */}
      {showCustomerModal && (<div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <card_1.Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <lucide_react_1.UserPlus size={16} className="text-indigo-600"/>
                </div>
                <h3 className="text-base font-bold text-slate-900">Register New Customer</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Create a customer profile to track loyalty &amp; purchase history</p>
            </div>

            <form onSubmit={createCustomer} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Name *</label>
                <input_1.Input type="text" value={newCustomer.name} onChange={function (e) { return setNewCustomer(__assign(__assign({}, newCustomer), { name: e.target.value })); }} placeholder="Customer Full Name" className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white" required/>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Phone *</label>
                <input_1.Input type="tel" value={newCustomer.phone} onChange={function (e) { return setNewCustomer(__assign(__assign({}, newCustomer), { phone: e.target.value })); }} placeholder="10-digit mobile number" className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white" required/>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email (optional)</label>
                <input_1.Input type="email" value={newCustomer.email} onChange={function (e) { return setNewCustomer(__assign(__assign({}, newCustomer), { email: e.target.value })); }} placeholder="name@domain.com" className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white"/>
              </div>

              <div className="flex gap-3 mt-6">
                <button_1.Button type="button" variant="outline" onClick={function () { return setShowCustomerModal(false); }} className="flex-1 rounded-xl h-10 text-xs font-semibold text-slate-600 border-slate-200 cursor-pointer" disabled={customerModalLoading}>
                  Cancel
                </button_1.Button>
                <button_1.Button type="submit" className="flex-1 rounded-xl h-10 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer" disabled={customerModalLoading}>
                  {customerModalLoading ? 'Saving...' : 'Register'}
                </button_1.Button>
              </div>
            </form>
          </card_1.Card>
        </div>)}

      {/* ===================== BILL PREVIEW MODAL ===================== */}
      {billPreview && (function () {
            var _a;
            var inv = billPreview;
            var customer = inv.customer;
            var createdDate = new Date(inv.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
            });
            var createdTime = new Date(inv.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
            });
            var paymentIcons = {
                cash: <lucide_react_1.Banknote size={13}/>,
                card: <lucide_react_1.CreditCard size={13}/>,
                online: <lucide_react_1.QrCode size={13}/>,
                credit: <lucide_react_1.UserCheck size={13}/>,
            };
            var handleWhatsApp = function () {
                var _a;
                var phone = ((customer === null || customer === void 0 ? void 0 : customer.phone) || '').replace(/[^0-9]/g, '');
                var formatted = phone.length === 10 ? "91".concat(phone) : phone;
                var shopName = "NexBill";
                try {
                    var s = localStorage.getItem('shop');
                    if (s)
                        shopName = JSON.parse(s).name || shopName;
                }
                catch (_) { }
                var itemLines = (inv.items || [])
                    .map(function (it) { var _a, _b; return "  \u2022 ".concat((_a = it.product) === null || _a === void 0 ? void 0 : _a.name, " \u00D7 ").concat(it.quantity, "  \u2192  \u20B9").concat(((_b = it.total) !== null && _b !== void 0 ? _b : 0).toFixed(2)); })
                    .join('\n');
                var msg = "Hello *".concat((customer === null || customer === void 0 ? void 0 : customer.name) || 'Valued Customer', "*! \uD83D\uDECD\uFE0F\n\n") +
                    "Thank you for shopping at *".concat(shopName, "*.\n\n") +
                    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n" +
                    "\uD83E\uDDFE *Invoice ".concat(inv.invoiceNumber, "*\n") +
                    "\uD83D\uDCC5 ".concat(createdDate, " at ").concat(createdTime, "\n") +
                    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n" +
                    "*Items Purchased:*\n".concat(itemLines, "\n\n") +
                    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n" +
                    "Subtotal : \u20B9".concat(((_a = inv.subtotal) !== null && _a !== void 0 ? _a : 0).toFixed(2), "\n") +
                    (inv.discountAmount > 0 ? "Discount : -\u20B9".concat(inv.discountAmount.toFixed(2), "\n") : '') +
                    "*Total : \u20B9".concat(inv.total.toFixed(2), "*\n") +
                    "Payment : ".concat((inv.paymentMethod || '').toUpperCase(), "\n") +
                    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n" +
                    "View receipt: ".concat(window.location.origin, "/dashboard/billing/").concat(inv._id, "\n\n") +
                    "Thank you! \uD83D\uDE4F";
                window.location.href = "whatsapp://send?phone=".concat(formatted, "&text=").concat(encodeURIComponent(msg));
            };
            var handleNewBill = function () {
                setBillPreview(null);
                setSelectedCustomer('');
                setLineItems([]);
                setPaymentMethod('cash');
                setDiscountAmount(0);
                setNotes('');
                setSearchQuery('');
                setCustomerSearchQuery('');
                setSelectedCategory('all');
                onSuccess();
            };
            return (<div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center gap-3 shrink-0">
                <div className="size-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <lucide_react_1.CheckCircle2 size={20} className="text-white" strokeWidth={2.5}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm leading-tight">Invoice Published!</p>
                  <p className="text-emerald-100 text-[11px] font-medium truncate">
                    {inv.invoiceNumber} · {createdDate} · {createdTime}
                  </p>
                </div>
                <span className="text-[9px] bg-white/20 border border-white/30 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {inv.paymentStatus}
                </span>
              </div>

              {/* Body — no scroll */}
              <div className="p-4 space-y-3">

                {/* Customer + payment row */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="size-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs select-none shrink-0">
                    {(customer === null || customer === void 0 ? void 0 : customer.name)
                    ? customer.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase()
                    : 'RG'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate leading-tight">{(customer === null || customer === void 0 ? void 0 : customer.name) || 'Retail Guest'}</p>
                    {(customer === null || customer === void 0 ? void 0 : customer.phone) && (<p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <lucide_react_1.Phone size={9}/>{customer.phone}
                      </p>)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full font-semibold shrink-0">
                    {paymentIcons[inv.paymentMethod] || <lucide_react_1.Banknote size={11}/>}
                    <span>{(inv.paymentMethod || '').toUpperCase()}</span>
                  </div>
                </div>

                {/* Line Items — compact table */}
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto] px-3 py-1.5 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Item</span><span className="text-center">Qty</span><span className="text-right">Total</span>
                  </div>
                  {(inv.items || []).map(function (it, idx) {
                    var _a, _b, _c;
                    return (<div key={idx} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-1.5 bg-white">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{(_a = it.product) === null || _a === void 0 ? void 0 : _a.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">₹{((_b = it.unitPrice) !== null && _b !== void 0 ? _b : 0).toFixed(2)}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 text-center px-3">{it.quantity}</span>
                      <span className="text-[11px] font-black text-slate-900 text-right">₹{((_c = it.total) !== null && _c !== void 0 ? _c : 0).toFixed(2)}</span>
                    </div>);
                })}
                </div>

                {/* Totals — slim horizontal strip */}
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-900 rounded-xl text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Sub <span className="text-white font-semibold">₹{((_a = inv.subtotal) !== null && _a !== void 0 ? _a : 0).toFixed(2)}</span></span>
                    {inv.discountAmount > 0 && (<span>Off <span className="text-red-400 font-semibold">-₹{inv.discountAmount.toFixed(2)}</span></span>)}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-base font-black text-indigo-400 leading-tight">₹{inv.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Notes (only if present — inline) */}
                {inv.notes && (<p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-1.5 font-medium truncate">
                    📝 {inv.notes}
                  </p>)}
              </div>

              {/* Action buttons — horizontal single row */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2 shrink-0">
                <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  <lucide_react_1.MessageCircle size={15}/>
                  WhatsApp
                </button>
                <a href={"/dashboard/billing/".concat(inv._id)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  <lucide_react_1.ExternalLink size={15}/>
                  View Bill
                </a>
                <button onClick={handleNewBill} className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer group">
                  <lucide_react_1.RotateCcw size={15} className="group-hover:rotate-180 transition-transform duration-500"/>
                  New Bill
                </button>
              </div>

            </div>
          </div>);
        })()}

    </div>);
}
