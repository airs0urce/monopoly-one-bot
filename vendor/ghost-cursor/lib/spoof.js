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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCursor = exports.path = void 0;
var math_1 = require("./math");
var fitts = function (distance, width) {
    var a = 0;
    var b = 2;
    var id = Math.log2(distance / width + 1);
    return a + b * id;
};
var getRandomBoxPoint = function (_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    var widthToAdd = Math.random() * width;
    var heightToAdd = Math.random() * height;
    if (widthToAdd > width - 1) {
        widthToAdd = width - 1;
    }
    if (heightToAdd > height - 1) {
        heightToAdd = height - 1;
    }
    return {
        x: x + widthToAdd,
        y: y + heightToAdd
    };
};
var isBox = function (a) { return "width" in a; };
function path(start, end, spreadOverride) {
    var defaultWidth = 100;
    var minSteps = 25;
    var width = isBox(end) ? end.width : defaultWidth;
    var curve = math_1.bezierCurve(start, end, spreadOverride);
    var length = curve.length() * 0.8;
    var baseTime = Math.random() * minSteps;
    var steps = Math.ceil((Math.log2(fitts(length, width) + 1) + baseTime) * 3);
    var re = curve.getLUT(steps);
    return clampPositive(re);
}
exports.path = path;
var steps = [
    {
        selector: ".emailAddress input",
        value: "sirbezier@test.com"
    },
    {
        selector: ".password input",
        value: "1234QWEasd"
    },
    {
        selector: ".firstName input",
        value: "asd"
    },
    {
        selector: ".lastName input",
        value: "asd"
    },
    {
        selector: ".dateOfBirth input",
        value: "1989-12-03"
    },
    {
        selector: ".gender ul li input"
    },
    {
        selector: ".joinSubmit input"
    }
];
var clampPositive = function (vectors) {
    var clamp0 = function (elem) { return Math.max(0, elem); };
    return vectors.map(function (vector) {
        return {
            x: clamp0(vector.x),
            y: clamp0(vector.y)
        };
    });
};
var overshootThreshold = 500;
var shouldOvershoot = function (a, b) {
    return math_1.magnitude(math_1.direction(a, b)) > overshootThreshold;
};
exports.createCursor = function (page, start) {
    if (start === void 0) { start = math_1.origin; }
    var overshootSpread = 10;
    var overshootRadius = 120;
    var previous = start;
    var tracePath = function (vectors) { return __awaiter(void 0, void 0, void 0, function () {
        var vectors_1, vectors_1_1, _a, x, y, e_1_1;
        var e_1, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, 6, 7]);
                    vectors_1 = __values(vectors), vectors_1_1 = vectors_1.next();
                    _c.label = 1;
                case 1:
                    if (!!vectors_1_1.done) return [3, 4];
                    _a = vectors_1_1.value, x = _a.x, y = _a.y;
                    return [4, page.mouse.move(x, y)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    vectors_1_1 = vectors_1.next();
                    return [3, 1];
                case 4: return [3, 7];
                case 5:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3, 7];
                case 6:
                    try {
                        if (vectors_1_1 && !vectors_1_1.done && (_b = vectors_1.return)) _b.call(vectors_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7];
                case 7: return [2];
            }
        });
    }); };
    var actions = {
        click: function (selector) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!selector) return [3, 2];
                            return [4, actions.move(selector)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2, page.mouse.down().then(function () { return page.mouse.up(); })];
                    }
                });
            });
        },
        move: async function (selector) {
            
            const element = await page.$(selector);
            if (element) {
                await element.evaluate((el) => {
                    el.scrollIntoView({block: 'center', inline: 'center'});
                });
            }
            

            return __awaiter(this, void 0, void 0, function () {
                var elem, box, height, width, destination, dimensions, overshooting, to, correction;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, page.$(selector)];
                        case 1:
                            elem = _a.sent();
                            if (!elem) {
                                throw new Error("Could not find element with selector \"" + selector + "\", make sure you're waiting for the elements with \"puppeteer.waitForSelector\"");
                            }
                            return [4, elem.boundingBox()];
                        case 2:
                            box = _a.sent();
                            if (!box) {
                                console.log('box:', box);
                                throw new Error("Could not find the dimensions of the element you're clicking on, this might be a bug?");
                            }
                            height = box.height, width = box.width;
                            destination = getRandomBoxPoint(box);
                            dimensions = { height: height, width: width };
                            overshooting = shouldOvershoot(previous, destination);
                            to = overshooting
                                ? math_1.overshoot(destination, overshootRadius)
                                : destination;
                            return [4, tracePath(path(previous, to))];
                        case 3:
                            _a.sent();
                            if (!overshooting) return [3, 5];
                            correction = path(to, __assign(__assign({}, dimensions), destination), overshootSpread);
                            return [4, tracePath(correction)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            previous = destination;
                            return [2];
                    }
                });
            });
        }
    };
    return actions;
};
