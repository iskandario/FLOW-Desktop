var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a2, b) => (typeof require !== "undefined" ? require : a2)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node_modules/onnxruntime-web/dist/ort.bundle.min.mjs
var Fn = Object.defineProperty;
var If = Object.getOwnPropertyDescriptor;
var Cf = Object.getOwnPropertyNames;
var Af = Object.prototype.hasOwnProperty;
var qn = ((t2) => typeof __require < "u" ? __require : typeof Proxy < "u" ? new Proxy(t2, { get: (e3, r2) => (typeof __require < "u" ? __require : e3)[r2] }) : t2)(function(t2) {
  if (typeof __require < "u") return __require.apply(this, arguments);
  throw Error('Dynamic require of "' + t2 + '" is not supported');
});
var V = (t2, e3, r2) => () => {
  if (r2) throw r2[0];
  try {
    return t2 && (e3 = t2(t2 = 0)), e3;
  } catch (n2) {
    throw r2 = [n2], n2;
  }
};
var Wt = (t2, e3) => {
  for (var r2 in e3) Fn(t2, r2, { get: e3[r2], enumerable: true });
};
var Ef = (t2, e3, r2, n2) => {
  if (e3 && typeof e3 == "object" || typeof e3 == "function") for (let o2 of Cf(e3)) !Af.call(t2, o2) && o2 !== r2 && Fn(t2, o2, { get: () => e3[o2], enumerable: !(n2 = If(e3, o2)) || n2.enumerable });
  return t2;
};
var er = (t2) => Ef(Fn({}, "__esModule", { value: true }), t2);
var Tr;
var kt;
var Pt;
var kf;
var Ba;
var Kn = V(() => {
  "use strict";
  Tr = /* @__PURE__ */ new Map(), kt = [], Pt = (t2, e3, r2) => {
    if (e3 && typeof e3.init == "function" && typeof e3.createInferenceSessionHandler == "function") {
      let n2 = Tr.get(t2);
      if (n2 === void 0) Tr.set(t2, { backend: e3, priority: r2 });
      else {
        if (n2.priority > r2) return;
        if (n2.priority === r2 && n2.backend !== e3) throw new Error(`cannot register backend "${t2}" using priority ${r2}`);
      }
      if (r2 >= 0) {
        let o2 = kt.indexOf(t2);
        o2 !== -1 && kt.splice(o2, 1);
        for (let i2 = 0; i2 < kt.length; i2++) if (Tr.get(kt[i2]).priority <= r2) {
          kt.splice(i2, 0, t2);
          return;
        }
        kt.push(t2);
      }
      return;
    }
    throw new TypeError("not a valid backend");
  }, kf = async (t2) => {
    let e3 = Tr.get(t2);
    if (!e3) return "backend not found.";
    if (e3.initialized) return e3.backend;
    if (e3.aborted) return e3.error;
    {
      let r2 = !!e3.initPromise;
      try {
        return r2 || (e3.initPromise = e3.backend.init(t2)), await e3.initPromise, e3.initialized = true, e3.backend;
      } catch (n2) {
        return r2 || (e3.error = `${n2}`, e3.aborted = true), e3.error;
      } finally {
        delete e3.initPromise;
      }
    }
  }, Ba = async (t2) => {
    let e3 = t2.executionProviders || [], r2 = e3.map((d2) => typeof d2 == "string" ? d2 : d2.name), n2 = r2.length === 0 ? kt : r2, o2, i2 = [], a2 = /* @__PURE__ */ new Set();
    for (let d2 of n2) {
      let c2 = await kf(d2);
      typeof c2 == "string" ? i2.push({ name: d2, err: c2 }) : (o2 || (o2 = c2), o2 === c2 && a2.add(d2));
    }
    if (!o2) throw new Error(`no available backend found. ERR: ${i2.map((d2) => `[${d2.name}] ${d2.err}`).join(", ")}`);
    for (let { name: d2, err: c2 } of i2) r2.includes(d2) && console.warn(`removing requested execution provider "${d2}" from session options because it is not available: ${c2}`);
    let u2 = e3.filter((d2) => a2.has(typeof d2 == "string" ? d2 : d2.name));
    return [o2, new Proxy(t2, { get: (d2, c2) => c2 === "executionProviders" ? u2 : Reflect.get(d2, c2) })];
  };
});
var Ma = V(() => {
  "use strict";
  Kn();
});
var Ra;
var Ua = V(() => {
  "use strict";
  Ra = "1.29.0";
});
var Na;
var De;
var jn = V(() => {
  "use strict";
  Ua();
  Na = "warning", De = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: Ra }, set logLevel(t2) {
    if (t2 !== void 0) {
      if (typeof t2 != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(t2) === -1) throw new Error(`Unsupported logging level: ${t2}`);
      Na = t2;
    }
  }, get logLevel() {
    return Na;
  } };
  Object.defineProperty(De, "logLevel", { enumerable: true });
});
var _e;
var Va = V(() => {
  "use strict";
  jn();
  _e = De;
});
var La;
var Wa;
var Ga = V(() => {
  "use strict";
  La = (t2, e3) => {
    let r2 = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
    r2.width = t2.dims[3], r2.height = t2.dims[2];
    let n2 = r2.getContext("2d");
    if (n2 != null) {
      let o2, i2;
      e3?.tensorLayout !== void 0 && e3.tensorLayout === "NHWC" ? (o2 = t2.dims[2], i2 = t2.dims[3]) : (o2 = t2.dims[3], i2 = t2.dims[2]);
      let a2 = e3?.format !== void 0 ? e3.format : "RGB", u2 = e3?.norm, d2, c2;
      u2 === void 0 || u2.mean === void 0 ? d2 = [255, 255, 255, 255] : typeof u2.mean == "number" ? d2 = [u2.mean, u2.mean, u2.mean, u2.mean] : (d2 = [u2.mean[0], u2.mean[1], u2.mean[2], 0], u2.mean[3] !== void 0 && (d2[3] = u2.mean[3])), u2 === void 0 || u2.bias === void 0 ? c2 = [0, 0, 0, 0] : typeof u2.bias == "number" ? c2 = [u2.bias, u2.bias, u2.bias, u2.bias] : (c2 = [u2.bias[0], u2.bias[1], u2.bias[2], 0], u2.bias[3] !== void 0 && (c2[3] = u2.bias[3]));
      let p2 = i2 * o2, m2 = 0, g2 = p2, y = p2 * 2, b = -1;
      a2 === "RGBA" ? (m2 = 0, g2 = p2, y = p2 * 2, b = p2 * 3) : a2 === "RGB" ? (m2 = 0, g2 = p2, y = p2 * 2) : a2 === "RBG" && (m2 = 0, y = p2, g2 = p2 * 2);
      for (let _ = 0; _ < i2; _++) for (let S = 0; S < o2; S++) {
        let x = (t2.data[m2++] - c2[0]) * d2[0], v = (t2.data[g2++] - c2[1]) * d2[1], T = (t2.data[y++] - c2[2]) * d2[2], I = b === -1 ? 255 : (t2.data[b++] - c2[3]) * d2[3];
        n2.fillStyle = "rgba(" + x + "," + v + "," + T + "," + I + ")", n2.fillRect(S, _, 1, 1);
      }
      if ("toDataURL" in r2) return r2.toDataURL();
      throw new Error("toDataURL is not supported");
    } else throw new Error("Can not access image data");
  }, Wa = (t2, e3) => {
    let r2 = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), n2;
    if (r2 != null) {
      let o2, i2, a2;
      e3?.tensorLayout !== void 0 && e3.tensorLayout === "NHWC" ? (o2 = t2.dims[2], i2 = t2.dims[1], a2 = t2.dims[3]) : (o2 = t2.dims[3], i2 = t2.dims[2], a2 = t2.dims[1]);
      let u2 = e3 !== void 0 && e3.format !== void 0 ? e3.format : "RGB", d2 = e3?.norm, c2, p2;
      d2 === void 0 || d2.mean === void 0 ? c2 = [255, 255, 255, 255] : typeof d2.mean == "number" ? c2 = [d2.mean, d2.mean, d2.mean, d2.mean] : (c2 = [d2.mean[0], d2.mean[1], d2.mean[2], 255], d2.mean[3] !== void 0 && (c2[3] = d2.mean[3])), d2 === void 0 || d2.bias === void 0 ? p2 = [0, 0, 0, 0] : typeof d2.bias == "number" ? p2 = [d2.bias, d2.bias, d2.bias, d2.bias] : (p2 = [d2.bias[0], d2.bias[1], d2.bias[2], 0], d2.bias[3] !== void 0 && (p2[3] = d2.bias[3]));
      let m2 = i2 * o2;
      if (e3 !== void 0 && (e3.format !== void 0 && a2 === 4 && e3.format !== "RGBA" || a2 === 3 && e3.format !== "RGB" && e3.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
      let g2 = 4, y = 0, b = 1, _ = 2, S = 3, x = 0, v = m2, T = m2 * 2, I = -1;
      u2 === "RGBA" ? (x = 0, v = m2, T = m2 * 2, I = m2 * 3) : u2 === "RGB" ? (x = 0, v = m2, T = m2 * 2) : u2 === "RBG" && (x = 0, T = m2, v = m2 * 2), n2 = r2.createImageData(o2, i2);
      for (let E = 0; E < i2 * o2; y += g2, b += g2, _ += g2, S += g2, E++) n2.data[y] = (t2.data[x++] - p2[0]) * c2[0], n2.data[b] = (t2.data[v++] - p2[1]) * c2[1], n2.data[_] = (t2.data[T++] - p2[2]) * c2[2], n2.data[S] = I === -1 ? 255 : (t2.data[I++] - p2[3]) * c2[3];
    } else throw new Error("Can not access image data");
    return n2;
  };
});
var Zn;
var Ha;
var Fa;
var qa;
var Ka;
var ja;
var Za = V(() => {
  "use strict";
  Ir();
  Zn = (t2, e3) => {
    if (t2 === void 0) throw new Error("Image buffer must be defined");
    if (e3.height === void 0 || e3.width === void 0) throw new Error("Image height and width must be defined");
    if (e3.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
    let { height: r2, width: n2 } = e3, o2 = e3.norm ?? { mean: 255, bias: 0 }, i2, a2;
    typeof o2.mean == "number" ? i2 = [o2.mean, o2.mean, o2.mean, o2.mean] : i2 = [o2.mean[0], o2.mean[1], o2.mean[2], o2.mean[3] ?? 255], typeof o2.bias == "number" ? a2 = [o2.bias, o2.bias, o2.bias, o2.bias] : a2 = [o2.bias[0], o2.bias[1], o2.bias[2], o2.bias[3] ?? 0];
    let u2 = e3.format !== void 0 ? e3.format : "RGBA", d2 = e3.tensorFormat !== void 0 && e3.tensorFormat !== void 0 ? e3.tensorFormat : "RGB", c2 = r2 * n2, p2 = d2 === "RGBA" ? new Float32Array(c2 * 4) : new Float32Array(c2 * 3), m2 = 4, g2 = 0, y = 1, b = 2, _ = 3, S = 0, x = c2, v = c2 * 2, T = -1;
    u2 === "RGB" && (m2 = 3, g2 = 0, y = 1, b = 2, _ = -1), d2 === "RGBA" ? T = c2 * 3 : d2 === "RBG" ? (S = 0, v = c2, x = c2 * 2) : d2 === "BGR" && (v = 0, x = c2, S = c2 * 2);
    for (let E = 0; E < c2; E++, g2 += m2, b += m2, y += m2, _ += m2) p2[S++] = (t2[g2] + a2[0]) / i2[0], p2[x++] = (t2[y] + a2[1]) / i2[1], p2[v++] = (t2[b] + a2[2]) / i2[2], T !== -1 && _ !== -1 && (p2[T++] = (t2[_] + a2[3]) / i2[3]);
    return d2 === "RGBA" ? new Be("float32", p2, [1, 4, r2, n2]) : new Be("float32", p2, [1, 3, r2, n2]);
  }, Ha = async (t2, e3) => {
    let r2 = typeof HTMLImageElement < "u" && t2 instanceof HTMLImageElement, n2 = typeof ImageData < "u" && t2 instanceof ImageData, o2 = typeof ImageBitmap < "u" && t2 instanceof ImageBitmap, i2 = typeof t2 == "string", a2, u2 = e3 ?? {}, d2 = () => {
      if (typeof document < "u") return document.createElement("canvas");
      if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
      throw new Error("Canvas is not supported");
    }, c2 = (p2) => typeof HTMLCanvasElement < "u" && p2 instanceof HTMLCanvasElement || p2 instanceof OffscreenCanvas ? p2.getContext("2d") : null;
    if (r2) {
      let p2 = d2();
      p2.width = t2.width, p2.height = t2.height;
      let m2 = c2(p2);
      if (m2 != null) {
        let g2 = t2.height, y = t2.width;
        if (e3 !== void 0 && e3.resizedHeight !== void 0 && e3.resizedWidth !== void 0 && (g2 = e3.resizedHeight, y = e3.resizedWidth), e3 !== void 0) {
          if (u2 = e3, e3.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
          u2.tensorFormat = "RGBA", u2.height = g2, u2.width = y;
        } else u2.tensorFormat = "RGBA", u2.height = g2, u2.width = y;
        m2.drawImage(t2, 0, 0), a2 = m2.getImageData(0, 0, y, g2).data;
      } else throw new Error("Can not access image data");
    } else if (n2) {
      let p2, m2;
      if (e3 !== void 0 && e3.resizedWidth !== void 0 && e3.resizedHeight !== void 0 ? (p2 = e3.resizedHeight, m2 = e3.resizedWidth) : (p2 = t2.height, m2 = t2.width), e3 !== void 0 && (u2 = e3), u2.format = "RGBA", u2.height = p2, u2.width = m2, e3 !== void 0) {
        let g2 = d2();
        g2.width = m2, g2.height = p2;
        let y = c2(g2);
        if (y != null) y.putImageData(t2, 0, 0), a2 = y.getImageData(0, 0, m2, p2).data;
        else throw new Error("Can not access image data");
      } else a2 = t2.data;
    } else if (o2) {
      if (e3 === void 0) throw new Error("Please provide image config with format for Imagebitmap");
      let p2 = d2();
      p2.width = t2.width, p2.height = t2.height;
      let m2 = c2(p2);
      if (m2 != null) {
        let g2 = t2.height, y = t2.width;
        return m2.drawImage(t2, 0, 0, y, g2), a2 = m2.getImageData(0, 0, y, g2).data, u2.height = g2, u2.width = y, Zn(a2, u2);
      } else throw new Error("Can not access image data");
    } else {
      if (i2) return new Promise((p2, m2) => {
        let g2 = d2(), y = c2(g2);
        if (!t2 || !y) return m2();
        let b = new Image();
        b.crossOrigin = "Anonymous", b.src = t2, b.onload = () => {
          g2.width = b.width, g2.height = b.height, y.drawImage(b, 0, 0, g2.width, g2.height);
          let _ = y.getImageData(0, 0, g2.width, g2.height);
          u2.height = g2.height, u2.width = g2.width, p2(Zn(_.data, u2));
        };
      });
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }
    if (a2 !== void 0) return Zn(a2, u2);
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }, Fa = (t2, e3) => {
    let { width: r2, height: n2, download: o2, dispose: i2 } = e3, a2 = [1, n2, r2, 4];
    return new Be({ location: "texture", type: "float32", texture: t2, dims: a2, download: o2, dispose: i2 });
  }, qa = (t2, e3) => {
    let { dataType: r2, dims: n2, download: o2, dispose: i2 } = e3;
    return new Be({ location: "gpu-buffer", type: r2 ?? "float32", gpuBuffer: t2, dims: n2, download: o2, dispose: i2 });
  }, Ka = (t2, e3) => {
    let { dataType: r2, dims: n2, download: o2, dispose: i2 } = e3;
    return new Be({ location: "ml-tensor", type: r2 ?? "float32", mlTensor: t2, dims: n2, download: o2, dispose: i2 });
  }, ja = (t2, e3, r2) => new Be({ location: "cpu-pinned", type: t2, data: e3, dims: r2 ?? [e3.length] });
});
var Ot;
var tr;
var Qa;
var Xa;
var Ya = V(() => {
  "use strict";
  Ot = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), tr = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), Qa = false, Xa = () => {
    if (!Qa) {
      Qa = true;
      let t2 = typeof BigInt64Array < "u" && BigInt64Array.from, e3 = typeof BigUint64Array < "u" && BigUint64Array.from, r2 = globalThis.Float16Array, n2 = typeof r2 < "u" && r2.from;
      t2 && (Ot.set("int64", BigInt64Array), tr.set(BigInt64Array, "int64")), e3 && (Ot.set("uint64", BigUint64Array), tr.set(BigUint64Array, "uint64")), n2 ? (Ot.set("float16", r2), tr.set(r2, "float16")) : Ot.set("float16", Uint16Array);
    }
  };
});
var Ja;
var es;
var ts = V(() => {
  "use strict";
  Ir();
  Ja = (t2) => {
    let e3 = 1;
    for (let r2 = 0; r2 < t2.length; r2++) {
      let n2 = t2[r2];
      if (typeof n2 != "number" || !Number.isSafeInteger(n2)) throw new TypeError(`dims[${r2}] must be an integer, got: ${n2}`);
      if (n2 < 0) throw new RangeError(`dims[${r2}] must be a non-negative integer, got: ${n2}`);
      e3 *= n2;
    }
    return e3;
  }, es = (t2, e3) => {
    switch (t2.location) {
      case "cpu":
        return new Be(t2.type, t2.data, e3);
      case "cpu-pinned":
        return new Be({ location: "cpu-pinned", data: t2.data, type: t2.type, dims: e3 });
      case "texture":
        return new Be({ location: "texture", texture: t2.texture, type: t2.type, dims: e3 });
      case "gpu-buffer":
        return new Be({ location: "gpu-buffer", gpuBuffer: t2.gpuBuffer, type: t2.type, dims: e3 });
      case "ml-tensor":
        return new Be({ location: "ml-tensor", mlTensor: t2.mlTensor, type: t2.type, dims: e3 });
      default:
        throw new Error(`tensorReshape: tensor location ${t2.location} is not supported`);
    }
  };
});
var Be;
var Ir = V(() => {
  "use strict";
  Ga();
  Za();
  Ya();
  ts();
  Be = class {
    constructor(e3, r2, n2) {
      Xa();
      let o2, i2;
      if (typeof e3 == "object" && "location" in e3) switch (this.dataLocation = e3.location, o2 = e3.type, i2 = e3.dims, e3.location) {
        case "cpu-pinned": {
          let u2 = Ot.get(o2);
          if (!u2) throw new TypeError(`unsupported type "${o2}" to create tensor from pinned buffer`);
          if (!(e3.data instanceof u2)) throw new TypeError(`buffer should be of type ${u2.name}`);
          this.cpuData = e3.data;
          break;
        }
        case "texture": {
          if (o2 !== "float32") throw new TypeError(`unsupported type "${o2}" to create tensor from texture`);
          this.gpuTextureData = e3.texture, this.downloader = e3.download, this.disposer = e3.dispose;
          break;
        }
        case "gpu-buffer": {
          if (o2 !== "float32" && o2 !== "float16" && o2 !== "int32" && o2 !== "int64" && o2 !== "uint32" && o2 !== "uint8" && o2 !== "bool" && o2 !== "uint4" && o2 !== "int4") throw new TypeError(`unsupported type "${o2}" to create tensor from gpu buffer`);
          this.gpuBufferData = e3.gpuBuffer, this.downloader = e3.download, this.disposer = e3.dispose;
          break;
        }
        case "ml-tensor": {
          if (o2 !== "float32" && o2 !== "float16" && o2 !== "int32" && o2 !== "int64" && o2 !== "uint32" && o2 !== "uint64" && o2 !== "int8" && o2 !== "uint8" && o2 !== "bool" && o2 !== "uint4" && o2 !== "int4") throw new TypeError(`unsupported type "${o2}" to create tensor from MLTensor`);
          this.mlTensorData = e3.mlTensor, this.downloader = e3.download, this.disposer = e3.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
      else {
        let u2, d2;
        if (typeof e3 == "string") if (o2 = e3, d2 = n2, e3 === "string") {
          if (!Array.isArray(r2)) throw new TypeError("A string tensor's data must be a string array.");
          u2 = r2;
        } else {
          let c2 = Ot.get(e3);
          if (c2 === void 0) throw new TypeError(`Unsupported tensor type: ${e3}.`);
          if (Array.isArray(r2)) {
            if (e3 === "float16" && c2 === Uint16Array || e3 === "uint4" || e3 === "int4") throw new TypeError(`Creating a ${e3} tensor from number array is not supported. Please use ${c2.name} as data.`);
            e3 === "uint64" || e3 === "int64" ? u2 = c2.from(r2, BigInt) : u2 = c2.from(r2);
          } else if (r2 instanceof c2) u2 = r2;
          else if (r2 instanceof Uint8ClampedArray) if (e3 === "uint8") u2 = Uint8Array.from(r2);
          else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (e3 === "float16" && r2 instanceof Uint16Array && c2 !== Uint16Array) u2 = new globalThis.Float16Array(r2.buffer, r2.byteOffset, r2.length);
          else throw new TypeError(`A ${o2} tensor's data must be type of ${c2}`);
        }
        else if (d2 = r2, Array.isArray(e3)) {
          if (e3.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
          let c2 = typeof e3[0];
          if (c2 === "string") o2 = "string", u2 = e3;
          else if (c2 === "boolean") o2 = "bool", u2 = Uint8Array.from(e3);
          else throw new TypeError(`Invalid element type of data array: ${c2}.`);
        } else if (e3 instanceof Uint8ClampedArray) o2 = "uint8", u2 = Uint8Array.from(e3);
        else {
          let c2 = tr.get(e3.constructor);
          if (c2 === void 0) throw new TypeError(`Unsupported type for tensor data: ${e3.constructor}.`);
          o2 = c2, u2 = e3;
        }
        if (d2 === void 0) d2 = [u2.length];
        else if (!Array.isArray(d2)) throw new TypeError("A tensor's dims must be a number array");
        i2 = d2, this.cpuData = u2, this.dataLocation = "cpu";
      }
      let a2 = Ja(i2);
      if (this.cpuData && a2 !== this.cpuData.length && !((o2 === "uint4" || o2 === "int4") && Math.ceil(a2 / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${a2}) does not match data length(${this.cpuData.length}).`);
      this.type = o2, this.dims = i2, this.size = a2;
    }
    static async fromImage(e3, r2) {
      return Ha(e3, r2);
    }
    static fromTexture(e3, r2) {
      return Fa(e3, r2);
    }
    static fromGpuBuffer(e3, r2) {
      return qa(e3, r2);
    }
    static fromMLTensor(e3, r2) {
      return Ka(e3, r2);
    }
    static fromPinnedBuffer(e3, r2, n2) {
      return ja(e3, r2, n2);
    }
    toDataURL(e3) {
      return La(this, e3);
    }
    toImageData(e3) {
      return Wa(this, e3);
    }
    get data() {
      if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
      return this.cpuData;
    }
    get location() {
      return this.dataLocation;
    }
    get texture() {
      if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
      return this.gpuTextureData;
    }
    get gpuBuffer() {
      if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
      return this.gpuBufferData;
    }
    get mlTensor() {
      if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
      return this.mlTensorData;
    }
    async getData(e3) {
      switch (this.ensureValid(), this.dataLocation) {
        case "cpu":
        case "cpu-pinned":
          return this.data;
        case "texture":
        case "gpu-buffer":
        case "ml-tensor": {
          if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          try {
            this.isDownloading = true;
            let r2 = await this.downloader();
            return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = r2, e3 && this.disposer && (this.disposer(), this.disposer = void 0), r2;
          } finally {
            this.isDownloading = false;
          }
        }
        default:
          throw new Error(`cannot get data from location: ${this.dataLocation}`);
      }
    }
    dispose() {
      if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
      this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
    }
    ensureValid() {
      if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
    }
    reshape(e3) {
      if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
      return es(this, e3);
    }
  };
});
var je;
var Qn = V(() => {
  "use strict";
  Ir();
  je = Be;
});
var Cr;
var rs;
var Ve;
var Re;
var _t;
var wt;
var Xn = V(() => {
  "use strict";
  jn();
  Cr = (t2, e3) => {
    (typeof De.trace > "u" ? !De.wasm.trace : !De.trace) || console.timeStamp(`${t2}::ORT::${e3}`);
  }, rs = (t2, e3) => {
    let r2 = new Error().stack?.split(/\r\n|\r|\n/g) || [], n2 = false;
    for (let o2 = 0; o2 < r2.length; o2++) {
      if (n2 && !r2[o2].includes("TRACE_FUNC")) {
        let i2 = `FUNC_${t2}::${r2[o2].trim().split(" ")[1]}`;
        e3 && (i2 += `::${e3}`), Cr("CPU", i2);
        return;
      }
      r2[o2].includes("TRACE_FUNC") && (n2 = true);
    }
  }, Ve = (t2) => {
    (typeof De.trace > "u" ? !De.wasm.trace : !De.trace) || rs("BEGIN", t2);
  }, Re = (t2) => {
    (typeof De.trace > "u" ? !De.wasm.trace : !De.trace) || rs("END", t2);
  }, _t = (t2) => {
    (typeof De.trace > "u" ? !De.wasm.trace : !De.trace) || console.time(`ORT::${t2}`);
  }, wt = (t2) => {
    (typeof De.trace > "u" ? !De.wasm.trace : !De.trace) || console.timeEnd(`ORT::${t2}`);
  };
});
var Ar;
var ns = V(() => {
  "use strict";
  Kn();
  Qn();
  Xn();
  Ar = class t2 {
    constructor(e3) {
      this.handler = e3;
    }
    async run(e3, r2, n2) {
      Ve(), _t("InferenceSession.run");
      let o2 = {}, i2 = {};
      if (typeof e3 != "object" || e3 === null || e3 instanceof je || Array.isArray(e3)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
      let a2 = true;
      if (typeof r2 == "object") {
        if (r2 === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
        if (r2 instanceof je) throw new TypeError("'fetches' cannot be a Tensor");
        if (Array.isArray(r2)) {
          if (r2.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
          a2 = false;
          for (let c2 of r2) {
            if (typeof c2 != "string") throw new TypeError("'fetches' must be a string array or an object.");
            if (this.outputNames.indexOf(c2) === -1) throw new RangeError(`'fetches' contains invalid output name: ${c2}.`);
            o2[c2] = null;
          }
          if (typeof n2 == "object" && n2 !== null) i2 = n2;
          else if (typeof n2 < "u") throw new TypeError("'options' must be an object.");
        } else {
          let c2 = false, p2 = Object.getOwnPropertyNames(r2);
          for (let m2 of this.outputNames) if (p2.indexOf(m2) !== -1) {
            let g2 = r2[m2];
            (g2 === null || g2 instanceof je) && (c2 = true, a2 = false, o2[m2] = g2);
          }
          if (c2) {
            if (typeof n2 == "object" && n2 !== null) i2 = n2;
            else if (typeof n2 < "u") throw new TypeError("'options' must be an object.");
          } else i2 = r2;
        }
      } else if (typeof r2 < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
      for (let c2 of this.inputNames) if (typeof e3[c2] > "u") throw new Error(`input '${c2}' is missing in 'feeds'.`);
      if (a2) for (let c2 of this.outputNames) o2[c2] = null;
      let u2 = await this.handler.run(e3, o2, i2), d2 = {};
      for (let c2 in u2) if (Object.hasOwnProperty.call(u2, c2)) {
        let p2 = u2[c2];
        p2 instanceof je ? d2[c2] = p2 : d2[c2] = new je(p2.type, p2.data, p2.dims);
      }
      return wt("InferenceSession.run"), Re(), d2;
    }
    async release() {
      return this.handler.dispose();
    }
    static async create(e3, r2, n2, o2) {
      Ve(), _t("InferenceSession.create");
      let i2, a2 = {};
      if (typeof e3 == "string") {
        if (i2 = e3, typeof r2 == "object" && r2 !== null) a2 = r2;
        else if (typeof r2 < "u") throw new TypeError("'options' must be an object.");
      } else if (e3 instanceof Uint8Array) {
        if (i2 = e3, typeof r2 == "object" && r2 !== null) a2 = r2;
        else if (typeof r2 < "u") throw new TypeError("'options' must be an object.");
      } else if (e3 instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e3 instanceof SharedArrayBuffer) {
        let p2 = e3, m2 = 0, g2 = e3.byteLength;
        if (typeof r2 == "object" && r2 !== null) a2 = r2;
        else if (typeof r2 == "number") {
          if (m2 = r2, !Number.isSafeInteger(m2)) throw new RangeError("'byteOffset' must be an integer.");
          if (m2 < 0 || m2 >= p2.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${p2.byteLength}).`);
          if (g2 = e3.byteLength - m2, typeof n2 == "number") {
            if (g2 = n2, !Number.isSafeInteger(g2)) throw new RangeError("'byteLength' must be an integer.");
            if (g2 <= 0 || m2 + g2 > p2.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${p2.byteLength - m2}].`);
            if (typeof o2 == "object" && o2 !== null) a2 = o2;
            else if (typeof o2 < "u") throw new TypeError("'options' must be an object.");
          } else if (typeof n2 < "u") throw new TypeError("'byteLength' must be a number.");
        } else if (typeof r2 < "u") throw new TypeError("'options' must be an object.");
        i2 = new Uint8Array(p2, m2, g2);
      } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let [u2, d2] = await Ba(a2), c2 = await u2.createInferenceSessionHandler(i2, d2);
      return wt("InferenceSession.create"), Re(), new t2(c2);
    }
    startProfiling() {
      this.handler.startProfiling();
    }
    endProfiling() {
      this.handler.endProfiling();
    }
    get inputNames() {
      return this.handler.inputNames;
    }
    get outputNames() {
      return this.handler.outputNames;
    }
    get inputMetadata() {
      return this.handler.inputMetadata;
    }
    get outputMetadata() {
      return this.handler.outputMetadata;
    }
  };
});
var Pf;
var os = V(() => {
  "use strict";
  ns();
  Pf = Ar;
});
var is = V(() => {
  "use strict";
});
var as = V(() => {
  "use strict";
});
var ss = V(() => {
  "use strict";
});
var us = V(() => {
  "use strict";
});
var Yn = {};
Wt(Yn, { InferenceSession: () => Pf, TRACE: () => Cr, TRACE_EVENT_BEGIN: () => _t, TRACE_EVENT_END: () => wt, TRACE_FUNC_BEGIN: () => Ve, TRACE_FUNC_END: () => Re, Tensor: () => je, env: () => _e, registerBackend: () => Pt });
var Le = V(() => {
  "use strict";
  Ma();
  Va();
  os();
  Qn();
  is();
  as();
  Xn();
  ss();
  us();
});
var Er = V(() => {
  "use strict";
});
var ps = {};
Wt(ps, { default: () => Of });
var ls;
var cs;
var Of;
var ms = V(() => {
  "use strict";
  Jn();
  $t();
  kr();
  ls = "ort-wasm-proxy-worker", cs = globalThis.self?.name === ls;
  cs && (self.onmessage = (t2) => {
    let { type: e3, in: r2 } = t2.data;
    try {
      switch (e3) {
        case "init-wasm":
          Pr(r2.wasm).then(() => {
            Or(r2).then(() => {
              postMessage({ type: e3 });
            }, (n2) => {
              postMessage({ type: e3, err: n2 });
            });
          }, (n2) => {
            postMessage({ type: e3, err: n2 });
          });
          break;
        case "init-ep": {
          let { epName: n2, env: o2 } = r2;
          Dr(o2, n2).then(() => {
            postMessage({ type: e3 });
          }, (i2) => {
            postMessage({ type: e3, err: i2 });
          });
          break;
        }
        case "copy-from": {
          let { buffer: n2 } = r2, o2 = rr(n2);
          postMessage({ type: e3, out: o2 });
          break;
        }
        case "create": {
          let { model: n2, options: o2 } = r2;
          zr(n2, o2).then((i2) => {
            postMessage({ type: e3, out: i2 });
          }, (i2) => {
            postMessage({ type: e3, err: i2 });
          });
          break;
        }
        case "release":
          Br(r2), postMessage({ type: e3 });
          break;
        case "run": {
          let { sessionId: n2, inputIndices: o2, inputs: i2, outputIndices: a2, options: u2 } = r2;
          Mr(n2, o2, i2, a2, new Array(a2.length).fill(null), u2).then((d2) => {
            d2.some((c2) => c2[3] !== "cpu") ? postMessage({ type: e3, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: e3, out: d2 }, Ur([...i2, ...d2]));
          }, (d2) => {
            postMessage({ type: e3, err: d2 });
          });
          break;
        }
        case "end-profiling":
          Rr(r2), postMessage({ type: e3 });
          break;
        default:
      }
    } catch (n2) {
      postMessage({ type: e3, err: n2 });
    }
  });
  Of = cs ? null : (t2) => new Worker(t2 ?? We, { type: "module", name: ls });
});
var hs = {};
Wt(hs, { default: () => Df });
async function fs(t2 = {}) {
  var e3 = t2, r2 = !!globalThis.window, n2 = !!globalThis.WorkerGlobalScope, o2 = n2 && self.name?.startsWith("em-pthread");
  e3.mountExternalData = (s2, l2) => {
    s2.startsWith("./") && (s2 = s2.substring(2)), (e3.Yc || (e3.Yc = /* @__PURE__ */ new Map())).set(s2, l2);
  }, e3.unmountExternalData = () => {
    delete e3.Yc, delete e3.Zd, delete e3.Yd, delete e3.$d;
  }, globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: true }).buffer.constructor;
  let i2 = (s2) => async (...l2) => {
    try {
      if (e3.Xc) throw Error("Session already started");
      let h2 = e3.Xc = { Kd: l2[0], errors: [] }, f2 = await s2(...l2);
      if (e3.Xc !== h2) throw Error("Session mismatch");
      e3.dd?.flush();
      let $ = h2.errors;
      if (0 < $.length) {
        let C = await Promise.all($);
        if (C = C.filter((P) => P), 0 < C.length) throw Error(C.join(`
`));
      }
      return f2;
    } finally {
      e3.Xc = null;
    }
  };
  e3.jsepInit = (s2, l2) => {
    if (s2 === "webgpu") {
      [e3.dd, e3.Ad, e3.Ed, e3.ed, e3.Dd, e3.$b, e3.Fd, e3.Hd, e3.Bd, e3.Cd, e3.Gd] = l2;
      let h2 = e3.dd;
      e3.jsepRegisterBuffer = (f2, $, C, P) => h2.registerBuffer(f2, $, C, P), e3.jsepGetBuffer = (f2) => h2.getBuffer(f2), e3.jsepCreateDownloader = (f2, $, C) => h2.createDownloader(f2, $, C), e3.jsepOnCreateSession = (f2) => {
        h2.onCreateSession(f2);
      }, e3.jsepOnReleaseSession = (f2) => {
        h2.onReleaseSession(f2);
      }, e3.jsepOnRunStart = (f2) => h2.onRunStart(f2), e3.Id = (f2, $) => {
        h2.upload(f2, $);
      };
    } else if (s2 === "webnn") {
      let h2 = l2[0];
      [e3.Sd, e3.sd, e3.webnnEnsureTensor, e3.td, e3.webnnDownloadTensor, e3.Rd, e3.webnnEnableTraceEvent] = l2.slice(1), e3.webnnReleaseTensorId = e3.sd, e3.webnnUploadTensor = e3.td, e3.webnnRegisterMLContext = e3.Rd, e3.webnnOnRunStart = (f2) => h2.onRunStart(f2), e3.webnnOnRunEnd = h2.onRunEnd.bind(h2), e3.webnnOnReleaseSession = (f2) => {
        h2.onReleaseSession(f2);
      }, e3.webnnCreateMLTensorDownloader = (f2, $) => h2.createMLTensorDownloader(f2, $), e3.webnnRegisterMLTensor = (f2, $, C, P) => h2.registerMLTensor(f2, $, C, P), e3.webnnCreateMLContext = (f2) => h2.createMLContext(f2), e3.webnnRegisterGraphInput = h2.registerGraphInput.bind(h2), e3.webnnIsGraphInput = h2.isGraphInput.bind(h2), e3.webnnRegisterGraphOutput = h2.registerGraphOutput.bind(h2), e3.webnnIsGraphOutput = h2.isGraphOutput.bind(h2), e3.webnnCreateTemporaryTensor = h2.createTemporaryTensor.bind(h2), e3.webnnIsGraphInputOutputTypeSupported = h2.isGraphInputOutputTypeSupported.bind(h2);
    }
  };
  let a2 = () => {
    let s2 = (l2) => (...h2) => {
      let f2 = et;
      return h2 = l2(...h2), et != f2 ? new Promise(($, C) => {
        On = { resolve: $, reject: C };
      }) : h2;
    };
    (() => {
      for (let l2 of ["_OrtAppendExecutionProvider", "_OrtCreateSession", "_OrtRun", "_OrtRunWithBinding", "_OrtBindInput"]) e3[l2] = s2(e3[l2]);
    })(), i2 !== void 0 && (e3._OrtRun = i2(e3._OrtRun), e3._OrtRunWithBinding = i2(e3._OrtRunWithBinding)), a2 = void 0;
  };
  e3.asyncInit = () => {
    a2?.();
  };
  var u2, d2, c2 = (s2, l2) => {
    throw l2;
  }, p2 = import.meta.url, m2 = "";
  if (r2 || n2) {
    try {
      m2 = new URL(".", p2).href;
    } catch {
    }
    n2 && (d2 = (s2) => {
      var l2 = new XMLHttpRequest();
      return l2.open("GET", s2, false), l2.responseType = "arraybuffer", l2.send(null), new Uint8Array(l2.response);
    }), u2 = async (s2) => {
      if (D(s2)) return new Promise((h2, f2) => {
        var $ = new XMLHttpRequest();
        $.open("GET", s2, true), $.responseType = "arraybuffer", $.onload = () => {
          $.status == 200 || $.status == 0 && $.response ? h2($.response) : f2($.status);
        }, $.onerror = f2, $.send(null);
      });
      var l2 = await fetch(s2, { credentials: "same-origin" });
      if (l2.ok) return l2.arrayBuffer();
      throw Error(l2.status + " : " + l2.url);
    };
  }
  var g2, y, b, _, S, x, v = console.log.bind(console), T = console.error.bind(console), I = v, E = T, A = false, D = (s2) => s2.startsWith("file://");
  function w() {
    ht.buffer != N.buffer && Me();
  }
  if (o2) {
    let s2 = function(l2) {
      try {
        var h2 = l2.data, f2 = h2.Sc;
        if (f2 === "load") {
          let $ = [];
          self.onmessage = (C) => $.push(C), x = () => {
            postMessage({ Sc: "loaded" });
            for (let C of $) s2(C);
            self.onmessage = s2;
          };
          for (let C of h2.xd) e3[C] && !e3[C].proxy || (e3[C] = (...P) => {
            postMessage({ Sc: "callHandler", vd: C, args: P });
          }, C == "print" && (I = e3[C]), C == "printErr" && (E = e3[C]));
          ht = h2.Od, Me(), y = h2.Pd, be(), Sr();
        } else if (f2 === "run") {
          (function($) {
            var C = (w(), L)[$ + 52 >>> 2 >>> 0];
            $ = (w(), L)[$ + 56 >>> 2 >>> 0], Fi(C, C - $), ue(C);
          })(h2.Rc), Rn(h2.Rc, 0, 0, 1, 0, 0), qo(), En(h2.Rc), U || (Ni(), U = true);
          try {
            hp(h2.Md, h2.bd);
          } catch ($) {
            if ($ != "unwind") throw $;
          }
        } else h2.target !== "setimmediate" && (f2 === "checkMailbox" ? U && br() : f2 && (E(`worker: received unknown command ${f2}`), E(h2)));
      } catch ($) {
        throw Vi(), $;
      }
    };
    var fy = s2, U = false;
    self.onunhandledrejection = (l2) => {
      throw l2.reason || l2;
    }, self.onmessage = s2;
  }
  var N, F, q, Y, z, L, Q, X, Z, ne, ie, le = false;
  function Me() {
    var s2 = ht.buffer;
    e3.HEAP8 = N = new Int8Array(s2), q = new Int16Array(s2), e3.HEAPU8 = F = new Uint8Array(s2), Y = new Uint16Array(s2), e3.HEAP32 = z = new Int32Array(s2), e3.HEAPU32 = L = new Uint32Array(s2), Q = new Float32Array(s2), X = new Float64Array(s2), Z = new BigInt64Array(s2), ne = new BigUint64Array(s2);
  }
  function $e() {
    le = true, o2 ? x() : ct.sb();
  }
  function M(s2) {
    throw E(s2 = "Aborted(" + s2 + ")"), A = true, s2 = new WebAssembly.RuntimeError(s2 + ". Build with -sASSERTIONS for more info."), S?.(s2), s2;
  }
  function G() {
    return { a: { ma: Vm, hb: Nm, g: gp, J: bp, f: yp, o: _p, i: wp, $: $p, b: vp, S: xp, Ia: Yo, n: Sp, aa: ri, Ya: ni, Ea: oi, Ga: ii, Za: ai, Wa: si, Pa: ui, Va: di, ka: li, Fa: ci, Ca: pi, Xa: mi, Da: fi, cb: Tp, fa: Cp, xa: Ap, va: kp, ea: Op, N: Dp, H: zp, wa: Bp, _: Wp, ya: Gp, Sa: Hp, Aa: qp, Ja: Kp, ta: jp, ga: Zp, Ra: En, $a: Qp, Q: em, r: im, c: Cn, ib: am, y: sm, M: um, D: dm, l: lm, s: vi, jb: cm, I: pm, R: mm, j: fm, u: hm, q: gm, k: bm, Ma: ym, Na: _m, Oa: wm, Ka: Ii, La: Ci, ua: Ai, eb: vm, bb: Tm, v: Im, ba: Cm, ha: Am, ab: xm, V: Em, _a: km, Ba: Pm, F: $m, T: Om, la: vr, za: zm, gb: Dm, fb: Bm, Ta: Oi, Ua: Di, Ha: vn, U: zi, ja: Bi, Qa: Mi, ia: Ri, lb: xf, na: yf, mb: vf, oa: bf, G: sf, e: Hm, t: Wm, w: Lm, B: ef, nb: ff, Z: mf, x: Km, pa: hf, X: _f, ca: pf, ob: cf, pb: lf, O: tf, qa: df, qb: uf, L: of, Y: gf, d: Gm, A: qm, m: Fm, kb: Sf, p: Zm, z: Qm, C: jm, E: Xm, K: rf, ra: af, P: wf, da: nf, W: $f, rb: Jm, sa: Ym, h: Rm, a: ht, db: pr } };
  }
  async function be() {
    function s2(f2, $) {
      var C = ct = f2.exports;
      f2 = {};
      for (let [P, B] of Object.entries(C)) typeof B == "function" ? (C = Xp(B), f2[P] = C) : f2[P] = B;
      return ct = f2, ct = (function() {
        var P = ct, B = (K) => (ae) => K(ae) >>> 0, H = (K) => () => K() >>> 0;
        return (P = Object.assign({}, P)).tb = B(P.tb), P.Xb = H(P.Xb), P.Zb = B(P.Zb), P.lc = B(P.lc), P.mc = H(P.mc), P.qc = B(P.qc), P;
      })(), Ho.push(ct._b), Ui = (f2 = ct).tb, Ni = f2.ub, e3._OrtInit = f2.vb, e3._OrtGetLastError = f2.wb, e3._OrtCreateSessionOptions = f2.xb, e3._OrtAppendExecutionProvider = f2.yb, e3._OrtAddFreeDimensionOverride = f2.zb, e3._OrtAddSessionConfigEntry = f2.Ab, e3._OrtReleaseSessionOptions = f2.Bb, e3._OrtCreateSession = f2.Cb, e3._OrtReleaseSession = f2.Db, e3._OrtGetInputOutputCount = f2.Eb, e3._OrtGetInputOutputMetadata = f2.Fb, e3._OrtFree = f2.Gb, e3._OrtCreateTensor = f2.Hb, e3._OrtGetTensorData = f2.Ib, e3._OrtReleaseTensor = f2.Jb, e3._OrtCreateRunOptions = f2.Kb, e3._OrtAddRunConfigEntry = f2.Lb, e3._OrtReleaseRunOptions = f2.Mb, e3._OrtCreateBinding = f2.Nb, e3._OrtBindInput = f2.Ob, e3._OrtBindOutput = f2.Pb, e3._OrtClearBoundOutputs = f2.Qb, e3._OrtReleaseBinding = f2.Rb, e3._OrtRunWithBinding = f2.Sb, e3._OrtRun = f2.Tb, e3._OrtEndProfiling = f2.Ub, e3._JsepOutput = f2.Vb, e3._JsepGetNodeName = f2.Wb, xr = f2.Xb, tt = e3._free = f2.Yb, Yt = e3._malloc = f2.Zb, Rn = f2.ac, Vi = f2.bc, Li = f2.cc, Wi = f2.dc, Un = f2.ec, Gi = f2.fc, Hi = f2.gc, ce = f2.hc, Jt = f2.ic, Fi = f2.jc, ue = f2.kc, Nn = f2.lc, de = f2.mc, qi = f2.nc, Vn = f2.oc, Ki = f2.pc, ji = f2.qc, Zi = f2.rc, Ln = f2.sc, Qi = f2.tc, Xi = f2.uc, Yi = f2.vc, Ji = f2.wc, ea = f2.xc, ta = f2.yc, ra = f2.zc, na = f2.Ac, oa = f2.Bc, ia = f2.Cc, aa = f2.Dc, sa = f2.Ec, ua = f2.Fc, da = f2.Gc, la = f2.Hc, ca = f2.Ic, pa = f2.Jc, ma = f2.Kc, fa = f2.Lc, ha = f2.Mc, ga = f2.Nc, ba = f2.Pc, ya = f2.Qc, _a = f2.$c, wa = f2.ad, $a = f2.fd, va = f2.kd, xa = f2.ld, Sa = f2.md, Ta = f2.nd, Ia = f2.od, Ca = f2.pd, Aa = f2.qd, Ea = f2.rd, ka = f2.wd, Pa = f2.Ud, Oa = f2.Vd, Da = f2.Wd, za = f2.Xd, y = $, ct;
    }
    var l2, h2 = G();
    return e3.instantiateWasm ? new Promise((f2) => {
      e3.instantiateWasm(h2, ($, C) => {
        f2(s2($, C));
      });
    }) : o2 ? s2(new WebAssembly.Instance(y, G()), y) : (ie ??= e3.locateFile ? e3.locateFile ? e3.locateFile("ort-wasm-simd-threaded.jsep.wasm", m2) : m2 + "ort-wasm-simd-threaded.jsep.wasm" : new URL("ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href, l2 = await (async function(f2) {
      var $ = ie;
      if (!g2 && !D($)) try {
        var C = fetch($, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(C, f2);
      } catch (P) {
        E(`wasm streaming compile failed: ${P}`), E("falling back to ArrayBuffer instantiation");
      }
      return (async function(P, B) {
        try {
          var H = await (async function(K) {
            if (!g2) try {
              var ae = await u2(K);
              return new Uint8Array(ae);
            } catch {
            }
            if (K == ie && g2) K = new Uint8Array(g2);
            else {
              if (!d2) throw "both async and sync fetching of the wasm failed";
              K = d2(K);
            }
            return K;
          })(P);
          return await WebAssembly.instantiate(H, B);
        } catch (K) {
          E(`failed to asynchronously prepare wasm: ${K}`), M(K);
        }
      })($, f2);
    })(h2), s2(l2.instance, l2.module));
  }
  class ke {
    name = "ExitStatus";
    constructor(l2) {
      this.message = `Program terminated with exit(${l2})`, this.status = l2;
    }
  }
  var ve = (s2) => {
    s2.terminate(), s2.onmessage = () => {
    };
  }, Oe = [], ge = 0, Te = null, qe = (s2) => {
    ft.length == 0 && (jo(), Ko(ft[0]));
    var l2 = ft.pop();
    if (!l2) return 6;
    Qt.push(l2), Ct[s2.Rc] = l2, l2.Rc = s2.Rc;
    var h2 = { Sc: "run", Md: s2.Ld, bd: s2.bd, Rc: s2.Rc };
    return l2.postMessage(h2, s2.jd), 0;
  }, Ne = 0, Se = (s2, l2, ...h2) => {
    var f2, $ = 16 * h2.length, C = de(), P = Nn($), B = P >>> 3;
    for (f2 of h2) typeof f2 == "bigint" ? ((w(), Z)[B++ >>> 0] = 1n, (w(), Z)[B++ >>> 0] = f2) : ((w(), Z)[B++ >>> 0] = 0n, (w(), X)[B++ >>> 0] = f2);
    return s2 = Li(s2, 0, $, P, l2), ue(C), s2;
  };
  function pr(s2) {
    if (o2) return Se(0, 1, s2);
    if (b = s2, !(0 < Ne)) {
      for (var l2 of Qt) ve(l2);
      for (l2 of ft) ve(l2);
      ft = [], Qt = [], Ct = {}, A = true;
    }
    c2(0, new ke(s2));
  }
  function Go(s2) {
    if (o2) return Se(1, 0, s2);
    vn(s2);
  }
  var vn = (s2) => {
    if (b = s2, o2) throw Go(s2), "unwind";
    pr(s2);
  }, ft = [], Qt = [], Ho = [], Ct = {}, Fo = (s2) => {
    var l2 = s2.Rc;
    delete Ct[l2], ft.push(s2), Qt.splice(Qt.indexOf(s2), 1), s2.Rc = 0, Wi(l2);
  };
  function qo() {
    Ho.forEach((s2) => s2());
  }
  var Ko = (s2) => new Promise((l2) => {
    s2.onmessage = ($) => {
      var C = $.data;
      if ($ = C.Sc, C.Zc && C.Zc != xr()) {
        var P = Ct[C.Zc];
        P ? P.postMessage(C, C.jd) : E(`Internal error! Worker sent a message "${$}" to target pthread ${C.Zc}, but that thread no longer exists!`);
      } else $ === "checkMailbox" ? br() : $ === "spawnThread" ? qe(C) : $ === "cleanupThread" ? gr(() => {
        Fo(Ct[C.Nd]);
      }) : $ === "loaded" ? (s2.loaded = true, l2(s2)) : C.target === "setimmediate" ? s2.postMessage(C) : $ === "uncaughtException" ? s2.onerror(C.error) : $ === "callHandler" ? e3[C.vd](...C.args) : $ && E(`worker sent an unknown command ${$}`);
    }, s2.onerror = ($) => {
      throw E(`worker sent an error! ${$.filename}:${$.lineno}: ${$.message}`), $;
    };
    var h2, f2 = [];
    for (h2 of []) e3.propertyIsEnumerable(h2) && f2.push(h2);
    s2.postMessage({ Sc: "load", xd: f2, Od: ht, Pd: y });
  });
  function jo() {
    var s2 = new Worker((() => {
      let l2 = URL;
      return import.meta.url > "file:" && import.meta.url < "file;" ? new l2("ort.bundle.min.mjs", import.meta.url) : new URL(import.meta.url);
    })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
    ft.push(s2);
  }
  var ht, hp = (s2, l2) => {
    Ne = 0, s2 = Ln(s2, l2), 0 < Ne ? b = s2 : Un(s2);
  }, mr = [], fr = 0;
  function gp(s2) {
    var l2 = new xn(s2 >>>= 0);
    return (w(), N)[l2.Tc + 12 >>> 0] == 0 && (Zo(l2, true), fr--), Qo(l2, false), mr.push(l2), ji(s2);
  }
  var Vt = 0, bp = () => {
    ce(0, 0);
    var s2 = mr.pop();
    qi(s2.cd), Vt = 0;
  };
  function Zo(s2, l2) {
    l2 = l2 ? 1 : 0, (w(), N)[s2.Tc + 12 >>> 0] = l2;
  }
  function Qo(s2, l2) {
    l2 = l2 ? 1 : 0, (w(), N)[s2.Tc + 13 >>> 0] = l2;
  }
  class xn {
    constructor(l2) {
      this.cd = l2, this.Tc = l2 - 24;
    }
  }
  var Sn = (s2) => {
    var l2 = Vt;
    if (!l2) return Jt(0), 0;
    var h2 = new xn(l2);
    (w(), L)[h2.Tc + 16 >>> 2 >>> 0] = l2;
    var f2 = (w(), L)[h2.Tc + 4 >>> 2 >>> 0];
    if (!f2) return Jt(0), l2;
    for (var $ of s2) {
      if ($ === 0 || $ === f2) break;
      if (Ki($, f2, h2.Tc + 16)) return Jt($), l2;
    }
    return Jt(f2), l2;
  };
  function yp() {
    return Sn([]);
  }
  function _p(s2) {
    return Sn([s2 >>> 0]);
  }
  function wp(s2, l2, h2, f2) {
    return Sn([s2 >>> 0, l2 >>> 0, h2 >>> 0, f2 >>> 0]);
  }
  var $p = () => {
    var s2 = mr.pop();
    s2 || M("no exception to throw");
    var l2 = s2.cd;
    throw (w(), N)[s2.Tc + 13 >>> 0] == 0 && (mr.push(s2), Qo(s2, true), Zo(s2, false), fr++), Vn(l2), Vt = l2;
  };
  function vp(s2, l2, h2) {
    var f2 = new xn(s2 >>>= 0);
    throw l2 >>>= 0, h2 >>>= 0, (w(), L)[f2.Tc + 16 >>> 2 >>> 0] = 0, (w(), L)[f2.Tc + 4 >>> 2 >>> 0] = l2, (w(), L)[f2.Tc + 8 >>> 2 >>> 0] = h2, Vn(s2), fr++, Vt = s2;
  }
  var xp = () => fr;
  function Xo(s2, l2, h2, f2) {
    return o2 ? Se(2, 1, s2, l2, h2, f2) : Yo(s2, l2, h2, f2);
  }
  function Yo(s2, l2, h2, f2) {
    if (s2 >>>= 0, l2 >>>= 0, h2 >>>= 0, f2 >>>= 0, !globalThis.SharedArrayBuffer) return 6;
    var $ = [];
    return o2 && $.length === 0 ? Xo(s2, l2, h2, f2) : (s2 = { Ld: h2, Rc: s2, bd: f2, jd: $ }, o2 ? (s2.Sc = "spawnThread", postMessage(s2, $), 0) : qe(s2));
  }
  function Sp(s2) {
    throw Vt ||= s2 >>> 0, Vt;
  }
  var Jo = globalThis.TextDecoder && new TextDecoder(), ei = (s2, l2, h2, f2) => {
    if (h2 = l2 + h2, f2) return h2;
    for (; s2[l2] && !(l2 >= h2); ) ++l2;
    return l2;
  }, ti = (s2, l2 = 0, h2, f2) => {
    if (16 < (h2 = ei(s2, l2 >>>= 0, h2, f2)) - l2 && s2.buffer && Jo) return Jo.decode(s2.buffer instanceof ArrayBuffer ? s2.subarray(l2, h2) : s2.slice(l2, h2));
    for (f2 = ""; l2 < h2; ) {
      var $ = s2[l2++];
      if (128 & $) {
        var C = 63 & s2[l2++];
        if ((224 & $) == 192) f2 += String.fromCharCode((31 & $) << 6 | C);
        else {
          var P = 63 & s2[l2++];
          65536 > ($ = (240 & $) == 224 ? (15 & $) << 12 | C << 6 | P : (7 & $) << 18 | C << 12 | P << 6 | 63 & s2[l2++]) ? f2 += String.fromCharCode($) : ($ -= 65536, f2 += String.fromCharCode(55296 | $ >> 10, 56320 | 1023 & $));
        }
      } else f2 += String.fromCharCode($);
    }
    return f2;
  }, Ee = (s2, l2, h2) => (s2 >>>= 0) ? ti((w(), F), s2, l2, h2) : "";
  function ri(s2, l2, h2) {
    return o2 ? Se(3, 1, s2, l2, h2) : 0;
  }
  function ni(s2, l2) {
    if (o2) return Se(4, 1, s2, l2);
  }
  function oi(s2, l2) {
    if (o2) return Se(5, 1, s2, l2);
  }
  function ii(s2, l2, h2) {
    if (o2) return Se(6, 1, s2, l2, h2);
  }
  function ai(s2, l2, h2) {
    return o2 ? Se(7, 1, s2, l2, h2) : 0;
  }
  function si(s2, l2) {
    if (o2) return Se(8, 1, s2, l2);
  }
  function ui(s2, l2, h2) {
    if (o2) return Se(9, 1, s2, l2, h2);
  }
  function di(s2, l2, h2, f2) {
    if (o2) return Se(10, 1, s2, l2, h2, f2);
  }
  function li(s2, l2, h2, f2) {
    if (o2) return Se(11, 1, s2, l2, h2, f2);
  }
  function ci(s2, l2, h2, f2) {
    if (o2) return Se(12, 1, s2, l2, h2, f2);
  }
  function pi(s2) {
    if (o2) return Se(13, 1, s2);
  }
  function mi(s2, l2) {
    if (o2) return Se(14, 1, s2, l2);
  }
  function fi(s2, l2, h2) {
    if (o2) return Se(15, 1, s2, l2, h2);
  }
  var Tp = () => M(""), Je = (s2) => {
    s2 >>>= 0;
    for (var l2 = ""; ; ) {
      var h2 = (w(), F)[s2++ >>> 0];
      if (!h2) return l2;
      l2 += String.fromCharCode(h2);
    }
  }, Tn = {}, In = {}, Ip = {}, Lt = class extends Error {
    constructor(s2) {
      super(s2), this.name = "BindingError";
    }
  };
  function lt(s2, l2, h2 = {}) {
    return (function(f2, $, C = {}) {
      var P = $.name;
      if (!f2) throw new Lt(`type "${P}" must have a positive integer typeid pointer`);
      if (In.hasOwnProperty(f2)) {
        if (C.yd) return;
        throw new Lt(`Cannot register type '${P}' twice`);
      }
      In[f2] = $, delete Ip[f2], Tn.hasOwnProperty(f2) && ($ = Tn[f2], delete Tn[f2], $.forEach((B) => B()));
    })(s2, l2, h2);
  }
  var hi = (s2, l2, h2) => {
    switch (l2) {
      case 1:
        return h2 ? (f2) => (w(), N)[f2 >>> 0] : (f2) => (w(), F)[f2 >>> 0];
      case 2:
        return h2 ? (f2) => (w(), q)[f2 >>> 1 >>> 0] : (f2) => (w(), Y)[f2 >>> 1 >>> 0];
      case 4:
        return h2 ? (f2) => (w(), z)[f2 >>> 2 >>> 0] : (f2) => (w(), L)[f2 >>> 2 >>> 0];
      case 8:
        return h2 ? (f2) => (w(), Z)[f2 >>> 3 >>> 0] : (f2) => (w(), ne)[f2 >>> 3 >>> 0];
      default:
        throw new TypeError(`invalid integer width (${l2}): ${s2}`);
    }
  };
  function Cp(s2, l2, h2, f2, $) {
    s2 >>>= 0, h2 >>>= 0, l2 = Je(l2 >>> 0);
    let C = (P) => P;
    if (f2 = f2 === 0n) {
      let P = 8 * h2;
      C = (B) => BigInt.asUintN(P, B), $ = C($);
    }
    lt(s2, { name: l2, Oc: C, Vc: (P, B) => (typeof B == "number" && (B = BigInt(B)), B), Uc: hi(l2, h2, !f2), Wc: null });
  }
  function Ap(s2, l2, h2, f2) {
    lt(s2 >>>= 0, { name: l2 = Je(l2 >>> 0), Oc: function($) {
      return !!$;
    }, Vc: function($, C) {
      return C ? h2 : f2;
    }, Uc: function($) {
      return this.Oc((w(), F)[$ >>> 0]);
    }, Wc: null });
  }
  var gi = [], At = [0, 1, , 1, null, 1, true, 1, false, 1];
  function Cn(s2) {
    9 < (s2 >>>= 0) && --At[s2 + 1] === 0 && (At[s2] = void 0, gi.push(s2));
  }
  var He = (s2) => {
    if (!s2) throw new Lt(`Cannot use deleted val. handle = ${s2}`);
    return At[s2];
  }, Ke = (s2) => {
    switch (s2) {
      case void 0:
        return 2;
      case null:
        return 4;
      case true:
        return 6;
      case false:
        return 8;
      default:
        let l2 = gi.pop() || At.length;
        return At[l2] = s2, At[l2 + 1] = 1, l2;
    }
  };
  function An(s2) {
    return this.Oc((w(), L)[s2 >>> 2 >>> 0]);
  }
  var Ep = { name: "emscripten::val", Oc: (s2) => {
    var l2 = He(s2);
    return Cn(s2), l2;
  }, Vc: (s2, l2) => Ke(l2), Uc: An, Wc: null };
  function kp(s2) {
    return lt(s2 >>> 0, Ep);
  }
  var Pp = (s2, l2) => {
    switch (l2) {
      case 4:
        return function(h2) {
          return this.Oc((w(), Q)[h2 >>> 2 >>> 0]);
        };
      case 8:
        return function(h2) {
          return this.Oc((w(), X)[h2 >>> 3 >>> 0]);
        };
      default:
        throw new TypeError(`invalid float width (${l2}): ${s2}`);
    }
  };
  function Op(s2, l2, h2) {
    h2 >>>= 0, lt(s2 >>>= 0, { name: l2 = Je(l2 >>> 0), Oc: (f2) => f2, Vc: (f2, $) => $, Uc: Pp(l2, h2), Wc: null });
  }
  function Dp(s2, l2, h2, f2, $) {
    s2 >>>= 0, h2 >>>= 0, l2 = Je(l2 >>> 0);
    let C = (B) => B;
    if (f2 === 0) {
      var P = 32 - 8 * h2;
      C = (B) => B << P >>> P, $ = C($);
    }
    lt(s2, { name: l2, Oc: C, Vc: (B, H) => H, Uc: hi(l2, h2, f2 !== 0), Wc: null });
  }
  function zp(s2, l2, h2) {
    function f2(C) {
      var P = (w(), L)[C >>> 2 >>> 0];
      return C = (w(), L)[C + 4 >>> 2 >>> 0], new $((w(), N).buffer, C, P);
    }
    var $ = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][l2];
    lt(s2 >>>= 0, { name: h2 = Je(h2 >>> 0), Oc: f2, Uc: f2 }, { yd: true });
  }
  var gt = (s2, l2, h2) => {
    var f2 = (w(), F);
    if (l2 >>>= 0, 0 < h2) {
      var $ = l2;
      h2 = l2 + h2 - 1;
      for (var C = 0; C < s2.length; ++C) {
        var P = s2.codePointAt(C);
        if (127 >= P) {
          if (l2 >= h2) break;
          f2[l2++ >>> 0] = P;
        } else if (2047 >= P) {
          if (l2 + 1 >= h2) break;
          f2[l2++ >>> 0] = 192 | P >> 6, f2[l2++ >>> 0] = 128 | 63 & P;
        } else if (65535 >= P) {
          if (l2 + 2 >= h2) break;
          f2[l2++ >>> 0] = 224 | P >> 12, f2[l2++ >>> 0] = 128 | P >> 6 & 63, f2[l2++ >>> 0] = 128 | 63 & P;
        } else {
          if (l2 + 3 >= h2) break;
          f2[l2++ >>> 0] = 240 | P >> 18, f2[l2++ >>> 0] = 128 | P >> 12 & 63, f2[l2++ >>> 0] = 128 | P >> 6 & 63, f2[l2++ >>> 0] = 128 | 63 & P, C++;
        }
      }
      f2[l2 >>> 0] = 0, s2 = l2 - $;
    } else s2 = 0;
    return s2;
  }, hr = (s2) => {
    for (var l2 = 0, h2 = 0; h2 < s2.length; ++h2) {
      var f2 = s2.charCodeAt(h2);
      127 >= f2 ? l2++ : 2047 >= f2 ? l2 += 2 : 55296 <= f2 && 57343 >= f2 ? (l2 += 4, ++h2) : l2 += 3;
    }
    return l2;
  };
  function Bp(s2, l2) {
    lt(s2 >>>= 0, { name: l2 = Je(l2 >>> 0), Oc(h2) {
      var f2 = (w(), L)[h2 >>> 2 >>> 0];
      return f2 = Ee(h2 + 4, f2, true), tt(h2), f2;
    }, Vc(h2, f2) {
      f2 instanceof ArrayBuffer && (f2 = new Uint8Array(f2));
      var $ = typeof f2 == "string";
      if (!($ || ArrayBuffer.isView(f2) && f2.BYTES_PER_ELEMENT == 1)) throw new Lt("Cannot pass non-string to std::string");
      var C = $ ? hr(f2) : f2.length, P = Yt(4 + C + 1), B = P + 4;
      return (w(), L)[P >>> 2 >>> 0] = C, $ ? gt(f2, B, C + 1) : (w(), F).set(f2, B >>> 0), h2 !== null && h2.push(tt, P), P;
    }, Uc: An, Wc(h2) {
      tt(h2);
    } });
  }
  var bi = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, Mp = (s2, l2, h2) => {
    if (s2 >>>= 1, 16 < (l2 = ei((w(), Y), s2, l2 / 2, h2)) - s2 && bi) return bi.decode((w(), Y).slice(s2, l2));
    for (h2 = ""; s2 < l2; ++s2) {
      var f2 = (w(), Y)[s2 >>> 0];
      h2 += String.fromCharCode(f2);
    }
    return h2;
  }, Rp = (s2, l2, h2) => {
    if (h2 ??= 2147483647, 2 > h2) return 0;
    var f2 = l2;
    h2 = (h2 -= 2) < 2 * s2.length ? h2 / 2 : s2.length;
    for (var $ = 0; $ < h2; ++$) {
      var C = s2.charCodeAt($);
      (w(), q)[l2 >>> 1 >>> 0] = C, l2 += 2;
    }
    return (w(), q)[l2 >>> 1 >>> 0] = 0, l2 - f2;
  }, Up = (s2) => 2 * s2.length, Np = (s2, l2, h2) => {
    var f2 = "";
    s2 >>>= 2;
    for (var $ = 0; !($ >= l2 / 4); $++) {
      var C = (w(), L)[s2 + $ >>> 0];
      if (!C && !h2) break;
      f2 += String.fromCodePoint(C);
    }
    return f2;
  }, Vp = (s2, l2, h2) => {
    if (l2 >>>= 0, h2 ??= 2147483647, 4 > h2) return 0;
    var f2 = l2;
    h2 = f2 + h2 - 4;
    for (var $ = 0; $ < s2.length; ++$) {
      var C = s2.codePointAt($);
      if (65535 < C && $++, (w(), z)[l2 >>> 2 >>> 0] = C, (l2 += 4) + 4 > h2) break;
    }
    return (w(), z)[l2 >>> 2 >>> 0] = 0, l2 - f2;
  }, Lp = (s2) => {
    for (var l2 = 0, h2 = 0; h2 < s2.length; ++h2) 65535 < s2.codePointAt(h2) && h2++, l2 += 4;
    return l2;
  };
  function Wp(s2, l2, h2) {
    if (s2 >>>= 0, l2 >>>= 0, h2 = Je(h2 >>>= 0), l2 === 2) var f2 = Mp, $ = Rp, C = Up;
    else f2 = Np, $ = Vp, C = Lp;
    lt(s2, { name: h2, Oc: (P) => {
      var B = (w(), L)[P >>> 2 >>> 0];
      return B = f2(P + 4, B * l2, true), tt(P), B;
    }, Vc: (P, B) => {
      if (typeof B != "string") throw new Lt(`Cannot pass non-string to C++ string type ${h2}`);
      var H = C(B), K = Yt(4 + H + l2);
      return (w(), L)[K >>> 2 >>> 0] = H / l2, $(B, K + 4, H + l2), P !== null && P.push(tt, K), K;
    }, Uc: An, Wc(P) {
      tt(P);
    } });
  }
  function Gp(s2, l2) {
    lt(s2 >>>= 0, { zd: true, name: l2 = Je(l2 >>> 0), Oc: () => {
    }, Vc: () => {
    } });
  }
  function Hp(s2) {
    Rn(s2 >>> 0, !n2, 1, !r2, 131072, false), qo();
  }
  var gr = (s2) => {
    if (!A) try {
      if (s2(), !(0 < Ne)) try {
        o2 ? xr() && Un(b) : vn(b);
      } catch (l2) {
        l2 instanceof ke || l2 == "unwind" || c2(0, l2);
      }
    } catch (l2) {
      l2 instanceof ke || l2 == "unwind" || c2(0, l2);
    }
  }, Fp = !Atomics.waitAsync || globalThis.navigator?.userAgent && 91 > Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]);
  function En(s2) {
    s2 >>>= 0, Fp || (Atomics.waitAsync((w(), z), s2 >>> 2, s2).value.then(br), s2 += 128, Atomics.store((w(), z), s2 >>> 2, 1));
  }
  var br = () => gr(() => {
    var s2 = xr();
    s2 && (En(s2), Hi());
  });
  function qp(s2, l2) {
    (s2 >>>= 0) == l2 >>> 0 ? setTimeout(br) : o2 ? postMessage({ Zc: s2, Sc: "checkMailbox" }) : (s2 = Ct[s2]) && s2.postMessage({ Sc: "checkMailbox" });
  }
  var kn = [];
  function Kp(s2, l2, h2, f2, $) {
    for (l2 >>>= 0, $ >>>= 0, kn.length = 0, h2 = $ >>> 3, f2 = $ + f2 >>> 3; h2 < f2; ) {
      var C;
      C = (w(), Z)[h2++ >>> 0] ? (w(), Z)[h2++ >>> 0] : (w(), X)[h2++ >>> 0], kn.push(C);
    }
    return (l2 ? Wn[l2] : Um[s2])(...kn);
  }
  var jp = () => {
    Ne = 0;
  };
  function Zp(s2) {
    s2 >>>= 0, o2 ? postMessage({ Sc: "cleanupThread", Nd: s2 }) : Fo(Ct[s2]);
  }
  function Qp(s2) {
  }
  var yr = (s2) => {
    try {
      s2();
    } catch (l2) {
      M(l2);
    }
  };
  function Xp(s2) {
    var l2 = (...h2) => {
      _r.push(s2);
      try {
        return s2(...h2);
      } finally {
        A || (_r.pop(), et && bt === 1 && _r.length === 0 && (bt = 0, Ne += 1, yr(Oa), typeof Fibers < "u" && Fibers.be()));
      }
    };
    return wi.set(s2, l2), l2;
  }
  var bt = 0, et = null, yi = 0, _r = [], Pn = /* @__PURE__ */ new Map(), _i = /* @__PURE__ */ new Map(), wi = /* @__PURE__ */ new Map(), Yp = 0, On = null, Jp = [], $i = (s2) => (function(l2) {
    if (!A) {
      if (bt === 0) {
        var h2 = false, f2 = false;
        l2(($ = 0) => {
          if (!A && (yi = $, h2 = true, f2)) {
            bt = 2, yr(() => Da(et)), typeof MainLoop < "u" && MainLoop.ud && MainLoop.resume(), $ = false;
            try {
              var C = (function() {
                var H = (w(), z)[et + 8 >>> 2 >>> 0];
                return H = _i.get(H), H = wi.get(H), --Ne, H();
              })();
            } catch (H) {
              C = H, $ = true;
            }
            var P = false;
            if (!et) {
              var B = On;
              B && (On = null, ($ ? B.reject : B.resolve)(C), P = true);
            }
            if ($ && !P) throw C;
          }
        }), f2 = true, h2 || (bt = 1, et = (function() {
          var $ = Yt(65548), C = $ + 12;
          if ((w(), L)[$ >>> 2 >>> 0] = C, (w(), L)[$ + 4 >>> 2 >>> 0] = C + 65536, C = _r[0], !Pn.has(C)) {
            var P = Yp++;
            Pn.set(C, P), _i.set(P, C);
          }
          return C = Pn.get(C), (w(), z)[$ + 8 >>> 2 >>> 0] = C, $;
        })(), typeof MainLoop < "u" && MainLoop.ud && MainLoop.pause(), yr(() => Pa(et)));
      } else bt === 2 ? (bt = 0, yr(za), tt(et), et = null, Jp.forEach(gr)) : M(`invalid state: ${bt}`);
      return yi;
    }
  })((l2) => {
    s2().then(l2);
  });
  function em(s2) {
    return s2 >>>= 0, $i(async () => {
      var l2 = await He(s2);
      return Ke(l2);
    });
  }
  var Dn = [], tm = (s2) => {
    var l2 = Dn.length;
    return Dn.push(s2), l2;
  }, rm = (s2, l2) => {
    for (var h2 = Array(s2), f2 = 0; f2 < s2; ++f2) {
      var $ = f2, C = (w(), L)[l2 + 4 * f2 >>> 2 >>> 0], P = In[C];
      if (P === void 0) throw s2 = `parameter ${f2}`, C = Ui(C), l2 = Je(C), tt(C), new Lt(`${s2} has unknown type ${l2}`);
      h2[$] = P;
    }
    return h2;
  }, nm = (s2, l2, h2) => {
    var f2 = [];
    return s2 = s2(f2, h2), f2.length && ((w(), L)[l2 >>> 2 >>> 0] = Ke(f2)), s2;
  }, om = {}, wr = (s2) => {
    var l2 = om[s2];
    return l2 === void 0 ? Je(s2) : l2;
  };
  function im(s2, l2, h2) {
    var [f2, ...$] = rm(s2, l2 >>> 0);
    l2 = f2.Vc.bind(f2);
    var C = $.map((H) => H.Uc.bind(H));
    s2--;
    var P = { toValue: He };
    switch (s2 = C.map((H, K) => {
      var ae = `argFromPtr${K}`;
      return P[ae] = H, `${ae}(args${K ? "+" + 8 * K : ""})`;
    }), h2) {
      case 0:
        var B = "toValue(handle)";
        break;
      case 2:
        B = "new (toValue(handle))";
        break;
      case 3:
        B = "";
        break;
      case 1:
        P.getStringOrSymbol = wr, B = "toValue(handle)[getStringOrSymbol(methodName)]";
    }
    return B += `(${s2})`, f2.zd || (P.toReturnWire = l2, P.emval_returnValue = nm, B = `return emval_returnValue(toReturnWire, destructorsRef, ${B})`), B = `return function (handle, methodName, destructorsRef, args) {
  ${B}
  }`, h2 = new Function(Object.keys(P), B)(...Object.values(P)), B = `methodCaller<(${$.map((H) => H.name)}) => ${f2.name}>`, tm(Object.defineProperty(h2, "name", { value: B }));
  }
  function am(s2, l2) {
    return l2 >>>= 0, (s2 = He(s2 >>> 0)) == He(l2);
  }
  function sm(s2) {
    return (s2 >>>= 0) ? (s2 = wr(s2), Ke(globalThis[s2])) : Ke(globalThis);
  }
  function um(s2) {
    return s2 = wr(s2 >>> 0), Ke(e3[s2]);
  }
  function dm(s2, l2) {
    return l2 >>>= 0, s2 = He(s2 >>> 0), l2 = He(l2), Ke(s2[l2]);
  }
  function lm(s2) {
    9 < (s2 >>>= 0) && (At[s2 + 1] += 1);
  }
  function vi(s2, l2, h2, f2, $) {
    return Dn[s2 >>> 0](l2 >>> 0, h2 >>> 0, f2 >>> 0, $ >>> 0);
  }
  function cm(s2, l2, h2, f2, $) {
    return vi(s2 >>> 0, l2 >>> 0, h2 >>> 0, f2 >>> 0, $ >>> 0);
  }
  function pm() {
    return Ke([]);
  }
  function mm(s2) {
    s2 = He(s2 >>> 0);
    for (var l2 = Array(s2.length), h2 = 0; h2 < s2.length; h2++) l2[h2] = s2[h2];
    return Ke(l2);
  }
  function fm(s2) {
    return Ke(wr(s2 >>> 0));
  }
  function hm() {
    return Ke({});
  }
  function gm(s2) {
    for (var l2 = He(s2 >>>= 0); l2.length; ) {
      var h2 = l2.pop();
      l2.pop()(h2);
    }
    Cn(s2);
  }
  function bm(s2, l2, h2) {
    l2 >>>= 0, h2 >>>= 0, s2 = He(s2 >>> 0), l2 = He(l2), h2 = He(h2), s2[l2] = h2;
  }
  function ym(s2, l2) {
    s2 = -9007199254740992 > s2 || 9007199254740992 < s2 ? NaN : Number(s2), l2 >>>= 0, s2 = new Date(1e3 * s2), (w(), z)[l2 >>> 2 >>> 0] = s2.getUTCSeconds(), (w(), z)[l2 + 4 >>> 2 >>> 0] = s2.getUTCMinutes(), (w(), z)[l2 + 8 >>> 2 >>> 0] = s2.getUTCHours(), (w(), z)[l2 + 12 >>> 2 >>> 0] = s2.getUTCDate(), (w(), z)[l2 + 16 >>> 2 >>> 0] = s2.getUTCMonth(), (w(), z)[l2 + 20 >>> 2 >>> 0] = s2.getUTCFullYear() - 1900, (w(), z)[l2 + 24 >>> 2 >>> 0] = s2.getUTCDay(), s2 = (s2.getTime() - Date.UTC(s2.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, (w(), z)[l2 + 28 >>> 2 >>> 0] = s2;
  }
  var xi = (s2) => s2 % 4 == 0 && (s2 % 100 != 0 || s2 % 400 == 0), Si = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Ti = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  function _m(s2, l2) {
    s2 = -9007199254740992 > s2 || 9007199254740992 < s2 ? NaN : Number(s2), l2 >>>= 0, s2 = new Date(1e3 * s2), (w(), z)[l2 >>> 2 >>> 0] = s2.getSeconds(), (w(), z)[l2 + 4 >>> 2 >>> 0] = s2.getMinutes(), (w(), z)[l2 + 8 >>> 2 >>> 0] = s2.getHours(), (w(), z)[l2 + 12 >>> 2 >>> 0] = s2.getDate(), (w(), z)[l2 + 16 >>> 2 >>> 0] = s2.getMonth(), (w(), z)[l2 + 20 >>> 2 >>> 0] = s2.getFullYear() - 1900, (w(), z)[l2 + 24 >>> 2 >>> 0] = s2.getDay();
    var h2 = (xi(s2.getFullYear()) ? Si : Ti)[s2.getMonth()] + s2.getDate() - 1 | 0;
    (w(), z)[l2 + 28 >>> 2 >>> 0] = h2, (w(), z)[l2 + 36 >>> 2 >>> 0] = -60 * s2.getTimezoneOffset(), h2 = new Date(s2.getFullYear(), 6, 1).getTimezoneOffset();
    var f2 = new Date(s2.getFullYear(), 0, 1).getTimezoneOffset();
    s2 = 0 | (h2 != f2 && s2.getTimezoneOffset() == Math.min(f2, h2)), (w(), z)[l2 + 32 >>> 2 >>> 0] = s2;
  }
  function wm(s2) {
    s2 >>>= 0;
    var l2 = new Date((w(), z)[s2 + 20 >>> 2 >>> 0] + 1900, (w(), z)[s2 + 16 >>> 2 >>> 0], (w(), z)[s2 + 12 >>> 2 >>> 0], (w(), z)[s2 + 8 >>> 2 >>> 0], (w(), z)[s2 + 4 >>> 2 >>> 0], (w(), z)[s2 >>> 2 >>> 0], 0), h2 = (w(), z)[s2 + 32 >>> 2 >>> 0], f2 = l2.getTimezoneOffset(), $ = new Date(l2.getFullYear(), 6, 1).getTimezoneOffset(), C = new Date(l2.getFullYear(), 0, 1).getTimezoneOffset(), P = Math.min(C, $);
    return 0 > h2 ? (w(), z)[s2 + 32 >>> 2 >>> 0] = +($ != C && P == f2) : 0 < h2 != (P == f2) && ($ = Math.max(C, $), l2.setTime(l2.getTime() + 6e4 * ((0 < h2 ? P : $) - f2))), (w(), z)[s2 + 24 >>> 2 >>> 0] = l2.getDay(), h2 = (xi(l2.getFullYear()) ? Si : Ti)[l2.getMonth()] + l2.getDate() - 1 | 0, (w(), z)[s2 + 28 >>> 2 >>> 0] = h2, (w(), z)[s2 >>> 2 >>> 0] = l2.getSeconds(), (w(), z)[s2 + 4 >>> 2 >>> 0] = l2.getMinutes(), (w(), z)[s2 + 8 >>> 2 >>> 0] = l2.getHours(), (w(), z)[s2 + 12 >>> 2 >>> 0] = l2.getDate(), (w(), z)[s2 + 16 >>> 2 >>> 0] = l2.getMonth(), (w(), z)[s2 + 20 >>> 2 >>> 0] = l2.getYear(), s2 = l2.getTime(), BigInt(isNaN(s2) ? -1 : s2 / 1e3);
  }
  function Ii(s2, l2, h2, f2, $, C, P) {
    return o2 ? Se(16, 1, s2, l2, h2, f2, $, C, P) : -52;
  }
  function Ci(s2, l2, h2, f2, $, C) {
    if (o2) return Se(17, 1, s2, l2, h2, f2, $, C);
  }
  var Xt = {}, $m = () => performance.timeOrigin + performance.now();
  function Ai(s2, l2) {
    if (o2) return Se(18, 1, s2, l2);
    if (Xt[s2] && (clearTimeout(Xt[s2].id), delete Xt[s2]), !l2) return 0;
    var h2 = setTimeout(() => {
      delete Xt[s2], gr(() => Gi(s2, performance.timeOrigin + performance.now()));
    }, l2);
    return Xt[s2] = { id: h2, ae: l2 }, 0;
  }
  function vm(s2, l2, h2, f2) {
    s2 >>>= 0, l2 >>>= 0, h2 >>>= 0, f2 >>>= 0;
    var $ = (/* @__PURE__ */ new Date()).getFullYear(), C = new Date($, 0, 1).getTimezoneOffset();
    $ = new Date($, 6, 1).getTimezoneOffset();
    var P = Math.max(C, $);
    (w(), L)[s2 >>> 2 >>> 0] = 60 * P, (w(), z)[l2 >>> 2 >>> 0] = +(C != $), s2 = (l2 = (B) => {
      var H = Math.abs(B);
      return `UTC${0 <= B ? "-" : "+"}${String(Math.floor(H / 60)).padStart(2, "0")}${String(H % 60).padStart(2, "0")}`;
    })(C), l2 = l2($), $ < C ? (gt(s2, h2, 17), gt(l2, f2, 17)) : (gt(s2, f2, 17), gt(l2, h2, 17));
  }
  var xm = () => Date.now(), Sm = 1;
  function Tm(s2, l2, h2) {
    if (h2 >>>= 0, !(0 <= s2 && 3 >= s2)) return 28;
    if (s2 === 0) s2 = Date.now();
    else {
      if (!Sm) return 52;
      s2 = performance.timeOrigin + performance.now();
    }
    return s2 = Math.round(1e6 * s2), (w(), Z)[h2 >>> 3 >>> 0] = BigInt(s2), 0;
  }
  var zn = [], Ei = (s2, l2) => {
    zn.length = 0;
    for (var h2; h2 = (w(), F)[s2++ >>> 0]; ) {
      var f2 = h2 != 105;
      l2 += (f2 &= h2 != 112) && l2 % 8 ? 4 : 0, zn.push(h2 == 112 ? (w(), L)[l2 >>> 2 >>> 0] : h2 == 106 ? (w(), Z)[l2 >>> 3 >>> 0] : h2 == 105 ? (w(), z)[l2 >>> 2 >>> 0] : (w(), X)[l2 >>> 3 >>> 0]), l2 += f2 ? 8 : 4;
    }
    return zn;
  };
  function Im(s2, l2, h2) {
    return s2 >>>= 0, l2 = Ei(l2 >>> 0, h2 >>> 0), Wn[s2](...l2);
  }
  function Cm(s2, l2, h2) {
    return s2 >>>= 0, l2 = Ei(l2 >>> 0, h2 >>> 0), Wn[s2](...l2);
  }
  var Am = () => {
  };
  function Em(s2, l2) {
    return E(Ee(s2 >>> 0, l2 >>> 0));
  }
  var km = () => {
    throw Ne += 1, "unwind";
  };
  function Pm() {
    return 4294901760;
  }
  var Om = () => navigator.hardwareConcurrency, Et = {}, $r = (s2) => {
    var l2;
    return (l2 = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(s2)) ? +l2[1] : (l2 = /:(\d+):\d+(?:\)|$)/.exec(s2)) ? 2147483648 | +l2[1] : 0;
  }, ki = (s2) => {
    for (var l2 of s2) (s2 = $r(l2)) && (Et[s2] = l2);
  };
  function Dm() {
    var s2 = Error().stack.toString().split(`
`);
    return s2[0] == "Error" && s2.shift(), ki(s2), Et.gd = $r(s2[3]), Et.Jd = s2, Et.gd;
  }
  function vr(s2) {
    if (!(s2 = Et[s2 >>> 0])) return 0;
    var l2;
    if (l2 = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(s2)) s2 = l2[1];
    else if (l2 = /^\s+at (.*) \(.*\)$/.exec(s2)) s2 = l2[1];
    else {
      if (!(l2 = /^(.+?)@/.exec(s2))) return 0;
      s2 = l2[1];
    }
    tt(vr.hd ?? 0), l2 = hr(s2) + 1;
    var h2 = Yt(l2);
    return h2 && gt(s2, h2, l2), vr.hd = h2, vr.hd;
  }
  function zm(s2) {
    s2 >>>= 0;
    var l2 = (w(), F).length;
    if (s2 <= l2 || 4294901760 < s2) return false;
    for (var h2 = 1; 4 >= h2; h2 *= 2) {
      var f2 = l2 * (1 + 0.2 / h2);
      f2 = Math.min(f2, s2 + 100663296);
      e: {
        f2 = (Math.min(4294901760, 65536 * Math.ceil(Math.max(s2, f2) / 65536)) - ht.buffer.byteLength + 65535) / 65536 | 0;
        try {
          ht.grow(f2), Me();
          var $ = 1;
          break e;
        } catch {
        }
        $ = void 0;
      }
      if ($) return true;
    }
    return false;
  }
  function Bm(s2, l2, h2) {
    if (s2 >>>= 0, l2 >>>= 0, Et.gd == s2) var f2 = Et.Jd;
    else (f2 = Error().stack.toString().split(`
`))[0] == "Error" && f2.shift(), ki(f2);
    for (var $ = 3; f2[$] && $r(f2[$]) != s2; ) ++$;
    for (s2 = 0; s2 < h2 && f2[s2 + $]; ++s2) (w(), z)[l2 + 4 * s2 >>> 2 >>> 0] = $r(f2[s2 + $]);
    return s2;
  }
  var Bn, Mn = {}, Pi = () => {
    if (!Bn) {
      var s2, l2 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
      for (s2 in Mn) Mn[s2] === void 0 ? delete l2[s2] : l2[s2] = Mn[s2];
      var h2 = [];
      for (s2 in l2) h2.push(`${s2}=${l2[s2]}`);
      Bn = h2;
    }
    return Bn;
  };
  function Oi(s2, l2) {
    if (o2) return Se(19, 1, s2, l2);
    s2 >>>= 0, l2 >>>= 0;
    var h2, f2 = 0, $ = 0;
    for (h2 of Pi()) {
      var C = l2 + f2;
      (w(), L)[s2 + $ >>> 2 >>> 0] = C, f2 += gt(h2, C, 1 / 0) + 1, $ += 4;
    }
    return 0;
  }
  function Di(s2, l2) {
    if (o2) return Se(20, 1, s2, l2);
    s2 >>>= 0, l2 >>>= 0;
    var h2 = Pi();
    for (var f2 of ((w(), L)[s2 >>> 2 >>> 0] = h2.length, s2 = 0, h2)) s2 += hr(f2) + 1;
    return (w(), L)[l2 >>> 2 >>> 0] = s2, 0;
  }
  function zi(s2) {
    return o2 ? Se(21, 1, s2) : 52;
  }
  function Bi(s2, l2, h2, f2) {
    return o2 ? Se(22, 1, s2, l2, h2, f2) : 52;
  }
  function Mi(s2, l2, h2, f2) {
    return o2 ? Se(23, 1, s2, l2, h2, f2) : 70;
  }
  var Mm = [null, [], []];
  function Ri(s2, l2, h2, f2) {
    if (o2) return Se(24, 1, s2, l2, h2, f2);
    l2 >>>= 0, h2 >>>= 0, f2 >>>= 0;
    for (var $ = 0, C = 0; C < h2; C++) {
      var P = (w(), L)[l2 >>> 2 >>> 0], B = (w(), L)[l2 + 4 >>> 2 >>> 0];
      l2 += 8;
      for (var H = 0; H < B; H++) {
        var K = s2, ae = (w(), F)[P + H >>> 0], pe = Mm[K];
        ae === 0 || ae === 10 ? ((K === 1 ? I : E)(ti(pe)), pe.length = 0) : pe.push(ae);
      }
      $ += B;
    }
    return (w(), L)[f2 >>> 2 >>> 0] = $, 0;
  }
  function Rm(s2) {
    return s2 >>> 0;
  }
  o2 || (function() {
    for (var s2 = e3.numThreads - 1; s2--; ) jo();
    Oe.push(async () => {
      var l2 = (async function() {
        if (!o2) return Promise.all(ft.map(Ko));
      })();
      ge++, await l2, --ge == 0 && Te && (l2 = Te, Te = null, l2());
    });
  })(), o2 || (ht = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true }), Me()), e3.wasmBinary && (g2 = e3.wasmBinary), e3.stackSave = () => de(), e3.stackRestore = (s2) => ue(s2), e3.stackAlloc = (s2) => Nn(s2), e3.setValue = function(s2, l2, h2 = "i8") {
    switch (h2.endsWith("*") && (h2 = "*"), h2) {
      case "i1":
      case "i8":
        (w(), N)[s2 >>> 0] = l2;
        break;
      case "i16":
        (w(), q)[s2 >>> 1 >>> 0] = l2;
        break;
      case "i32":
        (w(), z)[s2 >>> 2 >>> 0] = l2;
        break;
      case "i64":
        (w(), Z)[s2 >>> 3 >>> 0] = BigInt(l2);
        break;
      case "float":
        (w(), Q)[s2 >>> 2 >>> 0] = l2;
        break;
      case "double":
        (w(), X)[s2 >>> 3 >>> 0] = l2;
        break;
      case "*":
        (w(), L)[s2 >>> 2 >>> 0] = l2;
        break;
      default:
        M(`invalid type for setValue: ${h2}`);
    }
  }, e3.getValue = function(s2, l2 = "i8") {
    switch (l2.endsWith("*") && (l2 = "*"), l2) {
      case "i1":
      case "i8":
        return (w(), N)[s2 >>> 0];
      case "i16":
        return (w(), q)[s2 >>> 1 >>> 0];
      case "i32":
        return (w(), z)[s2 >>> 2 >>> 0];
      case "i64":
        return (w(), Z)[s2 >>> 3 >>> 0];
      case "float":
        return (w(), Q)[s2 >>> 2 >>> 0];
      case "double":
        return (w(), X)[s2 >>> 3 >>> 0];
      case "*":
        return (w(), L)[s2 >>> 2 >>> 0];
      default:
        M(`invalid type for getValue: ${l2}`);
    }
  }, e3.UTF8ToString = Ee, e3.stringToUTF8 = gt, e3.lengthBytesUTF8 = hr;
  var Ui, Ni, xr, tt, Yt, Rn, Vi, Li, Wi, Un, Gi, Hi, ce, Jt, Fi, ue, Nn, de, qi, Vn, Ki, ji, Zi, Ln, Qi, Xi, Yi, Ji, ea, ta, ra, na, oa, ia, aa, sa, ua, da, la, ca, pa, ma, fa, ha, ga, ba, ya, _a, wa, $a, va, xa, Sa, Ta, Ia, Ca, Aa, Ea, ka, Pa, Oa, Da, za, ct, Um = [pr, Go, Xo, ri, ni, oi, ii, ai, si, ui, di, li, ci, pi, mi, fi, Ii, Ci, Ai, Oi, Di, zi, Bi, Mi, Ri], Wn = { 1055492: (s2, l2, h2, f2, $) => {
    if (e3 === void 0 || !e3.Yc) return 1;
    if ((s2 = Ee(Number(s2 >>> 0))).startsWith("./") && (s2 = s2.substring(2)), !(s2 = e3.Yc.get(s2))) return 2;
    if (l2 = Number(l2 >>> 0), h2 = Number(h2 >>> 0), f2 = Number(f2 >>> 0), l2 + h2 > s2.byteLength) return 3;
    try {
      let C = s2.subarray(l2, l2 + h2);
      switch ($) {
        case 0:
          (w(), F).set(C, f2 >>> 0);
          break;
        case 1:
          e3.Qd ? e3.Qd(f2, C) : e3.Id(f2, C);
          break;
        default:
          return 4;
      }
      return 0;
    } catch {
      return 4;
    }
  }, 1056316: (s2, l2, h2) => {
    e3.td(s2, (w(), F).subarray(l2 >>> 0, l2 + h2 >>> 0));
  }, 1056380: () => e3.Sd(), 1056422: (s2) => {
    e3.sd(s2);
  }, 1056459: () => {
    e3.Bd();
  }, 1056490: () => {
    e3.Cd();
  }, 1056519: () => {
    e3.Gd();
  }, 1056544: (s2) => e3.Ad(s2), 1056577: (s2) => e3.Ed(s2), 1056609: (s2, l2, h2) => {
    e3.ed(Number(s2), Number(l2), Number(h2), true);
  }, 1056672: (s2, l2, h2) => {
    e3.ed(Number(s2), Number(l2), Number(h2));
  }, 1056729: () => typeof wasmOffsetConverter < "u", 1056786: (s2) => {
    e3.$b("Abs", s2, void 0);
  }, 1056837: (s2) => {
    e3.$b("Neg", s2, void 0);
  }, 1056888: (s2) => {
    e3.$b("Floor", s2, void 0);
  }, 1056941: (s2) => {
    e3.$b("Ceil", s2, void 0);
  }, 1056993: (s2) => {
    e3.$b("Reciprocal", s2, void 0);
  }, 1057051: (s2) => {
    e3.$b("Sqrt", s2, void 0);
  }, 1057103: (s2) => {
    e3.$b("Exp", s2, void 0);
  }, 1057154: (s2) => {
    e3.$b("Erf", s2, void 0);
  }, 1057205: (s2) => {
    e3.$b("Sigmoid", s2, void 0);
  }, 1057260: (s2, l2, h2) => {
    e3.$b("HardSigmoid", s2, { alpha: l2, beta: h2 });
  }, 1057339: (s2) => {
    e3.$b("HardSwish", s2, void 0);
  }, 1057396: (s2) => {
    e3.$b("Log", s2, void 0);
  }, 1057447: (s2) => {
    e3.$b("Sin", s2, void 0);
  }, 1057498: (s2) => {
    e3.$b("Cos", s2, void 0);
  }, 1057549: (s2) => {
    e3.$b("Tan", s2, void 0);
  }, 1057600: (s2) => {
    e3.$b("Asin", s2, void 0);
  }, 1057652: (s2) => {
    e3.$b("Acos", s2, void 0);
  }, 1057704: (s2) => {
    e3.$b("Atan", s2, void 0);
  }, 1057756: (s2) => {
    e3.$b("Sinh", s2, void 0);
  }, 1057808: (s2) => {
    e3.$b("Cosh", s2, void 0);
  }, 1057860: (s2) => {
    e3.$b("Asinh", s2, void 0);
  }, 1057913: (s2) => {
    e3.$b("Acosh", s2, void 0);
  }, 1057966: (s2) => {
    e3.$b("Atanh", s2, void 0);
  }, 1058019: (s2) => {
    e3.$b("Tanh", s2, void 0);
  }, 1058071: (s2) => {
    e3.$b("Not", s2, void 0);
  }, 1058122: (s2, l2, h2) => {
    e3.$b("Clip", s2, { min: l2, max: h2 });
  }, 1058191: (s2) => {
    e3.$b("Clip", s2, void 0);
  }, 1058243: (s2, l2) => {
    e3.$b("Elu", s2, { alpha: l2 });
  }, 1058301: (s2) => {
    e3.$b("Gelu", s2, void 0);
  }, 1058353: (s2) => {
    e3.$b("Relu", s2, void 0);
  }, 1058405: (s2, l2) => {
    e3.$b("LeakyRelu", s2, { alpha: l2 });
  }, 1058469: (s2, l2) => {
    e3.$b("ThresholdedRelu", s2, { alpha: l2 });
  }, 1058539: (s2, l2) => {
    e3.$b("Cast", s2, { to: l2 });
  }, 1058597: (s2) => {
    e3.$b("Add", s2, void 0);
  }, 1058648: (s2) => {
    e3.$b("Sub", s2, void 0);
  }, 1058699: (s2) => {
    e3.$b("Mul", s2, void 0);
  }, 1058750: (s2) => {
    e3.$b("Div", s2, void 0);
  }, 1058801: (s2) => {
    e3.$b("Pow", s2, void 0);
  }, 1058852: (s2) => {
    e3.$b("Equal", s2, void 0);
  }, 1058905: (s2) => {
    e3.$b("Greater", s2, void 0);
  }, 1058960: (s2) => {
    e3.$b("GreaterOrEqual", s2, void 0);
  }, 1059022: (s2) => {
    e3.$b("Less", s2, void 0);
  }, 1059074: (s2) => {
    e3.$b("LessOrEqual", s2, void 0);
  }, 1059133: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceMean", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1059308: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceMax", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1059482: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceMin", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1059656: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceProd", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1059831: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceSum", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060005: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceL1", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060178: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceL2", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060351: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceLogSum", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060528: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceSumSquare", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060708: (s2, l2, h2, f2, $) => {
    e3.$b("ReduceLogSumExp", s2, { keepDims: !!l2, noopWithEmptyAxes: !!h2, axes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1060888: (s2) => {
    e3.$b("Where", s2, void 0);
  }, 1060941: (s2, l2, h2) => {
    e3.$b("Transpose", s2, { perm: l2 ? Array.from((w(), z).subarray(Number(l2) >>> 0, Number(h2) >>> 0)) : [] });
  }, 1061065: (s2, l2, h2, f2) => {
    e3.$b("DepthToSpace", s2, { blocksize: l2, mode: Ee(h2), format: f2 ? "NHWC" : "NCHW" });
  }, 1061198: (s2, l2, h2, f2) => {
    e3.$b("DepthToSpace", s2, { blocksize: l2, mode: Ee(h2), format: f2 ? "NHWC" : "NCHW" });
  }, 1061331: (s2, l2, h2, f2) => {
    e3.$b("DFT", s2, { axis: l2, inverse: h2, onesided: f2 });
  }, 1061423: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie, yt) => {
    e3.$b("ConvTranspose", s2, { format: H ? "NHWC" : "NCHW", autoPad: l2, dilations: [h2], group: f2, kernelShape: [$], pads: [C, P], strides: [B], wIsConst: () => !!(w(), N)[K >>> 0], outputPadding: ae ? Array.from((w(), z).subarray(Number(ae) >>> 0, Number(pe) >>> 0)) : [], outputShape: xe ? Array.from((w(), z).subarray(Number(xe) >>> 0, Number(Ie) >>> 0)) : [], activation: Ee(yt) });
  }, 1061856: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("ConvTranspose", s2, { format: B ? "NHWC" : "NCHW", autoPad: l2, dilations: Array.from((w(), z).subarray(Number(h2) >>> 0, (Number(h2) >>> 0) + 2 >>> 0)), group: f2, kernelShape: Array.from((w(), z).subarray(Number($) >>> 0, (Number($) >>> 0) + 2 >>> 0)), pads: Array.from((w(), z).subarray(Number(C) >>> 0, (Number(C) >>> 0) + 4 >>> 0)), strides: Array.from((w(), z).subarray(Number(P) >>> 0, (Number(P) >>> 0) + 2 >>> 0)), wIsConst: () => !!(w(), N)[H >>> 0], outputPadding: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], outputShape: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [], activation: Ee(Ie) });
  }, 1062517: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie, yt) => {
    e3.$b("ConvTranspose", s2, { format: H ? "NHWC" : "NCHW", autoPad: l2, dilations: [h2], group: f2, kernelShape: [$], pads: [C, P], strides: [B], wIsConst: () => !!(w(), N)[K >>> 0], outputPadding: ae ? Array.from((w(), z).subarray(Number(ae) >>> 0, Number(pe) >>> 0)) : [], outputShape: xe ? Array.from((w(), z).subarray(Number(xe) >>> 0, Number(Ie) >>> 0)) : [], activation: Ee(yt) });
  }, 1062950: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("ConvTranspose", s2, { format: B ? "NHWC" : "NCHW", autoPad: l2, dilations: Array.from((w(), z).subarray(Number(h2) >>> 0, (Number(h2) >>> 0) + 2 >>> 0)), group: f2, kernelShape: Array.from((w(), z).subarray(Number($) >>> 0, (Number($) >>> 0) + 2 >>> 0)), pads: Array.from((w(), z).subarray(Number(C) >>> 0, (Number(C) >>> 0) + 4 >>> 0)), strides: Array.from((w(), z).subarray(Number(P) >>> 0, (Number(P) >>> 0) + 2 >>> 0)), wIsConst: () => !!(w(), N)[H >>> 0], outputPadding: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], outputShape: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [], activation: Ee(Ie) });
  }, 1063611: (s2, l2) => {
    e3.$b("GlobalAveragePool", s2, { format: l2 ? "NHWC" : "NCHW" });
  }, 1063702: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("AveragePool", s2, { format: Ie ? "NHWC" : "NCHW", auto_pad: l2, ceil_mode: h2, count_include_pad: f2, storage_order: $, dilations: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [], kernel_shape: B ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(H) >>> 0)) : [], pads: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], strides: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [] });
  }, 1064181: (s2, l2) => {
    e3.$b("GlobalAveragePool", s2, { format: l2 ? "NHWC" : "NCHW" });
  }, 1064272: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("AveragePool", s2, { format: Ie ? "NHWC" : "NCHW", auto_pad: l2, ceil_mode: h2, count_include_pad: f2, storage_order: $, dilations: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [], kernel_shape: B ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(H) >>> 0)) : [], pads: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], strides: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [] });
  }, 1064751: (s2, l2) => {
    e3.$b("GlobalMaxPool", s2, { format: l2 ? "NHWC" : "NCHW" });
  }, 1064838: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("MaxPool", s2, { format: Ie ? "NHWC" : "NCHW", auto_pad: l2, ceil_mode: h2, count_include_pad: f2, storage_order: $, dilations: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [], kernel_shape: B ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(H) >>> 0)) : [], pads: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], strides: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [] });
  }, 1065313: (s2, l2) => {
    e3.$b("GlobalMaxPool", s2, { format: l2 ? "NHWC" : "NCHW" });
  }, 1065400: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie) => {
    e3.$b("MaxPool", s2, { format: Ie ? "NHWC" : "NCHW", auto_pad: l2, ceil_mode: h2, count_include_pad: f2, storage_order: $, dilations: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [], kernel_shape: B ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(H) >>> 0)) : [], pads: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], strides: pe ? Array.from((w(), z).subarray(Number(pe) >>> 0, Number(xe) >>> 0)) : [] });
  }, 1065875: (s2, l2, h2, f2, $) => {
    e3.$b("Gemm", s2, { alpha: l2, beta: h2, transA: f2, transB: $ });
  }, 1065979: (s2) => {
    e3.$b("MatMul", s2, void 0);
  }, 1066033: (s2, l2, h2, f2) => {
    e3.$b("ArgMax", s2, { keepDims: !!l2, selectLastIndex: !!h2, axis: f2 });
  }, 1066141: (s2, l2, h2, f2) => {
    e3.$b("ArgMin", s2, { keepDims: !!l2, selectLastIndex: !!h2, axis: f2 });
  }, 1066249: (s2, l2) => {
    e3.$b("Softmax", s2, { axis: l2 });
  }, 1066312: (s2, l2) => {
    e3.$b("Concat", s2, { axis: l2 });
  }, 1066372: (s2, l2, h2, f2, $) => {
    e3.$b("Split", s2, { axis: l2, numOutputs: h2, splitSizes: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1066528: (s2) => {
    e3.$b("Expand", s2, void 0);
  }, 1066582: (s2, l2) => {
    e3.$b("Gather", s2, { axis: Number(l2) });
  }, 1066653: (s2, l2) => {
    e3.$b("GatherElements", s2, { axis: Number(l2) });
  }, 1066732: (s2, l2) => {
    e3.$b("GatherND", s2, { batch_dims: Number(l2) });
  }, 1066811: (s2, l2, h2, f2, $, C, P, B, H, K, ae) => {
    e3.$b("Resize", s2, { antialias: l2, axes: h2 ? Array.from((w(), z).subarray(Number(h2) >>> 0, Number(f2) >>> 0)) : [], coordinateTransformMode: Ee($), cubicCoeffA: C, excludeOutside: P, extrapolationValue: B, keepAspectRatioPolicy: Ee(H), mode: Ee(K), nearestMode: Ee(ae) });
  }, 1067173: (s2, l2, h2, f2, $, C, P) => {
    e3.$b("Slice", s2, { starts: l2 ? Array.from((w(), z).subarray(Number(l2) >>> 0, Number(h2) >>> 0)) : [], ends: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [], axes: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [] });
  }, 1067437: (s2) => {
    e3.$b("Tile", s2, void 0);
  }, 1067489: (s2, l2, h2) => {
    e3.$b("InstanceNormalization", s2, { epsilon: l2, format: h2 ? "NHWC" : "NCHW" });
  }, 1067603: (s2, l2, h2) => {
    e3.$b("InstanceNormalization", s2, { epsilon: l2, format: h2 ? "NHWC" : "NCHW" });
  }, 1067717: (s2) => {
    e3.$b("Range", s2, void 0);
  }, 1067770: (s2, l2) => {
    e3.$b("Einsum", s2, { equation: Ee(l2) });
  }, 1067851: (s2, l2, h2, f2, $) => {
    e3.$b("Pad", s2, { mode: l2, value: h2, pads: f2 ? Array.from((w(), z).subarray(Number(f2) >>> 0, Number($) >>> 0)) : [] });
  }, 1067994: (s2, l2, h2, f2, $, C) => {
    e3.$b("BatchNormalization", s2, { epsilon: l2, momentum: h2, spatial: !!$, trainingMode: !!f2, format: C ? "NHWC" : "NCHW" });
  }, 1068163: (s2, l2, h2, f2, $, C) => {
    e3.$b("BatchNormalization", s2, { epsilon: l2, momentum: h2, spatial: !!$, trainingMode: !!f2, format: C ? "NHWC" : "NCHW" });
  }, 1068332: (s2, l2, h2) => {
    e3.$b("CumSum", s2, { exclusive: Number(l2), reverse: Number(h2) });
  }, 1068429: (s2, l2, h2) => {
    e3.$b("DequantizeLinear", s2, { axis: l2, blockSize: h2 });
  }, 1068519: (s2, l2, h2, f2, $) => {
    e3.$b("GridSample", s2, { align_corners: l2, mode: Ee(h2), padding_mode: Ee(f2), format: $ ? "NHWC" : "NCHW" });
  }, 1068689: (s2, l2, h2, f2, $) => {
    e3.$b("GridSample", s2, { align_corners: l2, mode: Ee(h2), padding_mode: Ee(f2), format: $ ? "NHWC" : "NCHW" });
  }, 1068859: (s2, l2) => {
    e3.$b("ScatterND", s2, { reduction: Ee(l2) });
  }, 1068944: (s2, l2, h2, f2, $, C, P, B, H) => {
    e3.$b("Attention", s2, { numHeads: l2, isUnidirectional: h2, maskFilterValue: f2, scale: $, doRotary: C, qkvHiddenSizes: P ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(B) + P >>> 0)) : [], pastPresentShareBuffer: !!H });
  }, 1069216: (s2) => {
    e3.$b("BiasAdd", s2, void 0);
  }, 1069271: (s2) => {
    e3.$b("BiasSplitGelu", s2, void 0);
  }, 1069332: (s2) => {
    e3.$b("FastGelu", s2, void 0);
  }, 1069388: (s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie, yt, Gn) => {
    e3.$b("Conv", s2, { format: pe ? "NHWC" : "NCHW", auto_pad: l2, dilations: h2 ? Array.from((w(), z).subarray(Number(h2) >>> 0, Number(f2) >>> 0)) : [], group: $, kernel_shape: C ? Array.from((w(), z).subarray(Number(C) >>> 0, Number(P) >>> 0)) : [], pads: B ? Array.from((w(), z).subarray(Number(B) >>> 0, Number(H) >>> 0)) : [], strides: K ? Array.from((w(), z).subarray(Number(K) >>> 0, Number(ae) >>> 0)) : [], w_is_const: () => !!(w(), N)[Number(xe) >>> 0], activation: Ee(Ie), activation_params: yt ? Array.from((w(), Q).subarray(Number(yt) >>> 0, Number(Gn) >>> 0)) : [] });
  }, 1069972: (s2) => {
    e3.$b("Gelu", s2, void 0);
  }, 1070024: (s2, l2, h2, f2, $, C, P, B, H) => {
    e3.$b("GroupQueryAttention", s2, { numHeads: l2, kvNumHeads: h2, scale: f2, softcap: $, doRotary: C, rotaryInterleaved: P, smoothSoftmax: B, localWindowSize: H });
  }, 1070241: (s2, l2, h2, f2) => {
    e3.$b("LayerNormalization", s2, { axis: l2, epsilon: h2, simplified: !!f2 });
  }, 1070352: (s2, l2, h2, f2) => {
    e3.$b("LayerNormalization", s2, { axis: l2, epsilon: h2, simplified: !!f2 });
  }, 1070463: (s2, l2, h2, f2, $, C) => {
    e3.$b("MatMulNBits", s2, { k: l2, n: h2, accuracyLevel: f2, bits: $, blockSize: C });
  }, 1070590: (s2, l2, h2, f2, $, C) => {
    e3.$b("MultiHeadAttention", s2, { numHeads: l2, isUnidirectional: h2, maskFilterValue: f2, scale: $, doRotary: C });
  }, 1070749: (s2, l2) => {
    e3.$b("QuickGelu", s2, { alpha: l2 });
  }, 1070813: (s2, l2, h2, f2, $) => {
    e3.$b("RotaryEmbedding", s2, { interleaved: !!l2, numHeads: h2, rotaryEmbeddingDim: f2, scale: $ });
  }, 1070952: (s2, l2, h2) => {
    e3.$b("SkipLayerNormalization", s2, { epsilon: l2, simplified: !!h2 });
  }, 1071054: (s2, l2, h2) => {
    e3.$b("SkipLayerNormalization", s2, { epsilon: l2, simplified: !!h2 });
  }, 1071156: (s2, l2, h2, f2) => {
    e3.$b("GatherBlockQuantized", s2, { gatherAxis: l2, quantizeAxis: h2, blockSize: f2 });
  }, 1071277: (s2) => {
    e3.Fd(s2);
  }, 1071311: (s2, l2) => e3.Hd(Number(s2), Number(l2), e3.Xc.Kd, e3.Xc.errors) };
  function Nm(s2, l2, h2) {
    return $i(async () => {
      await e3.Dd(Number(s2), Number(l2), Number(h2));
    });
  }
  function Vm() {
    return typeof wasmOffsetConverter < "u";
  }
  function Lm(s2, l2, h2, f2) {
    var $ = de();
    try {
      return na(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function Wm(s2, l2, h2) {
    var f2 = de();
    try {
      return Ji(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      ce(1, 0);
    }
  }
  function Gm(s2) {
    var l2 = de();
    try {
      Qi(s2);
    } catch (h2) {
      if (ue(l2), h2 !== h2 + 0) throw h2;
      ce(1, 0);
    }
  }
  function Hm(s2, l2) {
    var h2 = de();
    try {
      return Ln(s2, l2);
    } catch (f2) {
      if (ue(h2), f2 !== f2 + 0) throw f2;
      ce(1, 0);
    }
  }
  function Fm(s2, l2, h2) {
    var f2 = de();
    try {
      Zi(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      ce(1, 0);
    }
  }
  function qm(s2, l2) {
    var h2 = de();
    try {
      oa(s2, l2);
    } catch (f2) {
      if (ue(h2), f2 !== f2 + 0) throw f2;
      ce(1, 0);
    }
  }
  function Km(s2, l2, h2, f2, $, C, P) {
    var B = de();
    try {
      return ta(s2, l2, h2, f2, $, C, P);
    } catch (H) {
      if (ue(B), H !== H + 0) throw H;
      ce(1, 0);
    }
  }
  function jm(s2, l2, h2, f2, $, C) {
    var P = de();
    try {
      Xi(s2, l2, h2, f2, $, C);
    } catch (B) {
      if (ue(P), B !== B + 0) throw B;
      ce(1, 0);
    }
  }
  function Zm(s2, l2, h2, f2) {
    var $ = de();
    try {
      ra(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function Qm(s2, l2, h2, f2, $) {
    var C = de();
    try {
      Yi(s2, l2, h2, f2, $);
    } catch (P) {
      if (ue(C), P !== P + 0) throw P;
      ce(1, 0);
    }
  }
  function Xm(s2, l2, h2, f2, $, C, P) {
    var B = de();
    try {
      aa(s2, l2, h2, f2, $, C, P);
    } catch (H) {
      if (ue(B), H !== H + 0) throw H;
      ce(1, 0);
    }
  }
  function Ym(s2, l2, h2, f2, $, C, P) {
    var B = de();
    try {
      sa(s2, l2, h2, f2, $, C, P);
    } catch (H) {
      if (ue(B), H !== H + 0) throw H;
      ce(1, 0);
    }
  }
  function Jm(s2, l2, h2, f2, $, C, P, B) {
    var H = de();
    try {
      ca(s2, l2, h2, f2, $, C, P, B);
    } catch (K) {
      if (ue(H), K !== K + 0) throw K;
      ce(1, 0);
    }
  }
  function ef(s2, l2, h2, f2, $) {
    var C = de();
    try {
      return ia(s2, l2, h2, f2, $);
    } catch (P) {
      if (ue(C), P !== P + 0) throw P;
      ce(1, 0);
    }
  }
  function tf(s2, l2, h2) {
    var f2 = de();
    try {
      return pa(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      ce(1, 0);
    }
  }
  function rf(s2, l2, h2, f2, $, C, P, B) {
    var H = de();
    try {
      ma(s2, l2, h2, f2, $, C, P, B);
    } catch (K) {
      if (ue(H), K !== K + 0) throw K;
      ce(1, 0);
    }
  }
  function nf(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe) {
    var xe = de();
    try {
      ua(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe);
    } catch (Ie) {
      if (ue(xe), Ie !== Ie + 0) throw Ie;
      ce(1, 0);
    }
  }
  function of(s2, l2, h2) {
    var f2 = de();
    try {
      return fa(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      return ce(1, 0), 0n;
    }
  }
  function af(s2, l2, h2, f2, $, C, P, B, H) {
    var K = de();
    try {
      ea(s2, l2, h2, f2, $, C, P, B, H);
    } catch (ae) {
      if (ue(K), ae !== ae + 0) throw ae;
      ce(1, 0);
    }
  }
  function sf(s2) {
    var l2 = de();
    try {
      return ha(s2);
    } catch (h2) {
      if (ue(l2), h2 !== h2 + 0) throw h2;
      ce(1, 0);
    }
  }
  function uf(s2, l2) {
    var h2 = de();
    try {
      return ka(s2, l2);
    } catch (f2) {
      if (ue(h2), f2 !== f2 + 0) throw f2;
      return ce(1, 0), 0n;
    }
  }
  function df(s2) {
    var l2 = de();
    try {
      return ga(s2);
    } catch (h2) {
      if (ue(l2), h2 !== h2 + 0) throw h2;
      return ce(1, 0), 0n;
    }
  }
  function lf(s2, l2, h2, f2) {
    var $ = de();
    try {
      return va(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function cf(s2, l2, h2, f2, $) {
    var C = de();
    try {
      return xa(s2, l2, h2, f2, $);
    } catch (P) {
      if (ue(C), P !== P + 0) throw P;
      ce(1, 0);
    }
  }
  function pf(s2, l2, h2, f2, $, C) {
    var P = de();
    try {
      return Sa(s2, l2, h2, f2, $, C);
    } catch (B) {
      if (ue(P), B !== B + 0) throw B;
      ce(1, 0);
    }
  }
  function mf(s2, l2, h2, f2, $, C) {
    var P = de();
    try {
      return da(s2, l2, h2, f2, $, C);
    } catch (B) {
      if (ue(P), B !== B + 0) throw B;
      ce(1, 0);
    }
  }
  function ff(s2, l2, h2, f2, $, C) {
    var P = de();
    try {
      return Ta(s2, l2, h2, f2, $, C);
    } catch (B) {
      if (ue(P), B !== B + 0) throw B;
      ce(1, 0);
    }
  }
  function hf(s2, l2, h2, f2, $, C, P, B) {
    var H = de();
    try {
      return la(s2, l2, h2, f2, $, C, P, B);
    } catch (K) {
      if (ue(H), K !== K + 0) throw K;
      ce(1, 0);
    }
  }
  function gf(s2, l2, h2, f2, $) {
    var C = de();
    try {
      return Ia(s2, l2, h2, f2, $);
    } catch (P) {
      if (ue(C), P !== P + 0) throw P;
      return ce(1, 0), 0n;
    }
  }
  function bf(s2, l2, h2, f2) {
    var $ = de();
    try {
      return Ca(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function yf(s2, l2, h2, f2) {
    var $ = de();
    try {
      return Aa(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function _f(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe) {
    var xe = de();
    try {
      return Ea(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe);
    } catch (Ie) {
      if (ue(xe), Ie !== Ie + 0) throw Ie;
      ce(1, 0);
    }
  }
  function wf(s2, l2, h2, f2, $, C, P, B, H, K, ae) {
    var pe = de();
    try {
      wa(s2, l2, h2, f2, $, C, P, B, H, K, ae);
    } catch (xe) {
      if (ue(pe), xe !== xe + 0) throw xe;
      ce(1, 0);
    }
  }
  function $f(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie, yt, Gn) {
    var Tf = de();
    try {
      $a(s2, l2, h2, f2, $, C, P, B, H, K, ae, pe, xe, Ie, yt, Gn);
    } catch (Hn) {
      if (ue(Tf), Hn !== Hn + 0) throw Hn;
      ce(1, 0);
    }
  }
  function vf(s2, l2, h2) {
    var f2 = de();
    try {
      return ba(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      ce(1, 0);
    }
  }
  function xf(s2, l2, h2) {
    var f2 = de();
    try {
      return ya(s2, l2, h2);
    } catch ($) {
      if (ue(f2), $ !== $ + 0) throw $;
      ce(1, 0);
    }
  }
  function Sf(s2, l2, h2, f2) {
    var $ = de();
    try {
      _a(s2, l2, h2, f2);
    } catch (C) {
      if (ue($), C !== C + 0) throw C;
      ce(1, 0);
    }
  }
  function Sr() {
    if (0 < ge) Te = Sr;
    else if (o2) _?.(e3), $e();
    else {
      for (var s2 = Oe; 0 < s2.length; ) s2.shift()(e3);
      0 < ge ? Te = Sr : (e3.calledRun = true, A || ($e(), _?.(e3)));
    }
  }
  return o2 || (ct = await be(), Sr()), e3.PTR_SIZE = 4, le ? e3 : new Promise((s2, l2) => {
    _ = s2, S = l2;
  });
}
var Df;
var zf;
var gs = V(() => {
  "use strict";
  Df = fs, zf = globalThis.self?.name?.startsWith("em-pthread");
  zf && fs();
});
var _s;
var to;
var Bf;
var We;
var ws;
var eo;
var Mf;
var Rf;
var $s;
var Uf;
var bs;
var vs;
var ys;
var xs;
var kr = V(() => {
  "use strict";
  Er();
  _s = typeof location > "u" ? void 0 : location.origin, to = import.meta.url > "file:" && import.meta.url < "file;", Bf = () => {
    if (true) {
      if (to) {
        let t2 = URL;
        return new URL(new t2("ort.bundle.min.mjs", import.meta.url).href, _s).href;
      }
      return import.meta.url;
    }
  }, We = Bf(), ws = () => {
    if (We && !We.startsWith("blob:")) return We.substring(0, We.lastIndexOf("/") + 1);
  }, eo = (t2, e3) => {
    try {
      let r2 = e3 ?? We;
      return (r2 ? new URL(t2, r2) : new URL(t2)).origin === _s;
    } catch {
      return false;
    }
  }, Mf = (t2, e3) => {
    let r2 = e3 ?? We;
    try {
      return (r2 ? new URL(t2, r2) : new URL(t2)).href;
    } catch {
      return;
    }
  }, Rf = (t2, e3) => `${e3 ?? "./"}${t2}`, $s = async (t2) => {
    let r2 = await (await fetch(t2, { credentials: "same-origin" })).blob();
    return URL.createObjectURL(r2);
  }, Uf = async (t2) => (await import(
    /*webpackIgnore:true*/
    /*@vite-ignore*/
    t2
  )).default, bs = (ms(), er(ps)).default, vs = async () => {
    if (!We) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
    if (eo(We)) return [void 0, bs()];
    let t2 = await $s(We);
    return [t2, bs(t2)];
  }, ys = (gs(), er(hs)).default, xs = async (t2, e3, r2, n2) => {
    let o2 = ys && !(t2 || e3);
    if (o2) if (We) o2 = eo(We) || n2 && !r2;
    else if (n2 && !r2) o2 = true;
    else throw new Error("cannot determine the script source URL.");
    if (o2) return [void 0, ys];
    {
      let i2 = "ort-wasm-simd-threaded.jsep.mjs", a2 = t2 ?? Mf(i2, e3), u2 = r2 && a2 && !eo(a2, e3), d2 = u2 ? await $s(a2) : a2 ?? Rf(i2, e3);
      return [u2 ? d2 : void 0, await Uf(d2)];
    }
  };
});
var ro;
var no;
var Nr;
var Ss;
var Nf;
var Vf;
var Lf;
var Pr;
var ye;
var $t = V(() => {
  "use strict";
  kr();
  no = false, Nr = false, Ss = false, Nf = () => {
    if (typeof SharedArrayBuffer > "u") return false;
    try {
      return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
    } catch {
      return false;
    }
  }, Vf = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
    } catch {
      return false;
    }
  }, Lf = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
    } catch {
      return false;
    }
  }, Pr = async (t2) => {
    if (no) return Promise.resolve();
    if (Nr) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
    if (Ss) throw new Error("previous call to 'initializeWebAssembly()' failed.");
    Nr = true;
    let e3 = t2.initTimeout, r2 = t2.numThreads;
    if (t2.simd !== false) {
      if (t2.simd === "relaxed") {
        if (!Lf()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
      } else if (!Vf()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
    }
    let n2 = Nf();
    r2 > 1 && !n2 && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + r2 + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), t2.numThreads = r2 = 1);
    let o2 = t2.wasmPaths, i2 = typeof o2 == "string" ? o2 : void 0, a2 = o2?.mjs, u2 = a2?.href ?? a2, d2 = o2?.wasm, c2 = d2?.href ?? d2, p2 = t2.wasmBinary, [m2, g2] = await xs(u2, i2, r2 > 1, !!p2 || !!c2), y = false, b = [];
    if (e3 > 0 && b.push(new Promise((_) => {
      setTimeout(() => {
        y = true, _();
      }, e3);
    })), b.push(new Promise((_, S) => {
      let x = { numThreads: r2 };
      if (p2) x.wasmBinary = p2, x.locateFile = (v) => v;
      else if (c2 || i2) x.locateFile = (v) => c2 ?? i2 + v;
      else if (u2 && u2.indexOf("blob:") !== 0) x.locateFile = (v) => new URL(v, u2).href;
      else if (m2) {
        let v = ws();
        v && (x.locateFile = (T) => v + T);
      }
      g2(x).then((v) => {
        Nr = false, no = true, ro = v, _(), m2 && URL.revokeObjectURL(m2);
      }, (v) => {
        Nr = false, Ss = true, S(v);
      });
    })), await Promise.race(b), y) throw new Error(`WebAssembly backend initializing failed due to timeout: ${e3}ms`);
  }, ye = () => {
    if (no && ro) return ro;
    throw new Error("WebAssembly is not initialized yet.");
  };
});
var Ge;
var nr;
var me;
var Vr = V(() => {
  "use strict";
  $t();
  Ge = (t2, e3) => {
    let r2 = ye(), n2 = r2.lengthBytesUTF8(t2) + 1, o2 = r2._malloc(n2);
    return r2.stringToUTF8(t2, o2, n2), e3.push(o2), o2;
  }, nr = (t2, e3, r2, n2) => {
    if (typeof t2 == "object" && t2 !== null) {
      if (r2.has(t2)) throw new Error("Circular reference in options");
      r2.add(t2);
    }
    Object.entries(t2).forEach(([o2, i2]) => {
      let a2 = e3 ? e3 + o2 : o2;
      if (typeof i2 == "object") nr(i2, a2 + ".", r2, n2);
      else if (typeof i2 == "string" || typeof i2 == "number") n2(a2, i2.toString());
      else if (typeof i2 == "boolean") n2(a2, i2 ? "1" : "0");
      else throw new Error(`Can't handle extra config type: ${typeof i2}`);
    });
  }, me = (t2) => {
    let e3 = ye(), r2 = e3.stackSave();
    try {
      let n2 = e3.PTR_SIZE, o2 = e3.stackAlloc(2 * n2);
      e3._OrtGetLastError(o2, o2 + n2);
      let i2 = Number(e3.getValue(o2, n2 === 4 ? "i32" : "i64")), a2 = e3.getValue(o2 + n2, "*"), u2 = a2 ? e3.UTF8ToString(a2) : "";
      throw new Error(`${t2} ERROR_CODE: ${i2}, ERROR_MESSAGE: ${u2}`);
    } finally {
      e3.stackRestore(r2);
    }
  };
});
var Ts;
var Is = V(() => {
  "use strict";
  $t();
  Vr();
  Ts = (t2) => {
    let e3 = ye(), r2 = 0, n2 = [], o2 = t2 || {};
    try {
      if (t2?.logSeverityLevel === void 0) o2.logSeverityLevel = 2;
      else if (typeof t2.logSeverityLevel != "number" || !Number.isInteger(t2.logSeverityLevel) || t2.logSeverityLevel < 0 || t2.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${t2.logSeverityLevel}`);
      if (t2?.logVerbosityLevel === void 0) o2.logVerbosityLevel = 0;
      else if (typeof t2.logVerbosityLevel != "number" || !Number.isInteger(t2.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${t2.logVerbosityLevel}`);
      t2?.terminate === void 0 && (o2.terminate = false);
      let i2 = 0;
      return t2?.tag !== void 0 && (i2 = Ge(t2.tag, n2)), r2 = e3._OrtCreateRunOptions(o2.logSeverityLevel, o2.logVerbosityLevel, !!o2.terminate, i2), r2 === 0 && me("Can't create run options."), t2?.extra !== void 0 && nr(t2.extra, "", /* @__PURE__ */ new WeakSet(), (a2, u2) => {
        let d2 = Ge(a2, n2), c2 = Ge(u2, n2);
        e3._OrtAddRunConfigEntry(r2, d2, c2) !== 0 && me(`Can't set a run config entry: ${a2} - ${u2}.`);
      }), [r2, n2];
    } catch (i2) {
      throw r2 !== 0 && e3._OrtReleaseRunOptions(r2), n2.forEach((a2) => e3._free(a2)), i2;
    }
  };
});
var Wf;
var Gf;
var Hf;
var Gt;
var Ff;
var Cs;
var As = V(() => {
  "use strict";
  $t();
  Vr();
  Wf = (t2) => {
    switch (t2) {
      case "disabled":
        return 0;
      case "basic":
        return 1;
      case "extended":
        return 2;
      case "layout":
        return 3;
      case "all":
        return 99;
      default:
        throw new Error(`unsupported graph optimization level: ${t2}`);
    }
  }, Gf = (t2) => {
    switch (t2) {
      case "sequential":
        return 0;
      case "parallel":
        return 1;
      default:
        throw new Error(`unsupported execution mode: ${t2}`);
    }
  }, Hf = (t2) => {
    t2.extra || (t2.extra = {}), t2.extra.session || (t2.extra.session = {});
    let e3 = t2.extra.session;
    e3.use_ort_model_bytes_directly || (e3.use_ort_model_bytes_directly = "1"), t2.executionProviders && t2.executionProviders.some((r2) => (typeof r2 == "string" ? r2 : r2.name) === "webgpu") && (t2.enableMemPattern = false);
  }, Gt = (t2, e3, r2, n2) => {
    let o2 = Ge(e3, n2), i2 = Ge(r2, n2);
    ye()._OrtAddSessionConfigEntry(t2, o2, i2) !== 0 && me(`Can't set a session config entry: ${e3} - ${r2}.`);
  }, Ff = async (t2, e3, r2) => {
    let n2 = e3.executionProviders;
    for (let o2 of n2) {
      let i2 = typeof o2 == "string" ? o2 : o2.name, a2 = [];
      switch (i2) {
        case "webnn":
          if (i2 = "WEBNN", Gt(t2, "session.disable_quant_qdq", "1", r2), Gt(t2, "session.disable_qdq_constant_folding", "1", r2), typeof o2 != "string") {
            let g2 = o2?.deviceType;
            g2 && Gt(t2, "deviceType", g2, r2);
          }
          break;
        case "webgpu":
          if (i2 = "JS", typeof o2 != "string") {
            let m2 = o2;
            if (m2?.preferredLayout) {
              if (m2.preferredLayout !== "NCHW" && m2.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${m2.preferredLayout}`);
              Gt(t2, "preferredLayout", m2.preferredLayout, r2);
            }
          }
          break;
        case "wasm":
        case "cpu":
          continue;
        default:
          throw new Error(`not supported execution provider: ${i2}`);
      }
      let u2 = Ge(i2, r2), d2 = a2.length, c2 = 0, p2 = 0;
      if (d2 > 0) {
        c2 = ye()._malloc(d2 * ye().PTR_SIZE), r2.push(c2), p2 = ye()._malloc(d2 * ye().PTR_SIZE), r2.push(p2);
        for (let m2 = 0; m2 < d2; m2++) ye().setValue(c2 + m2 * ye().PTR_SIZE, a2[m2][0], "*"), ye().setValue(p2 + m2 * ye().PTR_SIZE, a2[m2][1], "*");
      }
      await ye()._OrtAppendExecutionProvider(t2, u2, c2, p2, d2) !== 0 && me(`Can't append execution provider: ${i2}.`);
    }
  }, Cs = async (t2) => {
    let e3 = ye(), r2 = 0, n2 = [], o2 = t2 || {};
    Hf(o2);
    try {
      let i2 = Wf(o2.graphOptimizationLevel ?? "all"), a2 = Gf(o2.executionMode ?? "sequential"), u2 = typeof o2.logId == "string" ? Ge(o2.logId, n2) : 0, d2 = o2.logSeverityLevel ?? 2;
      if (!Number.isInteger(d2) || d2 < 0 || d2 > 4) throw new Error(`log severity level is not valid: ${d2}`);
      let c2 = o2.logVerbosityLevel ?? 0;
      if (!Number.isInteger(c2) || c2 < 0 || c2 > 4) throw new Error(`log verbosity level is not valid: ${c2}`);
      let p2 = typeof o2.optimizedModelFilePath == "string" ? Ge(o2.optimizedModelFilePath, n2) : 0;
      if (r2 = e3._OrtCreateSessionOptions(i2, !!o2.enableCpuMemArena, !!o2.enableMemPattern, a2, !!o2.enableProfiling, 0, u2, d2, c2, p2), r2 === 0 && me("Can't create session options."), o2.executionProviders && await Ff(r2, o2, n2), o2.enableGraphCapture !== void 0) {
        if (typeof o2.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${o2.enableGraphCapture}`);
        Gt(r2, "enableGraphCapture", o2.enableGraphCapture.toString(), n2);
      }
      if (o2.freeDimensionOverrides) for (let [m2, g2] of Object.entries(o2.freeDimensionOverrides)) {
        if (typeof m2 != "string") throw new Error(`free dimension override name must be a string: ${m2}`);
        if (typeof g2 != "number" || !Number.isInteger(g2) || g2 < 0) throw new Error(`free dimension override value must be a non-negative integer: ${g2}`);
        let y = Ge(m2, n2);
        e3._OrtAddFreeDimensionOverride(r2, y, g2) !== 0 && me(`Can't set a free dimension override: ${m2} - ${g2}.`);
      }
      return o2.extra !== void 0 && nr(o2.extra, "", /* @__PURE__ */ new WeakSet(), (m2, g2) => {
        Gt(r2, m2, g2, n2);
      }), [r2, n2];
    } catch (i2) {
      throw r2 !== 0 && e3._OrtReleaseSessionOptions(r2) !== 0 && me("Can't release session options."), n2.forEach((a2) => e3._free(a2)), i2;
    }
  };
});
var vt;
var rt;
var xt;
var Ht;
var or;
var Lr;
var Wr;
var oo;
var ee = V(() => {
  "use strict";
  vt = (t2) => {
    switch (t2) {
      case "int8":
        return 3;
      case "uint8":
        return 2;
      case "bool":
        return 9;
      case "int16":
        return 5;
      case "uint16":
        return 4;
      case "int32":
        return 6;
      case "uint32":
        return 12;
      case "float16":
        return 10;
      case "float32":
        return 1;
      case "float64":
        return 11;
      case "string":
        return 8;
      case "int64":
        return 7;
      case "uint64":
        return 13;
      case "int4":
        return 22;
      case "uint4":
        return 21;
      default:
        throw new Error(`unsupported data type: ${t2}`);
    }
  }, rt = (t2) => {
    switch (t2) {
      case 3:
        return "int8";
      case 2:
        return "uint8";
      case 9:
        return "bool";
      case 5:
        return "int16";
      case 4:
        return "uint16";
      case 6:
        return "int32";
      case 12:
        return "uint32";
      case 10:
        return "float16";
      case 1:
        return "float32";
      case 11:
        return "float64";
      case 8:
        return "string";
      case 7:
        return "int64";
      case 13:
        return "uint64";
      case 22:
        return "int4";
      case 21:
        return "uint4";
      default:
        throw new Error(`unsupported data type: ${t2}`);
    }
  }, xt = (t2, e3) => {
    let r2 = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][t2], n2 = typeof e3 == "number" ? e3 : e3.reduce((o2, i2) => o2 * i2, 1);
    return r2 > 0 ? Math.ceil(n2 * r2) : void 0;
  }, Ht = (t2) => {
    switch (t2) {
      case "float16":
        return typeof Float16Array < "u" ? Float16Array : Uint16Array;
      case "float32":
        return Float32Array;
      case "uint8":
        return Uint8Array;
      case "int8":
        return Int8Array;
      case "uint16":
        return Uint16Array;
      case "int16":
        return Int16Array;
      case "int32":
        return Int32Array;
      case "bool":
        return Uint8Array;
      case "float64":
        return Float64Array;
      case "uint32":
        return Uint32Array;
      case "int64":
        return BigInt64Array;
      case "uint64":
        return BigUint64Array;
      default:
        throw new Error(`unsupported type: ${t2}`);
    }
  }, or = (t2) => {
    switch (t2) {
      case "verbose":
        return 0;
      case "info":
        return 1;
      case "warning":
        return 2;
      case "error":
        return 3;
      case "fatal":
        return 4;
      default:
        throw new Error(`unsupported logging level: ${t2}`);
    }
  }, Lr = (t2) => t2 === "float32" || t2 === "float16" || t2 === "int32" || t2 === "int64" || t2 === "uint32" || t2 === "uint8" || t2 === "bool" || t2 === "uint4" || t2 === "int4", Wr = (t2) => t2 === "float32" || t2 === "float16" || t2 === "int32" || t2 === "int64" || t2 === "uint32" || t2 === "uint64" || t2 === "int8" || t2 === "uint8" || t2 === "bool" || t2 === "uint4" || t2 === "int4", oo = (t2) => {
    switch (t2) {
      case "none":
        return 0;
      case "cpu":
        return 1;
      case "cpu-pinned":
        return 2;
      case "texture":
        return 3;
      case "gpu-buffer":
        return 4;
      case "ml-tensor":
        return 5;
      default:
        throw new Error(`unsupported data location: ${t2}`);
    }
  };
});
var ir;
var io = V(() => {
  "use strict";
  Er();
  ir = async (t2) => {
    if (typeof t2 == "string") if (false) try {
      let { readFile: e3 } = qn("node:fs/promises");
      return new Uint8Array(await e3(t2));
    } catch (e3) {
      if (e3.code === "ERR_FS_FILE_TOO_LARGE") {
        let { createReadStream: r2 } = qn("node:fs"), n2 = r2(t2), o2 = [];
        for await (let i2 of n2) o2.push(i2);
        return new Uint8Array(Buffer.concat(o2));
      }
      throw e3;
    }
    else {
      let e3 = await fetch(t2);
      if (!e3.ok) throw new Error(`failed to load external data file: ${t2}`);
      let r2 = e3.headers.get("Content-Length"), n2 = r2 ? parseInt(r2, 10) : 0;
      if (n2 < 1073741824) return new Uint8Array(await e3.arrayBuffer());
      {
        if (!e3.body) throw new Error(`failed to load external data file: ${t2}, no response body.`);
        let o2 = e3.body.getReader(), i2;
        try {
          i2 = new ArrayBuffer(n2);
        } catch (u2) {
          if (u2 instanceof RangeError) {
            let d2 = Math.ceil(n2 / 65536);
            i2 = new WebAssembly.Memory({ initial: d2, maximum: d2 }).buffer;
          } else throw u2;
        }
        let a2 = 0;
        for (; ; ) {
          let { done: u2, value: d2 } = await o2.read();
          if (u2) break;
          let c2 = d2.byteLength;
          new Uint8Array(i2, a2, c2).set(d2), a2 += c2;
        }
        return new Uint8Array(i2, 0, n2);
      }
    }
    else return t2 instanceof Blob ? new Uint8Array(await t2.arrayBuffer()) : t2 instanceof Uint8Array ? t2 : new Uint8Array(t2);
  };
});
var qf;
var Kf;
var Es;
var ks;
var Gr;
var jf;
var se;
var nt = V(() => {
  "use strict";
  ee();
  qf = ["V", "I", "W", "E", "F"], Kf = (t2, e3) => {
    console.log(`[${qf[t2]},${(/* @__PURE__ */ new Date()).toISOString()}]${e3}`);
  }, Gr = (t2, e3) => {
    Es = t2, ks = e3;
  }, jf = (t2, e3) => {
    let r2 = or(t2), n2 = or(Es);
    r2 >= n2 && Kf(r2, typeof e3 == "function" ? e3() : e3);
  }, se = (...t2) => {
    ks && jf(...t2);
  };
});
var ao;
var ot;
var k;
var zt;
var Hr;
var Ps;
var Os;
var te = V(() => {
  "use strict";
  ao = class {
    static calcMatMulShape(e3, r2) {
      return e3[1] !== r2[0] ? void 0 : [e3[0], r2[1]];
    }
  }, ot = class {
    static calcShape(e3, r2, n2 = false) {
      let o2 = e3.length, i2 = r2.length;
      if (o2 === 0) return r2;
      if (i2 === 0) return e3;
      let a2 = Math.max(e3.length, r2.length), u2 = new Array(a2);
      if (n2) {
        if (o2 < 2 || i2 < 2) return;
        let d2 = ao.calcMatMulShape([e3[o2 - 2], e3[o2 - 1]], [r2[i2 - 2], r2[i2 - 1]]);
        if (d2 === void 0) return;
        [u2[a2 - 2], u2[a2 - 1]] = d2;
      }
      for (let d2 = n2 ? 3 : 1; d2 <= a2; d2++) {
        let c2 = o2 - d2 < 0 ? 1 : e3[o2 - d2], p2 = i2 - d2 < 0 ? 1 : r2[i2 - d2];
        if (c2 !== p2 && c2 > 1 && p2 > 1) return;
        let m2 = Math.max(c2, p2);
        if (c2 && p2) u2[a2 - d2] = Math.max(c2, p2);
        else {
          if (m2 > 1) return;
          u2[a2 - d2] = 0;
        }
      }
      return u2;
    }
    static isValidBroadcast(e3, r2) {
      let n2 = e3.length, o2 = r2.length;
      if (n2 > o2) return false;
      for (let i2 = 1; i2 <= n2; i2++) if (e3[n2 - i2] !== 1 && e3[n2 - i2] !== r2[o2 - i2]) return false;
      return true;
    }
  }, k = class t2 {
    static size(e3) {
      return t2.getSizeFromDimensionRange(e3, 0, e3.length);
    }
    static convertShape(e3, r2 = 4) {
      let n2 = e3.length;
      if (n2 === 0) return [];
      let o2 = new Array(n2), i2 = n2 - 1;
      for (; i2 >= 0; ) {
        if (e3[i2] % r2 === 0) {
          o2[i2] = e3[i2] / r2;
          break;
        }
        if (r2 % e3[i2] !== 0) throw new Error("cannot convert shape");
        o2[i2] = 1, r2 /= e3[i2], i2--;
      }
      for (i2--; i2 >= 0; i2--) o2[i2] = e3[i2];
      return o2;
    }
    static sizeFromDimension(e3, r2) {
      if (r2 < 0 || r2 > e3.length) throw new Error(`invalid dimension of ${r2} for sizeFromDimension as Tensor has ${e3.length} dimensions.`);
      return t2.getSizeFromDimensionRange(e3, r2, e3.length);
    }
    static sizeToDimension(e3, r2) {
      if (r2 < 0 || r2 > e3.length) throw new Error(`invalid dimension of ${r2} for sizeToDimension as Tensor has ${e3.length} dimensions.`);
      return t2.getSizeFromDimensionRange(e3, 0, r2);
    }
    static getSizeFromDimensionRange(e3, r2, n2) {
      let o2 = 1;
      for (let i2 = r2; i2 < n2; i2++) {
        if (e3[i2] < 0) throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");
        o2 *= Number(e3[i2]);
      }
      return o2;
    }
    static computeStrides(e3) {
      let r2 = e3.length;
      if (r2 === 0) return [];
      if (r2 === 1) return [1];
      let n2 = new Array(r2);
      n2[r2 - 1] = 1, n2[r2 - 2] = e3[r2 - 1];
      for (let o2 = r2 - 3; o2 >= 0; --o2) n2[o2] = n2[o2 + 1] * e3[o2 + 1];
      return n2;
    }
    static normalizeAxis(e3, r2) {
      if (e3 < -r2 && e3 >= r2) throw new Error("unsupported axis for this operation.");
      return e3 < 0 ? e3 + r2 : e3;
    }
    static normalizeAxes(e3, r2) {
      return e3.map((n2) => this.normalizeAxis(n2, r2 ?? e3.length));
    }
    static sortBasedOnPerm(e3, r2) {
      return r2 ? r2.map((n2) => e3[n2]) : e3.slice().reverse();
    }
    static padShape(e3, r2) {
      let n2 = e3.length;
      return e3.map((o2, i2) => o2 + r2[i2] + r2[i2 + n2]);
    }
    static areEqual(e3, r2) {
      return e3.length !== r2.length ? false : e3.every((n2, o2) => n2 === r2[o2]);
    }
  }, zt = class t2 {
    static adjustPoolAttributes(e3, r2, n2, o2, i2, a2) {
      if (!e3 && n2.length !== r2.length - 2) throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");
      if (e3) for (let u2 = 0; u2 < r2.length - 2; u2++) u2 >= n2.length ? n2.push(r2[u2 + 2]) : n2[u2] = r2[u2 + 2];
      for (let u2 = 0; u2 < n2.length; u2++) if (u2 < o2.length) {
        if (o2[u2] < 0) throw new Error("strides should be greater than or equal to 1");
      } else o2.push(1);
      for (let u2 = 0; u2 < n2.length; u2++) if (u2 < i2.length) {
        if (i2[u2] < 0) throw new Error("dilations should be greater than or equal to 1");
      } else i2.push(1);
      for (let u2 = 0; u2 < n2.length * 2; u2++) if (u2 < a2.length) {
        if (a2[u2] < 0) throw new Error("pad should be greater than or equal to 1");
      } else a2.push(0);
      for (let u2 = 0; u2 < n2.length; u2++) {
        if (n2[u2] <= 0) throw new Error("kernel shapes need to be greater than 0");
        if (a2[u2] >= n2[u2] || a2[u2 + n2.length] >= n2[u2]) throw new Error("pads should be smaller than kernel");
      }
    }
    static adjustPadsBasedOnAutoPad(e3, r2, n2, o2, i2, a2, u2) {
      if (u2) {
        if (i2.length !== 2 * (e3.length - 2)) throw new Error("length of pads should be twice the length of data dimensions");
        if (r2.length !== e3.length - 2) throw new Error("length of strides should be the length of data dimensions");
        if (o2.length !== e3.length - 2) throw new Error("length of kernel shapes should be the length of data dimensions");
        for (let d2 = 0; d2 < e3.length - 2; d2++) t2.adjustPadAndReturnShape(e3[d2 + (a2 ? 1 : 2)], r2[d2], n2[d2], o2[d2], i2, d2, d2 + e3.length - 2, u2);
      }
    }
    static computePoolOutputShape(e3, r2, n2, o2, i2, a2, u2, d2 = 0) {
      if (r2.length <= 0) throw new Error("input shape must be of size greater than 0");
      let c2 = [r2[0], r2[1]];
      return t2.computeShapeHelper(e3, r2, c2, n2, o2, i2, a2, u2, d2), c2;
    }
    static computeConvOutputShape(e3, r2, n2, o2, i2, a2, u2) {
      if (e3.length <= 0 || r2.length <= 0) throw new Error("invalid input tensor dims or invalid filter tensor dims");
      let d2 = [e3[0], r2[0]];
      return t2.computeShapeHelper(false, e3, d2, n2, o2, i2, a2, u2), d2;
    }
    static computeShapeHelper(e3, r2, n2, o2, i2, a2, u2, d2, c2 = 0) {
      if (e3) for (let p2 = 0; p2 < r2.length - 2; p2++) n2.push(1);
      else for (let p2 = 0; p2 < r2.length - 2; p2++) n2.push(t2.adjustPadAndReturnShape(r2[p2 + 2], o2[p2], i2[p2], a2[p2], u2, p2, p2 + r2.length - 2, d2, c2));
    }
    static computeOutputSize(e3, r2, n2, o2, i2) {
      let a2 = Math.floor(e3 / r2) + 1;
      return i2 === 1 && (a2 = Math.ceil(e3 / r2) + 1, (a2 - 1) * r2 >= n2 + o2 && (a2 -= 1)), a2;
    }
    static adjustPadAndReturnShape(e3, r2, n2, o2, i2, a2, u2, d2, c2 = 0) {
      let p2 = n2 * (o2 - 1) + 1;
      if (d2 && d2 !== "NOTSET") switch (d2) {
        case "VALID":
          return i2[a2] = 0, i2[u2] = 0, t2.computeOutputSize(e3 - p2, r2, e3, 0, c2);
        case "SAME_LOWER":
        case "SAME_UPPER":
          if (n2 !== 1) throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");
          {
            let g2 = (Math.floor((e3 + r2 - 1) / r2) - 1) * r2 + o2 - e3;
            return i2[a2] = Math.floor(d2 === "SAME_LOWER" ? (g2 + 1) / 2 : g2 / 2), i2[u2] = g2 - i2[a2], t2.computeOutputSize(e3 + i2[a2] + i2[u2] - p2, r2, e3, i2[a2], c2);
          }
        default:
          throw new Error("Unsupported AutoPad type");
      }
      else return t2.computeOutputSize(e3 + i2[a2] + i2[u2] - p2, r2, e3, i2[a2], c2);
    }
  }, Hr = class {
    static getShapeOfGemmResult(e3, r2, n2, o2, i2) {
      if (e3.length !== 2 || n2.length !== 2) throw new Error("shape need to be of size 2");
      let a2, u2, d2;
      r2 ? (a2 = e3[1], u2 = e3[0]) : (a2 = e3[0], u2 = e3[1]);
      let c2 = -1;
      if (o2 ? (d2 = n2[0], c2 = 1) : (d2 = n2[1], c2 = 0), n2[c2] !== u2) throw new Error("dimension mismatch");
      if (a2 <= 0 || d2 <= 0 || u2 <= 0) throw new Error("invalid shape specified");
      if (i2 && !ot.isValidBroadcast(i2, [a2, d2])) throw new Error("gemm: invalid bias shape for broadcast");
      return [a2, d2, u2];
    }
  }, Ps = -34028234663852886e22, Os = 34028234663852886e22;
});
var Fr;
var so = V(() => {
  "use strict";
  ee();
  Fr = (t2, e3) => new (Ht(e3))(t2);
});
var zs;
var Zf;
var Bs;
var Qf;
var Ds;
var Xf;
var Ms;
var qr;
var Kr;
var uo;
var Rs;
var Us = V(() => {
  "use strict";
  ee();
  nt();
  zs = /* @__PURE__ */ new Map([["float32", 32], ["float16", 16], ["int32", 32], ["uint32", 32], ["int64", 64], ["uint64", 64], ["int8", 8], ["uint8", 8], ["int4", 4], ["uint4", 4]]), Zf = (t2, e3) => {
    if (e3 === "int32") return t2;
    let r2 = zs.get(e3);
    if (!r2) throw new Error(`WebNN backend does not support data type: ${e3}`);
    let n2 = r2 / 8;
    if (t2.byteLength % n2 !== 0) throw new Error(`Invalid Uint8Array length - must be a multiple of ${n2}.`);
    let o2 = t2.byteLength / n2, i2 = new (Ht(e3))(t2.buffer, t2.byteOffset, o2);
    switch (e3) {
      case "int64":
      case "uint64": {
        let a2 = new Int32Array(o2);
        for (let u2 = 0; u2 < o2; u2++) {
          let d2 = i2[u2];
          if (d2 > 2147483647n || d2 < -2147483648n) throw new Error("Can not convert int64 data to int32 - value out of range.");
          a2[u2] = Number(d2);
        }
        return new Uint8Array(a2.buffer);
      }
      case "int8":
      case "uint8":
      case "uint32": {
        if (e3 === "uint32" && i2.some((u2) => u2 > 2147483647)) throw new Error("Can not convert uint32 data to int32 - value out of range.");
        let a2 = Int32Array.from(i2, Number);
        return new Uint8Array(a2.buffer);
      }
      default:
        throw new Error(`Unsupported data conversion from ${e3} to 'int32'`);
    }
  }, Bs = (t2, e3) => {
    if (e3 === "int32") return t2;
    if (t2.byteLength % 4 !== 0) throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");
    let r2 = t2.byteLength / 4, n2 = new Int32Array(t2.buffer, t2.byteOffset, r2);
    switch (e3) {
      case "int64": {
        let o2 = BigInt64Array.from(n2, BigInt);
        return new Uint8Array(o2.buffer);
      }
      case "uint64": {
        if (n2.some((i2) => i2 < 0)) throw new Error("Can not convert int32 data to uin64 - negative value found.");
        let o2 = BigUint64Array.from(n2, BigInt);
        return new Uint8Array(o2.buffer);
      }
      case "int8": {
        if (n2.some((i2) => i2 < -128 || i2 > 127)) throw new Error("Can not convert int32 data to int8 - value out of range.");
        let o2 = Int8Array.from(n2, Number);
        return new Uint8Array(o2.buffer);
      }
      case "uint8": {
        if (n2.some((o2) => o2 < 0 || o2 > 255)) throw new Error("Can not convert int32 data to uint8 - value out of range.");
        return Uint8Array.from(n2, Number);
      }
      case "uint32": {
        if (n2.some((i2) => i2 < 0)) throw new Error("Can not convert int32 data to uint32 - negative value found.");
        let o2 = Uint32Array.from(n2, Number);
        return new Uint8Array(o2.buffer);
      }
      default:
        throw new Error(`Unsupported data conversion from 'int32' to ${e3}`);
    }
  }, Qf = 1, Ds = () => Qf++, Xf = /* @__PURE__ */ new Map([["int8", "int32"], ["uint8", "int32"], ["uint32", "int32"], ["int64", "int32"]]), Ms = (t2, e3) => {
    let r2 = zs.get(t2);
    if (!r2) throw new Error(`WebNN backend does not support data type: ${t2}`);
    return e3.length > 0 ? Math.ceil(e3.reduce((n2, o2) => n2 * o2) * r2 / 8) : 0;
  }, qr = class {
    constructor(e3) {
      this.isDataConverted = false;
      let { sessionId: r2, context: n2, tensor: o2, dataType: i2, shape: a2, fallbackDataType: u2 } = e3;
      this.sessionId = r2, this.mlContext = n2, this.mlTensor = o2, this.dataType = i2, this.tensorShape = a2, this.fallbackDataType = u2;
    }
    get tensor() {
      return this.mlTensor;
    }
    get type() {
      return this.dataType;
    }
    get fallbackType() {
      return this.fallbackDataType;
    }
    get shape() {
      return this.tensorShape;
    }
    get byteLength() {
      return Ms(this.dataType, this.tensorShape);
    }
    destroy() {
      se("verbose", () => "[WebNN] TensorWrapper.destroy"), this.mlTensor.destroy();
    }
    write(e3) {
      this.mlContext.writeTensor(this.mlTensor, e3);
    }
    async read(e3) {
      if (this.fallbackDataType) {
        let r2 = await this.mlContext.readTensor(this.mlTensor), n2 = Bs(new Uint8Array(r2), this.dataType);
        if (e3) {
          (e3 instanceof ArrayBuffer ? new Uint8Array(e3) : new Uint8Array(e3.buffer, e3.byteOffset, e3.byteLength)).set(n2);
          return;
        } else return new Uint8Array(n2).buffer;
      } else return e3 ? this.mlContext.readTensor(this.mlTensor, e3) : this.mlContext.readTensor(this.mlTensor);
    }
    canReuseTensor(e3, r2, n2) {
      return this.mlContext === e3 && this.dataType === r2 && this.tensorShape.length === n2.length && this.tensorShape.every((o2, i2) => o2 === n2[i2]);
    }
    setIsDataConverted(e3) {
      this.isDataConverted = e3;
    }
  }, Kr = class {
    constructor(e3, r2) {
      this.tensorManager = e3;
      this.wrapper = r2;
    }
    get tensorWrapper() {
      return this.wrapper;
    }
    releaseTensor() {
      this.tensorWrapper && (this.tensorManager.releaseTensor(this.tensorWrapper), this.wrapper = void 0);
    }
    async ensureTensor(e3, r2, n2, o2) {
      let i2 = this.tensorManager.getMLContext(e3), a2 = this.tensorManager.getMLOpSupportLimits(e3), u2;
      if (!a2?.input.dataTypes.includes(r2)) {
        if (u2 = Xf.get(r2), !u2 || a2?.input.dataTypes.includes(u2)) throw new Error(`WebNN backend does not support data type: ${r2}`);
        se("verbose", () => `[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${r2} to ${u2}`);
      }
      if (this.wrapper) {
        if (this.wrapper.canReuseTensor(i2, r2, n2)) return this.wrapper.tensor;
        if (o2) {
          if (this.wrapper.byteLength !== Ms(r2, n2)) throw new Error("Unable to copy data to tensor with different size.");
          this.activeUpload = new Uint8Array(await this.wrapper.read());
        }
        this.tensorManager.releaseTensor(this.wrapper);
      }
      let d2 = typeof MLTensorUsage > "u" ? void 0 : MLTensorUsage.READ | MLTensorUsage.WRITE;
      return this.wrapper = await this.tensorManager.getCachedTensor(e3, r2, n2, d2, true, true, u2), o2 && this.activeUpload && (this.wrapper.write(this.activeUpload), this.activeUpload = void 0), this.wrapper.tensor;
    }
    upload(e3) {
      let r2 = e3;
      if (this.wrapper) {
        if (this.wrapper.fallbackType) if (this.wrapper.fallbackType === "int32") r2 = Zf(e3, this.wrapper.type), this.wrapper.setIsDataConverted(true);
        else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);
        if (e3.byteLength === this.wrapper.byteLength) {
          this.wrapper.write(r2);
          return;
        } else se("verbose", () => "Data size does not match tensor size. Releasing tensor."), this.releaseTensor();
      }
      this.activeUpload ? this.activeUpload.set(r2) : this.activeUpload = new Uint8Array(r2);
    }
    async download(e3) {
      if (this.activeUpload) {
        let r2 = this.wrapper?.isDataConverted ? Bs(this.activeUpload, this.wrapper?.type) : this.activeUpload;
        if (e3) {
          e3 instanceof ArrayBuffer ? new Uint8Array(e3).set(r2) : new Uint8Array(e3.buffer, e3.byteOffset, e3.byteLength).set(r2);
          return;
        } else return r2.buffer;
      }
      if (!this.wrapper) throw new Error("Tensor has not been created.");
      return e3 ? this.wrapper.read(e3) : this.wrapper.read();
    }
  }, uo = class {
    constructor(e3) {
      this.backend = e3;
      this.tensorTrackersById = /* @__PURE__ */ new Map();
      this.freeTensors = [];
      this.externalTensors = /* @__PURE__ */ new Set();
    }
    getMLContext(e3) {
      let r2 = this.backend.getMLContext(e3);
      if (!r2) throw new Error("MLContext not found for session.");
      return r2;
    }
    getMLOpSupportLimits(e3) {
      return this.backend.getMLOpSupportLimits(e3);
    }
    reserveTensorId() {
      let e3 = Ds();
      return this.tensorTrackersById.set(e3, new Kr(this)), e3;
    }
    releaseTensorId(e3) {
      let r2 = this.tensorTrackersById.get(e3);
      r2 && (this.tensorTrackersById.delete(e3), r2.tensorWrapper && this.releaseTensor(r2.tensorWrapper));
    }
    async ensureTensor(e3, r2, n2, o2, i2) {
      se("verbose", () => `[WebNN] TensorManager.ensureTensor {tensorId: ${r2}, dataType: ${n2}, shape: ${o2}, copyOld: ${i2}}`);
      let a2 = this.tensorTrackersById.get(r2);
      if (!a2) throw new Error("Tensor not found.");
      return a2.ensureTensor(e3, n2, o2, i2);
    }
    upload(e3, r2) {
      let n2 = this.tensorTrackersById.get(e3);
      if (!n2) throw new Error("Tensor not found.");
      n2.upload(r2);
    }
    async download(e3, r2) {
      se("verbose", () => `[WebNN] TensorManager.download {tensorId: ${e3}, dstBuffer: ${r2?.byteLength}}`);
      let n2 = this.tensorTrackersById.get(e3);
      if (!n2) throw new Error("Tensor not found.");
      return n2.download(r2);
    }
    releaseTensorsForSession(e3) {
      for (let r2 of this.freeTensors) r2.sessionId === e3 && r2.destroy();
      this.freeTensors = this.freeTensors.filter((r2) => r2.sessionId !== e3);
    }
    registerTensor(e3, r2, n2, o2) {
      let i2 = this.getMLContext(e3), a2 = Ds(), u2 = new qr({ sessionId: e3, context: i2, tensor: r2, dataType: n2, shape: o2 });
      return this.tensorTrackersById.set(a2, new Kr(this, u2)), this.externalTensors.add(u2), a2;
    }
    async getCachedTensor(e3, r2, n2, o2, i2, a2, u2) {
      let d2 = this.getMLContext(e3);
      for (let [p2, m2] of this.freeTensors.entries()) if (m2.canReuseTensor(d2, r2, n2)) {
        se("verbose", () => `[WebNN] Reusing tensor {dataType: ${r2}, ${u2 ? `fallbackDataType: ${u2},` : ""} shape: ${n2}`);
        let g2 = this.freeTensors.splice(p2, 1)[0];
        return g2.sessionId = e3, g2;
      }
      se("verbose", () => `[WebNN] MLContext.createTensor {dataType: ${r2}, ${u2 ? `fallbackDataType: ${u2},` : ""} shape: ${n2}}`);
      let c2 = await d2.createTensor({ dataType: u2 ?? r2, shape: n2, dimensions: n2, usage: o2, writable: i2, readable: a2 });
      return new qr({ sessionId: e3, context: d2, tensor: c2, dataType: r2, shape: n2, fallbackDataType: u2 });
    }
    releaseTensor(e3) {
      this.externalTensors.has(e3) && this.externalTensors.delete(e3), this.freeTensors.push(e3);
    }
  }, Rs = (...t2) => new uo(...t2);
});
var jr;
var Yf;
var Zr;
var Ns = V(() => {
  "use strict";
  ee();
  $t();
  so();
  Us();
  nt();
  jr = /* @__PURE__ */ new Map([[1, "float32"], [10, "float16"], [6, "int32"], [12, "uint32"], [7, "int64"], [13, "uint64"], [22, "int4"], [21, "uint4"], [3, "int8"], [2, "uint8"], [9, "uint8"]]), Yf = (t2, e3) => {
    if (t2 === e3) return true;
    if (t2 === void 0 || e3 === void 0) return false;
    let r2 = Object.keys(t2).sort(), n2 = Object.keys(e3).sort();
    return r2.length === n2.length && r2.every((o2, i2) => o2 === n2[i2] && t2[o2] === e3[o2]);
  }, Zr = class {
    constructor(e3) {
      this.tensorManager = Rs(this);
      this.mlContextBySessionId = /* @__PURE__ */ new Map();
      this.sessionIdsByMLContext = /* @__PURE__ */ new Map();
      this.mlContextCache = [];
      this.sessionGraphInputs = /* @__PURE__ */ new Map();
      this.sessionGraphOutputs = /* @__PURE__ */ new Map();
      this.temporaryGraphInputs = [];
      this.temporaryGraphOutputs = [];
      this.temporarySessionTensorIds = /* @__PURE__ */ new Map();
      this.mlOpSupportLimitsBySessionId = /* @__PURE__ */ new Map();
      Gr(e3.logLevel, !!e3.debug);
    }
    get currentSessionId() {
      if (this.activeSessionId === void 0) throw new Error("No active session");
      return this.activeSessionId;
    }
    onRunStart(e3) {
      se("verbose", () => `[WebNN] onRunStart {sessionId: ${e3}}`), this.activeSessionId = e3;
    }
    onRunEnd(e3) {
      se("verbose", () => `[WebNN] onRunEnd {sessionId: ${e3}}`);
      let r2 = this.temporarySessionTensorIds.get(e3);
      if (r2) {
        for (let n2 of r2) se("verbose", () => `[WebNN] releasing temporary tensor {tensorId: ${n2}}`), this.tensorManager.releaseTensorId(n2);
        this.temporarySessionTensorIds.delete(e3), this.activeSessionId = void 0;
      }
    }
    async createMLContext(e3) {
      if (e3 instanceof GPUDevice) {
        let n2 = this.mlContextCache.findIndex((o2) => o2.gpuDevice === e3);
        if (n2 !== -1) return this.mlContextCache[n2].mlContext;
        {
          let o2 = await navigator.ml.createContext(e3);
          return this.mlContextCache.push({ gpuDevice: e3, mlContext: o2 }), o2;
        }
      } else if (e3 === void 0) {
        let n2 = this.mlContextCache.findIndex((o2) => o2.options === void 0 && o2.gpuDevice === void 0);
        if (n2 !== -1) return this.mlContextCache[n2].mlContext;
        {
          let o2 = await navigator.ml.createContext();
          return this.mlContextCache.push({ mlContext: o2 }), o2;
        }
      }
      let r2 = this.mlContextCache.findIndex((n2) => Yf(n2.options, e3));
      if (r2 !== -1) return this.mlContextCache[r2].mlContext;
      {
        let n2 = await navigator.ml.createContext(e3);
        return this.mlContextCache.push({ options: e3, mlContext: n2 }), n2;
      }
    }
    registerMLContext(e3, r2) {
      this.mlContextBySessionId.set(e3, r2);
      let n2 = this.sessionIdsByMLContext.get(r2);
      n2 || (n2 = /* @__PURE__ */ new Set(), this.sessionIdsByMLContext.set(r2, n2)), n2.add(e3), this.mlOpSupportLimitsBySessionId.has(e3) || this.mlOpSupportLimitsBySessionId.set(e3, r2.opSupportLimits()), this.temporaryGraphInputs.length > 0 && (this.sessionGraphInputs.set(e3, this.temporaryGraphInputs), this.temporaryGraphInputs = []), this.temporaryGraphOutputs.length > 0 && (this.sessionGraphOutputs.set(e3, this.temporaryGraphOutputs), this.temporaryGraphOutputs = []);
    }
    onReleaseSession(e3) {
      this.sessionGraphInputs.delete(e3), this.sessionGraphOutputs.delete(e3);
      let r2 = this.mlContextBySessionId.get(e3);
      if (!r2) return;
      this.tensorManager.releaseTensorsForSession(e3), this.mlContextBySessionId.delete(e3), this.mlOpSupportLimitsBySessionId.delete(e3);
      let n2 = this.sessionIdsByMLContext.get(r2);
      if (n2.delete(e3), n2.size === 0) {
        this.sessionIdsByMLContext.delete(r2);
        let o2 = this.mlContextCache.findIndex((i2) => i2.mlContext === r2);
        o2 !== -1 && this.mlContextCache.splice(o2, 1);
      }
    }
    getMLContext(e3) {
      return this.mlContextBySessionId.get(e3);
    }
    getMLOpSupportLimits(e3) {
      return this.mlOpSupportLimitsBySessionId.get(e3);
    }
    reserveTensorId() {
      return this.tensorManager.reserveTensorId();
    }
    releaseTensorId(e3) {
      se("verbose", () => `[WebNN] releaseTensorId {tensorId: ${e3}}`), this.tensorManager.releaseTensorId(e3);
    }
    async ensureTensor(e3, r2, n2, o2, i2) {
      let a2 = jr.get(n2);
      if (!a2) throw new Error(`Unsupported ONNX data type: ${n2}`);
      return this.tensorManager.ensureTensor(e3 ?? this.currentSessionId, r2, a2, o2, i2);
    }
    async createTemporaryTensor(e3, r2, n2) {
      se("verbose", () => `[WebNN] createTemporaryTensor {onnxDataType: ${r2}, shape: ${n2}}`);
      let o2 = jr.get(r2);
      if (!o2) throw new Error(`Unsupported ONNX data type: ${r2}`);
      let i2 = this.tensorManager.reserveTensorId();
      await this.tensorManager.ensureTensor(e3, i2, o2, n2, false);
      let a2 = this.temporarySessionTensorIds.get(e3);
      return a2 ? a2.push(i2) : this.temporarySessionTensorIds.set(e3, [i2]), i2;
    }
    uploadTensor(e3, r2) {
      if (!ye().shouldTransferToMLTensor) throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");
      se("verbose", () => `[WebNN] uploadTensor {tensorId: ${e3}, data: ${r2.byteLength}}`), this.tensorManager.upload(e3, r2);
    }
    async downloadTensor(e3, r2) {
      return this.tensorManager.download(e3, r2);
    }
    createMLTensorDownloader(e3, r2) {
      return async () => {
        let n2 = await this.tensorManager.download(e3);
        return Fr(n2, r2);
      };
    }
    registerMLTensor(e3, r2, n2, o2) {
      let i2 = jr.get(n2);
      if (!i2) throw new Error(`Unsupported ONNX data type: ${n2}`);
      let a2 = this.tensorManager.registerTensor(e3, r2, i2, o2);
      return se("verbose", () => `[WebNN] registerMLTensor {tensor: ${r2}, dataType: ${i2}, dimensions: ${o2}} -> {tensorId: ${a2}}`), a2;
    }
    registerGraphInput(e3) {
      this.temporaryGraphInputs.push(e3);
    }
    registerGraphOutput(e3) {
      this.temporaryGraphOutputs.push(e3);
    }
    isGraphInput(e3, r2) {
      let n2 = this.sessionGraphInputs.get(e3);
      return n2 ? n2.includes(r2) : false;
    }
    isGraphOutput(e3, r2) {
      let n2 = this.sessionGraphOutputs.get(e3);
      return n2 ? n2.includes(r2) : false;
    }
    isGraphInputOutputTypeSupported(e3, r2, n2 = true) {
      let o2 = jr.get(vt(r2)), i2 = this.mlOpSupportLimitsBySessionId.get(e3);
      return typeof o2 > "u" ? false : n2 ? !!i2?.input.dataTypes.includes(o2) : !!i2?.output.dataTypes.includes(o2);
    }
    flush() {
    }
  };
});
var Qr = V(() => {
  "use strict";
});
var Vs;
var lo;
var co;
var Jf;
var eh;
var Ls;
var mo;
var po;
var Gs;
var Hs = V(() => {
  "use strict";
  nt();
  Qr();
  Vs = /* @__PURE__ */ new Map([[64, 250], [128, 200], [256, 200], [512, 200], [2048, 230], [4096, 200], [8192, 50], [16384, 50], [32768, 50], [65536, 50], [131072, 50], [262144, 50], [524288, 50], [1048576, 50], [2097152, 30], [4194304, 20], [8388608, 10], [12582912, 10], [16777216, 10], [26214400, 15], [33554432, 22], [44236800, 2], [58982400, 6], [67108864, 6], [134217728, 6], [167772160, 6]]), lo = [], co = (t2) => Math.ceil(Number(t2) / 16) * 16, Jf = (t2) => {
    for (let e3 = 0; e3 < lo.length; e3++) {
      let r2 = lo[e3];
      if (t2 <= r2) return r2;
    }
    return Math.ceil(t2 / 16) * 16;
  }, eh = 1, Ls = () => eh++, mo = async (t2, e3, r2, n2) => {
    let o2 = co(r2), i2 = t2.device.createBuffer({ size: o2, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    try {
      let a2 = t2.getCommandEncoder();
      t2.endComputePass(), a2.copyBufferToBuffer(e3, 0, i2, 0, o2), t2.flush(), await i2.mapAsync(GPUMapMode.READ);
      let u2 = i2.getMappedRange();
      if (n2) {
        let d2 = n2();
        return d2.set(new Uint8Array(u2, 0, r2)), d2;
      } else return new Uint8Array(u2.slice(0, r2));
    } finally {
      i2.destroy();
    }
  }, po = class {
    constructor(e3) {
      this.backend = e3;
      this.storageCache = /* @__PURE__ */ new Map(), this.freeBuffers = /* @__PURE__ */ new Map(), this.freeUniformBuffers = /* @__PURE__ */ new Map(), this.buffersPending = [], this.capturedPendingBuffers = /* @__PURE__ */ new Map();
      for (let [r2] of Vs) lo.push(r2), this.freeBuffers.set(r2, []), this.freeUniformBuffers.set(r2, []);
      this.sessionCount = 0;
    }
    upload(e3, r2) {
      let n2 = r2.buffer, o2 = r2.byteOffset, i2 = r2.byteLength, a2 = co(i2), u2 = this.storageCache.get(e3);
      if (!u2) throw new Error("gpu data for uploading does not exist");
      if (Number(u2.originalSize) !== i2) throw new Error(`inconsistent data size. gpu data size=${u2.originalSize}, data size=${i2}`);
      if (a2 === i2 && o2 % 4 === 0) this.backend.device.queue.writeBuffer(u2.gpuData.buffer, 0, n2, o2, i2);
      else {
        let d2 = new Uint8Array(a2);
        d2.set(r2), this.backend.device.queue.writeBuffer(u2.gpuData.buffer, 0, d2, 0, a2);
      }
      se("verbose", () => `[WebGPU] GpuDataManager.upload(id=${e3})`);
    }
    memcpy(e3, r2) {
      let n2 = this.storageCache.get(e3);
      if (!n2) throw new Error("source gpu data for memcpy does not exist");
      let o2 = this.storageCache.get(r2);
      if (!o2) throw new Error("destination gpu data for memcpy does not exist");
      if (n2.originalSize !== o2.originalSize) throw new Error("inconsistent source and destination gpu data size");
      let i2 = co(n2.originalSize), a2 = this.backend.getCommandEncoder();
      this.backend.endComputePass(), a2.copyBufferToBuffer(n2.gpuData.buffer, 0, o2.gpuData.buffer, 0, i2);
    }
    registerExternalBuffer(e3, r2, n2) {
      let o2;
      if (n2) {
        if (o2 = n2[0], e3 === n2[1]) return se("verbose", () => `[WebGPU] GpuDataManager.registerExternalBuffer(size=${r2}) => id=${o2}, buffer is the same, skip.`), o2;
        if (this.backend.capturedCommandList.has(this.backend.currentSessionId)) throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`);
      } else o2 = Ls();
      return this.storageCache.set(o2, { gpuData: { id: o2, type: 0, buffer: e3 }, originalSize: r2 }), se("verbose", () => `[WebGPU] GpuDataManager.registerExternalBuffer(size=${r2}) => id=${o2}, registered.`), o2;
    }
    unregisterExternalBuffer(e3) {
      e3 !== void 0 && (this.storageCache.delete(e3), se("verbose", () => `[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e3}`));
    }
    create(e3, r2 = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST) {
      let n2 = Jf(e3), o2, i2 = (r2 & GPUBufferUsage.STORAGE) === GPUBufferUsage.STORAGE, a2 = (r2 & GPUBufferUsage.UNIFORM) === GPUBufferUsage.UNIFORM;
      if (i2 || a2) {
        let c2 = (i2 ? this.freeBuffers : this.freeUniformBuffers).get(n2);
        c2 ? c2.length > 0 ? o2 = c2.pop() : o2 = this.backend.device.createBuffer({ size: n2, usage: r2 }) : o2 = this.backend.device.createBuffer({ size: n2, usage: r2 });
      } else o2 = this.backend.device.createBuffer({ size: n2, usage: r2 });
      let u2 = { id: Ls(), type: 0, buffer: o2 };
      return this.storageCache.set(u2.id, { gpuData: u2, originalSize: Number(e3) }), se("verbose", () => `[WebGPU] GpuDataManager.create(size=${e3}) => id=${u2.id}`), u2;
    }
    get(e3) {
      return this.storageCache.get(e3)?.gpuData;
    }
    release(e3) {
      let r2 = typeof e3 == "bigint" ? Number(e3) : e3, n2 = this.storageCache.get(r2);
      if (!n2) {
        if (this.storageCache.size === 0) return 0;
        throw new Error("releasing data does not exist");
      }
      return se("verbose", () => `[WebGPU] GpuDataManager.release(id=${r2}), gpuDataId=${n2.gpuData.id}`), this.storageCache.delete(r2), this.buffersPending.push(n2.gpuData.buffer), n2.originalSize;
    }
    async download(e3, r2) {
      let n2 = this.storageCache.get(Number(e3));
      if (!n2) throw new Error("data does not exist");
      await mo(this.backend, n2.gpuData.buffer, n2.originalSize, r2);
    }
    refreshPendingBuffers() {
      if (this.buffersPending.length !== 0) if (this.backend.sessionStatus === "default") {
        for (let e3 of this.buffersPending) {
          let r2 = Vs.get(e3.size);
          if ((e3.usage & GPUBufferUsage.STORAGE) === GPUBufferUsage.STORAGE) {
            let n2 = this.freeBuffers.get(e3.size) || [];
            r2 === void 0 || n2.length >= r2 ? e3.destroy() : n2.push(e3);
          } else if ((e3.usage & GPUBufferUsage.UNIFORM) === GPUBufferUsage.UNIFORM) {
            let n2 = this.freeUniformBuffers.get(e3.size) || [];
            r2 === void 0 || n2.length >= r2 ? e3.destroy() : n2.push(e3);
          } else e3.destroy();
        }
        this.buffersPending = [];
      } else {
        let e3 = this.capturedPendingBuffers.get(this.backend.currentSessionId);
        e3 || (e3 = [], this.capturedPendingBuffers.set(this.backend.currentSessionId, e3));
        for (let r2 of this.buffersPending) e3.push(r2);
        this.buffersPending = [];
      }
    }
    dispose() {
      this.freeBuffers.forEach((e3) => {
        e3.forEach((r2) => {
          r2.destroy();
        });
      }), this.freeUniformBuffers.forEach((e3) => {
        e3.forEach((r2) => {
          r2.destroy();
        });
      }), this.storageCache.forEach((e3) => {
        e3.gpuData.buffer.destroy();
      }), this.capturedPendingBuffers.forEach((e3) => {
        e3.forEach((r2) => {
          r2.destroy();
        });
      }), this.storageCache = /* @__PURE__ */ new Map(), this.freeBuffers = /* @__PURE__ */ new Map(), this.freeUniformBuffers = /* @__PURE__ */ new Map(), this.capturedPendingBuffers = /* @__PURE__ */ new Map();
    }
    onCreateSession() {
      this.sessionCount += 1;
    }
    onReleaseSession(e3) {
      let r2 = this.capturedPendingBuffers.get(e3);
      r2 && (r2.forEach((n2) => {
        n2.destroy();
      }), this.capturedPendingBuffers.delete(e3)), this.sessionCount -= 1, this.sessionCount === 0 && (se("warning", () => "[WebGPU] Clearing webgpu buffer cache"), this.storageCache.forEach((n2) => {
        n2.gpuData.buffer.destroy();
      }), this.storageCache = /* @__PURE__ */ new Map());
    }
  }, Gs = (...t2) => new po(...t2);
});
var fo;
var J;
var Ce = V(() => {
  "use strict";
  fo = class {
    constructor(e3) {
      Object.assign(this, e3);
    }
    get cacheKey() {
      return this.key || (this.key = Object.getOwnPropertyNames(this).sort().map((e3) => `${this[e3]}`).join(";")), this.key;
    }
  }, J = (t2) => new fo(t2);
});
var Bt;
var go;
var we;
var Ae;
var W;
var fe;
var bo;
var Mt;
var Ze;
var j;
var Xr;
var O;
var R;
var Fs;
var Yr;
var ho;
var qs;
var oe = V(() => {
  "use strict";
  ee();
  te();
  Bt = 64, go = (t2, e3) => {
    if (e3 === 3) throw new Error("vec3 has same alignment as vec4, use vec4 instead");
    switch (Number(t2)) {
      case 10:
        return e3 > 1 ? `vec${e3}<f16>` : "f16";
      case 1:
        return e3 > 1 ? `vec${e3}<f32>` : "f32";
      case 6:
        return e3 > 1 ? `vec${e3}<i32>` : "i32";
      case 12:
        return e3 > 1 ? `vec${e3}<u32>` : "u32";
      case 7:
        if (e3 > 1) throw new Error("currently not supported vecX of uint64 yet");
        return ["vec2<u32>", "i32"];
      case 13:
        if (e3 > 1) throw new Error("currently not supported vecX of uint64 yet");
        return ["vec2<u32>", "u32"];
      case 9:
        if (e3 !== 4) throw new Error("bool must be vec4");
        return ["u32", "vec4<bool>"];
      case 22:
        return "i32";
      case 21:
        return "u32";
      default:
        throw new Error(`Unknown data type: ${t2}`);
    }
  }, we = (t2, e3 = 1) => {
    let r2 = go(t2, e3);
    return typeof r2 == "string" ? r2 : r2[0];
  }, Ae = (t2, e3 = 1) => {
    let r2 = go(t2, e3);
    return typeof r2 == "string" ? r2 : r2[1];
  }, W = (...t2) => {
    let e3 = [];
    return t2.forEach((r2) => {
      r2.length !== 0 && e3.push({ type: 12, data: r2 }, { type: 12, data: k.computeStrides(r2) });
    }), e3;
  }, fe = (t2) => t2 % 4 === 0 ? 4 : t2 % 2 === 0 ? 2 : 1, bo = (t2 = "f32", e3, r2 = "0") => !e3 || e3 === 1 ? `${t2}(${r2})` : `vec${e3}<${t2}>(${r2})`, Mt = (t2, e3, r2) => t2 === "f32" ? r2 : e3 === 1 ? `f32(${r2})` : `vec${e3}<f32>(${r2})`, Ze = (t2, e3) => e3 === 4 ? `(${t2}.x + ${t2}.y + ${t2}.z + ${t2}.w)` : e3 === 2 ? `(${t2}.x + ${t2}.y)` : e3 === 3 ? `(${t2}.x + ${t2}.y + ${t2}.z)` : t2, j = (t2, e3, r2, n2) => t2.startsWith("uniforms.") && r2 > 4 ? typeof e3 == "string" ? n2 === "f16" ? `${t2}[(${e3}) / 8][(${e3}) % 8 / 4][(${e3}) % 8 % 4]` : `${t2}[(${e3}) / 4][(${e3}) % 4]` : n2 === "f16" ? `${t2}[${Math.floor(e3 / 8)}][${Math.floor(e3 % 8 / 4)}][${e3 % 8 % 4}]` : `${t2}[${Math.floor(e3 / 4)}][${e3 % 4}]` : r2 > 1 ? `${t2}[${e3}]` : t2, Xr = (t2, e3, r2, n2, o2) => {
    let i2 = typeof r2 == "number", a2 = i2 ? r2 : r2.length, u2 = [...new Array(a2).keys()], d2 = a2 < 2 ? "u32" : a2 <= 4 ? `vec${a2}<u32>` : `array<u32, ${a2}>`, c2 = go(e3, o2), p2 = typeof c2 == "string" ? c2 : c2[1], m2 = typeof c2 == "string" ? c2 : c2[0], g2 = { indices: d2, value: p2, storage: m2, tensor: e3 }, y = (M) => typeof M == "string" ? M : `${M}u`, b = { offsetToIndices: false, indicesToOffset: false, broadcastedIndicesToOffset: false, set: false, setByIndices: false, get: false, getByIndices: false }, _ = i2 ? "uniforms." : "", S = `${_}${t2}_shape`, x = `${_}${t2}_strides`, v = "";
    for (let M = 0; M < a2 - 1; M++) v += `
    let dim${M} = current / ${j(x, M, a2)};
    let rest${M} = current % ${j(x, M, a2)};
    indices[${M}] = dim${M};
    current = rest${M};
    `;
    v += `indices[${a2 - 1}] = current;`;
    let T = a2 < 2 ? "" : `
  fn o2i_${t2}(offset: u32) -> ${g2.indices} {
    var indices: ${g2.indices};
    var current = offset;
    ${v}
    return indices;
  }`, I = (M) => (b.offsetToIndices = true, a2 < 2 ? M : `o2i_${t2}(${M})`), E = [];
    if (a2 >= 2) for (let M = a2 - 1; M >= 0; M--) E.push(`${j(x, M, a2)} * (indices[${M}])`);
    let A = a2 < 2 ? "" : `
  fn i2o_${t2}(indices: ${g2.indices}) -> u32 {
    return ${E.join("+")};
  }`, D = (M) => (b.indicesToOffset = true, a2 < 2 ? M : `i2o_${t2}(${M})`), w = (...M) => a2 === 0 ? "0u" : `${g2.indices}(${M.map(y).join(",")})`, U = (M, G) => a2 < 2 ? `${M}` : `${j(M, G, a2)}`, N = (M, G, be) => a2 < 2 ? `${M}=${be};` : `${j(M, G, a2)}=${be};`, F = {}, q = (M, G) => {
      b.broadcastedIndicesToOffset = true;
      let be = `${G.name}broadcastedIndicesTo${t2}Offset`;
      if (be in F) return `${be}(${M})`;
      let ke = [];
      for (let ve = a2 - 1; ve >= 0; ve--) {
        let Oe = G.indicesGet("outputIndices", ve + G.rank - a2);
        ke.push(`${U(x, ve)} * (${Oe} % ${U(S, ve)})`);
      }
      return F[be] = `fn ${be}(outputIndices: ${G.type.indices}) -> u32 {
             return ${ke.length > 0 ? ke.join("+") : "0u"};
           }`, `${be}(${M})`;
    }, Y = (M, G) => (() => {
      if (g2.storage === g2.value) return `${t2}[${M}]=${G};`;
      if (g2.storage === "vec2<u32>" && g2.value === "i32") return `${t2}[${M}]=vec2<u32>(u32(${G}), select(0u, 0xFFFFFFFFu, ${G} < 0));`;
      if (g2.storage === "vec2<u32>" && g2.value === "u32") return `${t2}[${M}]=vec2<u32>(u32(${G}), 0u);`;
      if (g2.storage === "u32" && g2.value === "vec4<bool>") return `${t2}[${M}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${G}));`;
      throw new Error(`not supported combination of storage type ${g2.storage} and value type ${g2.value} yet`);
    })(), z = (M) => (() => {
      if (g2.storage === g2.value) return `${t2}[${M}]`;
      if (g2.storage === "vec2<u32>" && g2.value === "i32") return `i32(${t2}[${M}].x)`;
      if (g2.storage === "vec2<u32>" && g2.value === "u32") return `u32(${t2}[${M}].x)`;
      if (g2.storage === "u32" && g2.value === "vec4<bool>") return `vec4<bool>(bool(${t2}[${M}] & 0xFFu), bool(${t2}[${M}] & 0xFF00u), bool(${t2}[${M}] & 0xFF0000u), bool(${t2}[${M}] & 0xFF000000u))`;
      throw new Error(`not supported combination of storage type ${g2.storage} and value type ${g2.value} yet`);
    })(), L = a2 < 2 ? "" : `
  fn get_${t2}ByIndices(indices: ${g2.indices}) -> ${p2} {
    return ${z(`i2o_${t2}(indices)`)};
  }`, Q = a2 < 2 ? "" : (() => {
      let M = u2.map((be) => `d${be}: u32`).join(", "), G = u2.map((be) => `d${be}`).join(", ");
      return `
  fn get_${t2}(${M}) -> ${p2} {
    return get_${t2}ByIndices(${w(G)});
  }`;
    })(), X = (...M) => {
      if (M.length !== a2) throw new Error(`indices length must be ${a2}`);
      let G = M.map(y).join(",");
      return a2 === 0 ? z("0u") : a2 === 1 ? z(G[0]) : (b.get = true, b.getByIndices = true, b.indicesToOffset = true, `get_${t2}(${G})`);
    }, Z = (M) => a2 < 2 ? z(M) : (b.getByIndices = true, b.indicesToOffset = true, `get_${t2}ByIndices(${M})`), ne = a2 < 2 ? "" : `
  fn set_${t2}ByIndices(indices: ${g2.indices}, value: ${p2}) {
    ${Y(`i2o_${t2}(indices)`, "value")}
  }`, ie = a2 < 2 ? "" : (() => {
      let M = u2.map((be) => `d${be}: u32`).join(", "), G = u2.map((be) => `d${be}`).join(", ");
      return `
  fn set_${t2}(${M}, value: ${p2}) {
    set_${t2}ByIndices(${w(G)}, value);
  }`;
    })();
    return { impl: () => {
      let M = [], G = false;
      return b.offsetToIndices && (M.push(T), G = true), b.indicesToOffset && (M.push(A), G = true), b.broadcastedIndicesToOffset && (Object.values(F).forEach((be) => M.push(be)), G = true), b.set && (M.push(ie), G = true), b.setByIndices && (M.push(ne), G = true), b.get && (M.push(Q), G = true), b.getByIndices && (M.push(L), G = true), !i2 && G && M.unshift(`const ${S} = ${g2.indices}(${r2.join(",")});`, `const ${x} = ${g2.indices}(${k.computeStrides(r2).join(",")});`), M.join(`
`);
    }, type: g2, offsetToIndices: I, indicesToOffset: D, broadcastedIndicesToOffset: q, indices: w, indicesGet: U, indicesSet: N, set: (...M) => {
      if (M.length !== a2 + 1) throw new Error(`indices length must be ${a2}`);
      let G = M[a2];
      if (typeof G != "string") throw new Error("value must be string");
      let be = M.slice(0, a2).map(y).join(",");
      return a2 === 0 ? Y("0u", G) : a2 === 1 ? Y(be[0], G) : (b.set = true, b.setByIndices = true, b.indicesToOffset = true, `set_${t2}(${be}, ${G})`);
    }, setByOffset: Y, setByIndices: (M, G) => a2 < 2 ? Y(M, G) : (b.setByIndices = true, b.indicesToOffset = true, `set_${t2}ByIndices(${M}, ${G});`), get: X, getByOffset: z, getByIndices: Z, usage: n2, name: t2, strides: x, shape: S, rank: a2 };
  }, O = (t2, e3, r2, n2 = 1) => Xr(t2, e3, r2, "input", n2), R = (t2, e3, r2, n2 = 1) => Xr(t2, e3, r2, "output", n2), Fs = (t2, e3, r2) => Xr(t2, e3, r2, "atomicOutput", 1), Yr = (t2, e3, r2, n2 = 1) => Xr(t2, e3, r2, "internal", n2), ho = class {
    constructor(e3, r2) {
      this.normalizedDispatchGroup = e3;
      this.limits = r2;
      this.internalVariables = [];
      this.variables = [];
      this.uniforms = [];
      this.variableIndex = 0;
    }
    guardAgainstOutOfBoundsWorkgroupSizes(e3) {
      return `if (global_idx >= ${typeof e3 == "number" ? `${e3}u` : e3}) { return; }`;
    }
    mainStart(e3 = Bt) {
      let r2 = typeof e3 == "number" ? e3 : e3[0], n2 = typeof e3 == "number" ? 1 : e3[1], o2 = typeof e3 == "number" ? 1 : e3[2];
      if (r2 > this.limits.maxComputeWorkgroupSizeX || n2 > this.limits.maxComputeWorkgroupSizeY || o2 > this.limits.maxComputeWorkgroupSizeZ) throw new Error(`workgroup size [${r2}, ${n2}, ${o2}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);
      if (r2 * n2 * o2 > this.limits.maxComputeInvocationsPerWorkgroup) throw new Error(`workgroup size [${r2}, ${n2}, ${o2}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);
      let i2 = this.normalizedDispatchGroup[1] === 1 && this.normalizedDispatchGroup[2] === 1, a2 = i2 ? `@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>` : `@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`, u2 = i2 ? `let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;` : `let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${r2 * n2 * o2}u + local_idx;`;
      return `@compute @workgroup_size(${r2}, ${n2}, ${o2})
  fn main(${a2}) {
    ${u2}
  `;
    }
    appendVariableUniforms(e3) {
      e3.rank !== 0 && (e3.shape.startsWith("uniforms.") && this.uniforms.push({ name: e3.shape.replace("uniforms.", ""), type: "u32", length: e3.rank }), e3.strides.startsWith("uniforms.") && this.uniforms.push({ name: e3.strides.replace("uniforms.", ""), type: "u32", length: e3.rank }));
    }
    declareVariable(e3, r2) {
      if (e3.usage === "internal") throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");
      this.variables.push(e3), this.appendVariableUniforms(e3);
      let n2 = e3.usage === "input" ? "read" : "read_write", o2 = e3.usage === "atomicOutput" ? "atomic<i32>" : e3.type.storage;
      return `@group(0) @binding(${r2}) var<storage, ${n2}> ${e3.name}: array<${o2}>;`;
    }
    declareVariables(...e3) {
      return e3.map((r2) => this.declareVariable(r2, this.variableIndex++)).join(`
`);
    }
    registerInternalVariable(e3) {
      if (e3.usage !== "internal") throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");
      this.internalVariables.push(e3), this.appendVariableUniforms(e3);
    }
    registerInternalVariables(...e3) {
      return e3.forEach((r2) => this.registerInternalVariable(r2)), this;
    }
    registerUniform(e3, r2, n2 = 1) {
      return this.uniforms.push({ name: e3, type: r2, length: n2 }), this;
    }
    registerUniforms(e3) {
      return this.uniforms = this.uniforms.concat(e3), this;
    }
    uniformDeclaration() {
      if (this.uniforms.length === 0) return "";
      let e3 = [];
      for (let { name: r2, type: n2, length: o2 } of this.uniforms) if (o2 && o2 > 4) n2 === "f16" ? e3.push(`@align(16) ${r2}:array<mat2x4<${n2}>, ${Math.ceil(o2 / 8)}>`) : e3.push(`${r2}:array<vec4<${n2}>, ${Math.ceil(o2 / 4)}>`);
      else {
        let i2 = o2 == null || o2 === 1 ? n2 : `vec${o2}<${n2}>`;
        e3.push(`${r2}:${i2}`);
      }
      return `
      struct Uniforms { ${e3.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`;
    }
    get additionalImplementations() {
      return this.uniformDeclaration() + this.variables.map((e3) => e3.impl()).join(`
`) + this.internalVariables.map((e3) => e3.impl()).join(`
`);
    }
    get variablesInfo() {
      if (this.uniforms.length === 0) return;
      let e3 = (r2) => [12, 10, 1, 6][["u32", "f16", "f32", "i32"].indexOf(r2)];
      return this.uniforms.map((r2) => [e3(r2.type), r2.length ?? 1]);
    }
  }, qs = (t2, e3) => new ho(t2, e3);
});
var th;
var Ks;
var rh;
var nh;
var oh;
var ih;
var ze;
var js;
var Zs;
var pt = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  th = (t2, e3) => {
    if (!t2 || t2.length !== 1) throw new Error("Transpose requires 1 input.");
    if (e3.length !== 0 && e3.length !== t2[0].dims.length) throw new Error(`perm size ${e3.length} does not match input rank ${t2[0].dims.length}`);
  }, Ks = (t2, e3) => e3.length !== 0 ? e3 : [...new Array(t2).keys()].reverse(), rh = (t2, e3) => k.sortBasedOnPerm(t2, Ks(t2.length, e3)), nh = (t2, e3, r2, n2) => {
    let o2 = `fn perm(i: ${n2.type.indices}) -> ${r2.type.indices} {
    var a: ${r2.type.indices};`;
    for (let i2 = 0; i2 < e3; ++i2) o2 += `a[${t2[i2]}]=i[${i2}];`;
    return o2 += "return a;}";
  }, oh = (t2, e3) => {
    let r2 = [], n2 = [];
    for (let o2 = 0; o2 < t2.length; ++o2) t2[o2] !== 1 && r2.push(t2[o2]), t2[e3[o2]] !== 1 && n2.push(e3[o2]);
    return { newShape: r2, newPerm: n2 };
  }, ih = (t2, e3) => {
    let r2 = 0;
    for (let n2 = 0; n2 < t2.length; ++n2) if (e3[t2[n2]] !== 1) {
      if (t2[n2] < r2) return false;
      r2 = t2[n2];
    }
    return true;
  }, ze = (t2, e3) => {
    let r2 = t2.dataType, n2 = t2.dims.length, o2 = Ks(n2, e3), i2 = rh(t2.dims, o2), a2 = t2.dims, u2 = i2, d2 = n2 < 2 || ih(o2, t2.dims), c2;
    if (d2) return c2 = (_) => {
      let S = O("input", r2, a2, 4), x = R("output", r2, u2, 4);
      return `
  ${_.registerUniform("output_size", "u32").declareVariables(S, x)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`;
    }, { name: "TransposeCopy", shaderCache: { inputDependencies: ["type"] }, getRunData: () => {
      let _ = k.size(i2);
      return { outputs: [{ dims: i2, dataType: t2.dataType }], dispatchGroup: { x: Math.ceil(_ / 64 / 4) }, programUniforms: [{ type: 12, data: Math.ceil(_ / 4) }] };
    }, getShaderSource: c2 };
    let { newShape: p2, newPerm: m2 } = oh(t2.dims, o2), g2 = k.areEqual(m2, [2, 3, 1]), y = k.areEqual(m2, [3, 1, 2]);
    if (p2.length === 2 || g2 || y) {
      a2 = g2 ? [p2[0], p2[1] * p2[2]] : y ? [p2[0] * p2[1], p2[2]] : p2, u2 = [a2[1], a2[0]];
      let _ = 16;
      return c2 = (S) => {
        let x = O("a", r2, a2.length), v = R("output", r2, u2.length);
        return `
  ${S.registerUniform("output_size", "u32").declareVariables(x, v)}
  var<workgroup> tile : array<array<${v.type.value}, ${_ + 1}>, ${_}>;
  ${S.mainStart([_, _, 1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${x.getByIndices(`${x.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${v.setByIndices(`${v.type.indices}(output_row, output_col)`, "tile[local_id.x][local_id.y]")}
    }
  }`;
      }, { name: "TransposeShared", shaderCache: { inputDependencies: ["type"] }, getRunData: () => {
        let S = k.size(i2);
        return { outputs: [{ dims: i2, dataType: t2.dataType }], dispatchGroup: { x: Math.ceil(u2[1] / _), y: Math.ceil(u2[0] / _) }, programUniforms: [{ type: 12, data: S }, ...W(a2, u2)] };
      }, getShaderSource: c2 };
    }
    return c2 = (_) => {
      let S = O("a", r2, a2.length), x = R("output", r2, u2.length);
      return `
  ${_.registerUniform("output_size", "u32").declareVariables(S, x)}

  ${nh(o2, n2, S, x)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${x.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${x.setByOffset("global_idx", S.getByIndices("aIndices"))}
  }`;
    }, { name: "Transpose", shaderCache: { hint: `${e3}`, inputDependencies: ["rank"] }, getRunData: () => {
      let _ = k.size(i2);
      return { outputs: [{ dims: i2, dataType: t2.dataType }], dispatchGroup: { x: Math.ceil(_ / 64) }, programUniforms: [{ type: 12, data: _ }, ...W(a2, u2)] };
    }, getShaderSource: c2 };
  }, js = (t2, e3) => {
    th(t2.inputs, e3.perm), t2.compute(ze(t2.inputs[0], e3.perm));
  }, Zs = (t2) => J({ perm: t2.perm });
});
var ah;
var sh;
var uh;
var dh;
var lh;
var ch;
var ph;
var mh;
var fh;
var hh;
var it;
var Qs;
var Xs;
var Ys;
var Js;
var eu;
var tu;
var ru;
var nu;
var ou;
var iu;
var au = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Jr();
  pt();
  ah = { max: "select(bestValue, candidate, candidate > bestValue)", min: "select(bestValue, candidate, candidate < bestValue)", mean: "bestValue + candidate", sum: "bestValue + candidate", prod: "bestValue * candidate", sumSquare: "bestValue + candidate * candidate", logSumExp: "bestValue + exp(candidate)", l1: "bestValue + abs(candidate)", l2: "bestValue + candidate * candidate", logSum: "bestValue + candidate" }, sh = { max: "select(bestValue, candidate, candidate > bestValue)", min: "select(bestValue, candidate, candidate < bestValue)", mean: "bestValue + candidate", sum: "bestValue + candidate", prod: "bestValue * candidate", sumSquare: "bestValue + candidate", logSumExp: "bestValue + candidate", l1: "bestValue + candidate", l2: "bestValue + candidate", logSum: "bestValue + candidate" }, uh = { max: "_A[offset]", min: "_A[offset]", mean: "0", sum: "0", prod: "1", sumSquare: "0", logSumExp: "0", l1: "0", l2: "0", logSum: "0" }, dh = { max: "bestValue", min: "bestValue", sum: "bestValue", prod: "bestValue", sumSquare: "bestValue", logSumExp: "log(bestValue)", l1: "bestValue", l2: "sqrt(bestValue)", logSum: "log(bestValue)" }, lh = (t2, e3) => {
    let r2 = [];
    for (let n2 = e3 - t2; n2 < e3; ++n2) r2.push(n2);
    return r2;
  }, ch = (t2, e3) => {
    let r2 = [], n2 = t2.length;
    for (let i2 = 0; i2 < n2; i2++) e3.indexOf(i2) === -1 && r2.push(t2[i2]);
    let o2 = e3.map((i2) => t2[i2]);
    return [r2, o2];
  }, ph = (t2, e3) => {
    let r2 = t2.length + e3.length, n2 = [], o2 = 0;
    for (let i2 = 0; i2 < r2; i2++) e3.indexOf(i2) === -1 ? n2.push(t2[o2++]) : n2.push(1);
    return n2;
  }, mh = (t2, e3) => {
    for (let r2 = 0; r2 < t2.length; ++r2) if (t2[t2.length - r2 - 1] !== e3 - 1 - r2) return false;
    return true;
  }, fh = (t2, e3) => {
    let r2 = [];
    if (!mh(t2, e3)) {
      for (let n2 = 0; n2 < e3; ++n2) t2.indexOf(n2) === -1 && r2.push(n2);
      t2.forEach((n2) => r2.push(n2));
    }
    return r2;
  }, hh = (t2, e3, r2, n2, o2, i2, a2) => {
    let u2 = r2[0].dims, d2 = k.size(i2), c2 = k.size(a2), p2 = O("_A", r2[0].dataType, u2), m2 = R("output", o2, i2), g2 = 64;
    d2 === 1 && (g2 = 256);
    let y = `
          var<workgroup> aBestValues : array<f32, ${g2}>;
       `, b = (_) => `
        ${_.registerUniform("reduceSize", "u32").declareVariables(p2, m2)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${_.mainStart(g2)}

          let outputIndex = global_idx / ${g2};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${uh[n2]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g2}) {
           let candidate = f32(${p2.getByOffset("offset + k")});
           bestValue = ${ah[n2]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g2}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${sh[n2]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${m2.setByOffset("outputIndex", `${n2 === "mean" ? `${m2.type.storage}(bestValue / f32(uniforms.reduceSize))` : `${m2.type.storage}(${dh[n2]})`}`)};
         }
        }`;
    return { name: t2, shaderCache: { hint: `${e3};${g2}`, inputDependencies: ["type"] }, getShaderSource: b, getRunData: () => ({ outputs: [{ dims: i2, dataType: o2 }], dispatchGroup: { x: d2 }, programUniforms: [{ type: 12, data: c2 }] }) };
  }, it = (t2, e3, r2, n2) => {
    let o2 = t2.inputs.length === 1 ? r2 : yo(t2.inputs, r2), i2 = o2.axes;
    i2.length === 0 && !o2.noopWithEmptyAxes && (i2 = t2.inputs[0].dims.map((y, b) => b));
    let a2 = k.normalizeAxes(i2, t2.inputs[0].dims.length), u2 = a2, d2 = t2.inputs[0], c2 = fh(u2, t2.inputs[0].dims.length);
    c2.length > 0 && (d2 = t2.compute(ze(t2.inputs[0], c2), { inputs: [0], outputs: [-1] })[0], u2 = lh(u2.length, d2.dims.length));
    let [p2, m2] = ch(d2.dims, u2), g2 = p2;
    o2.keepDims && (g2 = ph(p2, a2)), t2.compute(hh(e3, o2.cacheKey, [d2], n2, t2.inputs[0].dataType, g2, m2), { inputs: [d2] });
  }, Qs = (t2, e3) => {
    it(t2, "ReduceMeanShared", e3, "mean");
  }, Xs = (t2, e3) => {
    it(t2, "ReduceL1Shared", e3, "l1");
  }, Ys = (t2, e3) => {
    it(t2, "ReduceL2Shared", e3, "l2");
  }, Js = (t2, e3) => {
    it(t2, "ReduceLogSumExpShared", e3, "logSumExp");
  }, eu = (t2, e3) => {
    it(t2, "ReduceMaxShared", e3, "max");
  }, tu = (t2, e3) => {
    it(t2, "ReduceMinShared", e3, "min");
  }, ru = (t2, e3) => {
    it(t2, "ReduceProdShared", e3, "prod");
  }, nu = (t2, e3) => {
    it(t2, "ReduceSumShared", e3, "sum");
  }, ou = (t2, e3) => {
    it(t2, "ReduceSumSquareShared", e3, "sumSquare");
  }, iu = (t2, e3) => {
    it(t2, "ReduceLogSumShared", e3, "logSum");
  };
});
var at;
var gh;
var en;
var yo;
var st;
var bh;
var yh;
var _h;
var wh;
var $h;
var vh;
var xh;
var Sh;
var Th;
var Ih;
var ut;
var su;
var uu;
var du;
var lu;
var cu;
var pu;
var mu;
var fu;
var hu;
var gu;
var Jr = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  au();
  at = (t2) => {
    if (!t2 || t2.length === 0 || t2.length > 2) throw new Error("Reduce op requires 1 or 2 inputs.");
    if (t2.length === 2 && t2[1].dims.length !== 1) throw new Error("Invalid axes input dims.");
  }, gh = (t2) => ["", "", `var value = ${t2.getByIndices("input_indices")};`, ""], en = (t2, e3, r2, n2, o2, i2, a2 = false, u2 = false) => {
    let d2 = [], c2 = r2[0].dims, p2 = c2.length, m2 = k.normalizeAxes(o2, p2), g2 = !u2 && m2.length === 0;
    c2.forEach((S, x) => {
      g2 || m2.indexOf(x) >= 0 ? a2 && d2.push(1) : d2.push(S);
    });
    let y = d2.length, b = k.size(d2);
    return { name: t2, shaderCache: e3, getShaderSource: (S) => {
      let x = [], v = O("_A", r2[0].dataType, p2), T = R("output", i2, y), I = n2(v, T, m2), E = I[2];
      for (let A = 0, D = 0; A < p2; A++) g2 || m2.indexOf(A) >= 0 ? (a2 && D++, E = `for(var j${A}: u32 = 0; j${A} < ${c2[A]}; j${A}++) {
                  ${I[2].includes("last_index") ? `let last_index = j${A};` : ""}
                  ${v.indicesSet("input_indices", A, `j${A}`)}
                  ${E}
                }`) : (x.push(`${v.indicesSet("input_indices", A, T.indicesGet("output_indices", D))};`), D++);
      return `

        ${S.registerUniform("output_size", "u32").declareVariables(v, T)}

        ${S.mainStart()}
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${v.type.indices};
          let output_indices = ${T.offsetToIndices("global_idx")};

          ${x.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${E}
          ${I[3]}
          ${I.length === 4 ? T.setByOffset("global_idx", "value") : I.slice(4).join(`
`)}
        }`;
    }, getRunData: () => ({ outputs: [{ dims: d2, dataType: i2 }], dispatchGroup: { x: Math.ceil(b / 64) }, programUniforms: [{ type: 12, data: b }, ...W(c2, d2)] }) };
  }, yo = (t2, e3) => {
    let r2 = [];
    return t2[1].dims[0] > 0 && t2[1].getBigInt64Array().forEach((n2) => r2.push(Number(n2))), J({ axes: r2, keepDims: e3.keepDims, noopWithEmptyAxes: e3.noopWithEmptyAxes });
  }, st = (t2, e3, r2, n2) => {
    let o2 = t2.inputs, i2 = o2.length === 1 ? r2 : yo(o2, r2);
    t2.compute(en(e3, { hint: i2.cacheKey, inputDependencies: ["rank"] }, [o2[0]], i2.noopWithEmptyAxes && i2.axes.length === 0 ? gh : n2, i2.axes, o2[0].dataType, i2.keepDims, i2.noopWithEmptyAxes), { inputs: [0] });
  }, bh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceLogSum", e3, (n2, o2) => [`var value = ${o2.type.storage}(0);`, "", `value += ${n2.getByIndices("input_indices")};`, "value = log(value);"]);
  }, yh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceL1", e3, (n2, o2) => [`var value = ${o2.type.storage}(0);`, "", `value += abs(${n2.getByIndices("input_indices")});`, ""]);
  }, _h = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceL2", e3, (n2, o2) => [`var t = ${o2.type.value}(0); var value = ${o2.type.value}(0);`, "", `t = ${n2.getByIndices("input_indices")}; value += (t * t);`, "value = sqrt(value);"]);
  }, wh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceLogSumExp", e3, (n2, o2) => [`var value = ${o2.type.storage}(0);`, "", `value += exp(${n2.getByIndices("input_indices")});`, "value = log(value);"]);
  }, $h = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceMax", e3, (n2, o2, i2) => {
      let a2 = [];
      for (let u2 = 0; u2 < n2.rank; u2++) (i2.indexOf(u2) >= 0 || i2.length === 0) && a2.push(n2.indicesSet("input_indices", u2, 0));
      return [`${a2.join(`
`)}`, `var value = ${n2.getByIndices("input_indices")};`, `value = max(value, ${n2.getByIndices("input_indices")});`, ""];
    });
  }, vh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceMean", e3, (n2, o2, i2) => {
      let a2 = 1;
      for (let u2 = 0; u2 < n2.rank; u2++) (i2.indexOf(u2) >= 0 || i2.length === 0) && (a2 *= t2.inputs[0].dims[u2]);
      return ["var sum = f32(0);", "", `sum += f32(${n2.getByIndices("input_indices")});`, `let value = ${o2.type.value}(sum / ${a2});`];
    });
  }, xh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceMin", e3, (n2, o2, i2) => {
      let a2 = [];
      for (let u2 = 0; u2 < n2.rank; u2++) (i2.indexOf(u2) >= 0 || i2.length === 0) && a2.push(`input_indices[${u2}] = 0;`);
      return [`${a2.join(`
`)}`, `var value = ${n2.getByIndices("input_indices")};`, `value = min(value, ${n2.getByIndices("input_indices")});`, ""];
    });
  }, Sh = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceProd", e3, (n2, o2) => [`var value = ${o2.type.storage}(1);`, "", `value *= ${n2.getByIndices("input_indices")};`, ""]);
  }, Th = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceSum", e3, (n2, o2) => [`var value = ${o2.type.storage}(0);`, "", `value += ${n2.getByIndices("input_indices")};`, ""]);
  }, Ih = (t2, e3) => {
    at(t2.inputs), st(t2, "ReduceSumSquare", e3, (n2, o2) => [`var t = ${o2.type.value}(0); var value = ${o2.type.value}(0);`, "", `t = ${n2.getByIndices("input_indices")}; value += t * t;`, ""]);
  }, ut = (t2, e3, r2) => {
    if (e3.length === 0) return r2;
    let n2 = 1, o2 = 1;
    for (let i2 = 0; i2 < e3.length; i2++) e3.indexOf(i2) === -1 ? n2 *= t2[i2] : o2 *= t2[i2];
    return o2 < 32 && n2 > 1024;
  }, su = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? vh(t2, e3) : Qs(t2, e3);
  }, uu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? yh(t2, e3) : Xs(t2, e3);
  }, du = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? _h(t2, e3) : Ys(t2, e3);
  }, lu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? wh(t2, e3) : Js(t2, e3);
  }, cu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? $h(t2, e3) : eu(t2, e3);
  }, pu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? xh(t2, e3) : tu(t2, e3);
  }, mu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? Sh(t2, e3) : ru(t2, e3);
  }, fu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? Th(t2, e3) : nu(t2, e3);
  }, hu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? Ih(t2, e3) : ou(t2, e3);
  }, gu = (t2, e3) => {
    ut(t2.inputs[0].dims, e3.axes, e3.noopWithEmptyAxes) ? bh(t2, e3) : iu(t2, e3);
  };
});
var bu;
var yu;
var _u;
var _o;
var wu = V(() => {
  "use strict";
  ee();
  Ce();
  Jr();
  bu = (t2) => {
    if (!t2 || t2.length === 0 || t2.length > 2) throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");
    if (t2[0].dataType !== 1) throw new Error("Invalid input type.");
  }, yu = (t2, e3) => {
    bu(t2.inputs);
    let r2 = (n2, o2, i2) => {
      let a2 = [];
      for (let u2 = 0; u2 < n2.rank; u2++) (i2.indexOf(u2) >= 0 || i2.length === 0) && a2.push(`input_indices[${u2}] = 0;`);
      return [`${a2.join(`
`)}`, `var value = ${n2.getByIndices("input_indices")};
var best_index : i32 = 0;`, `if (${n2.getByIndices("input_indices")} ${e3.selectLastIndex > 0 ? "<=" : "<"} value) {
         value = ${n2.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`, "", o2.setByOffset("global_idx", "best_index")];
    };
    t2.compute(en("ArgMin", { hint: e3.cacheKey, inputDependencies: ["rank"] }, [t2.inputs[0]], r2, [e3.axis], 7, e3.keepDims), { inputs: [0] });
  }, _u = (t2, e3) => {
    bu(t2.inputs);
    let r2 = (n2, o2, i2) => {
      let a2 = [];
      for (let u2 = 0; u2 < n2.rank; u2++) (i2.indexOf(u2) >= 0 || i2.length === 0) && a2.push(`input_indices[${u2}] = 0;`);
      return [`${a2.join(`
`)}`, `var value = ${n2.getByIndices("input_indices")};
var best_index : i32 = 0;`, `if (${n2.getByIndices("input_indices")} ${e3.selectLastIndex > 0 ? ">=" : ">"} value) {
         value = ${n2.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`, "", o2.setByOffset("global_idx", "best_index")];
    };
    t2.compute(en("argMax", { hint: e3.cacheKey, inputDependencies: ["rank"] }, [t2.inputs[0]], r2, [e3.axis], 7, e3.keepDims), { inputs: [0] });
  }, _o = (t2) => J(t2);
});
var Ch;
var wo;
var Ah;
var Eh;
var kh;
var Ft;
var Ph;
var $u;
var tn = V(() => {
  "use strict";
  ee();
  te();
  Qr();
  oe();
  Ch = (t2, e3) => {
    let r2 = t2[0], n2 = t2[1], o2 = t2[2], i2 = t2[3], a2 = t2[4], u2 = t2[5];
    if (a2 && u2) throw new Error("Attention cannot have both past and attention_bias");
    if (r2.dims.length !== 3) throw new Error('Input "input" must have 3 dimensions');
    let d2 = r2.dims[0], c2 = r2.dims[1], p2 = r2.dims[2];
    if (o2.dims.length !== 1) throw new Error('Input "bias" is expected to have 1 dimensions');
    if (n2.dims.length !== 2) throw new Error('Input "weights" is expected to have 2 dimensions');
    if (n2.dims[0] !== p2) throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");
    if (o2.dims[0] !== n2.dims[1]) throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');
    let m2 = o2.dims[0] / 3, g2 = m2, y = g2;
    if (e3.qkvHiddenSizes.length > 0) {
      if (e3.qkvHiddenSizes.length !== 3) throw new Error("qkv_hidden_sizes attribute should have 3 elements");
      for (let T of e3.qkvHiddenSizes) if (T % e3.numHeads !== 0) throw new Error("qkv_hidden_sizes should be divisible by num_heads");
      m2 = e3.qkvHiddenSizes[0], g2 = e3.qkvHiddenSizes[1], y = e3.qkvHiddenSizes[2];
    }
    let b = c2;
    if (m2 !== g2) throw new Error("qkv_hidden_sizes first element should be same as the second");
    if (o2.dims[0] !== m2 + g2 + y) throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');
    let _ = 0;
    if (a2) {
      if (g2 !== y) throw new Error('Input "past" expect k_hidden_size == v_hidden_size');
      if (a2.dims.length !== 5) throw new Error('Input "past" must have 5 dimensions');
      if (a2.dims[0] !== 2) throw new Error('Input "past" first dimension must be 2');
      if (a2.dims[1] !== d2) throw new Error('Input "past" second dimension must be batch_size');
      if (a2.dims[2] !== e3.numHeads) throw new Error('Input "past" third dimension must be num_heads');
      if (a2.dims[4] !== g2 / e3.numHeads) throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');
      e3.pastPresentShareBuffer || (_ = a2.dims[3]);
    }
    let S = b + _, x = -1, v = 0;
    if (i2) throw new Error("Mask not supported");
    if (a2) throw new Error("past is not supported");
    if (u2) {
      if (u2.dims.length !== 4) throw new Error('Input "attention_bias" must have 4 dimensions');
      if (u2.dims[0] !== d2 || u2.dims[1] !== e3.numHeads || u2.dims[2] !== c2 || u2.dims[3] !== S) throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)');
    }
    return { batchSize: d2, sequenceLength: c2, pastSequenceLength: _, kvSequenceLength: b, totalSequenceLength: S, maxSequenceLength: x, inputHiddenSize: p2, hiddenSize: m2, vHiddenSize: y, headSize: Math.floor(m2 / e3.numHeads), vHeadSize: Math.floor(y / e3.numHeads), numHeads: e3.numHeads, isUnidirectional: false, pastPresentShareBuffer: false, maskFilterValue: e3.maskFilterValue, maskType: v, scale: e3.scale, broadcastResPosBias: false, passPastInKv: false, qkvFormat: 1 };
  }, wo = (t2, e3, r2) => e3 && t2 ? `
      let total_sequence_length_input = u32(${e3.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${t2?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       ` : `
    ${r2 ? "let past_sequence_length = uniforms.past_sequence_length" : ""};
    let present_sequence_length = total_sequence_length;
    `, Ah = (t2, e3, r2, n2, o2, i2, a2, u2) => {
    let d2 = fe(a2 ? 1 : i2), c2 = 64, p2 = i2 / d2;
    p2 < c2 && (c2 = 32);
    let m2 = Math.ceil(i2 / d2 / c2), g2 = [{ type: 12, data: e3 }, { type: 12, data: r2 }, { type: 12, data: n2 }, { type: 12, data: o2 }, { type: 12, data: p2 }, { type: 12, data: m2 }], y = we(t2.dataType, d2), b = Ae(1, d2), _ = ["type"];
    a2 && _.push("type"), u2 && _.push("type");
    let S = (x) => {
      let v = R("x", t2.dataType, t2.dims, d2), T = [v], I = a2 ? O("seq_lens", a2.dataType, a2.dims) : void 0;
      I && T.push(I);
      let E = u2 ? O("total_sequence_length_input", u2.dataType, u2.dims) : void 0;
      E && T.push(E);
      let A = Ae(t2.dataType), D = [{ name: "batch_size", type: "u32" }, { name: "num_heads", type: "u32" }, { name: "past_sequence_length", type: "u32" }, { name: "sequence_length", type: "u32" }, { name: "total_sequence_length", type: "u32" }, { name: "elements_per_thread", type: "u32" }];
      return `
  var<workgroup> thread_max: array<f32, ${c2}>;
  var<workgroup> thread_sum: array<f32, ${c2}>;
  ${x.registerUniforms(D).declareVariables(...T)}
  ${x.mainStart([c2, 1, 1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${wo(I, E, false)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${c2}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${a2 ? "u32(past_sequence_length + workgroup_id.y + 1)" : "total_sequence_length"};
    var thread_max_vector = ${b}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${b}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(() => {
        switch (d2) {
          case 1:
            return "thread_max_vector";
          case 2:
            return "max(thread_max_vector.x, thread_max_vector.y)";
          case 4:
            return "max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";
          default:
            throw new Error(`Unsupported components: ${d2}`);
        }
      })()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${c2}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${b}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${b}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(() => {
        switch (d2) {
          case 1:
            return "sum_vector";
          case 2:
            return "sum_vector.x + sum_vector.y";
          case 4:
            return "sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";
          default:
            throw new Error(`Unsupported components: ${d2}`);
        }
      })()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${c2}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${v.type.value}(${A}(1.0) / ${A}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${b}(x[offset + i]);
        x[offset + i] = ${v.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${a2 ? `
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${v.type.value}(${A}(0));
        }` : ""};
  }`;
    };
    return { name: "AttentionProbsSoftmax", shaderCache: { hint: `${c2};${y};${d2}`, inputDependencies: _ }, getShaderSource: S, getRunData: () => ({ outputs: [], dispatchGroup: { x: 1, y: o2, z: e3 * r2 }, programUniforms: g2 }) };
  }, Eh = (t2, e3, r2, n2, o2, i2, a2, u2, d2) => {
    let c2 = a2 + i2.kvSequenceLength, p2 = [i2.batchSize, i2.numHeads, i2.sequenceLength, c2], m2 = t2 > 1 && n2, g2 = i2.kvNumHeads ? i2.kvNumHeads : i2.numHeads, y = m2 ? [i2.batchSize, g2, c2, i2.headSize] : void 0, b = i2.nReps ? i2.nReps : 1, _ = i2.scale === 0 ? 1 / Math.sqrt(i2.headSize) : i2.scale, S = fe(i2.headSize), x = i2.headSize / S, v = 12, T = { x: Math.ceil(c2 / v), y: Math.ceil(i2.sequenceLength / v), z: i2.batchSize * i2.numHeads }, I = [{ type: 12, data: i2.sequenceLength }, { type: 12, data: x }, { type: 12, data: c2 }, { type: 12, data: i2.numHeads }, { type: 12, data: i2.headSize }, { type: 1, data: _ }, { type: 12, data: a2 }, { type: 12, data: i2.kvSequenceLength }, { type: 12, data: b }], E = m2 && n2 && k.size(n2.dims) > 0, A = ["type", "type"];
    E && A.push("type"), o2 && A.push("type"), u2 && A.push("type"), d2 && A.push("type");
    let D = [{ dims: p2, dataType: e3.dataType, gpuDataType: 0 }];
    m2 && D.push({ dims: y, dataType: e3.dataType, gpuDataType: 0 });
    let w = (U) => {
      let N = O("q", e3.dataType, e3.dims, S), F = O("key", r2.dataType, r2.dims, S), q = [N, F];
      if (E) {
        let ne = O("past_key", n2.dataType, n2.dims, S);
        q.push(ne);
      }
      o2 && q.push(O("attention_bias", o2.dataType, o2.dims));
      let Y = u2 ? O("seq_lens", u2.dataType, u2.dims) : void 0;
      Y && q.push(Y);
      let z = d2 ? O("total_sequence_length_input", d2.dataType, d2.dims) : void 0;
      z && q.push(z);
      let L = R("output", e3.dataType, p2), Q = [L];
      m2 && Q.push(R("present_key", e3.dataType, y, S));
      let X = Ae(1, S), Z = [{ name: "M", type: "u32" }, { name: "K", type: "u32" }, { name: "N", type: "u32" }, { name: "num_heads", type: "u32" }, { name: "head_size", type: "u32" }, { name: "alpha", type: "f32" }, { name: "past_sequence_length", type: "u32" }, { name: "kv_sequence_length", type: "u32" }, { name: "n_reps", type: "u32" }];
      return `
  const TILE_SIZE = ${v}u;

  var<workgroup> tileQ: array<${N.type.storage}, ${v * v}>;
  var<workgroup> tileK: array<${N.type.storage}, ${v * v}>;
  ${U.registerUniforms(Z).declareVariables(...q, ...Q)}
  ${U.mainStart([v, v, 1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${b === 1 ? "headIdx" : "headIdx / uniforms.n_reps"};
    let kv_num_heads = ${b === 1 ? "uniforms.num_heads" : "uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${wo(Y, z, true)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E && m2 ? "let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;" : ""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${m2 ? "let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;" : ""}
    var value = ${X}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E && m2 ? `
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }` : `
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${m2 ? `if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }` : ""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${X}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(() => {
        switch (S) {
          case 1:
            return "value";
          case 2:
            return "value.x + value.y";
          case 4:
            return "value.x + value.y + value.z + value.w";
          default:
            throw new Error(`Unsupported components: ${S}`);
        }
      })()};
        output[outputIdx] = ${L.type.value} (sum * uniforms.alpha) + ${o2 ? "attention_bias[outputIdx]" : "0.0"};
    }
  }`;
    };
    return { name: "AttentionProbs", shaderCache: { hint: `${S};${o2 !== void 0};${n2 !== void 0};${t2}`, inputDependencies: A }, getRunData: () => ({ outputs: D, dispatchGroup: T, programUniforms: I }), getShaderSource: w };
  }, kh = (t2, e3, r2, n2, o2, i2, a2 = void 0, u2 = void 0) => {
    let d2 = i2 + o2.kvSequenceLength, c2 = o2.nReps ? o2.nReps : 1, p2 = o2.vHiddenSize * c2, m2 = t2 > 1 && n2, g2 = o2.kvNumHeads ? o2.kvNumHeads : o2.numHeads, y = m2 ? [o2.batchSize, g2, d2, o2.headSize] : void 0, b = [o2.batchSize, o2.sequenceLength, p2], _ = 12, S = { x: Math.ceil(o2.vHeadSize / _), y: Math.ceil(o2.sequenceLength / _), z: o2.batchSize * o2.numHeads }, x = [{ type: 12, data: o2.sequenceLength }, { type: 12, data: d2 }, { type: 12, data: o2.vHeadSize }, { type: 12, data: o2.numHeads }, { type: 12, data: o2.headSize }, { type: 12, data: p2 }, { type: 12, data: i2 }, { type: 12, data: o2.kvSequenceLength }, { type: 12, data: c2 }], v = m2 && n2 && k.size(n2.dims) > 0, T = ["type", "type"];
    v && T.push("type"), a2 && T.push("type"), u2 && T.push("type");
    let I = [{ dims: b, dataType: e3.dataType, gpuDataType: 0 }];
    m2 && I.push({ dims: y, dataType: e3.dataType, gpuDataType: 0 });
    let E = (A) => {
      let D = O("probs", e3.dataType, e3.dims), w = O("v", r2.dataType, r2.dims), U = [D, w];
      v && U.push(O("past_value", n2.dataType, n2.dims));
      let N = a2 ? O("seq_lens", a2.dataType, a2.dims) : void 0;
      a2 && U.push(N);
      let F = u2 ? O("total_sequence_length_input", u2.dataType, u2.dims) : void 0;
      u2 && U.push(F);
      let Y = [R("output", e3.dataType, b)];
      m2 && Y.push(R("present_value", e3.dataType, y));
      let z = [{ name: "M", type: "u32" }, { name: "K", type: "u32" }, { name: "N", type: "u32" }, { name: "num_heads", type: "u32" }, { name: "head_size", type: "u32" }, { name: "v_hidden_size", type: "u32" }, { name: "past_sequence_length", type: "u32" }, { name: "kv_sequence_length", type: "u32" }, { name: "n_reps", type: "u32" }];
      return `
  const TILE_SIZE = ${_}u;
  var<workgroup> tileQ: array<${D.type.value}, ${_ * _}>;
  var<workgroup> tileV: array<${D.type.value}, ${_ * _}>;
  ${A.registerUniforms(z).declareVariables(...U, ...Y)}
  ${A.mainStart([_, _, 1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${c2 === 1 ? "headIdx" : "headIdx / uniforms.n_reps"};
   let kv_num_heads = ${c2 === 1 ? "uniforms.num_heads" : "uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${wo(N, F, true)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${v && m2 ? "let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;" : ""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${m2 ? "let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;" : ""}
   var value = ${D.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${v && m2 ? `
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      ` : `
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${m2 ? `
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }` : ""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`;
    };
    return { name: "AttentionScore", shaderCache: { hint: `${n2 !== void 0};${t2}`, inputDependencies: T }, getRunData: () => ({ outputs: I, dispatchGroup: S, programUniforms: x }), getShaderSource: E };
  }, Ft = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2, p2 = void 0, m2 = void 0) => {
    let g2 = Math.min(t2.outputCount, 1 + (a2 ? 1 : 0) + (u2 ? 1 : 0)), y = g2 > 1 ? a2 : void 0, b = g2 > 1 ? u2 : void 0, _ = g2 > 1 ? c2.pastSequenceLength : 0, S = _ + c2.kvSequenceLength, x = d2 && k.size(d2.dims) > 0 ? d2 : void 0, v = [e3, r2];
    y && k.size(y.dims) > 0 && v.push(y), x && v.push(x), p2 && v.push(p2), m2 && v.push(m2);
    let T = t2.compute(Eh(g2, e3, r2, y, x, c2, _, p2, m2), { inputs: v, outputs: g2 > 1 ? [-1, 1] : [-1] })[0];
    t2.compute(Ah(T, c2.batchSize, c2.numHeads, _, c2.sequenceLength, S, p2, m2), { inputs: p2 && m2 ? [T, p2, m2] : [T], outputs: [] });
    let I = [T, n2];
    b && k.size(b.dims) > 0 && I.push(b), p2 && I.push(p2), m2 && I.push(m2), t2.compute(kh(g2, T, n2, b, c2, _, p2, m2), { inputs: I, outputs: g2 > 1 ? [0, 2] : [0] });
  }, Ph = (t2, e3) => {
    let r2 = [e3.batchSize, e3.numHeads, e3.sequenceLength, e3.headSize], n2 = e3.sequenceLength, o2 = e3.inputHiddenSize, i2 = e3.headSize, a2 = 12, u2 = { x: Math.ceil(e3.headSize / a2), y: Math.ceil(e3.sequenceLength / a2), z: e3.batchSize * e3.numHeads }, d2 = [t2.inputs[0], t2.inputs[1], t2.inputs[2]], c2 = [{ type: 12, data: n2 }, { type: 12, data: o2 }, { type: 12, data: i2 }, { type: 12, data: e3.numHeads }, { type: 12, data: e3.headSize }, { type: 12, data: e3.hiddenSize }, { type: 12, data: e3.hiddenSize + e3.hiddenSize + e3.vHiddenSize }], p2 = (m2) => {
      let g2 = R("output_q", d2[0].dataType, r2), y = R("output_k", d2[0].dataType, r2), b = R("output_v", d2[0].dataType, r2), _ = O("input", d2[0].dataType, d2[0].dims), S = O("weight", d2[1].dataType, d2[1].dims), x = O("bias", d2[2].dataType, d2[2].dims), v = _.type.storage, T = [{ name: "M", type: "u32" }, { name: "K", type: "u32" }, { name: "N", type: "u32" }, { name: "num_heads", type: "u32" }, { name: "head_size", type: "u32" }, { name: "hidden_size", type: "u32" }, { name: "ldb", type: "u32" }];
      return `
  const TILE_SIZE = ${a2}u;
  var<workgroup> tileInput: array<${v}, ${a2 * a2}>;
  var<workgroup> tileWeightQ: array<${v}, ${a2 * a2}>;
  var<workgroup> tileWeightK: array<${v}, ${a2 * a2}>;
  var<workgroup> tileWeightV: array<${v}, ${a2 * a2}>;
  ${m2.registerUniforms(T).declareVariables(_, S, x, g2, y, b)}
  ${m2.mainStart([a2, a2, 1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${v}(0);
    var valueK = ${v}(0);
    var valueV = ${v}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`;
    };
    return t2.compute({ name: "AttentionPrepare", shaderCache: { inputDependencies: ["type", "type", "type"] }, getRunData: () => ({ outputs: [{ dims: r2, dataType: t2.inputs[0].dataType, gpuDataType: 0 }, { dims: r2, dataType: t2.inputs[0].dataType, gpuDataType: 0 }, { dims: r2, dataType: t2.inputs[0].dataType, gpuDataType: 0 }], dispatchGroup: u2, programUniforms: c2 }), getShaderSource: p2 }, { inputs: d2, outputs: [-1, -1, -1] });
  }, $u = (t2, e3) => {
    let r2 = Ch(t2.inputs, e3), [n2, o2, i2] = Ph(t2, r2);
    return Ft(t2, n2, o2, i2, t2.inputs[4], void 0, void 0, void 0, t2.inputs[5], r2);
  };
});
var Oh;
var Dh;
var zh;
var vu;
var xu = V(() => {
  "use strict";
  Le();
  ee();
  te();
  Ce();
  oe();
  Oh = (t2, e3) => {
    if (!t2 || t2.length !== 5) throw new Error("BatchNormalization requires 5 inputs");
    let r2 = (n2, o2, i2) => {
      let a2 = o2.length;
      if (a2 !== n2.length) throw new Error(`${i2}: num dimensions != ${a2}`);
      o2.forEach((u2, d2) => {
        if (u2 !== n2[d2]) throw new Error(`${i2}: dim[${d2}] do not match`);
      });
    };
    if (t2[0].dims.length > 1) {
      let n2 = e3.format === "NHWC" ? e3.spatial ? t2[0].dims.slice(-1) : t2[0].dims.slice(-1).concat(t2[0].dims.slice(1, t2[0].dims.length - 1)) : t2[0].dims.slice(1, e3.spatial ? 2 : void 0);
      r2(t2[1].dims, n2, "Invalid input scale"), r2(t2[2].dims, n2, "Invalid input B"), r2(t2[3].dims, n2, "Invalid input mean"), r2(t2[4].dims, n2, "Invalid input var");
    } else r2(t2[1].dims, [1], "Invalid input scale"), r2(t2[2].dims, [1], "Invalid input B"), r2(t2[3].dims, [1], "Invalid input mean"), r2(t2[4].dims, [1], "Invalid input var");
  }, Dh = (t2, e3) => {
    let { epsilon: r2, spatial: n2, format: o2 } = e3, i2 = t2[0].dims, a2 = n2 ? fe(i2[i2.length - 1]) : 1, u2 = o2 === "NHWC" && i2.length > 1 ? a2 : 1, d2 = k.size(i2) / a2, c2 = n2, p2 = c2 ? i2.length : i2, m2 = O("x", t2[0].dataType, t2[0].dims, a2), g2 = O("scale", t2[1].dataType, t2[1].dims, u2), y = O("bias", t2[2].dataType, t2[2].dims, u2), b = O("inputMean", t2[3].dataType, t2[3].dims, u2), _ = O("inputVar", t2[4].dataType, t2[4].dims, u2), S = R("y", t2[0].dataType, p2, a2), x = () => {
      let T = "";
      if (n2) T = `let cOffset = ${i2.length === 1 ? "0u" : o2 === "NHWC" ? `outputIndices[${i2.length - 1}] / ${a2}` : "outputIndices[1]"};`;
      else if (o2 === "NCHW") T = `
            ${S.indicesSet("outputIndices", "0", "0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;
      else {
        T = `var cIndices = ${g2.type.indices}(0);
                       cIndices[0] = outputIndices[${i2.length - 1}];`;
        for (let I = 1; I < g2.rank; I++) T += `cIndices[${I}] = outputIndices[${I}];`;
        T += `let cOffset = ${g2.indicesToOffset("cIndices")};`;
      }
      return T;
    }, v = (T) => `
  const epsilon = ${r2};
  ${T.registerUniform("outputSize", "u32").declareVariables(m2, g2, y, b, _, S)}
  ${T.mainStart()}
  ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${a2}`)};
    ${x()}
    let scale = ${g2.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${b.getByOffset("cOffset")};
    let inputVar = ${_.getByOffset("cOffset")};
    let x = ${m2.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx", "value")}
  }`;
    return { name: "BatchNormalization", shaderCache: { hint: `${e3.epsilon}_${e3.format}_${n2}_${a2}`, inputDependencies: c2 ? ["rank", "type", "type", "type", "type"] : void 0 }, getShaderSource: v, getRunData: () => ({ outputs: [{ dims: t2[0].dims, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(d2 / 64) }, programUniforms: c2 ? [{ type: 12, data: d2 }, ...W(i2)] : [{ type: 12, data: d2 }] }) };
  }, zh = (t2) => J(t2), vu = (t2, e3) => {
    let { inputs: r2, outputCount: n2 } = t2, o2 = zh({ ...e3, outputCount: n2 });
    if (_e.webgpu.validateInputContent && Oh(r2, o2), e3.trainingMode) throw new Error("BatchNormalization trainingMode is not supported yet.");
    t2.compute(Dh(r2, o2));
  };
});
var Bh;
var Mh;
var Su;
var Tu = V(() => {
  "use strict";
  te();
  oe();
  Bh = (t2) => {
    if (t2[0].dims.length !== 3) throw new Error("input should have 3 dimensions");
    if (![320, 640, 1280].includes(t2[0].dims[2])) throw new Error("number of channels should be 320, 640 or 1280");
    if (t2[1].dims.length !== 1) throw new Error("bias is expected to have 1 dimensions");
    if (t2[0].dims[2] !== t2[1].dims[0]) throw new Error("last dimension of input and bias are not the same");
  }, Mh = (t2) => {
    let e3 = t2[0].dims, r2 = t2[0].dims[2], n2 = k.size(e3) / 4, o2 = t2[0].dataType, i2 = O("input", o2, e3, 4), a2 = O("bias", o2, [r2], 4), u2 = O("residual", o2, e3, 4), d2 = R("output", o2, e3, 4);
    return { name: "BiasAdd", getRunData: () => ({ outputs: [{ dims: e3, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(n2 / 64) } }), getShaderSource: (p2) => `
  const channels = ${r2}u / 4;
  ${p2.declareVariables(i2, a2, u2, d2)}

  ${p2.mainStart()}
    ${p2.guardAgainstOutOfBoundsWorkgroupSizes(n2)}
    let value = ${i2.getByOffset("global_idx")}
      + ${a2.getByOffset("global_idx % channels")} + ${u2.getByOffset("global_idx")};
    ${d2.setByOffset("global_idx", "value")}
  }` };
  }, Su = (t2) => {
    Bh(t2.inputs), t2.compute(Mh(t2.inputs));
  };
});
var Rh;
var he;
var Iu;
var Cu;
var Au;
var Eu;
var ku;
var Pu;
var Ou;
var Du;
var zu;
var Uh;
var Bu;
var Mu;
var Ru;
var Uu;
var ar;
var Nu;
var rn;
var Vu;
var Lu;
var Wu;
var Gu;
var Hu;
var Fu;
var qu;
var Ku;
var ju;
var Zu;
var Qu;
var Xu;
var Yu;
var Ju;
var ed;
var td;
var rd;
var nd;
var od;
var $o;
var vo;
var id;
var ad;
var sd;
var Nh;
var Vh;
var ud;
var nn = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Rh = (t2, e3, r2, n2, o2, i2, a2) => {
    let u2 = Math.ceil(e3 / 4), d2 = "";
    typeof o2 == "string" ? d2 = `${o2}(a)` : d2 = o2("a");
    let c2 = O("inputData", r2, [u2], 4), p2 = R("outputData", n2, [u2], 4), m2 = [{ name: "vec_size", type: "u32" }];
    return a2 && m2.push(...a2), `
      ${t2.registerUniforms(m2).declareVariables(c2, p2)}

  ${i2 ?? ""}

  ${t2.mainStart()}
    ${t2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${c2.getByOffset("global_idx")};
    ${p2.setByOffset("global_idx", d2)}
  }`;
  }, he = (t2, e3, r2, n2, o2, i2 = t2.dataType, a2, u2) => {
    let d2 = [{ type: 12, data: Math.ceil(k.size(t2.dims) / 4) }];
    return a2 && d2.push(...a2), { name: e3, shaderCache: { hint: o2, inputDependencies: ["type"] }, getShaderSource: (c2) => Rh(c2, k.size(t2.dims), t2.dataType, i2, r2, n2, u2), getRunData: (c2) => ({ outputs: [{ dims: t2.dims, dataType: i2 }], dispatchGroup: { x: Math.ceil(k.size(c2[0].dims) / 64 / 4) }, programUniforms: d2 }) };
  }, Iu = (t2) => {
    t2.compute(he(t2.inputs[0], "Abs", "abs"));
  }, Cu = (t2) => {
    t2.compute(he(t2.inputs[0], "Acos", "acos"));
  }, Au = (t2) => {
    t2.compute(he(t2.inputs[0], "Acosh", "acosh"));
  }, Eu = (t2) => {
    t2.compute(he(t2.inputs[0], "Asin", "asin"));
  }, ku = (t2) => {
    t2.compute(he(t2.inputs[0], "Asinh", "asinh"));
  }, Pu = (t2) => {
    t2.compute(he(t2.inputs[0], "Atan", "atan"));
  }, Ou = (t2) => {
    t2.compute(he(t2.inputs[0], "Atanh", "atanh"));
  }, Du = (t2) => J(t2), zu = (t2, e3) => {
    let r2;
    switch (e3.to) {
      case 10:
        r2 = "vec4<f16>";
        break;
      case 1:
        r2 = "vec4<f32>";
        break;
      case 12:
        r2 = "vec4<u32>";
        break;
      case 6:
        r2 = "vec4<i32>";
        break;
      case 9:
        r2 = "vec4<bool>";
        break;
      default:
        throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${e3.to}`);
    }
    t2.compute(he(t2.inputs[0], "Cast", r2, void 0, e3.cacheKey, e3.to));
  }, Uh = (t2) => {
    let e3, r2, n2 = t2.length >= 2 && t2[1].data !== 0, o2 = t2.length >= 3 && t2[2].data !== 0;
    switch (t2[0].dataType) {
      case 1:
        e3 = n2 ? t2[1].getFloat32Array()[0] : -34028234663852886e22, r2 = o2 ? t2[2].getFloat32Array()[0] : 34028234663852886e22;
        break;
      case 10:
        e3 = n2 ? t2[1].getUint16Array()[0] : 64511, r2 = o2 ? t2[2].getUint16Array()[0] : 31743;
        break;
      default:
        throw new Error("Unsupport data type");
    }
    return J({ min: e3, max: r2 });
  }, Bu = (t2, e3) => {
    let r2 = e3 || Uh(t2.inputs), n2 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "Clip", (o2) => `clamp(${o2}, vec4<${n2}>(uniforms.min), vec4<${n2}>(uniforms.max))`, void 0, r2.cacheKey, void 0, [{ type: t2.inputs[0].dataType, data: r2.min }, { type: t2.inputs[0].dataType, data: r2.max }], [{ name: "min", type: n2 }, { name: "max", type: n2 }]), { inputs: [0] });
  }, Mu = (t2) => {
    t2.compute(he(t2.inputs[0], "Ceil", "ceil"));
  }, Ru = (t2) => {
    t2.compute(he(t2.inputs[0], "Cos", "cos"));
  }, Uu = (t2) => {
    t2.compute(he(t2.inputs[0], "Cosh", "cosh"));
  }, ar = (t2) => J(t2), Nu = (t2, e3) => {
    let r2 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "Elu", (n2) => `elu_vf32(${n2})`, `
  const elu_alpha_ = ${r2}(${e3.alpha});

  fn elu_f32(a: ${r2}) -> ${r2} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r2}>) -> vec4<${r2}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`, e3.cacheKey));
  }, rn = (t2 = "f32") => `
const r0: ${t2} = 0.3275911;
const r1: ${t2} = 0.254829592;
const r2: ${t2} = -0.284496736;
const r3: ${t2} = 1.421413741;
const r4: ${t2} = -1.453152027;
const r5: ${t2} = 1.061405429;

fn erf_vf32(v: vec4<${t2}>) -> vec4<${t2}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`, Vu = (t2) => {
    let e3 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "Erf", (r2) => `erf_vf32(${r2})`, rn(e3)));
  }, Lu = (t2) => {
    t2.compute(he(t2.inputs[0], "Exp", "exp"));
  }, Wu = (t2) => {
    t2.compute(he(t2.inputs[0], "Floor", "floor"));
  }, Gu = (t2) => {
    let e3 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "Gelu", (r2) => `0.5 * ${r2} * (1.0 + erf_vf32(${r2} * 0.7071067811865475))`, rn(e3)));
  }, Hu = (t2, e3) => {
    let r2 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "LeakyRelu", (n2) => `select(leaky_relu_alpha_ * ${n2}, ${n2}, ${n2} >= vec4<${r2}>(0.0))`, `const leaky_relu_alpha_ = ${r2}(${e3.alpha});`, e3.cacheKey));
  }, Fu = (t2) => {
    t2.compute(he(t2.inputs[0], "Not", (e3) => `!${e3}`));
  }, qu = (t2) => {
    t2.compute(he(t2.inputs[0], "Neg", (e3) => `-${e3}`));
  }, Ku = (t2) => {
    t2.compute(he(t2.inputs[0], "Reciprocal", (e3) => `1.0/${e3}`));
  }, ju = (t2) => {
    let e3 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "Relu", (r2) => `select(vec4<${e3}>(0.0), ${r2}, ${r2} > vec4<${e3}>(0.0))`));
  }, Zu = (t2) => {
    t2.compute(he(t2.inputs[0], "Sigmoid", (e3) => `(1.0 / (1.0 + exp(-${e3})))`));
  }, Qu = (t2) => J(t2), Xu = (t2, e3) => {
    let r2 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "HardSigmoid", (n2) => `max(vec4<${r2}>(0.0), min(vec4<${r2}>(1.0), ${e3.alpha} * ${n2} + vec4<${r2}>(${e3.beta})))`, void 0, e3.cacheKey));
  }, Yu = (t2) => {
    let e3 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "HardSwish", (r2) => `${r2} * max(vec4<${e3}>(0.0), min(vec4<${e3}>(1.0), vec4<${e3}>(${e3}(1.0 / 6.0)) * ${r2} + vec4<${e3}>(0.5)))`));
  }, Ju = (t2) => {
    t2.compute(he(t2.inputs[0], "Sin", "sin"));
  }, ed = (t2) => {
    t2.compute(he(t2.inputs[0], "Sinh", "sinh"));
  }, td = (t2) => {
    t2.compute(he(t2.inputs[0], "Sqrt", "sqrt"));
  }, rd = (t2) => {
    t2.compute(he(t2.inputs[0], "Tan", "tan"));
  }, nd = (t2) => `sign(${t2}) * (1 - exp(-2 * abs(${t2}))) / (1 + exp(-2 * abs(${t2})))`, od = (t2) => {
    t2.compute(he(t2.inputs[0], "Tanh", nd));
  }, $o = (t2 = "f32") => `
const fast_gelu_a: ${t2} = 0.5;
const fast_gelu_b: ${t2} = 0.7978845608028654;
const fast_gelu_c: ${t2} = 0.035677408136300125;

fn tanh_v(v: vec4<${t2}>) -> vec4<${t2}> {
  return ${nd("v")};
}
`, vo = (t2) => `(fast_gelu_a + fast_gelu_a * tanh_v(${t2} * (fast_gelu_c * ${t2} * ${t2} + fast_gelu_b))) * ${t2}`, id = (t2) => {
    let e3 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "FastGelu", vo, $o(e3), void 0, t2.inputs[0].dataType));
  }, ad = (t2, e3) => {
    let r2 = Ae(t2.inputs[0].dataType);
    return t2.compute(he(t2.inputs[0], "ThresholdedRelu", (n2) => `select(vec4<${r2}>(0.0), ${n2}, ${n2} > thresholded_relu_alpha_)`, `const thresholded_relu_alpha_ = vec4<${r2}>(${e3.alpha});`, e3.cacheKey)), 0;
  }, sd = (t2) => {
    t2.compute(he(t2.inputs[0], "Log", "log"));
  }, Nh = (t2, e3) => `
const alpha = vec4<${t2}>(${e3});
const one = ${t2}(1.0);
const zero = ${t2}(0.0);

fn quick_gelu_impl(x: vec4<${t2}>) -> vec4<${t2}> {
  let v = x *alpha;
  var x1 : vec4<${t2}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`, Vh = (t2) => `quick_gelu_impl(${t2})`, ud = (t2, e3) => {
    let r2 = Ae(t2.inputs[0].dataType);
    t2.compute(he(t2.inputs[0], "QuickGelu", Vh, Nh(r2, e3.alpha), e3.cacheKey, t2.inputs[0].dataType));
  };
});
var Lh;
var Wh;
var ld;
var cd = V(() => {
  "use strict";
  te();
  oe();
  nn();
  Lh = (t2) => {
    if (t2[0].dims.length !== 3) throw new Error("input should have 3 dimensions");
    if (![2560, 5120, 10240].includes(t2[0].dims[2])) throw new Error("hidden state should be 2560, 5120 or 10240");
    if (t2[1].dims.length !== 1) throw new Error("bias is expected to have 1 dimensions");
    if (t2[0].dims[2] !== t2[1].dims[0]) throw new Error("last dimension of input and bias are not the same");
  }, Wh = (t2) => {
    let e3 = t2[0].dims.slice();
    e3[2] = e3[2] / 2;
    let r2 = O("input", t2[0].dataType, t2[0].dims, 4), n2 = O("bias", t2[0].dataType, [t2[0].dims[2]], 4), o2 = R("output", t2[0].dataType, e3, 4), i2 = k.size(e3) / 4, a2 = we(t2[0].dataType);
    return { name: "BiasSplitGelu", getRunData: () => ({ outputs: [{ dims: e3, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(i2 / 64) } }), getShaderSource: (d2) => `
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${t2[0].dims[2] / 4 / 2}u;

  ${d2.declareVariables(r2, n2, o2)}

  ${rn(a2)}

  ${d2.mainStart()}
    ${d2.guardAgainstOutOfBoundsWorkgroupSizes(i2)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${o2.setByOffset("global_idx", "valueLeft * geluRight")}
  }` };
  }, ld = (t2) => {
    Lh(t2.inputs), t2.compute(Wh(t2.inputs));
  };
});
var Gh;
var Hh;
var dt;
var pd;
var md;
var fd;
var hd;
var gd;
var bd;
var yd;
var _d;
var wd;
var $d;
var vd = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Gh = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2, p2, m2) => {
    let g2, y;
    typeof u2 == "string" ? g2 = y = (v, T) => `${u2}((${v}),(${T}))` : typeof u2 == "function" ? g2 = y = u2 : (g2 = u2.scalar, y = u2.vector);
    let b = R("outputData", p2, n2.length, 4), _ = O("aData", d2, e3.length, 4), S = O("bData", c2, r2.length, 4), x;
    if (o2) if (i2) {
      let v = k.size(e3) === 1, T = k.size(r2) === 1, I = e3.length > 0 && e3[e3.length - 1] % 4 === 0, E = r2.length > 0 && r2[r2.length - 1] % 4 === 0;
      v || T ? x = b.setByOffset("global_idx", y(v ? `${_.type.value}(${_.getByOffset("0")}.x)` : _.getByOffset("global_idx"), T ? `${S.type.value}(${S.getByOffset("0")}.x)` : S.getByOffset("global_idx"))) : x = `
            let outputIndices = ${b.offsetToIndices("global_idx * 4u")};
            let offsetA = ${_.broadcastedIndicesToOffset("outputIndices", b)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices", b)};
            ${b.setByOffset("global_idx", y(a2 || I ? _.getByOffset("offsetA / 4u") : `${_.type.value}(${_.getByOffset("offsetA / 4u")}[offsetA % 4u])`, a2 || E ? S.getByOffset("offsetB / 4u") : `${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `;
    } else x = b.setByOffset("global_idx", y(_.getByOffset("global_idx"), S.getByOffset("global_idx")));
    else {
      if (!i2) throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");
      let v = (T, I, E = "") => {
        let A = `aData[indexA${I}][componentA${I}]`, D = `bData[indexB${I}][componentB${I}]`;
        return `
            let outputIndices${I} = ${b.offsetToIndices(`global_idx * 4u + ${I}u`)};
            let offsetA${I} = ${_.broadcastedIndicesToOffset(`outputIndices${I}`, b)};
            let offsetB${I} = ${S.broadcastedIndicesToOffset(`outputIndices${I}`, b)};
            let indexA${I} = offsetA${I} / 4u;
            let indexB${I} = offsetB${I} / 4u;
            let componentA${I} = offsetA${I} % 4u;
            let componentB${I} = offsetB${I} % 4u;
            ${T}[${I}] = ${E}(${g2(A, D)});
          `;
      };
      p2 === 9 ? x = `
            var data = vec4<u32>(0);
            ${v("data", 0, "u32")}
            ${v("data", 1, "u32")}
            ${v("data", 2, "u32")}
            ${v("data", 3, "u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));` : x = `
            ${v("outputData[global_idx]", 0)}
            ${v("outputData[global_idx]", 1)}
            ${v("outputData[global_idx]", 2)}
            ${v("outputData[global_idx]", 3)}
          `;
    }
    return `
        ${t2.registerUniform("vec_size", "u32").declareVariables(_, S, b)}

        ${m2 ?? ""}

        ${t2.mainStart()}
        ${t2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${x}
      }`;
  }, Hh = (t2, e3, r2, n2, o2, i2, a2 = r2.dataType) => {
    let u2 = r2.dims.map(Number), d2 = n2.dims.map(Number), c2 = !k.areEqual(u2, d2), p2 = u2, m2 = k.size(u2), g2 = false, y = false, b = [c2];
    if (c2) {
      let _ = ot.calcShape(u2, d2, false);
      if (!_) throw new Error("Can't perform binary op on the given tensors");
      p2 = _.slice(), m2 = k.size(p2);
      let S = k.size(u2) === 1, x = k.size(d2) === 1, v = u2.length > 0 && u2[u2.length - 1] % 4 === 0, T = d2.length > 0 && d2[d2.length - 1] % 4 === 0;
      b.push(S), b.push(x), b.push(v), b.push(T);
      let I = 1;
      for (let E = 1; E < p2.length; E++) {
        let A = u2[u2.length - E], D = d2[d2.length - E];
        if (A === D) I *= A;
        else break;
      }
      I % 4 === 0 ? (y = true, g2 = true) : (S || x || v || T) && (g2 = true);
    } else g2 = true;
    return b.push(g2), { name: t2, shaderCache: { hint: e3 + b.map((_) => _.toString()).join("_"), inputDependencies: ["rank", "rank"] }, getShaderSource: (_) => Gh(_, u2, d2, p2, g2, c2, y, o2, r2.dataType, n2.dataType, a2, i2), getRunData: () => ({ outputs: [{ dims: p2, dataType: a2 }], dispatchGroup: { x: Math.ceil(m2 / 64 / 4) }, programUniforms: [{ type: 12, data: Math.ceil(k.size(p2) / 4) }, ...W(u2, d2, p2)] }) };
  }, dt = (t2, e3, r2, n2, o2, i2) => {
    t2.compute(Hh(e3, o2 ?? "", t2.inputs[0], t2.inputs[1], r2, n2, i2));
  }, pd = (t2) => {
    dt(t2, "Add", (e3, r2) => `${e3}+${r2}`);
  }, md = (t2) => {
    dt(t2, "Div", (e3, r2) => `${e3}/${r2}`);
  }, fd = (t2) => {
    dt(t2, "Equal", { scalar: (e3, r2) => `u32(${e3}==${r2})`, vector: (e3, r2) => `vec4<u32>(${e3}==${r2})` }, void 0, void 0, 9);
  }, hd = (t2) => {
    dt(t2, "Mul", (e3, r2) => `${e3}*${r2}`);
  }, gd = (t2) => {
    let e3 = O("input", t2.inputs[0].dataType, t2.inputs[0].dims).type.value;
    dt(t2, "Pow", { scalar: (n2, o2) => `pow_custom(${n2},${o2})`, vector: (n2, o2) => `pow_vector_custom(${n2},${o2})` }, `
    fn pow_custom(a : ${e3}, b : ${e3}) -> ${e3} {
      if (b == ${e3}(0.0)) {
        return ${e3}(1.0);
      } else if (a < ${e3}(0.0) && f32(b) != floor(f32(b))) {
        return ${e3}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${e3}(1.0), round(f32(abs(b) % ${e3}(2.0))) != 1.0) * ${e3}(${e3 === "i32" ? "round" : ""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${e3}>, b : vec4<${e3}>) -> vec4<${e3}> {
      // TODO: implement vectorized pow
      return vec4<${e3}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `);
  }, bd = (t2) => {
    dt(t2, "Sub", (e3, r2) => `${e3}-${r2}`);
  }, yd = (t2) => {
    dt(t2, "Greater", { scalar: (e3, r2) => `u32(${e3}>${r2})`, vector: (e3, r2) => `vec4<u32>(${e3}>${r2})` }, void 0, void 0, 9);
  }, _d = (t2) => {
    dt(t2, "Less", { scalar: (e3, r2) => `u32(${e3}<${r2})`, vector: (e3, r2) => `vec4<u32>(${e3}<${r2})` }, void 0, void 0, 9);
  }, wd = (t2) => {
    dt(t2, "GreaterOrEqual", { scalar: (e3, r2) => `u32(${e3}>=${r2})`, vector: (e3, r2) => `vec4<u32>(${e3}>=${r2})` }, void 0, void 0, 9);
  }, $d = (t2) => {
    dt(t2, "LessOrEqual", { scalar: (e3, r2) => `u32(${e3}<=${r2})`, vector: (e3, r2) => `vec4<u32>(${e3}<=${r2})` }, void 0, void 0, 9);
  };
});
var qh;
var Kh;
var jh;
var Zh;
var xd;
var Sd;
var Td = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  qh = (t2, e3) => {
    if (!t2 || t2.length < 1) throw new Error("too few inputs");
    let r2 = 0, n2 = t2[r2], o2 = n2.dataType, i2 = n2.dims.length;
    t2.forEach((a2, u2) => {
      if (u2 !== r2) {
        if (a2.dataType !== o2) throw new Error("input tensors should be one type");
        if (a2.dims.length !== i2) throw new Error("input tensors should have the same shape");
        a2.dims.forEach((d2, c2) => {
          if (c2 !== e3 && d2 !== n2.dims[c2]) throw new Error("non concat dimensions must match");
        });
      }
    });
  }, Kh = (t2, e3) => `
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${t2}u>(${e3});
    for (var i: u32 = 0u; i < ${t2}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${t2}u;
  }`, jh = (t2, e3) => {
    let r2 = t2.length, n2 = [];
    for (let o2 = 0; o2 < r2; ++o2) {
      let i2 = e3.setByOffset("global_idx", t2[o2].getByIndices("indices"));
      r2 === 1 ? n2.push(i2) : o2 === 0 ? n2.push(`if (inputIndex == ${o2}u) { ${i2} }`) : o2 === r2 - 1 ? n2.push(`else { ${i2} }`) : n2.push(`else if (inputIndex == ${o2}) { ${i2} }`);
    }
    return n2.join(`
`);
  }, Zh = (t2, e3, r2, n2) => {
    let o2 = k.size(r2), i2 = new Array(t2.length), a2 = new Array(t2.length), u2 = 0, d2 = [], c2 = [], p2 = [{ type: 12, data: o2 }];
    for (let _ = 0; _ < t2.length; ++_) u2 += t2[_].dims[e3], i2[_] = u2, c2.push(t2[_].dims.length), a2[_] = O(`input${_}`, n2, c2[_]), d2.push("rank"), p2.push({ type: 12, data: i2[_] });
    for (let _ = 0; _ < t2.length; ++_) p2.push(...W(t2[_].dims));
    p2.push(...W(r2));
    let m2 = R("output", n2, r2.length), g2 = m2.indicesGet("indices", e3), y = Array.from(Array(i2.length).keys()).map((_) => `uniforms.sizeInConcatAxis${_}`).join(","), b = (_) => `

  ${(() => {
      _.registerUniform("outputSize", "u32");
      for (let S = 0; S < t2.length; S++) _.registerUniform(`sizeInConcatAxis${S}`, "u32");
      return _.declareVariables(...a2, m2);
    })()}

  ${Kh(i2.length, y)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${m2.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g2});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${i2.length}u>(${y});
      ${g2} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${jh(a2, m2)}
  }`;
    return { name: "Concat", shaderCache: { hint: `${e3}`, inputDependencies: d2 }, getRunData: () => ({ outputs: [{ dims: r2, dataType: n2 }], dispatchGroup: { x: Math.ceil(o2 / 64) }, programUniforms: p2 }), getShaderSource: b };
  }, xd = (t2, e3) => {
    let r2 = t2.inputs, n2 = r2[0].dims, o2 = k.normalizeAxis(e3.axis, n2.length);
    qh(r2, o2);
    let i2 = n2.slice();
    i2[o2] = r2.reduce((u2, d2) => u2 + (d2.dims.length > o2 ? d2.dims[o2] : 0), 0);
    let a2 = r2.filter((u2) => k.size(u2.dims) > 0);
    t2.compute(Zh(a2, o2, i2, r2[0].dataType), { inputs: a2 });
  }, Sd = (t2) => J({ axis: t2.axis });
});
var Qe;
var Xe;
var Ye;
var on;
var St = V(() => {
  "use strict";
  ee();
  te();
  Qe = (t2, e3, r2 = "f32") => {
    switch (t2.activation) {
      case "Relu":
        return `value = max(value, ${e3}(0.0));`;
      case "Sigmoid":
        return `value = (${e3}(1.0) / (${e3}(1.0) + exp(-value)));`;
      case "Clip":
        return `value = clamp(value, ${e3}(${r2}(uniforms.clip_min)), ${e3}(${r2}(uniforms.clip_max)));`;
      case "HardSigmoid":
        return `value = max(${e3}(0.0), min(${e3}(1.0), ${r2}(uniforms.alpha) * value + ${r2}(uniforms.beta)));`;
      case "LeakyRelu":
        return `value = select(${r2}(uniforms.alpha) * value, value, value >= ${e3}(0.0));`;
      case "Tanh":
        return `let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;
      case "":
        return "";
      default:
        throw new Error(`Unsupported activation ${t2.activation}`);
    }
  }, Xe = (t2, e3) => {
    t2.activation === "Clip" ? e3.push({ type: 1, data: t2.clipMax }, { type: 1, data: t2.clipMin }) : t2.activation === "HardSigmoid" ? e3.push({ type: 1, data: t2.alpha }, { type: 1, data: t2.beta }) : t2.activation === "LeakyRelu" && e3.push({ type: 1, data: t2.alpha });
  }, Ye = (t2, e3) => {
    t2.activation === "Clip" ? e3.push({ name: "clip_max", type: "f32" }, { name: "clip_min", type: "f32" }) : t2.activation === "HardSigmoid" ? e3.push({ name: "alpha", type: "f32" }, { name: "beta", type: "f32" }) : t2.activation === "LeakyRelu" && e3.push({ name: "alpha", type: "f32" });
  }, on = (t2) => {
    let e3 = t2?.activation || "";
    if (e3 === "HardSigmoid") {
      let [r2, n2] = t2?.activation_params || [0.2, 0.5];
      return { activation: e3, alpha: r2, beta: n2 };
    } else if (e3 === "Clip") {
      let [r2, n2] = t2?.activation_params || [Ps, Os];
      return { activation: e3, clipMax: n2, clipMin: r2 };
    } else if (e3 === "LeakyRelu") {
      let [r2] = t2?.activation_params || [0.01];
      return { activation: e3, alpha: r2 };
    }
    return { activation: e3 };
  };
});
var Pe;
var Id;
var an = V(() => {
  "use strict";
  Pe = (t2, e3) => {
    switch (t2) {
      case 1:
        return e3;
      case 2:
        return `vec2<${e3}>`;
      case 3:
        return `vec3<${e3}>`;
      case 4:
        return `vec4<${e3}>`;
      default:
        throw new Error(`${t2}-component is not supported.`);
    }
  }, Id = (t2) => `
      ${t2 ? "value = value + getBiasByOutputCoords(coords);" : ""}
      `;
});
var Cd;
var Ad = V(() => {
  "use strict";
  Cd = (t2) => `
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${t2}.x), i32(${t2}.y), i32(${t2}.z), 1));
}
`;
});
var sr;
var sn;
var un = V(() => {
  "use strict";
  ee();
  te();
  oe();
  St();
  sr = (t2, e3, r2, n2, o2) => {
    let i2 = n2 - r2;
    return `
      ${Array.from({ length: r2 }).map((a2, u2) => `
      if (${j(e3.shape, u2, e3.rank)} != 1) {
        ${e3.indicesSet(t2, u2, j(o2, u2 + i2, n2))}
      } else {
        ${e3.indicesSet(t2, u2, 0)}
      }`).join("")}
`;
  }, sn = (t2, e3, r2, n2, o2 = false, i2) => {
    let a2 = t2[0].dims, u2 = t2[1].dims, d2 = a2[a2.length - 2], c2 = u2[u2.length - 1], p2 = a2[a2.length - 1], m2 = fe(c2), g2 = fe(p2), y = fe(d2), b = k.size(r2) / m2 / y, _ = t2.length > 2, S = n2 ? n2.slice(0, -2) : r2.slice(0, -2), v = [k.size(S), d2, c2], T = [{ type: 12, data: b }, { type: 12, data: d2 }, { type: 12, data: c2 }, { type: 12, data: p2 }];
    Xe(e3, T), T.push(...W(S, a2, u2)), _ && T.push(...W(t2[2].dims)), T.push(...W(v));
    let I = (E) => {
      let A = Yr("batch_dims", t2[0].dataType, S.length), D = O("a", t2[0].dataType, a2.length, g2), w = O("b", t2[1].dataType, u2.length, m2), U = R("output", t2[0].dataType, v.length, m2), N = we(U.type.tensor), F = Qe(e3, U.type.value, N), q = [D, w], Y = "";
      if (_) {
        let Q = o2 ? m2 : 1;
        q.push(O("bias", t2[2].dataType, t2[2].dims.length, Q)), Y = `${o2 ? `value += bias[col / ${Q}];` : `value += ${U.type.value}(bias[row + i]);`}`;
      }
      let z = [{ name: "output_size", type: "u32" }, { name: "M", type: "u32" }, { name: "N", type: "u32" }, { name: "K", type: "u32" }];
      Ye(e3, z);
      let L = () => {
        let Q = `var a_data: ${D.type.value};`;
        for (let X = 0; X < g2; X++) Q += `
              let b_data${X} = b[(b_offset + (k + ${X}) * uniforms.N + col) / ${m2}];`;
        for (let X = 0; X < y; X++) {
          Q += `a_data = a[(a_offset + (row + ${X}) * uniforms.K + k) / ${g2}];`;
          for (let Z = 0; Z < g2; Z++) Q += `
            values[${X}] = fma(${w.type.value}(a_data${g2 === 1 ? "" : `[${Z}]`}), b_data${Z}, values[${X}]);
`;
        }
        return Q;
      };
      return `
  ${E.registerUniforms(z).registerInternalVariables(A).declareVariables(...q, U)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${m2})) * ${m2};
    var index1 = global_idx / (uniforms.N / ${m2});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r2.length === 2 ? "" : `let batch_indices = ${A.offsetToIndices("batch")};`}

    var a_indices: ${D.type.indices};
    ${sr("a_indices", D, D.rank - 2, A.rank, "batch_indices")}
    ${D.indicesSet("a_indices", D.rank - 2, 0)}
    ${D.indicesSet("a_indices", D.rank - 1, 0)}
    let a_offset = ${D.indicesToOffset("a_indices")};

    var b_indices: ${w.type.indices};
    ${sr("b_indices", w, w.rank - 2, A.rank, "batch_indices")}
    ${w.indicesSet("b_indices", w.rank - 2, 0)}
    ${w.indicesSet("b_indices", w.rank - 1, 0)}
    let b_offset = ${w.indicesToOffset("b_indices")};
    var values: array<${U.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g2}) {
      ${L()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${Y}
      ${F}
      let cur_indices = ${U.type.indices}(batch, row + i, col);
      let offset = ${U.indicesToOffset("cur_indices")};
      ${U.setByOffset(`offset / ${m2}`, "value")};
    }
  }
  `;
    };
    return { name: "MatMulNaive", shaderCache: { hint: `${e3.activation};${m2};${g2};${y};${o2}`, inputDependencies: _ ? ["rank", "rank", "rank"] : ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: i2 ? i2(r2) : r2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(b / 64) }, programUniforms: T }), getShaderSource: I };
  };
});
var Qh;
var Xh;
var xo;
var Ed;
var Yh;
var So;
var Jh;
var ur;
var dn = V(() => {
  "use strict";
  ee();
  te();
  oe();
  St();
  un();
  an();
  Qh = (t2, e3) => t2 ? `
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${e3 ? ", batchIndices" : ""});
        ` : `
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${e3 ? ", batchIndices" : ""});
        `, Xh = (t2, e3) => t2 ? `
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${e3 === 3 ? "" : "let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${e3 === 3 ? "" : "acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }` : `
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${e3 === 3 ? "" : "acc[i] = BCached3 * ACached.w + acc[i];"}
        }`, xo = (t2, e3, r2 = "f32", n2, o2 = false, i2 = 32, a2 = false, u2 = 32) => {
    let d2 = e3[1] * t2[1], c2 = e3[0] * t2[0], p2 = o2 ? d2 : i2, m2 = o2 ? i2 : d2, g2 = p2 / e3[0], y = i2 / e3[1];
    if (!((o2 && g2 === 4 && t2[1] === 4 || !o2 && (g2 === 3 || g2 === 4)) && p2 % e3[0] === 0 && i2 % e3[1] === 0 && t2[0] === 4)) throw new Error(`If transposeA ${o2} is true, innerElementSize ${g2} and workPerThread[1] ${t2[1]} must be 4.
      Otherwise, innerElementSize ${g2} must be 3 or 4.
  tileAWidth ${p2} must be divisible by workgroupSize[0]${e3[0]}. tileInner ${i2} must be divisible by workgroupSize[1] ${e3[1]}. colPerThread ${t2[0]} must be 4.`);
    return `
var<workgroup> mm_Asub: array<array<vec${g2}<${r2}>, ${p2 / g2}>, ${m2}>;
var<workgroup> mm_Bsub: array<array<vec4<${r2}>, ${c2 / t2[0]}>, ${i2}>;

const rowPerThread = ${t2[1]};
const colPerThread = ${t2[0]};
const innerElementSize = ${g2};
const tileInner = ${i2};

@compute @workgroup_size(${e3[0]}, ${e3[1]}, ${e3[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${a2 ? "0" : "i32(globalId.z)"};
  ${n2 ? `let batchIndices = ${n2.offsetToIndices("u32(batch)")};` : ""}
  let globalRowStart = i32(workgroupId.y) * ${d2};

  let num_tiles = ${a2 ? `${Math.ceil(u2 / i2)}` : "(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${a2 ? `i32(globalId.z) * ${u2}` : "0"};

  var acc: array<vec4<${r2}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Qh(o2, n2)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${n2 ? ", batchIndices" : ""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g2 === 3 ? "" : "let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Xh(o2, g2)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`;
  }, Ed = (t2, e3) => t2 ? `
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${e3 ? ", batchIndices" : ""});
            ` : `
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${e3 ? ", batchIndices" : ""});
            `, Yh = (t2) => t2 ? "let ACached = mm_Asub[k][tileRow + innerRow];" : "let ACached = mm_Asub[tileRow + innerRow][k];", So = (t2, e3, r2 = "f32", n2, o2 = false, i2 = 32, a2 = false, u2 = 32, d2 = false) => {
    let c2 = t2[1] * e3[1], p2 = t2[0] * e3[0], m2 = o2 ? c2 : i2, g2 = o2 ? i2 : c2;
    if (!(g2 % e3[1] === 0 && m2 % e3[0] === 0 && i2 % e3[1] === 0)) throw new Error(`tileAHight ${g2} must be divisible by workgroupSize[1]${e3[1]}, tileAWidth ${m2} must be divisible by workgroupSize[0]${e3[0]}, tileInner ${i2} must be divisible by workgroupSize[1]${e3[1]}`);
    let y = g2 / e3[1], b = m2 / e3[0], _ = i2 / e3[1], S = d2 ? `
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${c2};
    let globalColStart = i32(workgroupId.x) * ${p2};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g2}; inputRow = inputRow + ${e3[1]}) {
        for (var inputCol = localCol; inputCol < ${m2}; inputCol = inputCol + ${e3[0]}) {
          ${Ed(o2, n2)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${i2}; inputRow = inputRow + ${e3[1]}) {
            for (var inputCol = localCol; inputCol < ${p2}; inputCol = inputCol + ${e3[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${n2 ? ", batchIndices" : ""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r2}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${e3[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${o2 ? `mm_Asub[k][localRow + innerRow * ${e3[1]}];` : `mm_Asub[localRow + innerRow * ${e3[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${e3[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${e3[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    ` : `
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${c2};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${b};
let tileRowB = i32(localId.y) * ${_};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${b}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Ed(o2, n2)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${n2 ? ", batchIndices" : ""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r2}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Yh(o2)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;
    return `
  var<workgroup> mm_Asub : array<array<${r2}, ${m2}>, ${g2}>;
  var<workgroup> mm_Bsub : array<array<${r2}, ${p2}>, ${i2}>;
  const rowPerThread = ${t2[1]};
  const colPerThread = ${t2[0]};
  const tileInner = ${i2};

@compute @workgroup_size(${e3[0]}, ${e3[1]}, ${e3[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${a2 ? "0" : "i32(globalId.z)"};
    ${n2 ? `let batchIndices = ${n2.offsetToIndices("u32(batch)")};` : ""}
    let num_tiles = ${a2 ? `${Math.ceil(u2 / i2)}` : "(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${a2 ? `i32(globalId.z) * ${u2}` : "0"};

    var acc : array<array<${r2}, colPerThread>, rowPerThread>;
    ${S}
  }
`;
  }, Jh = (t2, e3, r2, n2, o2 = false) => {
    let [i2, a2, u2, d2] = n2, c2 = we(n2[0].type.tensor);
    return `
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${i2.type.indices}) -> ${Pe(t2, c2)} {
      var value = ${Pe(t2, c2)}(0.0);
      let col = colIn * ${t2};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${a2.type.indices};
        ${sr("aIndices", a2, a2.rank - 2, i2.rank, "batchIndices")}
        ${a2.indicesSet("aIndices", a2.rank - 2, "u32(row)")}
        ${a2.indicesSet("aIndices", a2.rank - 1, "u32(colIn)")}
        value = ${a2.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${i2.type.indices}) -> ${Pe(t2, c2)} {
      var value = ${Pe(t2, c2)}(0.0);
      let col = colIn * ${t2};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u2.type.indices};
        ${sr("bIndices", u2, u2.rank - 2, i2.rank, "batchIndices")}
        ${u2.indicesSet("bIndices", u2.rank - 2, "u32(row)")}
        ${u2.indicesSet("bIndices", u2.rank - 1, "u32(colIn)")}
        value = ${u2.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Pe(t2, c2)}) {
      let col = colIn * ${t2};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${e3 ? `value = value + ${o2 ? "bias[colIn]" : `${Pe(t2, c2)}(bias[row])`};` : ""}
        ${r2}
        ${d2.setByIndices("vec3<u32>(coords)", "value")}
      }
    }
    `;
  }, ur = (t2, e3, r2, n2, o2 = false, i2) => {
    let a2 = t2[0].dims, u2 = t2[1].dims, d2 = a2.slice(0, -2), c2 = u2.slice(0, -2), p2 = n2 ? n2.slice(0, -2) : r2.slice(0, -2), m2 = k.size(p2), g2 = a2[a2.length - 2], y = a2[a2.length - 1], b = u2[u2.length - 1], _ = y % 4 === 0 && b % 4 === 0, S = g2 <= 8 ? [4, 1, 1] : [4, 4, 1], x = [8, 8, 1], v = [Math.ceil(b / x[0] / S[0]), Math.ceil(g2 / x[1] / S[1]), Math.ceil(m2 / x[2] / S[2])], T = _ ? 4 : 1, I = [...d2, g2, y / T], E = I.length, A = [...c2, y, b / T], D = A.length, w = [m2, g2, b / T], U = [{ type: 6, data: g2 }, { type: 6, data: b }, { type: 6, data: y }];
    Xe(e3, U), U.push(...W(p2, I, A));
    let N = ["rank", "rank"], F = t2.length > 2;
    F && (U.push(...W(t2[2].dims)), N.push("rank")), U.push(...W(w));
    let q = (Y) => {
      let z = p2.length, L = Yr("batchDims", t2[0].dataType, z, 1), Q = we(t2[0].dataType), X = O("a", t2[0].dataType, E, T), Z = O("b", t2[1].dataType, D, T), ne = R("result", t2[0].dataType, w.length, T), ie = [X, Z];
      if (F) {
        let G = o2 ? T : 1;
        ie.push(O("bias", t2[2].dataType, t2[2].dims.length, G));
      }
      let le = [{ name: "dim_a_outer", type: "i32" }, { name: "dim_b_outer", type: "i32" }, { name: "dim_inner", type: "i32" }];
      Ye(e3, le);
      let Me = we(ne.type.tensor), $e = Qe(e3, ne.type.value, Me), M = Jh(T, F, $e, [L, X, Z, ne], o2);
      return `
  ${Y.registerUniforms(le).registerInternalVariables(L).declareVariables(...ie, ne)}
  ${M}
  ${_ ? xo(S, x, Q, L) : So(S, x, Q, L)}
                   `;
    };
    return { name: "MatMul", shaderCache: { hint: `${S};${e3.activation};${_};${o2}`, inputDependencies: N }, getRunData: () => ({ outputs: [{ dims: i2 ? i2(r2) : r2, dataType: t2[0].dataType }], dispatchGroup: { x: v[0], y: v[1], z: v[2] }, programUniforms: U }), getShaderSource: q };
  };
});
var eg;
var kd;
var Pd = V(() => {
  "use strict";
  ee();
  nt();
  oe();
  St();
  an();
  Ad();
  dn();
  eg = (t2, e3, r2, n2, o2 = false, i2, a2 = 4, u2 = 4, d2 = 4, c2 = "f32") => {
    let p2 = (N) => {
      switch (N) {
        case 1:
          return "resData = x[xIndex];";
        case 3:
          return `resData = vec3<${c2}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;
        case 4:
          return "resData = x[xIndex / 4];";
        default:
          throw new Error(`innerElementSize ${N} is not supported.`);
      }
    }, m2 = (N) => {
      switch (N) {
        case 1:
          return "return w[row * i32(uniforms.w_shape[3]) + colIn];";
        case 4:
          return "return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";
        default:
          throw new Error(`innerElementSize ${N} is not supported.`);
      }
    }, g2 = t2 ? `
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    ` : `
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `, y = t2 ? `
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    ` : `
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `, b = t2 ? "i32(uniforms.x_shape[1])" : "i32(uniforms.x_shape[2])", _ = t2 ? "i32(uniforms.x_shape[2])" : "i32(uniforms.x_shape[3])", S = t2 ? "row" : "col", x = t2 ? "col" : "row", v = `
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${t2 ? "i32(uniforms.result_shape[2])" : "i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${x} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${x} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${x} % inChannels;
    var resData = ${Pe(a2, c2)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${b} && xCol >= 0 && xCol < ${_}) {
      ${g2}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${p2(a2)}
    }
    return resData;`, T = t2 ? e3 && n2 ? `
    let col = colIn * ${a2};
    ${v}` : `
    let col = colIn * ${a2};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${v}
    }
    return ${Pe(a2, c2)}(0.0);` : n2 && r2 ? `
    let col = colIn * ${a2};
    ${v}` : `
    let col = colIn * ${a2};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${v}
    }
    return ${Pe(a2, c2)}(0.0);`, I = t2 ? n2 && r2 ? m2(u2) : `
    let col = colIn * ${u2};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${m2(u2)}
    }
    return ${Pe(u2, c2)}(0.0);` : `
    let col = colIn * ${u2};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${m2(u2)}
    }
    return ${Pe(u2, c2)}(0.0);`, E = Pe(d2, c2), A = t2 ? Pe(a2, c2) : Pe(u2, c2), D = t2 ? Pe(u2, c2) : Pe(a2, c2), w = Qe(i2, E, c2);
    return `
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${t2 ? T : I}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${D} {
      ${t2 ? I : T}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${d2};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${t2 ? "i32(uniforms.result_shape[2])" : "i32(uniforms.result_shape[3])"};
      ${y}
      ${Id(o2)}
      ${w}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`;
  }, kd = (t2, e3, r2, n2, o2, i2, a2, u2, d2) => {
    let c2 = e3.format === "NHWC", p2 = c2 ? t2[0].dims[3] : t2[0].dims[1], m2 = r2[0], g2 = c2 ? r2[2] : r2[3], y = c2 ? r2[1] : r2[2], b = c2 ? r2[3] : r2[1], _ = c2 && (p2 % 4 === 0 || p2 % 3 === 0) && b % 4 === 0, S = c2 ? b : g2 * y, x = c2 ? g2 * y : b, v = [8, 8, 1], T = n2 <= 8 ? [4, 1, 1] : [4, 4, 1], I = [Math.ceil(S / v[0] / T[0]), Math.ceil(x / v[1] / T[1]), Math.ceil(m2 / v[2] / T[2])];
    se("verbose", () => `[conv2d_mm_webgpu] dispatch = ${I}`);
    let E = _ ? c2 && p2 % 4 !== 0 ? 3 : 4 : 1, A = v[1] * T[1], D = v[0] * T[0], w = Math.max(v[0] * E, v[1]), U = n2 % A === 0, N = o2 % D === 0, F = i2 % w === 0, q = _ ? [E, 4, 4] : [1, 1, 1], Y = [{ type: 6, data: n2 }, { type: 6, data: o2 }, { type: 6, data: i2 }, { type: 6, data: [e3.pads[0], e3.pads[1]] }, { type: 6, data: e3.strides }, { type: 6, data: e3.dilations }];
    Xe(e3, Y), Y.push(...W(t2[0].dims, t2[1].dims));
    let z = ["rank", "rank"];
    a2 && (Y.push(...W(t2[2].dims)), z.push("rank")), Y.push(...W(r2));
    let L = (Q) => {
      let X = [{ name: "dim_a_outer", type: "i32" }, { name: "dim_b_outer", type: "i32" }, { name: "dim_inner", type: "i32" }, { name: "pad", type: "i32", length: 2 }, { name: "stride", type: "i32", length: 2 }, { name: "dilation", type: "i32", length: 2 }];
      Ye(e3, X);
      let Z = _ ? 4 : 1, ne = we(t2[0].dataType), ie = `
      fn setOutputAtIndex(flatIndex : i32, value : ${_ ? `vec4<${ne}>` : ne}) {
        result[flatIndex] = ${_ ? `vec4<${ne}>` : ne}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${_ ? `vec4<${ne}>` : ne}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${_ ? "/ 4" : ""}, value);
      }`, le = O("x", t2[0].dataType, t2[0].dims.length, E === 3 ? 1 : E), Me = O("w", t2[1].dataType, t2[1].dims.length, Z), $e = [le, Me], M = R("result", t2[0].dataType, r2.length, Z);
      if (a2) {
        let G = O("bias", t2[2].dataType, t2[2].dims.length, Z);
        $e.push(G), ie += `
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${_ ? `vec4<${ne}>` : ne} {
          return bias[coords.${c2 ? "w" : "y"}${_ ? "/ 4" : ""}];
        }`;
      }
      return `
        ${Cd("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${Q.registerUniforms(X).declareVariables(...$e, M)}
        ${ie}
        ${eg(c2, U, N, F, a2, e3, q[0], q[1], q[2], ne)}
        ${_ ? xo(T, v, ne, void 0, !c2, w) : So(T, v, ne, void 0, !c2, w, false, void 0, u2)}`;
    };
    return { name: "Conv2DMatMul", shaderCache: { hint: `${e3.cacheKey};${E};${_};${U};${N};${F};${A};${D};${w}`, inputDependencies: z }, getRunData: () => ({ outputs: [{ dims: d2 ? d2(r2) : r2, dataType: t2[0].dataType }], dispatchGroup: { x: I[0], y: I[1], z: I[2] }, programUniforms: Y }), getShaderSource: L };
  };
});
var tg;
var Od;
var ln;
var rg;
var Dd;
var ng;
var zd;
var Bd;
var Md = V(() => {
  "use strict";
  ee();
  nt();
  te();
  oe();
  St();
  an();
  tg = (t2) => {
    let e3 = 1;
    for (let r2 = 0; r2 < t2.length; r2++) e3 *= t2[r2];
    return e3;
  }, Od = (t2) => typeof t2 == "number" ? [t2, t2, t2] : t2, ln = (t2, e3) => e3 <= 1 ? t2 : t2 + (t2 - 1) * (e3 - 1), rg = (t2, e3, r2, n2 = 1) => {
    let o2 = ln(e3, n2);
    return Math.floor((t2[0] * (r2 - 1) - r2 + o2) / 2);
  }, Dd = (t2, e3, r2, n2, o2) => {
    o2 == null && (o2 = rg(t2, e3[0], n2[0]));
    let i2 = [0, 0, 0, r2];
    for (let a2 = 0; a2 < 3; a2++) t2[a2] + 2 * o2 >= e3[a2] && (i2[a2] = Math.trunc((t2[a2] - e3[a2] + 2 * o2) / n2[a2] + 1));
    return i2;
  }, ng = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2) => {
    let p2, m2, g2, y;
    if (t2 === "VALID" && (t2 = 0), typeof t2 == "number") {
      p2 = { top: t2, bottom: t2, left: t2, right: t2, front: t2, back: t2 };
      let b = Dd([e3, r2, n2, 1], [u2, d2, c2], 1, [o2, i2, a2], t2);
      m2 = b[0], g2 = b[1], y = b[2];
    } else if (Array.isArray(t2)) {
      if (!t2.every((_, S, x) => _ === x[0])) throw Error(`Unsupported padding parameter: ${t2}`);
      p2 = { top: t2[0], bottom: t2[1], left: t2[2], right: t2[3], front: t2[4], back: t2[5] };
      let b = Dd([e3, r2, n2, 1], [u2, d2, c2], 1, [o2, i2, a2], t2[0]);
      m2 = b[0], g2 = b[1], y = b[2];
    } else if (t2 === "SAME_UPPER") {
      m2 = Math.ceil(e3 / o2), g2 = Math.ceil(r2 / i2), y = Math.ceil(n2 / a2);
      let b = (m2 - 1) * o2 + u2 - e3, _ = (g2 - 1) * i2 + d2 - r2, S = (y - 1) * a2 + c2 - n2, x = Math.floor(b / 2), v = b - x, T = Math.floor(_ / 2), I = _ - T, E = Math.floor(S / 2), A = S - E;
      p2 = { top: T, bottom: I, left: E, right: A, front: x, back: v };
    } else throw Error(`Unknown padding parameter: ${t2}`);
    return { padInfo: p2, outDepth: m2, outHeight: g2, outWidth: y };
  }, zd = (t2, e3, r2, n2, o2, i2 = false, a2 = "channelsLast") => {
    let u2, d2, c2, p2, m2;
    if (a2 === "channelsLast") [u2, d2, c2, p2, m2] = t2;
    else if (a2 === "channelsFirst") [u2, m2, d2, c2, p2] = t2;
    else throw new Error(`Unknown dataFormat ${a2}`);
    let [g2, , y, b, _] = e3, [S, x, v] = Od(r2), [T, I, E] = Od(n2), A = ln(y, T), D = ln(b, I), w = ln(_, E), { padInfo: U, outDepth: N, outHeight: F, outWidth: q } = ng(o2, d2, c2, p2, S, x, v, A, D, w), Y = i2 ? g2 * m2 : g2, z = [0, 0, 0, 0, 0];
    return a2 === "channelsFirst" ? z = [u2, Y, N, F, q] : a2 === "channelsLast" && (z = [u2, N, F, q, Y]), { batchSize: u2, dataFormat: a2, inDepth: d2, inHeight: c2, inWidth: p2, inChannels: m2, outDepth: N, outHeight: F, outWidth: q, outChannels: Y, padInfo: U, strideDepth: S, strideHeight: x, strideWidth: v, filterDepth: y, filterHeight: b, filterWidth: _, effectiveFilterDepth: A, effectiveFilterHeight: D, effectiveFilterWidth: w, dilationDepth: T, dilationHeight: I, dilationWidth: E, inShape: t2, outShape: z, filterShape: e3 };
  }, Bd = (t2, e3, r2, n2, o2, i2) => {
    let a2 = i2 === "channelsLast", u2 = a2 ? t2[0].dims[3] : t2[0].dims[1], d2 = false, c2 = [64, 1, 1], p2 = { x: r2.map((v, T) => T) }, m2 = [Math.ceil(tg(p2.x.map((v) => r2[v])) / c2[0]), 1, 1];
    se("verbose", () => `[conv3d_naive_webgpu] dispatch = ${m2}`);
    let g2 = d2 ? a2 && u2 % 4 !== 0 ? 3 : 4 : 1, y = k.size(r2), b = [{ type: 12, data: y }, { type: 12, data: n2 }, { type: 12, data: o2 }, { type: 12, data: e3.strides }, { type: 12, data: e3.dilations }];
    Xe(e3, b), b.push(...W(t2[0].dims, t2[1].dims));
    let _ = ["rank", "rank"], S = t2.length === 3;
    S && (b.push(...W(t2[2].dims)), _.push("rank")), b.push(...W(r2));
    let x = (v) => {
      let T = [{ name: "output_size", type: "u32" }, { name: "filter_dims", type: "u32", length: n2.length }, { name: "pads", type: "u32", length: o2.length }, { name: "strides", type: "u32", length: e3.strides.length }, { name: "dilations", type: "u32", length: e3.dilations.length }];
      Ye(e3, T);
      let I = d2 ? 4 : 1, E = we(t2[0].dataType), A = O("x", t2[0].dataType, t2[0].dims.length, g2 === 3 ? 1 : g2), D = O("W", t2[1].dataType, t2[1].dims.length, I), w = [A, D], U = R("result", t2[0].dataType, r2.length, I), N = "";
      if (S) {
        let Y = O("bias", t2[2].dataType, t2[2].dims.length, I);
        w.push(Y), N += `
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${d2 ? `vec4<${E}>` : E} {
          return bias[${a2 ? j("coords", 4, 5) : j("coords", 1, 5)}${d2 ? "/ 4" : ""}];
        }`;
      }
      let F = Pe(g2, E), q = Qe(e3, F, E);
      return `
            ${N}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${D.getByIndices("aIndices")};
            }
          ${v.registerUniforms(T).declareVariables(...w, U)}
          ${v.mainStart()}
          ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${U.offsetToIndices("global_idx")};
              let batch = ${j("coords", 0, A.rank)};
              let d2 = ${a2 ? j("coords", A.rank - 1, A.rank) : j("coords", 1, A.rank)};
              let xFRCCorner = vec3<u32>(${a2 ? j("coords", 1, A.rank) : j("coords", 2, A.rank)},
              ${a2 ? j("coords", 2, A.rank) : j("coords", 3, A.rank)},
              ${a2 ? j("coords", 3, A.rank) : j("coords", 4, A.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${a2 ? j("uniforms.x_shape", 1, A.rank) : j("uniforms.x_shape", 2, A.rank)};
              let xShapeZ = ${a2 ? j("uniforms.x_shape", 2, A.rank) : j("uniforms.x_shape", 3, A.rank)};
              let xShapeW = ${a2 ? j("uniforms.x_shape", 3, A.rank) : j("uniforms.x_shape", 4, A.rank)};
              let xShapeU = ${a2 ? j("uniforms.x_shape", 4, A.rank) : j("uniforms.x_shape", 1, A.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${a2 ? `let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            ` : `let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${a2 ? `value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);` : `value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${a2 ? `let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      ` : `let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${a2 ? `let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      ` : `let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${S ? "value = value + getBiasByOutputCoords(coords)" : ""};
              ${q}
              result[global_idx] = f32(value);
          }`;
    };
    return { name: "Conv3DNaive", shaderCache: { hint: `${e3.cacheKey};${a2};${g2};${S}`, inputDependencies: _ }, getRunData: () => ({ outputs: [{ dims: r2, dataType: t2[0].dataType }], dispatchGroup: { x: m2[0], y: m2[1], z: m2[2] }, programUniforms: b }), getShaderSource: x };
  };
});
var Rd;
var Ud;
var Nd = V(() => {
  "use strict";
  ee();
  te();
  oe();
  St();
  Rd = (t2, e3, r2, n2) => {
    let o2 = t2.length > 2, i2 = o2 ? "value += b[output_channel];" : "", a2 = t2[0].dims, u2 = t2[1].dims, d2 = e3.format === "NHWC", c2 = d2 ? r2[3] : r2[1], p2 = c2 / e3.group, m2 = d2 && p2 >= 4 ? fe(c2) : 1, g2 = k.size(r2) / m2, y = [{ type: 12, data: g2 }, { type: 12, data: e3.dilations }, { type: 12, data: [e3.strides[0], e3.strides[1]] }, { type: 12, data: [e3.pads[0], e3.pads[1]] }, { type: 12, data: p2 }];
    Xe(e3, y), y.push(...W(a2, [u2[0], u2[1], u2[2], u2[3] / m2]));
    let b = o2 ? ["rank", "rank", "rank"] : ["rank", "rank"];
    y.push(...W([r2[0], r2[1], r2[2], r2[3] / m2]));
    let _ = (S) => {
      let x = R("output", t2[0].dataType, r2.length, m2), v = we(x.type.tensor), T = Qe(e3, x.type.value, v), I = O("x", t2[0].dataType, a2.length), E = O("w", t2[1].dataType, u2.length, m2), A = [I, E];
      o2 && A.push(O("b", t2[2].dataType, t2[2].dims, m2));
      let D = [{ name: "output_size", type: "u32" }, { name: "dilations", type: "u32", length: e3.dilations.length }, { name: "strides", type: "u32", length: 2 }, { name: "pads", type: "u32", length: 2 }, { name: "output_channels_per_group", type: "u32" }];
      Ye(e3, D);
      let w = d2 ? `
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${I.get("batch", "xHeight", "xWidth", "input_channel")};
            let wVal = ${E.get("wHeight", "wWidth", "wInChannel", "output_channel")};
            value += xVal * wVal;
          }
        }
      }
      ` : `
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${I.get("batch", "input_channel", "xHeight", "xWidth")};
            let wVal = ${E.get("output_channel", "wInChannel", "wHeight", "wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;
      return `
  ${S.registerUniforms(D).declareVariables(...A, x)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${x.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d2 ? 3 : 1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d2 ? 1 : 2}], outputIndices[${d2 ? 2 : 3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${m2} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d2 ? 2 : 1}];

    var value: ${x.type.value} = ${x.type.value}(0);
    ${w}
    ${i2}
    ${T}
    ${x.setByOffset("global_idx", "value")}
  }`;
    };
    return { name: "GroupedConv", shaderCache: { hint: `${e3.cacheKey}_${m2}`, inputDependencies: b }, getRunData: () => ({ outputs: [{ dims: n2 ? n2(r2) : r2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(g2 / 64) }, programUniforms: y }), getShaderSource: _ };
  }, Ud = (t2, e3, r2, n2) => {
    let o2 = t2.length > 2, i2 = fe(r2[3]), a2 = fe(r2[2]), u2 = k.size(r2) / i2 / a2, d2 = [t2[0].dims[0], t2[0].dims[1], t2[0].dims[2], t2[0].dims[3] / i2], c2 = [t2[1].dims[0], t2[1].dims[1], t2[1].dims[2], t2[1].dims[3] / i2], p2 = [r2[0], r2[1], r2[2], r2[3] / i2], m2 = [{ type: 12, data: u2 }, { type: 6, data: [e3.strides[0], e3.strides[1]] }, { type: 6, data: [e3.pads[0], e3.pads[1]] }];
    Xe(e3, m2), m2.push(...W(d2, c2, p2));
    let g2 = (a2 - 1) * e3.strides[1] + c2[1], y = (b) => {
      let _ = R("output", t2[0].dataType, p2.length, i2), S = we(_.type.tensor), x = Qe(e3, _.type.value, S), v = O("x", t2[0].dataType, d2.length, i2), T = O("w", t2[1].dataType, c2.length, i2), I = [v, T];
      o2 && I.push(O("b", t2[2].dataType, t2[2].dims, i2));
      let E = o2 ? "value += b[output_channel];" : "", A = [{ name: "output_size", type: "u32" }, { name: "strides", type: "i32", length: 2 }, { name: "pads", type: "i32", length: 2 }];
      return Ye(e3, A), `
  ${b.registerUniforms(A).declareVariables(...I, _)}
  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${a2}u;
    let col = (index1 % width1) * ${a2}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${v.type.value}, ${g2}>;
    var values: array<${_.type.value}, ${a2}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${c2[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g2}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${v.get("batch", "u32(x_height)", "u32(x_width)", "input_channel")};
          } else {
            x_vals[i] = ${v.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${c2[1]}; w_width++) {
          let w_val = ${T.get("w_height", "w_width", "0", "output_channel")};
          for (var i = 0u; i < ${a2}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${a2}u; i++) {
      var value = values[i];
      ${E}
      ${x}
      ${_.set("batch", "row", "col + i", "output_channel", "value")};
    }
  }`;
    };
    return { name: "GroupedConv-Vectorize", shaderCache: { hint: `${e3.cacheKey};${i2};${a2};${g2};${c2[0]};${c2[1]}`, inputDependencies: o2 ? ["rank", "rank", "type"] : ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: n2 ? n2(r2) : r2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(u2 / 64) }, programUniforms: m2 }), getShaderSource: y };
  };
});
var og;
var To;
var ig;
var Io;
var Co;
var Vd;
var ag;
var sg;
var Ao;
var Ld = V(() => {
  "use strict";
  te();
  Pd();
  Md();
  dn();
  Nd();
  St();
  un();
  pt();
  og = (t2, e3, r2, n2, o2, i2) => {
    let a2 = t2[0], u2 = t2.slice(i2 ? 1 : 2, i2 ? 3 : 4), d2 = u2.length, c2 = e3[0], m2 = e3.slice(2).map((b, _) => b + (b - 1) * (r2[_] - 1)), y = u2.map((b, _) => b + n2[_] + n2[_ + d2]).map((b, _) => Math.floor((b - m2[_] + o2[_]) / o2[_]));
    return y.splice(0, 0, a2), y.splice(i2 ? 3 : 1, 0, c2), y;
  }, To = [2, 3, 1, 0], ig = (t2, e3) => {
    if (!t2 || t2.length !== 2 && t2.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
    if (t2[0].dims.length > 5) throw new Error("greater than 5D is not supported");
    if (t2[0].dims.length !== t2[1].dims.length) throw new Error("filter does not have same dimension as input");
    let r2 = t2[0].dims[e3.format === "NHWC" ? t2[0].dims.length - 1 : 1], n2 = t2[1].dims[1] * e3.group;
    if (r2 !== n2) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
    if (t2.length === 3 && (t2[2].dims.length !== 1 || t2[1].dims[0] !== t2[2].dims[0])) throw new Error("invalid bias");
    let o2 = t2[0].dims.length - 2;
    if (e3.dilations.length !== o2) throw new Error(`dilations should be ${o2}D`);
    if (e3.strides.length !== o2) throw new Error(`strides should be ${o2}D`);
    if (e3.pads.length !== o2 * 2) throw new Error(`pads should be ${o2 * 2}D`);
    if (e3.kernelShape.length !== 0 && e3.kernelShape.length !== t2[1].dims.length - 2) throw new Error("invalid kernel shape");
  }, Io = (t2, e3) => {
    let r2 = t2.kernelShape.slice();
    r2.length < e3[1].dims.length - 2 && r2.push(...Array(e3[1].dims.length - 2 - r2.length).fill(0));
    for (let i2 = 2; i2 < e3[1].dims.length; ++i2) r2[i2 - 2] === 0 && (r2[i2 - 2] = e3[1].dims[i2]);
    let n2 = t2.pads.slice();
    zt.adjustPadsBasedOnAutoPad(e3[0].dims, t2.strides, t2.dilations, r2, n2, t2.format === "NHWC", t2.autoPad);
    let o2 = Object.assign({}, t2);
    return Object.assign(o2, { kernelShape: r2, pads: n2 }), o2;
  }, Co = (t2) => {
    let e3 = on(t2), r2 = t2.format, n2 = ["NOTSET", "VALID", "SAME_UPPER", "SAME_LOWER"][t2.auto_pad], o2 = t2.dilations, i2 = t2.group, a2 = t2.kernel_shape, u2 = t2.pads, d2 = t2.strides, c2 = t2.w_is_const();
    return { autoPad: n2, format: r2, dilations: o2, group: i2, kernelShape: a2, pads: u2, strides: d2, wIsConst: c2, ...e3, cacheKey: `${t2.format};${e3.activation};` };
  }, Vd = (t2, e3, r2, n2) => {
    let o2 = r2.format === "NHWC", i2 = og(e3[0].dims, e3[1].dims, r2.dilations, r2.pads, r2.strides, o2);
    if (r2.group !== 1) {
      let A = [e3[0]];
      if (o2) {
        let w = t2.kernelCustomData.wT ?? t2.compute(ze(e3[1], To), { inputs: [1], outputs: [r2.wIsConst ? -2 : -1] })[0];
        r2.wIsConst && !t2.kernelCustomData.wT && (t2.kernelCustomData.wT = w), A.push(w);
      } else A.push(e3[1]);
      e3.length === 3 && A.push(e3[2]), !t2.adapterInfo.isArchitecture("ampere") && o2 && e3[1].dims[0] === r2.group && e3[1].dims[1] === 1 && r2.dilations[0] === 1 && r2.dilations[1] === 1 ? t2.compute(Ud(A, r2, i2, n2), { inputs: A }) : t2.compute(Rd(A, r2, i2, n2), { inputs: A });
      return;
    }
    let a2 = e3.length === 3, u2 = e3[0].dims[o2 ? 1 : 2], d2 = e3[0].dims[o2 ? 2 : 3], c2 = e3[0].dims[o2 ? 3 : 1], p2 = e3[1].dims[2], m2 = e3[1].dims[3], g2 = i2[o2 ? 1 : 2], y = i2[o2 ? 2 : 3], b = i2[o2 ? 3 : 1], _ = o2 && p2 === u2 && m2 === d2 && r2.pads[0] === 0 && r2.pads[1] === 0;
    if (_ || p2 === 1 && m2 === 1 && r2.dilations[0] === 1 && r2.dilations[1] === 1 && r2.strides[0] === 1 && r2.strides[1] === 1 && r2.pads[0] === 0 && r2.pads[1] === 0) {
      let A = i2[0], D, w, U, N = [];
      if (o2) {
        let Y = t2.kernelCustomData.wT ?? t2.compute(ze(e3[1], To), { inputs: [1], outputs: [r2.wIsConst ? -2 : -1] })[0];
        if (r2.wIsConst && !t2.kernelCustomData.wT && (t2.kernelCustomData.wT = Y), _) {
          let z = u2 * d2 * c2;
          D = e3[0].reshape([1, A, z]), w = Y.reshape([1, z, b]), U = [1, A, b];
        } else D = e3[0].reshape([A, u2 * d2, c2]), w = Y.reshape([1, c2, b]), U = [A, g2 * y, b];
        N.push(D), N.push(w);
      } else D = e3[0].reshape([A, c2, u2 * d2]), w = e3[1].reshape([1, b, c2]), U = [A, b, g2 * y], N.push(w), N.push(D);
      a2 && N.push(e3[2]);
      let F = U[2], q = N[0].dims[N[0].dims.length - 1];
      F < 8 && q < 8 ? t2.compute(sn(N, r2, i2, U, o2, n2), { inputs: N }) : t2.compute(ur(N, r2, i2, U, o2, n2), { inputs: N });
      return;
    }
    let S = true, x = t2.kernelCustomData.wT ?? t2.compute(ze(e3[1], To), { inputs: [1], outputs: [r2.wIsConst ? -2 : -1] })[0];
    r2.wIsConst && !t2.kernelCustomData.wT && (t2.kernelCustomData.wT = x);
    let v = [e3[0], x];
    a2 && v.push(e3[2]);
    let T = o2 ? g2 * y : b, I = o2 ? b : g2 * y, E = p2 * m2 * c2;
    t2.compute(kd(v, r2, i2, T, I, E, a2, S, n2), { inputs: v });
  }, ag = (t2, e3) => {
    let r2 = e3.format === "NHWC", n2 = [t2.inputs[0].reshape(r2 ? [t2.inputs[0].dims[0], 1, t2.inputs[0].dims[1], t2.inputs[0].dims[2]] : [t2.inputs[0].dims[0], t2.inputs[0].dims[1], 1, t2.inputs[0].dims[2]]), t2.inputs[1].reshape([t2.inputs[1].dims[0], t2.inputs[1].dims[1], 1, t2.inputs[1].dims[2]])];
    t2.inputs.length === 3 && n2.push(t2.inputs[2]);
    let o2 = [0, e3.pads[0], 0, e3.pads[1]], i2 = [1].concat(e3.strides), a2 = [1].concat(e3.dilations), u2 = [1].concat(e3.kernelShape), d2 = Io({ ...e3, pads: o2, strides: i2, dilations: a2, kernelShape: u2 }, n2);
    Vd(t2, n2, d2, (c2) => r2 ? [c2[0], c2[2], c2[3]] : [c2[0], c2[1], c2[3]]);
  }, sg = (t2, e3, r2) => {
    let n2 = r2.format === "NHWC" ? "channelsLast" : "channelsFirst", o2 = Io(r2, e3), i2 = r2.autoPad === "NOTSET" ? r2.pads : r2.autoPad, a2 = zd(e3[0].dims, e3[1].dims, r2.strides, r2.dilations, i2, false, n2);
    t2.compute(Bd(e3, o2, a2.outShape, [a2.filterDepth, a2.filterHeight, a2.filterWidth], [a2.padInfo.front, a2.padInfo.top, a2.padInfo.left], n2));
  }, Ao = (t2, e3) => {
    if (ig(t2.inputs, e3), t2.inputs[0].dims.length === 3) ag(t2, e3);
    else if (t2.inputs[0].dims.length === 5) sg(t2, t2.inputs, e3);
    else {
      let r2 = Io(e3, t2.inputs);
      Vd(t2, t2.inputs, r2);
    }
  };
});
var Wd;
var Gd = V(() => {
  "use strict";
  ee();
  nt();
  te();
  oe();
  Wd = (t2, e3, r2) => {
    let n2 = t2.length > 2, o2 = e3.outputShape, i2 = e3.format === "NHWC", a2 = e3.group, u2 = t2[1].dims, d2 = u2[2] / a2, c2 = u2[3], p2 = i2 ? fe(d2) : 1, m2 = i2 && c2 === 1 && d2 >= 4, g2 = m2 ? Math.floor(d2 / 4) * 4 : Math.floor(d2 / p2) * p2, y = d2 - g2, b = i2 ? fe(c2) : 1, _ = i2 ? c2 === 1 ? p2 : b : 1, S = k.size(o2) / b, x = [Math.ceil(S / 64), 1, 1];
    se("verbose", () => `[conv2d_backprop_webgpu] dispatch = ${x}`);
    let v = ["rank", "rank"], T = [e3.strides[0], e3.strides[1]], I = [e3.kernelShape[i2 ? 1 : 2], e3.kernelShape[i2 ? 2 : 3]], E = [e3.dilations[0], e3.dilations[1]], A = [I[0] + (e3.dilations[0] <= 1 ? 0 : (e3.kernelShape[i2 ? 1 : 2] - 1) * (e3.dilations[0] - 1)), I[1] + (e3.dilations[1] <= 1 ? 0 : (e3.kernelShape[i2 ? 2 : 3] - 1) * (e3.dilations[1] - 1))], D = [A[0] - 1 - Math.floor((e3.pads[0] + e3.pads[2]) / 2), A[1] - 1 - Math.floor((e3.pads[1] + e3.pads[3]) / 2)], w = [{ type: 12, data: S }, { type: 12, data: T }, { type: 12, data: I }, { type: 12, data: E }, { type: 12, data: A }, { type: 6, data: D }, { type: 12, data: g2 }, { type: 12, data: d2 }, { type: 12, data: c2 }, ...W(t2[0].dims, t2[1].dims)];
    n2 && (w.push(...W(t2[2].dims)), v.push("rank")), w.push(...W(o2));
    let U = (N) => {
      let F = [{ name: "output_size", type: "u32" }, { name: "strides", type: "u32", length: T.length }, { name: "filter_dims", type: "u32", length: I.length }, { name: "dilations", type: "u32", length: I.length }, { name: "effective_filter_dims", type: "u32", length: A.length }, { name: "pads", type: "i32", length: D.length }, { name: "input_channels_per_group_int", type: "u32" }, { name: "input_channels_per_group", type: "u32" }, { name: "output_channels_per_group", type: "u32" }], q = we(t2[0].dataType), Y = i2 ? 1 : 2, z = i2 ? 2 : 3, L = i2 ? 3 : 1, Q = O("W", t2[1].dataType, t2[1].dims.length, _), X = O("Dy", t2[0].dataType, t2[0].dims.length, p2), Z = [X, Q];
      n2 && Z.push(O("bias", t2[2].dataType, [o2[L]].length, b));
      let ne = R("result", t2[0].dataType, o2.length, b), ie = () => {
        let $e = "";
        if (m2) p2 === 4 ? $e += `
        let xValue = ${X.getByOffset("x_offset")};
        let wValue = ${Q.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;` : p2 === 2 ? $e += `
          dotProd = dotProd + dot(vec4<${q}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}), vec4<${q}>(${Q.getByOffset("w_offset")}, ${Q.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;` : p2 === 1 && ($e += `
          dotProd = dotProd + dot(vec4<${q}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}, ${X.getByOffset("x_offset + 2u")}, ${X.getByOffset("x_offset + 3u")}), vec4<${q}>(${Q.getByOffset("w_offset")}, ${Q.getByOffset("w_offset + 1u")}, ${Q.getByOffset("w_offset + 2u")}, ${Q.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);
        else if ($e += `
                  let xValue = ${i2 ? X.getByOffset(`${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p2}`) : X.get("batch", "inputChannel", "idyR", "idyC")};
        `, p2 === 1) $e += `
          let w_offset = ${Q.indicesToOffset(`${Q.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${Q.getByOffset(`w_offset / ${_}`)};
          dotProd = dotProd + xValue * wValue;`;
        else for (let M = 0; M < p2; M++) $e += `
            let wValue${M} = ${Q.getByOffset(`${Q.indicesToOffset(`${Q.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${M}, wOutChannel)`)} / ${_}`)};
            dotProd = dotProd + xValue[${M}] * wValue${M};`;
        return $e;
      }, le = () => {
        if (y === 0) return "";
        if (!m2) throw new Error(`packInputAs4 ${m2} is not true.`);
        let $e = "";
        if (p2 === 1) {
          $e += "dotProd = dotProd";
          for (let M = 0; M < y; M++) $e += `
            + ${X.getByOffset(`x_offset + ${M}`)} * ${Q.getByOffset(`w_offset + ${M}`)}`;
          $e += ";";
        } else if (p2 === 2) {
          if (y !== 2) throw new Error(`Invalid inputChannelsRemainder ${y}.`);
          $e += `
          let xValue = ${X.getByOffset("x_offset")};
          let wValue = ${Q.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`;
        }
        return $e;
      }, Me = `
            let outputIndices = ${ne.offsetToIndices(`global_idx * ${b}`)};
            let batch = ${ne.indicesGet("outputIndices", 0)};
            let d1 = ${ne.indicesGet("outputIndices", L)};
            let r = ${ne.indicesGet("outputIndices", Y)};
            let c = ${ne.indicesGet("outputIndices", z)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${ne.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${q}(dyRCorner) + ${q}(wR)) / ${q}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${q}(uniforms.Dy_shape[${Y}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${q}(dyCCorner) + ${q}(wC)) / ${q}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${q}(uniforms.Dy_shape[${z}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${m2 ? `
                var x_offset = ${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p2};
                var w_offset = ${Q.indicesToOffset(`${Q.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${_};
                  ` : ""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${m2 ? 4 : p2}) {
                  ${ie()}
                  inputChannel = inputChannel + ${m2 ? 4 : p2};
                }
                ${le()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${n2 ? ` + bias[d1 / ${b}]` : ""};
            ${ne.setByOffset("global_idx", "value")};
          `;
      return `
    ${N.registerUniforms(F).declareVariables(...Z, ne)}
      ${N.mainStart()}
      ${N.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${Me}}`;
    };
    return { name: "ConvTranspose2D", shaderCache: { hint: `${e3.cacheKey};${p2}${_}${b}${m2}${y}`, inputDependencies: v }, getRunData: () => ({ dispatchGroup: { x: x[0], y: x[1], z: x[2] }, outputs: [{ dims: r2 ? r2(o2) : o2, dataType: t2[0].dataType }], programUniforms: w }), getShaderSource: U };
  };
});
var ug;
var dg;
var lg;
var Hd;
var Fd;
var cg;
var qd;
var pg;
var Kd;
var jd = V(() => {
  "use strict";
  Gd();
  St();
  pt();
  ug = (t2, e3, r2, n2, o2, i2) => (t2 - 1) * e3 + r2 + (n2 - 1) * o2 + 1 - i2, dg = (t2, e3, r2, n2, o2) => {
    let i2 = Math.floor(t2 / 2);
    e3 === "SAME_UPPER" ? (r2[n2] = i2, r2[o2] = t2 - i2) : e3 === "SAME_LOWER" && (r2[n2] = t2 - i2, r2[o2] = i2);
  }, lg = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2) => {
    let p2 = t2.length - 2, m2 = c2.length === 0;
    d2.length < p2 && d2.push(...Array(p2 - d2.length).fill(0));
    let g2 = t2[0], y = e3[u2 ? 3 : 1] * o2;
    for (let b = 0, _ = t2.length - p2 - (u2 ? 1 : 0); b < p2; ++b, ++_) {
      let S = t2[_], x = m2 ? S * a2[b] : c2[b], v = ug(S, a2[b], i2[b], e3[_], r2[b], x);
      dg(v, n2, i2, b, b + p2), m2 && c2.push(a2[b] * (S - 1) + d2[b] + (e3[_] - 1) * r2[b] + 1 - i2[b] - i2[b + p2]);
    }
    c2.splice(0, 0, g2), c2.splice(u2 ? 3 : 1, 0, y);
  }, Hd = (t2, e3) => {
    let r2 = t2.kernelShape.slice();
    if (t2.kernelShape.length === 0 || t2.kernelShape.reduce((m2, g2) => m2 * g2, 1) === 0) {
      r2.length = 0;
      for (let m2 = 2; m2 < e3[1].dims.length; ++m2) r2.push(e3[1].dims[m2]);
    }
    let n2 = t2.format === "NHWC";
    r2.splice(0, 0, e3[1].dims[0]), r2.splice(n2 ? 3 : 1, 0, e3[1].dims[1]);
    let o2 = t2.pads.slice(), i2 = t2.outputShape.slice(), a2 = t2.outputPadding.slice(), u2 = e3[0].dims, d2 = t2.dilations.slice();
    if (d2.reduce((m2, g2) => m2 + g2, 0) === 0) {
      let m2 = e3[0].dims.length - 2;
      d2 = new Array(m2).fill(1);
    }
    let c2 = t2.strides.slice();
    if (c2.reduce((m2, g2) => m2 + g2, 0) === 0) {
      let m2 = e3[0].dims.length - 2;
      c2 = new Array(m2).fill(1);
    }
    lg(u2, r2, d2, t2.autoPad, t2.group, o2, c2, n2, a2, i2);
    let p2 = Object.assign({}, t2);
    return Object.assign(p2, { kernelShape: r2, pads: o2, outputPadding: a2, outputShape: i2, dilations: d2, strides: c2 }), p2;
  }, Fd = (t2) => {
    let e3 = on(t2), r2 = t2.format, n2 = ["NOTSET", "VALID", "SAME_UPPER", "SAME_LOWER"][typeof t2.autoPad > "u" ? 0 : t2.autoPad], o2 = t2.dilations, i2 = t2.group ?? 1, a2 = t2.kernelShape, u2 = t2.pads, d2 = t2.strides, c2 = t2.wIsConst(), p2 = t2.outputPadding, m2 = t2.outputShape;
    return { autoPad: n2, format: r2, dilations: o2, group: i2, kernelShape: a2, outputPadding: p2, outputShape: m2, pads: u2, strides: d2, wIsConst: c2, ...e3, cacheKey: `${t2.format};${e3.activation};` };
  }, cg = (t2, e3) => {
    if (!t2 || t2.length !== 2 && t2.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
    if (t2[0].dims.length !== 4 && t2[0].dims.length !== 3) throw new Error("currently only support 2-dimensional conv");
    if (t2[0].dims.length !== t2[1].dims.length) throw new Error("filter does not have same dimension as input");
    let r2 = t2[0].dims[e3.format === "NHWC" ? t2[0].dims.length - 1 : 1], n2 = t2[1].dims[0];
    if (r2 !== n2) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
    let o2 = t2[1].dims[1] * e3.group;
    if (t2.length === 3 && (t2[2].dims.length !== 1 || t2[2].dims[0] !== o2)) throw new Error("invalid bias");
    let i2 = t2[0].dims.length - 2;
    if (e3.dilations.reduce((p2, m2) => p2 + m2, 0) > 0 && e3.dilations.length !== i2) throw new Error(`dilations should be ${i2}D`);
    if (e3.strides.reduce((p2, m2) => p2 + m2, 0) > 0 && e3.strides.length !== i2) throw new Error(`strides should be ${i2}D`);
    if (e3.pads.reduce((p2, m2) => p2 + m2, 0) > 0 && e3.pads.length !== i2 * 2) throw new Error(`pads should be ${i2 * 2}D`);
    if (e3.outputPadding.length !== i2 && e3.outputPadding.length !== 0) throw new Error(`output_padding should be ${i2}D`);
    if (e3.kernelShape.reduce((p2, m2) => p2 + m2, 0) > 0 && e3.kernelShape.length !== 0 && e3.kernelShape.length !== t2[1].dims.length - 2) throw new Error("invalid kernel shape");
    if (e3.outputShape.length !== 0 && e3.outputShape.length !== t2[0].dims.length - 2) throw new Error("invalid output shape");
  }, qd = (t2, e3, r2, n2) => {
    let o2 = t2.kernelCustomData.wT ?? t2.compute(ze(e3[1], [2, 3, 0, 1]), { inputs: [1], outputs: [r2.wIsConst ? -2 : -1] })[0];
    r2.wIsConst && !t2.kernelCustomData.wT && (t2.kernelCustomData.wT = o2);
    let i2 = [e3[0], o2];
    e3.length === 3 && i2.push(e3[2]), t2.compute(Wd(i2, r2, n2), { inputs: i2 });
  }, pg = (t2, e3) => {
    let r2 = e3.format === "NHWC", n2 = [t2.inputs[0].reshape(r2 ? [t2.inputs[0].dims[0], 1, t2.inputs[0].dims[1], t2.inputs[0].dims[2]] : [t2.inputs[0].dims[0], t2.inputs[0].dims[1], 1, t2.inputs[0].dims[2]]), t2.inputs[1].reshape([t2.inputs[1].dims[0], t2.inputs[1].dims[1], 1, t2.inputs[1].dims[2]])];
    t2.inputs.length === 3 && n2.push(t2.inputs[2]);
    let o2 = e3.kernelShape;
    (o2.length === 0 || o2[0] === 0) && (o2 = [t2.inputs[1].dims[2]]);
    let i2 = e3.dilations;
    (i2.length === 0 || i2[0] === 0) && (i2 = [1]);
    let a2 = e3.strides;
    (a2.length === 0 || a2[0] === 0) && (a2 = [1]);
    let u2 = e3.pads;
    u2.length === 0 && (u2 = [0, 0]), u2 = [0, u2[0], 0, u2[1]], a2 = [1].concat(a2), i2 = [1].concat(i2), o2 = [1].concat(o2);
    let d2 = e3.outputPadding;
    d2 = [0].concat(d2);
    let c2 = Hd({ ...e3, pads: u2, strides: a2, dilations: i2, kernelShape: o2, outputPadding: d2 }, n2);
    qd(t2, n2, c2, (p2) => r2 ? [p2[0], p2[2], p2[3]] : [p2[0], p2[1], p2[3]]);
  }, Kd = (t2, e3) => {
    if (cg(t2.inputs, e3), t2.inputs[0].dims.length === 3) pg(t2, e3);
    else {
      let r2 = Hd(e3, t2.inputs);
      qd(t2, t2.inputs, r2);
    }
  };
});
var mg;
var Zd;
var Qd;
var Xd = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  mg = (t2, e3, r2, n2) => {
    let o2 = k.size(e3), i2 = e3.length, a2 = O("input", t2, i2), u2 = R("output", t2, i2), d2 = r2.dataType === 6 ? r2.getInt32Array()[0] : Number(r2.getBigInt64Array()[0]), c2 = k.normalizeAxis(d2, i2), p2 = (m2) => {
      let g2 = ` i32(${a2.indicesGet("inputIndices", "uniforms.axis")}) `, y = j("uniforms.input_shape", "uniforms.axis", i2), b = n2.reverse ? g2 + (n2.exclusive ? " + 1" : "") : "0", _ = n2.reverse ? y : g2 + (n2.exclusive ? "" : " + 1");
      return `
                ${m2.registerUniform("outputSize", "u32").registerUniform("axis", "u32").declareVariables(a2, u2)}
                ${m2.mainStart()}
                  ${m2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u2.offsetToIndices("global_idx")};
                  var sum = ${u2.type.value}(0);
                  let first : i32 = ${b};
                  let last : i32 = ${_};
                  for (var i : i32 = first; i < last; i++) {
                    ${a2.indicesSet("inputIndices", "uniforms.axis", "u32(i)")};
                    sum = sum + ${a2.getByIndices("inputIndices")};
                  }
                  ${u2.setByOffset("global_idx", "sum")};
                }`;
    };
    return { name: "CumSum", shaderCache: { hint: n2.cacheKey, inputDependencies: ["rank"] }, getRunData: () => ({ outputs: [{ dims: e3, dataType: t2 }], dispatchGroup: { x: Math.ceil(o2 / 64) }, programUniforms: [{ type: 12, data: o2 }, { type: 12, data: c2 }, ...W(e3, e3)] }), getShaderSource: p2 };
  }, Zd = (t2, e3) => {
    let r2 = t2.inputs[0].dims, n2 = t2.inputs[0].dataType, o2 = t2.inputs[1];
    t2.compute(mg(n2, r2, o2, e3), { inputs: [0] });
  }, Qd = (t2) => {
    let e3 = t2.exclusive === 1, r2 = t2.reverse === 1;
    return J({ exclusive: e3, reverse: r2 });
  };
});
var fg;
var hg;
var gg;
var Yd;
var Jd;
var el = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  fg = (t2) => {
    if (!t2 || t2.length !== 1) throw new Error("DepthToSpace requires 1 input.");
    if (t2[0].dims.length !== 4) throw new Error("DepthToSpace requires 4D input.");
  }, hg = (t2, e3, r2, n2) => {
    let o2 = [];
    o2.push(`fn perm(i: ${n2.type.indices}) -> ${r2.type.indices} {
    var a: ${r2.type.indices};`);
    for (let i2 = 0; i2 < e3; ++i2) o2.push(r2.indicesSet("a", t2[i2], `i[${i2}]`));
    return o2.push("return a;}"), o2.join(`
`);
  }, gg = (t2, e3) => {
    let r2, n2, o2, i2, a2, u2, d2 = e3.format === "NHWC", c2 = e3.blocksize, p2 = e3.mode === "DCR";
    d2 ? ([r2, n2, o2, i2] = t2.dims, a2 = p2 ? [r2, n2, o2, c2, c2, i2 / c2 ** 2] : [r2, n2, o2, i2 / c2 ** 2, c2, c2], u2 = p2 ? [0, 1, 3, 2, 4, 5] : [0, 1, 4, 2, 5, 3]) : ([r2, n2, o2, i2] = [t2.dims[0], t2.dims[2], t2.dims[3], t2.dims[1]], a2 = p2 ? [r2, c2, c2, i2 / c2 ** 2, n2, o2] : [r2, i2 / c2 ** 2, c2, c2, n2, o2], u2 = p2 ? [0, 3, 4, 1, 5, 2] : [0, 1, 4, 2, 5, 3]);
    let m2 = t2.reshape(a2), g2 = m2.dims.length, y = t2.dataType, b = O("a", y, g2), _ = R("output", y, g2), S = (x) => `
  ${x.registerUniform("output_size", "u32").declareVariables(b, _)}

  ${hg(u2, g2, b, _)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${_.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${_.setByOffset("global_idx", b.getByIndices("aIndices"))}
  }`;
    return { name: "DepthToSpace", shaderCache: { hint: `${t2.dims};${e3.blocksize};${e3.mode}`, inputDependencies: ["rank"] }, getRunData: (x) => {
      let v = d2 ? [r2, n2 * c2, o2 * c2, i2 / c2 ** 2] : [r2, i2 / c2 ** 2, n2 * c2, o2 * c2], T = k.size(v), I = m2.dims, E = k.sortBasedOnPerm(I, u2);
      return { outputs: [{ dims: v, dataType: x[0].dataType }], dispatchGroup: { x: Math.ceil(T / 64) }, programUniforms: [{ type: 12, data: T }, ...W(I, E)] };
    }, getShaderSource: S };
  }, Yd = (t2, e3) => {
    fg(t2.inputs), t2.compute(gg(t2.inputs[0], e3));
  }, Jd = (t2) => J({ blocksize: t2.blocksize, mode: t2.mode, format: t2.format });
});
var Tt;
var cn;
var Eo;
var rl;
var Rt;
var bg;
var yg;
var _g;
var nl;
var ol;
var il;
var wg;
var $g;
var tl;
var vg;
var al;
var sl;
var ul = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Tt = 256, cn = 512, Eo = 2 * Math.PI, rl = (t2) => {
    let e3 = [], r2 = t2;
    for (let n2 of [4, 2, 3, 5]) for (; r2 % n2 === 0; ) e3.push(n2), r2 /= n2;
    return r2 === 1 ? e3 : void 0;
  }, Rt = (t2) => {
    let e3 = t2.toPrecision(9);
    return /[.eE]/.test(e3) ? e3 : `${e3}.0`;
  }, bg = (t2, e3, r2, n2, o2) => {
    let i2 = r2 / t2, a2 = cn - n2, u2 = (c2) => `smem[${a2}u + base + ${c2 * e3}u]`, d2 = `  for (var t = local_idx; t < ${i2}u; t += ${Tt}u) {
`;
    d2 += `    let twiddleIndex = t % ${e3}u;
    let angleUnit = f32(twiddleIndex);
`, d2 += `    var leg: array<vec2<f32>, 5>;
`;
    for (let c2 = 0; c2 < t2; c2++) {
      let p2 = `${n2}u + t + ${c2 * i2}u`;
      if (c2 === 0) d2 += `    leg[0] = smem[${p2}];
`;
      else {
        let m2 = o2 * Eo * c2 / (t2 * e3);
        d2 += `    { let a = ${Rt(m2)} * angleUnit; leg[${c2}] = cmul(smem[${p2}], vec2<f32>(cos(a), sin(a))); }
`;
      }
    }
    if (d2 += `    let base = (t / ${e3}u) * ${e3 * t2}u + twiddleIndex;
`, t2 === 2) d2 += `    ${u2(0)} = leg[0] + leg[1];
    ${u2(1)} = leg[0] - leg[1];
`;
    else if (t2 === 4) {
      let c2 = o2 < 0 ? "vec2<f32>(oddDiff.y, -oddDiff.x)" : "vec2<f32>(-oddDiff.y, oddDiff.x)";
      d2 += `    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`, d2 += `    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`, d2 += `    let oddRot = ${c2};
`, d2 += `    ${u2(0)} = evenSum + oddSum;
    ${u2(1)} = evenDiff + oddRot;
`, d2 += `    ${u2(2)} = evenSum - oddSum;
    ${u2(3)} = evenDiff - oddRot;
`;
    } else for (let c2 = 0; c2 < t2; c2++) {
      let p2 = ["leg[0]"];
      for (let m2 = 1; m2 < t2; m2++) {
        let g2 = o2 * Eo * (m2 * c2) / t2, y = Rt(Math.cos(g2)), b = Rt(Math.sin(g2));
        p2.push(`vec2<f32>(leg[${m2}].x*${y} - leg[${m2}].y*${b}, leg[${m2}].x*${b} + leg[${m2}].y*${y})`);
      }
      d2 += `    ${u2(c2)} = ${p2.join(" + ")};
`;
    }
    return `${d2}  }
  workgroupBarrier();
`;
  }, yg = (t2, e3, r2) => {
    let n2 = "", o2 = 1, i2 = 0;
    for (let a2 of t2) n2 += bg(a2, o2, e3, i2, r2), o2 *= a2, i2 = cn - i2;
    return { code: n2, resultOffset: i2 };
  }, _g = (t2, e3, r2, n2, o2) => {
    let i2 = t2.dims, a2 = i2.length, u2 = i2[a2 - 1], d2 = i2[e3], c2 = r2 && n2 ? (d2 - 1) * 2 : d2;
    o2 !== void 0 && (c2 = o2);
    let p2 = r2 && n2 ? 1 : 2, m2 = n2 && !r2 ? Math.floor(c2 / 2) + 1 : c2, g2 = i2.slice();
    g2[e3] = m2, g2[a2 - 1] = p2;
    let y = 1;
    for (let _ = e3 + 1; _ < a2 - 1; _++) y *= i2[_];
    let b = k.size(i2) / u2 / d2;
    return { dataType: t2.dataType, outputDims: g2, length: c2, signalLength: d2, inner: y, batch: b, inputComponents: u2, outputComponents: p2, outputLength: m2, inverse: r2, onesided: n2 };
  }, nl = (t2, e3) => [e3, t2.length, t2.inputComponents, t2.outputComponents, t2.inverse, t2.onesided].join(";"), ol = (t2) => [{ type: 12, data: t2.batch }, { type: 12, data: t2.signalLength }, { type: 12, data: t2.inner }, { type: 12, data: t2.outputLength }], il = (t2, e3, r2) => t2.registerUniform("batch", "u32").registerUniform("signalLength", "u32").registerUniform("inner", "u32").registerUniform("outputLength", "u32").declareVariables(e3, r2), wg = (t2) => {
    let { dataType: e3, length: r2, inputComponents: n2, outputComponents: o2, inverse: i2, onesided: a2 } = t2, u2 = Ae(e3), d2 = i2 ? 1 : -1, c2 = i2 ? 1 / r2 : 1, p2 = rl(r2), m2 = (g2) => {
      let y = O("x", e3, [1]), b = R("y", e3, [1]), _ = (E) => {
        let A = `inBase + (${E}) * uniforms.inner * ${n2}u`, D = `f32(${y.getByOffset(A)})`, w = n2 === 2 ? `f32(${y.getByOffset(`${A} + 1u`)})` : "0.0";
        return `vec2<f32>(${D}, ${w})`;
      }, S;
      if (i2 && a2) {
        let E = Math.floor(r2 / 2) + 1, A = r2 % 2 === 0 ? `select(provided, provided - 1u, provided == ${E}u)` : "provided";
        S = `
    let provided = min(uniforms.signalLength, ${E}u);
    for (var i = local_idx; i < ${r2}u; i += ${Tt}u) {
      if (i < provided) { smem[i] = ${_("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${A}; k += ${Tt}u) {
      let h = smem[k];
      smem[${r2}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`;
      } else S = `
    let loadCount = min(uniforms.signalLength, ${r2}u);
    for (var i = local_idx; i < ${r2}u; i += ${Tt}u) {
      if (i < loadCount) { smem[i] = ${_("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;
      let { code: x, resultOffset: v } = yg(p2, r2, d2), T = c2 === 1 ? `smem[${v}u + i]` : `smem[${v}u + i] * ${Rt(c2)}`, I = o2 === 2 ? b.setByOffset("off + 1u", `${u2}(v.y)`) : "";
      return `
  ${il(g2, y, b)}
  var<workgroup> smem: array<vec2<f32>, ${2 * cn}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${g2.mainStart(Tt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${n2}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${o2}u;
    ${S}
${x}    for (var i = local_idx; i < uniforms.outputLength; i += ${Tt}u) {
      let v = ${T};
      let off = outBase + i * uniforms.inner * ${o2}u;
      ${b.setByOffset("off", `${u2}(v.x)`)}
      ${I}
    }
  }`;
    };
    return { name: "DFT", shaderCache: { hint: nl(t2, "fft"), inputDependencies: ["type"] }, getShaderSource: m2, getRunData: () => ({ outputs: [{ dims: t2.outputDims, dataType: e3 }], programUniforms: ol(t2), dispatchGroup: { x: t2.batch } }) };
  }, $g = (t2) => {
    let { dataType: e3, length: r2, inputComponents: n2, outputComponents: o2, inverse: i2, onesided: a2 } = t2, u2 = Ae(e3), d2 = i2 ? 1 : -1, c2 = i2 ? 1 / r2 : 1, p2 = (m2) => {
      let g2 = O("x", e3, [1]), y = R("y", e3, [1]), b = (T) => {
        let I = `inBase + (${T}) * uniforms.inner * ${n2}u`, E = `f32(${g2.getByOffset(I)})`, A = n2 === 2 ? `f32(${g2.getByOffset(`${I} + 1u`)})` : "0.0";
        return `vec2<f32>(${E}, ${A})`;
      }, _ = i2 && a2 ? `fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(r2 / 2) + 1}u);
    if (k < provided) { return ${b("k")}; }
    let m = ${r2}u - k;
    if (m < provided) {
      let h = ${b("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }` : `fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${b("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`, S = `
      let angle = ${Rt(d2 * Eo)} * f32(knMod) / ${Rt(r2)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${r2}u) { knMod -= ${r2}u; }`, x = o2 === 2 ? y.setByOffset("off + 1u", `${u2}(v.y)`) : "", v = c2 === 1 ? "acc" : `acc * ${Rt(c2)}`;
      return `
  ${il(m2, g2, y)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${_}
  ${m2.mainStart(Tt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${n2}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${o2}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${Tt}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${r2}u; n++) {${S}
      }
      let v = ${v};
      let off = outBase + k * uniforms.inner * ${o2}u;
      ${y.setByOffset("off", `${u2}(v.x)`)}
      ${x}
    }
  }`;
    };
    return { name: "DFT", shaderCache: { hint: nl(t2, "direct"), inputDependencies: ["type"] }, getShaderSource: p2, getRunData: () => ({ outputs: [{ dims: t2.outputDims, dataType: e3 }], programUniforms: ol(t2), dispatchGroup: { x: t2.batch } }) };
  }, tl = (t2) => {
    if (!t2 || t2.dataType === 0) return;
    if (k.size(t2.dims) !== 1) throw new Error("DFT optional scalar inputs must have exactly 1 element.");
    if (t2.dataType === 6) return t2.getInt32Array()[0];
    let e3 = Number(t2.getBigInt64Array()[0]);
    if (!Number.isSafeInteger(e3)) throw new Error("DFT optional scalar inputs are out of JavaScript safe integer range.");
    return e3;
  }, vg = (t2) => {
    if (!t2 || t2.length < 1) throw new Error("DFT requires at least 1 input.");
    let e3 = t2[0].dims;
    if (e3.length < 2) throw new Error("DFT input must have at least 2 dimensions.");
    let r2 = e3[e3.length - 1];
    if (r2 !== 1 && r2 !== 2) throw new Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).");
  }, al = (t2, e3) => {
    vg(t2.inputs);
    let r2 = t2.inputs[0], n2 = r2.dims.length, o2 = e3.inverse !== 0, i2 = e3.onesided !== 0, a2 = tl(t2.inputs[1]);
    if (a2 !== void 0 && a2 <= 0) throw new Error("dft_length must be greater than zero.");
    let u2 = k.normalizeAxis(tl(t2.inputs[2]) ?? e3.axis, n2);
    if (u2 === n2 - 1) throw new Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");
    if (o2 && i2 && r2.dims[n2 - 1] !== 2) throw new Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");
    let d2 = _g(r2, u2, o2, i2, a2);
    if (d2.length <= 0) throw new Error(`Invalid DFT length: ${d2.length}`);
    let p2 = d2.length <= cn && rl(d2.length) !== void 0 ? wg(d2) : $g(d2);
    t2.compute(p2, { inputs: [0] });
  }, sl = (t2) => J({ axis: t2.axis ?? 1, inverse: t2.inverse ?? 0, onesided: t2.onesided ?? 0 });
});
var ko;
var pn;
var dl;
var xg;
var Sg;
var Po;
var Oo;
var ll;
var Tg;
var cl;
var pl;
var ml = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  ko = "[a-zA-Z]|\\.\\.\\.", pn = "(" + ko + ")+", dl = "^" + pn + "$", xg = "(" + pn + ",)*" + pn, Sg = "^" + xg + "$", Po = class {
    constructor(e3 = -1) {
      this.symbolToIndices = /* @__PURE__ */ new Map(), this.inputIndex = e3;
    }
    addSymbol(e3, r2) {
      let n2 = this.symbolToIndices.get(e3);
      n2 === void 0 ? n2 = [r2] : n2.push(r2), this.symbolToIndices.set(e3, n2);
    }
  }, Oo = class {
    constructor(e3, r2) {
      this.equation = r2;
      this.hasEllipsis = false, this.symbolToInfo = /* @__PURE__ */ new Map(), this.lhs = new Array(), this.outputDims = [];
      let [n2, o2] = r2.includes("->") ? r2.split("->", 2) : [r2, ""];
      if (!n2.match(RegExp(Sg))) throw new Error("Invalid LHS term");
      if (n2.split(",").forEach((u2, d2) => {
        let c2 = e3[d2].dims.slice();
        if (!u2.match(RegExp(dl))) throw new Error("Invalid LHS term");
        let p2 = this.processTerm(u2, true, c2, d2);
        this.lhs.push(p2);
      }), o2 === "") o2 += [...this.symbolToInfo.entries()].filter(([u2, d2]) => d2.count === 1 || u2 === "...").map(([u2]) => u2).join("");
      else if (!o2.match(RegExp(pn))) throw new Error("Invalid RHS");
      o2.match(RegExp(ko, "g"))?.forEach((u2) => {
        if (u2 === "...") this.outputDims = this.outputDims.concat(this.ellipsisDims);
        else {
          let d2 = this.symbolToInfo.get(u2);
          if (d2 === void 0) throw new Error("Invalid RHS symbol");
          this.outputDims.push(d2.dimValue);
        }
      }), this.rhs = this.processTerm(o2, false, this.outputDims);
    }
    addSymbol(e3, r2, n2) {
      let o2 = this.symbolToInfo.get(e3);
      if (o2 !== void 0) {
        if (o2.dimValue !== r2 && o2.count !== 1) throw new Error("Dimension mismatch");
        o2.count++, o2.inputIndices.push(n2);
      } else o2 = { count: 1, dimValue: r2, inputIndices: [n2] };
      this.symbolToInfo.set(e3, o2);
    }
    processTerm(e3, r2, n2, o2 = -1) {
      let i2 = n2.length, a2 = false, u2 = [], d2 = 0;
      if (!e3.match(RegExp(dl)) && !r2 && e3 !== "") throw new Error("Invalid LHS term");
      let c2 = e3.match(RegExp(ko, "g")), p2 = new Po(o2);
      return c2?.forEach((m2, g2) => {
        if (m2 === "...") {
          if (a2) throw new Error("Only one ellipsis is allowed per input term");
          a2 = true;
          let y = i2 - c2.length + 1;
          if (y < 0) throw new Error("Ellipsis out of bounds");
          if (u2 = n2.slice(d2, d2 + y), this.hasEllipsis) {
            if (this.ellipsisDims.length !== u2.length || this.ellipsisDims.toString() !== u2.toString()) throw new Error("Ellipsis dimensions mismatch");
          } else if (r2) this.hasEllipsis = true, this.ellipsisDims = u2;
          else throw new Error("Ellipsis must be specified in the LHS");
          for (let b = 0; b < u2.length; b++) {
            let _ = String.fromCharCode(48 + b);
            p2.addSymbol(_, g2 + b), this.addSymbol(_, n2[d2++], o2);
          }
        } else p2.addSymbol(m2, g2 + (this.hasEllipsis ? this.ellipsisDims.length - 1 : 0)), this.addSymbol(m2, n2[d2++], o2);
      }), p2;
    }
  }, ll = (t2) => t2 + "_max", Tg = (t2, e3, r2, n2) => {
    let i2 = t2.map((p2) => p2.length).map((p2, m2) => O(`input${m2}`, e3, p2)), a2 = k.size(n2), u2 = R("output", e3, n2.length), d2 = [...r2.symbolToInfo.keys()].filter((p2) => !r2.rhs.symbolToIndices.has(p2)), c2 = (p2) => {
      let m2 = [], g2 = "var prod = 1.0;", y = "var sum = 0.0;", b = "sum += prod;", _ = [], S = [], x = [], v = [], T = r2.symbolToInfo.size === r2.rhs.symbolToIndices.size;
      r2.symbolToInfo.forEach((E, A) => {
        if (r2.rhs.symbolToIndices.has(A)) {
          let D = r2.rhs.symbolToIndices.get(A)?.[0];
          D !== void 0 && r2.lhs.forEach((w, U) => {
            if (E.inputIndices.includes(U)) {
              let N = w.symbolToIndices.get(A);
              if (N === void 0) throw new Error("Invalid symbol error");
              N.forEach((F) => {
                m2.push(`${i2[U].indicesSet(`input${U}Indices`, F, u2.indicesGet("outputIndices", D))}`);
              });
            }
          });
        } else r2.lhs.forEach((D, w) => {
          if (E.inputIndices.includes(w)) {
            let U = D.symbolToIndices.get(A);
            if (U === void 0) throw new Error("Invalid symbol error");
            U.forEach((N) => {
              _.push(`${i2[w].indicesSet(`input${w}Indices`, N, `${A}`)}`);
            }), v.push(`prod *= ${i2[w].getByIndices(`input${w}Indices`)};`);
          }
        }), S.push(`for(var ${A}: u32 = 0; ${A} < uniforms.${ll(A)}; ${A}++) {`), x.push("}");
      });
      let I = T ? [...m2, `let sum = ${i2.map((E, A) => E.getByIndices(`input${A}Indices`)).join(" * ")};`] : [...m2, y, ...S, ..._, g2, ...v, b, ...x];
      return `
            ${p2.registerUniforms(d2.map((E) => ({ name: `${ll(E)}`, type: "u32" }))).registerUniform("outputSize", "u32").declareVariables(...i2, u2)}

            ${p2.mainStart()}
            ${p2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${u2.offsetToIndices("global_idx")};
            ${i2.map((E, A) => `var input${A}Indices: ${i2[A].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${u2.setByOffset("global_idx", "sum")};
          }`;
    };
    return { name: "Einsum", shaderCache: { hint: r2.equation, inputDependencies: t2.map(() => "rank") }, getRunData: () => {
      let p2 = d2.filter((g2) => r2.symbolToInfo.has(g2)).map((g2) => ({ type: 12, data: r2.symbolToInfo.get(g2)?.dimValue || 0 }));
      p2.push({ type: 12, data: a2 });
      let m2 = t2.map((g2, y) => [...W(g2)]).reduce((g2, y) => g2.concat(y), p2);
      return m2.push(...W(n2)), { outputs: [{ dims: n2, dataType: e3 }], dispatchGroup: { x: Math.ceil(a2 / 64) }, programUniforms: m2 };
    }, getShaderSource: c2 };
  }, cl = (t2, e3) => {
    let r2 = new Oo(t2.inputs, e3.equation), n2 = r2.outputDims, o2 = t2.inputs.map((i2, a2) => i2.dims);
    t2.compute(Tg(o2, t2.inputs[0].dataType, r2, n2));
  }, pl = (t2) => {
    let e3 = t2.equation.replace(/\s+/g, "");
    return J({ equation: e3 });
  };
});
var Ig;
var fl;
var Cg;
var Ag;
var hl;
var gl = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Ig = (t2) => {
    if (!t2 || t2.length !== 2) throw new Error("Expand requires 2 input.");
    let e3 = t2[0].dims, r2 = Array.from(t2[1].getBigInt64Array(), Number), n2 = r2.length < e3.length ? 0 : r2.length - e3.length, o2 = e3.length < r2.length ? 0 : e3.length - r2.length;
    for (; n2 < r2.length && o2 < e3.length; ++n2, ++o2) if (r2[n2] !== e3[o2] && r2[n2] !== 1 && e3[o2] !== 1) throw new Error("Expand requires shape to be broadcastable to input");
  }, fl = (t2, e3) => {
    let r2 = t2.length - e3.length, n2 = [];
    for (let o2 = 0; o2 < r2; ++o2) n2.push(t2[o2]);
    for (let o2 = 0; o2 < e3.length; ++o2) n2.push(e3[o2] === 1 ? t2[o2 + r2] : e3[o2]);
    return n2;
  }, Cg = (t2, e3) => t2.length > e3.length ? fl(t2, e3) : fl(e3, t2), Ag = (t2) => {
    let e3 = t2[0].dims, r2 = Array.from(t2[1].getBigInt64Array(), Number), n2 = Cg(e3, r2), o2 = t2[0].dataType, i2 = o2 === 9 || k.size(e3) === 1, a2 = o2 === 9 || e3.length > 0 && e3[e3.length - 1] % 4 === 0 ? 4 : 1, u2 = i2 || n2.length > 0 && n2[n2.length - 1] % 4 === 0 ? 4 : 1, d2 = Math.ceil(k.size(n2) / u2), c2 = (m2) => {
      let g2 = O("input", o2, e3.length, a2), y = R("output", o2, n2.length, u2), b;
      if (o2 === 9) {
        let _ = (S, x, v = "") => `
          let outputIndices${x} = ${y.offsetToIndices(`outputOffset + ${x}u`)};
          let offset${x} = ${g2.broadcastedIndicesToOffset(`outputIndices${x}`, y)};
          let index${x} = offset${x} / 4u;
          let component${x} = offset${x} % 4u;
          ${S}[${x}] = ${v}(${g2.getByOffset(`index${x}`)}[component${x}]);
        `;
        b = `
        let outputOffset = global_idx * ${u2};
        var data = vec4<u32>(0);
        ${_("data", 0, "u32")}
        ${_("data", 1, "u32")}
        ${_("data", 2, "u32")}
        ${_("data", 3, "u32")}
        ${y.setByOffset("global_idx", "data")}
      }`;
      } else b = `
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u2}`)};
        let inputOffset = ${g2.broadcastedIndicesToOffset("outputIndices", y)};
        let data = ${y.type.value}(${g2.getByOffset(`inputOffset / ${a2}`)});
        ${y.setByOffset("global_idx", "data")}
      }`;
      return `
    ${m2.registerUniform("vec_size", "u32").declareVariables(g2, y)}
    ${m2.mainStart()}
    ${m2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${b}`;
    }, p2 = [{ type: 12, data: d2 }, ...W(e3, n2)];
    return { name: "Expand", shaderCache: { hint: `${n2.length};${a2}${u2}`, inputDependencies: ["rank"] }, getShaderSource: c2, getRunData: () => ({ outputs: [{ dims: n2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(d2 / 64) }, programUniforms: p2 }) };
  }, hl = (t2) => {
    Ig(t2.inputs), t2.compute(Ag(t2.inputs), { inputs: [0] });
  };
});
var Eg;
var bl;
var yl = V(() => {
  "use strict";
  ee();
  te();
  oe();
  nn();
  Eg = (t2) => {
    let e3 = t2[0].dataType, r2 = k.size(t2[0].dims), n2 = k.size(t2[1].dims), o2 = n2 % 4 === 0, i2 = (a2) => {
      let u2 = O("x", e3, [1], 4), d2 = O("bias", e3, [1], 4), c2 = R("y", e3, [1], 4), p2 = [{ name: "output_vec_size", type: "u32" }, { name: "bias_size", type: "u32" }], m2 = (y) => `
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${d2.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`, g2 = o2 ? `
      let bias = ${d2.getByOffset("global_idx % (uniforms.bias_size / 4)")};` : `${m2(0)}${m2(1)}${m2(2)}${m2(3)}
      let bias = ${u2.type.value}(bias0, bias1, bias2, bias3);`;
      return `${a2.registerUniforms(p2).declareVariables(u2, d2, c2)}

    ${$o(Ae(e3))}

    ${a2.mainStart(Bt)}
      ${a2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u2.getByOffset("global_idx")};
      ${g2}
      let x_in = x + bias;
      ${c2.setByOffset("global_idx", vo("x_in"))}
    }`;
    };
    return { name: "FastGeluWithBias", shaderCache: { hint: `${o2}`, inputDependencies: ["type", "type"] }, getShaderSource: i2, getRunData: (a2) => ({ outputs: [{ dims: a2[0].dims, dataType: a2[0].dataType }], programUniforms: [{ type: 12, data: Math.ceil(r2 / 4) }, { type: 12, data: n2 }], dispatchGroup: { x: Math.ceil(r2 / Bt / 4) } }) };
  }, bl = (t2) => {
    t2.inputs.length < 2 || k.size(t2.inputs[1].dims) === 0 ? id(t2) : t2.compute(Eg(t2.inputs));
  };
});
var kg;
var Pg;
var _l;
var wl;
var $l = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  kg = (t2) => {
    if (!t2 || t2.length !== 2) throw new Error("Gather requires 2 inputs.");
  }, Pg = (t2, e3) => {
    let r2 = t2[0].dims, n2 = t2[1].dims, o2 = r2.length, i2 = k.normalizeAxis(e3.axis, o2), a2 = r2.slice(0);
    a2.splice(i2, 1, ...n2);
    let u2 = r2[i2], d2 = t2[0].dataType === 9 ? 4 : 1, c2 = Math.ceil(k.size(a2) / d2), p2 = [{ type: 12, data: c2 }, { type: 6, data: u2 }, { type: 12, data: i2 }, ...W(t2[0].dims, t2[1].dims, a2)], m2 = (g2) => {
      let y = O("data", t2[0].dataType, t2[0].dims.length, d2), b = O("inputIndices", t2[1].dataType, t2[1].dims.length), _ = R("output", t2[0].dataType, a2.length, d2), S = (v) => {
        let T = n2.length, I = `var indicesIndices${v}  = ${b.type.indices}(0);`;
        for (let E = 0; E < T; E++) I += `${T > 1 ? `indicesIndices${v}[${E}]` : `indicesIndices${v}`} = ${a2.length > 1 ? `outputIndices${v}[uniforms.axis + ${E}]` : `outputIndices${v}`};`;
        I += `
          var idx${v} = ${b.getByIndices(`indicesIndices${v}`)};
          if (idx${v} < 0) {
            idx${v} = idx${v} + uniforms.axisDimLimit;
          }
          var dataIndices${v} : ${y.type.indices};
        `;
        for (let E = 0, A = 0; E < o2; E++) E === i2 ? (I += `${o2 > 1 ? `dataIndices${v}[${E}]` : `dataIndices${v}`} = u32(idx${v});`, A += T) : (I += `${o2 > 1 ? `dataIndices${v}[${E}]` : `dataIndices${v}`} = ${a2.length > 1 ? `outputIndices${v}[${A}]` : `outputIndices${v}`};`, A++);
        return I;
      }, x;
      if (t2[0].dataType === 9) {
        let v = (T, I, E = "") => `
          let outputIndices${I} = ${_.offsetToIndices(`outputOffset + ${I}u`)};
          ${S(I)};
          let offset${I} = ${y.indicesToOffset(`dataIndices${I}`)};
          let index${I} = offset${I} / 4u;
          let component${I} = offset${I} % 4u;
          ${T}[${I}] = ${E}(${y.getByOffset(`index${I}`)}[component${I}]);
        `;
        x = `
        let outputOffset = global_idx * ${d2};
        var value = vec4<u32>(0);
        ${v("value", 0, "u32")}
        ${v("value", 1, "u32")}
        ${v("value", 2, "u32")}
        ${v("value", 3, "u32")}
        ${_.setByOffset("global_idx", "value")}
      `;
      } else x = `
      let outputIndices = ${_.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${y.getByIndices("dataIndices")};
      ${_.setByOffset("global_idx", "value")};
      `;
      return `
      ${g2.registerUniform("outputSize", "u32").registerUniform("axisDimLimit", "i32").registerUniform("axis", "u32").declareVariables(y, b, _)}
      ${g2.mainStart()}
        ${g2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${x}
      }`;
    };
    return { name: "Gather", shaderCache: { hint: e3.cacheKey, inputDependencies: ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: a2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(c2 / 64) }, programUniforms: p2 }), getShaderSource: m2 };
  }, _l = (t2) => J({ axis: t2.axis }), wl = (t2, e3) => {
    let r2 = t2.inputs;
    kg(r2), t2.compute(Pg(t2.inputs, e3));
  };
});
var Og;
var vl;
var xl;
var Sl = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Og = (t2, e3, r2, n2, o2, i2, a2, u2, d2) => {
    let c2 = [{ type: 12, data: i2 }, { type: 12, data: n2 }, { type: 12, data: o2 }, { type: 12, data: r2 }, { type: 12, data: a2 }, { type: 12, data: u2 }, { type: 12, data: d2 }], p2 = [i2];
    c2.push(...W(e3.dims, p2));
    let m2 = (g2) => {
      let y = O("indices_data", e3.dataType, e3.dims.length), b = R("input_slice_offsets_data", 12, 1, 1), _ = [y, b], S = [{ name: "output_size", type: "u32" }, { name: "batch_dims", type: "u32" }, { name: "input_dims", type: "u32", length: o2.length }, { name: "sizes_from_slice_dims_data", type: "u32", length: r2.length }, { name: "num_slices_per_batch", type: "u32" }, { name: "input_batch_stride", type: "u32" }, { name: "num_slice_dims", type: "u32" }];
      return `
  ${g2.registerUniforms(S).declareVariables(..._)}
  ${g2.mainStart()}
    ${g2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${o2.length === 1 ? "index += i32(uniforms.input_dims);" : "index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r2.length === 1 ? "relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);" : "relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`;
    };
    return t2.compute({ name: "computeSliceOffsets", shaderCache: { hint: `${o2.length}_${r2.length}`, inputDependencies: ["rank"] }, getRunData: () => ({ outputs: [{ dims: p2, dataType: t2.inputs[1].dataType }], dispatchGroup: { x: Math.ceil(i2 / 64) }, programUniforms: c2 }), getShaderSource: m2 }, { inputs: [e3], outputs: [-1] })[0];
  }, vl = (t2, e3) => {
    let r2 = t2.inputs, n2 = r2[0].dims, o2 = r2[0].dataType, i2 = r2[1].dims, a2 = i2[i2.length - 1], u2 = k.sizeToDimension(i2, i2.length - 1), d2 = k.sizeFromDimension(n2, e3.batchDims + a2), c2 = k.sizeToDimension(n2, e3.batchDims), p2 = k.sizeFromDimension(n2, e3.batchDims), m2 = u2 / c2, g2 = new Array(a2), y = d2;
    for (let I = 0; I < a2; ++I) g2[a2 - 1 - I] = y, y *= n2[e3.batchDims + a2 - 1 - I];
    let b = Og(t2, r2[1], g2, e3.batchDims, n2, u2, m2, p2, a2), _ = e3.batchDims + a2;
    if (_ > n2.length) throw new Error("last dimension of indices must not be larger than rank of input tensor");
    let S = i2.slice(0, -1).concat(n2.slice(_)), x = k.size(S), v = [{ type: 12, data: x }, { type: 12, data: d2 }, ...W(r2[0].dims, b.dims, S)], T = (I) => {
      let E = O("data", r2[0].dataType, r2[0].dims.length), A = O("slice_offsets", 12, b.dims.length), D = R("output", r2[0].dataType, S.length);
      return `
          ${I.registerUniform("output_size", "u32").registerUniform("slice_size", "u32").declareVariables(E, A, D)}
            ${I.mainStart()}
            ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`;
    };
    t2.compute({ name: "GatherND", shaderCache: { hint: e3.cacheKey, inputDependencies: ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: S, dataType: o2 }], dispatchGroup: { x: Math.ceil(x / 64) }, programUniforms: v }), getShaderSource: T }, { inputs: [r2[0], b] });
  }, xl = (t2) => ({ batchDims: t2.batch_dims, cacheKey: "" });
});
var Dg;
var zg;
var Tl;
var Il;
var Cl = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Dg = (t2, e3) => {
    if (t2.length < 3 || t2.length > 4) throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");
    let r2 = k.normalizeAxis(e3.quantizeAxis, t2[0].dims.length), n2 = e3.blockSize, o2 = t2[0], i2 = t2[2], a2 = t2.length === 4 ? t2[3] : void 0;
    if (i2.dims.length !== o2.dims.length || !o2.dims.map((u2, d2) => d2 === r2 ? Math.ceil(u2 / n2) === i2.dims[d2] : u2 === i2.dims[d2]).reduce((u2, d2) => u2 && d2, true)) throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");
    if (a2) {
      if (a2.dataType !== o2.dataType) throw new Error("Zero point must have the same data type as the input tensor.");
      if (a2.dims.length !== i2.dims.length || !a2.dims.map((u2, d2) => u2 === i2.dims[d2]).reduce((u2, d2) => u2 && d2, true)) throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.");
    }
  }, zg = (t2, e3) => {
    let r2 = t2[0].dims, n2 = t2[1].dims, o2 = r2.length, i2 = k.normalizeAxis(e3.gatherAxis, o2), a2 = k.normalizeAxis(e3.quantizeAxis, o2), u2 = r2.slice(0);
    u2.splice(i2, 1, ...n2);
    let d2 = k.size(u2), c2 = t2[2].dataType, m2 = t2[0].dataType === 22, g2 = [{ type: 12, data: d2 }, { type: 12, data: a2 }, { type: 12, data: i2 }, { type: 12, data: e3.blockSize }, ...W(...t2.map((b, _) => b.dims), u2)], y = (b) => {
      let _ = O("data", t2[0].dataType, t2[0].dims.length), S = O("inputIndices", t2[1].dataType, t2[1].dims.length), x = O("scales", t2[2].dataType, t2[2].dims.length), v = t2.length > 3 ? O("zeroPoint", t2[3].dataType, t2[3].dims.length) : void 0, T = R("output", c2, u2.length), I = [_, S, x];
      v && I.push(v);
      let E = [{ name: "output_size", type: "u32" }, { name: "quantize_axis", type: "u32" }, { name: "gather_axis", type: "u32" }, { name: "block_size", type: "u32" }];
      return `
        ${b.registerUniforms(E).declareVariables(...I, T)}
        ${b.mainStart()}
        let output_indices = ${T.offsetToIndices("global_idx")};
        var indices_indices = ${S.type.indices}(0);
        ${n2.length > 1 ? `
          for (var i: u32 = 0; i < ${n2.length}; i++) {
            let index = ${T.indicesGet("output_indices", "uniforms.gather_axis + i")};
            ${S.indicesSet("indices_indices", "i", "index")};
          }` : `indices_indices = ${T.indicesGet("output_indices", "uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${T.indicesGet("output_indices", "i")};
          ${_.indicesSet("data_indices", "i", "index")};
        }
        var index_from_indices = ${S.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r2[i2]};
        }
        ${_.indicesSet("data_indices", "uniforms.gather_axis", "u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u2.length}; i++) {
          let index = ${T.indicesGet("output_indices", `i + ${n2.length} - 1`)};
          ${_.indicesSet("data_indices", "i", "index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${m2 ? "unpack4xI8" : "unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${x.indicesGet("data_indices", "uniforms.quantize_axis")} / uniforms.block_size;
        ${x.indicesSet("scale_indices", "uniforms.quantize_axis", "quantize_axis_index")};
        var scale = ${x.getByIndices("scale_indices")};
        ${v ? `
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${v.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${v.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${m2 ? "unpack4xI8" : "unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];` : "var zero_point = 0"};
        let dequantized_data = ${Ae(c2)}(quantized_data - zero_point) * scale;
        ${T.setByOffset("global_idx", "dequantized_data")};
    }`;
    };
    return { name: "GatherBlockQuantized", shaderCache: { hint: `${e3.cacheKey};${t2.filter((b, _) => _ !== 1).map((b) => b.dims.join("_")).join(";")}`, inputDependencies: Array.from({ length: t2.length }, (b, _) => "rank") }, getRunData: () => ({ outputs: [{ dims: u2, dataType: c2 }], dispatchGroup: { x: Math.ceil(d2 / 64) }, programUniforms: g2 }), getShaderSource: y };
  }, Tl = (t2, e3) => {
    let r2 = t2.inputs;
    Dg(r2, e3), t2.compute(zg(t2.inputs, e3));
  }, Il = (t2) => J({ blockSize: t2.blockSize, gatherAxis: t2.gatherAxis, quantizeAxis: t2.quantizeAxis });
});
var Bg;
var Mg;
var Al;
var El;
var kl = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Bg = (t2) => {
    if (!t2 || t2.length !== 2) throw new Error("GatherElements requires 2 inputs.");
    if (t2[0].dims.length < 1) throw new Error("GatherElements requires that the data input be rank >= 1.");
    if (t2[0].dims.length !== t2[1].dims.length) throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`);
  }, Mg = (t2, e3) => {
    let r2 = t2[0].dims, n2 = t2[0].dataType, o2 = r2.length, i2 = t2[1].dims, a2 = t2[1].dataType, u2 = k.normalizeAxis(e3.axis, o2), d2 = r2[u2], c2 = i2.slice(0), p2 = k.size(c2), m2 = O("input", n2, o2), g2 = O("indicesInput", a2, i2.length), y = R("output", n2, c2.length), b = [{ type: 12, data: p2 }, { type: 6, data: d2 }, { type: 12, data: u2 }];
    return b.push(...W(r2, i2, c2)), { name: "GatherElements", shaderCache: { inputDependencies: ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: c2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(p2 / 64) }, programUniforms: b }), getShaderSource: (x) => `
      ${x.registerUniform("outputSize", "u32").registerUniform("axisDimLimit", "i32").registerUniform("axis", "u32").declareVariables(m2, g2, y)}
      ${x.mainStart()}
      ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g2.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${m2.type.indices}(outputIndices);
      ${m2.indicesSet("inputIndices", "uniforms.axis", "u32(idx)")};
      let value = ${m2.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx", "value")};
  }` };
  }, Al = (t2) => J({ axis: t2.axis }), El = (t2, e3) => {
    let r2 = t2.inputs;
    Bg(r2), t2.compute(Mg(t2.inputs, e3));
  };
});
var Rg;
var Ug;
var Pl;
var Ol;
var Dl = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Rg = (t2) => {
    if (!t2) throw new Error("Input is missing");
    if (t2.length < 2 || t2.length > 3) throw new Error("Invaid input number.");
    if (t2.length === 3 && t2[2].dims.length > 2) throw new Error("Invalid input shape of C");
    if (t2[0].dataType !== t2[1].dataType || t2.length === 3 && t2[0].dataType !== t2[2].dataType) throw new Error("Input types are mismatched");
  }, Ug = (t2, e3) => {
    let r2 = t2[0].dims.slice(), n2 = t2[1].dims.slice(), [o2, i2, a2] = Hr.getShapeOfGemmResult(r2, e3.transA, n2, e3.transB, t2.length === 3 ? t2[2].dims : void 0), u2 = [o2, i2];
    if (!u2) throw new Error("Can't use gemm on the given tensors");
    let d2 = 16, c2 = Math.ceil(i2 / d2), p2 = Math.ceil(o2 / d2), m2 = true, g2 = k.size(u2), y = [{ type: 12, data: m2 ? c2 : g2 }, { type: 12, data: o2 }, { type: 12, data: i2 }, { type: 12, data: a2 }, { type: 1, data: e3.alpha }, { type: 1, data: e3.beta }], b = ["type", "type"];
    t2.length === 3 && (y.push(...W(t2[2].dims)), b.push("rank")), y.push(...W(u2));
    let _ = (x) => {
      let v = "";
      e3.transA && e3.transB ? v = "value += a[k * uniforms.M + m] * b[n * uniforms.K + k];" : e3.transA && !e3.transB ? v = "value += a[k * uniforms.M + m] * b[k * uniforms.N + n];" : !e3.transA && e3.transB ? v = "value += a[m * uniforms.K + k] * b[n * uniforms.K + k];" : !e3.transA && !e3.transB && (v = "value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");
      let T = e3.alpha === 1 ? "" : "value *= uniforms.alpha;", I = O("a", t2[0].dataType, t2[0].dims), E = O("b", t2[1].dataType, t2[1].dims), A = I.type.value, D = null, w = [I, E];
      t2.length === 3 && (D = O("c", t2[2].dataType, t2[2].dims.length), w.push(D));
      let U = R("output", t2[0].dataType, u2.length);
      w.push(U);
      let N = [{ name: "output_size", type: "u32" }, { name: "M", type: "u32" }, { name: "N", type: "u32" }, { name: "K", type: "u32" }, { name: "alpha", type: "f32" }, { name: "beta", type: "f32" }];
      return `
  ${x.registerUniforms(N).declareVariables(...w)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${A}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${v}
    }

    ${T}
    ${D != null ? `let cOffset = ${D.broadcastedIndicesToOffset("vec2(m, n)", U)}; value += ${A}(uniforms.beta) * ${D.getByOffset("cOffset")};` : ""}
    output[global_idx] = value;
  }`;
    }, S = (x) => {
      let v = O("a", t2[0].dataType, t2[0].dims), T = O("b", t2[1].dataType, t2[1].dims), I = null, E = [v, T];
      t2.length === 3 && (I = O("c", t2[2].dataType, t2[2].dims.length), E.push(I));
      let A = R("output", t2[0].dataType, u2.length);
      E.push(A);
      let D = [{ name: "num_tile_n", type: "u32" }, { name: "M", type: "u32" }, { name: "N", type: "u32" }, { name: "K", type: "u32" }, { name: "alpha", type: "f32" }, { name: "beta", type: "f32" }], w = "", U = "";
      e3.transA && e3.transB ? (U = `
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `, w = "value += tile_a[k][local_id.y] * tile_b[local_id.x][k];") : e3.transA && !e3.transB ? (U = `
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `, w = "value += tile_a[k][local_id.y] * tile_b[k][local_id.x];") : !e3.transA && e3.transB ? (U = `
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `, w = "value += tile_a[local_id.y][k] * tile_b[local_id.x][k];") : !e3.transA && !e3.transB && (U = `
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `, w = "value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");
      let N = e3.alpha === 1 ? "" : "value *= uniforms.alpha;";
      return `
  ${x.registerUniforms(D).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${v.type.storage}, ${d2}>, ${d2}>;
  var<workgroup> tile_b: array<array<${T.type.storage}, ${d2}>, ${d2}>;
  ${x.mainStart([d2, d2, 1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d2};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d2};
    let num_tiles = (uniforms.K - 1) / ${d2} + 1;
    var k_start = 0u;
    var value = ${A.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${U}
      k_start = k_start + ${d2};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d2}; k++) {
        ${w}
      }
      workgroupBarrier();
    }

    ${N}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${I != null ? `let cOffset = ${I.broadcastedIndicesToOffset("vec2(m, n)", A)}; value += ${A.type.value}(uniforms.beta) * ${I.getByOffset("cOffset")};` : ""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`;
    };
    return m2 ? { name: "GemmShared", shaderCache: { hint: `${e3.cacheKey}`, inputDependencies: b }, getRunData: () => ({ outputs: [{ dims: u2, dataType: t2[0].dataType }], dispatchGroup: { x: c2 * p2 }, programUniforms: y }), getShaderSource: S } : { name: "Gemm", shaderCache: { hint: `${e3.cacheKey}`, inputDependencies: b }, getRunData: () => ({ outputs: [{ dims: u2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(g2 / 64) }, programUniforms: y }), getShaderSource: _ };
  }, Pl = (t2) => {
    let e3 = t2.transA, r2 = t2.transB, n2 = t2.alpha, o2 = t2.beta;
    return { transA: e3, transB: r2, alpha: n2, beta: o2, cacheKey: `${t2.transA};${t2.transB};${t2.alpha === 1}` };
  }, Ol = (t2, e3) => {
    Rg(t2.inputs), t2.compute(Ug(t2.inputs, e3));
  };
});
var mt;
var It;
var qt;
var Kt;
var Ng;
var Vg;
var Lg;
var Wg;
var Gg;
var Hg;
var Fg;
var qg;
var zl;
var Bl;
var Ml = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  [mt, It, qt, Kt] = [0, 1, 2, 3], Ng = (t2) => {
    if (t2[0].dims.length !== 4) throw new Error("only 4-D tensor is supported.");
    if (t2[0].dims.length !== t2[1].dims.length) throw new Error("input dimensions must be equal to grid dimensions");
    if (t2[0].dims.length - 2 !== t2[1].dims[t2[1].dims.length - 1]) throw new Error(`last dimension of grid must be equal to ${t2[0].dims.length - 2}`);
    if (t2[0].dims[0] !== t2[1].dims[0]) throw new Error("grid batch size must match input batch size");
  }, Vg = `
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`, Lg = (t2) => `
  fn gs_bicubic_interpolate(p: mat4x4<${t2}>, x: f32, y: f32) -> ${t2} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${t2}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`, Wg = (t2) => `
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${t2.alignCorners === 0 ? `
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    ` : `
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`, Gg = (t2) => `
  ${t2.paddingMode === "reflection" ? `
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }` : ""}
`, Hg = (t2, e3, r2) => `
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${e3} {
     var pixel = ${e3}(0);
     var indices = vec4<u32>(0);
     indices[${mt}] = batch;
     indices[${It}] = channel;` + (() => {
    switch (r2.paddingMode) {
      case "zeros":
        return `
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${qt}] = u32(r);
            indices[${Kt}] = u32(c);
          } else {
            return ${e3}(0);
          }
        `;
      case "border":
        return `
          indices[${qt}] = u32(clamp(r, 0, H - 1));
          indices[${Kt}] = u32(clamp(c, 0, W - 1));
        `;
      case "reflection":
        return `
          indices[${qt}] = gs_reflect(r, border[1], border[3]);
          indices[${Kt}] = gs_reflect(c, border[0], border[2]);
        `;
      default:
        throw new Error(`padding mode ${r2.paddingMode} is not supported`);
    }
  })() + `
    return ${t2.getByIndices("indices")};
  }
`, Fg = (t2, e3, r2) => (() => {
    switch (r2.mode) {
      case "nearest":
        return `
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${mt}], indices[${It}], border);
        `;
      case "bilinear":
        return `
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${mt}], indices[${It}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${mt}], indices[${It}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${mt}], indices[${It}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${mt}], indices[${It}], border);

          let dx2 = ${e3}(f32(x2) - x);
          let dx1 = ${e3}(x - f32(x1));
          let dy2 = ${e3}(f32(y2) - y);
          let dy1 = ${e3}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;
      case "bicubic":
        return `
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${e3}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${mt}], indices[${It}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;
      default:
        throw new Error(`mode ${r2.mode} is not supported`);
    }
  })() + `${t2.setByOffset("global_idx", "result")}`, qg = (t2, e3) => {
    let r2 = O("x", t2[0].dataType, t2[0].dims.length), n2 = [t2[1].dims[0], t2[1].dims[1], t2[1].dims[2]], o2 = O("grid", t2[1].dataType, n2.length, 2), i2 = [t2[0].dims[0], t2[0].dims[1], t2[1].dims[1], t2[1].dims[2]];
    e3.format === "NHWC" && (i2 = [t2[0].dims[0], t2[1].dims[1], t2[1].dims[2], t2[0].dims[3]], [mt, It, qt, Kt] = [0, 3, 1, 2]);
    let a2 = R("output", t2[0].dataType, i2.length), u2 = r2.type.value, d2 = k.size(i2), c2 = [{ type: 12, data: d2 }, ...W(t2[0].dims, n2, i2)], p2 = (m2) => `
  ${m2.registerUniform("output_size", "u32").declareVariables(r2, o2, a2)}
  ${Vg}
  ${Lg(u2)}
  ${Wg(e3)}
  ${Gg(e3)}
  ${Hg(r2, u2, e3)}

  ${m2.mainStart()}
    ${m2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${qt}]);
      let W_in = i32(uniforms.x_shape[${Kt}]);

      ${e3.alignCorners === 0 ? `
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      ` : `
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${a2.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${mt}], indices[${qt}], indices[${Kt}]);
      let nxy = ${o2.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Fg(a2, u2, e3)}
  }`;
    return { name: "GridSample", shaderCache: { hint: `${e3.cacheKey}`, inputDependencies: ["type", "type"] }, getRunData: (m2) => {
      let g2 = k.size(i2);
      return { outputs: [{ dims: i2, dataType: m2[0].dataType }], dispatchGroup: { x: Math.ceil(g2 / 64) }, programUniforms: c2 };
    }, getShaderSource: p2 };
  }, zl = (t2, e3) => {
    Ng(t2.inputs), t2.compute(qg(t2.inputs, e3));
  }, Bl = (t2) => J({ alignCorners: t2.align_corners, mode: t2.mode, paddingMode: t2.padding_mode, format: t2.format });
});
var Ue;
var Zg;
var Ul;
var Rl;
var Qg;
var dr;
var Nl;
var Do = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  Qr();
  tn();
  oe();
  pt();
  Ue = (t2, e3) => t2.length > e3 && t2[e3].dims.length > 0 ? t2[e3] : void 0, Zg = (t2, e3) => {
    let r2 = t2[0], n2 = Ue(t2, 1), o2 = Ue(t2, 2), i2 = Ue(t2, 3), a2 = Ue(t2, 4), u2 = Ue(t2, 5), d2 = Ue(t2, 6), c2 = Ue(t2, 7);
    if (r2.dims.length !== 3 && r2.dims.length !== 5) throw new Error("Input query is expected to have 3 or 5 dimensions");
    let p2 = r2.dims[0], m2 = r2.dims[1], g2 = r2.dims.length === 3 ? r2.dims[2] : e3.numHeads * r2.dims[4], y = m2, b = 0, _ = 0, S = Math.floor(g2 / e3.numHeads);
    if (d2 && c2 && k.size(d2.dims) && k.size(c2.dims)) {
      if (d2.dims.length !== 4) throw new Error('Input "past_key" is expected to have 4 dimensions');
      if (d2.dims[0] !== p2 || d2.dims[1] !== e3.numHeads || d2.dims[3] !== S) throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');
      if (c2.dims[0] !== p2 || c2.dims[1] !== e3.numHeads || c2.dims[3] !== S) throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');
      if (d2.dims[2] !== c2.dims[2]) throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');
      if (c2.dims.length !== 4) throw new Error('Input "past_value" is expected to have 4 dimensions');
      b = d2.dims[2], _ = d2.dims[2];
    } else if (d2 && k.size(d2.dims) || c2 && k.size(c2.dims)) throw new Error('Input "past_key" and "past_value" shall be both present or both absent');
    let x;
    if (n2 && k.size(n2.dims) > 0) {
      if (r2.dims.length !== 3) throw new Error('Input "query" is expected to have 3 dimensions when key is given');
      if (n2.dims.length < 3 || n2.dims.length > 5) throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');
      if (r2.dims[0] !== n2.dims[0]) throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');
      if (n2.dims.length === 3) {
        if (n2.dims[2] !== r2.dims[2]) throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');
        x = 2, y = n2.dims[1];
      } else if (n2.dims.length === 5) {
        if (n2.dims[2] !== e3.numHeads || n2.dims[3] !== 2 || n2.dims[4] !== S) throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');
        if (o2) throw new Error('Expect "value" be none when "key" has packed kv format.');
        x = 5, y = n2.dims[1];
      } else {
        if (n2.dims[1] !== e3.numHeads || n2.dims[3] !== S) throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');
        x = 0, y = n2.dims[2];
      }
    } else {
      if (r2.dims.length !== 5) throw new Error('Input "query" is expected to have 5 dimensions when key is empty');
      if (r2.dims[2] !== e3.numHeads || r2.dims[3] !== 3) throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');
      x = 3;
    }
    if (i2 && k.size(i2.dims) > 0) {
      if (i2.dims.length !== 1) throw new Error('Input "bias" is expected to have 1 dimension');
      if (n2 && n2.dims.length === 5 && n2.dims[3] === 2) throw new Error("bias is not allowed for packed kv.");
    }
    let v = b + y, T = 0;
    if (a2 && k.size(a2.dims) > 0) {
      T = 8;
      let D = a2.dims;
      throw D.length === 1 ? D[0] === p2 ? T = 1 : D[0] === 3 * p2 + 2 && (T = 3) : D.length === 2 && D[0] === p2 && D[1] === v && (T = 5), T === 8 ? new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)') : new Error("Mask not supported");
    }
    let I = false, E = g2;
    if (o2 && k.size(o2.dims) > 0) {
      if (o2.dims.length !== 3 && o2.dims.length !== 4) throw new Error('Input "value" is expected to have 3 or 4 dimensions');
      if (r2.dims[0] !== o2.dims[0]) throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');
      if (o2.dims.length === 3) {
        if (y !== o2.dims[1]) throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');
        E = o2.dims[2];
      } else {
        if (y !== o2.dims[2]) throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');
        E = o2.dims[1] * o2.dims[3], I = true;
      }
    }
    let A = false;
    if (a2 && k.size(a2.dims) > 0) throw new Error("Key padding mask is not supported");
    if (u2 && k.size(u2.dims) > 0) {
      if (u2.dims.length !== 4) throw new Error('Input "attention_bias" is expected to have 4 dimensions');
      if (u2.dims[0] !== p2 || u2.dims[1] !== e3.numHeads || u2.dims[2] !== m2 || u2.dims[3] !== v) throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)');
    }
    return { batchSize: p2, sequenceLength: m2, pastSequenceLength: b, kvSequenceLength: y, totalSequenceLength: v, maxSequenceLength: _, inputHiddenSize: 0, hiddenSize: g2, vHiddenSize: E, headSize: S, vHeadSize: Math.floor(E / e3.numHeads), numHeads: e3.numHeads, isUnidirectional: false, pastPresentShareBuffer: false, maskFilterValue: e3.maskFilterValue, maskType: T, scale: e3.scale, broadcastResPosBias: A, passPastInKv: I, qkvFormat: x };
  }, Ul = (t2) => J({ ...t2 }), Rl = J({ perm: [0, 2, 1, 3] }), Qg = (t2, e3, r2, n2, o2, i2, a2) => {
    let u2 = [n2, o2, i2], d2 = k.size(u2), c2 = [{ type: 12, data: d2 }, { type: 12, data: a2 }, { type: 12, data: i2 }], p2 = (m2) => {
      let g2 = R("qkv_with_bias", e3.dataType, u2), y = O("qkv", e3.dataType, u2), b = O("bias", r2.dataType, u2), _ = [{ name: "output_size", type: "u32" }, { name: "bias_offset", type: "u32" }, { name: "hidden_size", type: "u32" }];
      return `
  ${m2.registerUniforms(_).declareVariables(y, b, g2)}
  ${m2.mainStart()}
    ${m2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`;
    };
    return t2.compute({ name: "MultiHeadAttentionAddBias", shaderCache: { inputDependencies: ["type", "type"] }, getRunData: () => ({ outputs: [{ dims: u2, dataType: e3.dataType, gpuDataType: 0 }], dispatchGroup: { x: Math.ceil(d2 / 64) }, programUniforms: c2 }), getShaderSource: p2 }, { inputs: [e3, r2], outputs: [-1] })[0];
  }, dr = (t2, e3, r2, n2, o2, i2, a2, u2) => {
    let d2 = i2;
    if (a2 && k.size(a2.dims) > 0) {
      if (n2 === 1) throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");
      return d2 = Qg(t2, i2, a2, e3, n2, r2 * o2, u2), d2 = d2.reshape([e3, n2, r2, o2]), r2 === 1 || n2 === 1 ? d2 : t2.compute(ze(d2, Rl.perm), { inputs: [d2], outputs: [-1] })[0];
    } else return i2.dims.length === 3 && (d2 = i2.reshape([e3, n2, r2, o2])), r2 === 1 || n2 === 1 ? d2 : t2.compute(ze(d2, Rl.perm), { inputs: [d2], outputs: [-1] })[0];
  }, Nl = (t2, e3) => {
    let r2 = Zg(t2.inputs, e3), n2 = t2.inputs[0], o2 = Ue(t2.inputs, 1), i2 = Ue(t2.inputs, 2), a2 = Ue(t2.inputs, 3), u2 = Ue(t2.inputs, 4), d2 = Ue(t2.inputs, 5), c2 = Ue(t2.inputs, 6), p2 = Ue(t2.inputs, 7);
    if (n2.dims.length === 5) throw new Error("Packed QKV is not implemented");
    if (o2?.dims.length === 5) throw new Error("Packed KV is not implemented");
    let m2 = o2 && i2 && o2.dims.length === 4 && i2.dims.length === 4, g2 = dr(t2, r2.batchSize, r2.numHeads, r2.sequenceLength, r2.headSize, n2, a2, 0);
    if (m2) return Ft(t2, g2, o2, i2, u2, void 0, c2, p2, d2, r2);
    if (!o2 || !i2) throw new Error("key and value must be provided");
    let y = dr(t2, r2.batchSize, r2.numHeads, r2.kvSequenceLength, r2.headSize, o2, a2, r2.hiddenSize), b = dr(t2, r2.batchSize, r2.numHeads, r2.kvSequenceLength, r2.vHeadSize, i2, a2, 2 * r2.hiddenSize);
    Ft(t2, g2, y, b, u2, void 0, c2, p2, d2, r2);
  };
});
var Xg;
var Yg;
var Jg;
var eb;
var zo;
var Vl;
var Ll;
var Bo = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Xg = (t2) => {
    if (!t2 || t2.length < 1) throw new Error("too few inputs");
  }, Yg = (t2, e3) => {
    let r2 = [], n2 = e3.numOutputs;
    return t2[1].dims[0] > 0 && (t2[1].getBigInt64Array().forEach((o2) => r2.push(Number(o2))), n2 = r2.length), J({ numOutputs: n2, axis: e3.axis, splitSizes: r2 });
  }, Jg = (t2) => `
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${t2}u; i += 1u ) {
    if (index < ${j("uniforms.size_in_split_axis", "i", t2)}) {
        return i;
    }
    }
    return ${t2}u;
}`, eb = (t2) => {
    let e3 = t2.length, r2 = [];
    for (let n2 = 0; n2 < e3; ++n2) {
      let o2 = t2[n2].setByIndices("indices", "input[global_idx]");
      e3 === 1 ? r2.push(o2) : n2 === 0 ? r2.push(`if (output_number == ${n2}u) { ${o2} }`) : n2 === e3 - 1 ? r2.push(`else { ${o2} }`) : r2.push(`else if (output_number == ${n2}) { ${o2} }`);
    }
    return `
      fn writeBufferData(output_number: u32, indices: ${t2[0].type.indices}, global_idx: u32) {
        ${r2.join(`
`)}
      }`;
  }, zo = (t2, e3) => {
    let r2 = t2[0].dims, n2 = k.size(r2), o2 = t2[0].dataType, i2 = k.normalizeAxis(e3.axis, r2.length), a2 = new Array(e3.numOutputs), u2 = O("input", o2, r2.length), d2 = new Array(e3.numOutputs), c2 = [], p2 = [], m2 = 0, g2 = [{ type: 12, data: n2 }];
    for (let b = 0; b < e3.numOutputs; b++) {
      m2 += e3.splitSizes[b], d2[b] = m2;
      let _ = r2.slice();
      _[i2] = e3.splitSizes[b], p2.push(_), a2[b] = R(`output${b}`, o2, _.length), c2.push({ dims: p2[b], dataType: t2[0].dataType });
    }
    g2.push({ type: 12, data: d2 }, ...W(r2, ...p2));
    let y = (b) => `
  ${b.registerUniform("input_size", "u32").registerUniform("size_in_split_axis", "u32", d2.length).declareVariables(u2, ...a2)}
  ${Jg(d2.length)}
  ${eb(a2)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u2.offsetToIndices("global_idx")};
    var index = ${u2.indicesGet("indices", i2)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${j("uniforms.size_in_split_axis", "output_number - 1u", d2.length)};
      ${u2.indicesSet("indices", i2, "index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;
    return { name: "Split", shaderCache: { hint: e3.cacheKey, inputDependencies: ["rank"] }, getShaderSource: y, getRunData: () => ({ outputs: c2, dispatchGroup: { x: Math.ceil(n2 / 64) }, programUniforms: g2 }) };
  }, Vl = (t2, e3) => {
    Xg(t2.inputs);
    let r2 = t2.inputs.length === 1 ? e3 : Yg(t2.inputs, e3);
    t2.compute(zo(t2.inputs, r2), { inputs: [0] });
  }, Ll = (t2) => {
    let e3 = t2.axis, r2 = t2.splitSizes, n2 = t2.numOutputs < 0 ? r2.length : t2.numOutputs;
    if (n2 !== r2.length) throw new Error("numOutputs and splitSizes length must be equal");
    return J({ axis: e3, numOutputs: n2, splitSizes: r2 });
  };
});
var tb;
var mn;
var Wl;
var Mo = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  tb = (t2, e3) => {
    let [r2, n2, o2, i2] = t2, { numHeads: a2, rotaryEmbeddingDim: u2 } = e3;
    if (r2.dims.length !== 3 && r2.dims.length !== 4) throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r2.dims.length}`);
    if (!k.areEqual(n2.dims, []) && !k.areEqual(n2.dims, [1]) && n2.dims.length !== 2) throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${n2.dims.length}`);
    if (o2.dims.length !== 2) throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${o2.dims.length}`);
    if (i2.dims.length !== 2) throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${i2.dims.length}`);
    if (!k.areEqual(o2.dims, i2.dims)) throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");
    if (u2 > 0 && a2 === 0) throw new Error("num_heads must be provided if rotary_embedding_dim is specified");
    let d2 = r2.dims[0], c2 = r2.dims[r2.dims.length - 2], p2 = o2.dims[0], m2 = k.sizeFromDimension(r2.dims, 1) / c2, g2 = u2 === 0 ? o2.dims[1] * 2 : m2 / a2;
    if (u2 > g2) throw new Error("rotary_embedding_dim must be less than or equal to head_size");
    if (n2.dims.length === 2) {
      if (d2 !== n2.dims[0]) throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${n2.dims[0]}`);
      if (c2 !== n2.dims[1]) throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${n2.dims[1]}`);
    }
    if (c2 > p2) throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");
    if (g2 / 2 !== o2.dims[1] && u2 / 2 !== o2.dims[1]) throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${o2.dims[1]}`);
  }, mn = (t2, e3) => {
    let { interleaved: r2, numHeads: n2, rotaryEmbeddingDim: o2, scale: i2 } = e3, a2 = t2[0].dims[0], u2 = k.sizeFromDimension(t2[0].dims, 1), d2 = t2[0].dims[t2[0].dims.length - 2], c2 = u2 / d2, p2 = t2[2].dims[1], m2 = o2 === 0 ? p2 * 2 : c2 / n2, g2 = new Array(a2, d2, c2 / m2, m2 - p2), y = k.computeStrides(g2), b = [{ type: 1, data: i2 }, { type: 12, data: g2 }, { type: 12, data: y }, ...t2[0].dims.length === 3 ? new Array({ type: 12, data: [u2, c2, m2, 1] }) : [], ...t2[0].dims.length === 4 ? new Array({ type: 12, data: [u2, m2, d2 * m2, 1] }) : [], ...W(t2[0].dims, t2[1].dims, t2[2].dims, t2[3].dims, t2[0].dims)], _ = (S) => {
      let x = O("input", t2[0].dataType, t2[0].dims.length), v = O("position_ids", t2[1].dataType, t2[1].dims.length), T = O("cos_cache", t2[2].dataType, t2[2].dims.length), I = O("sin_cache", t2[3].dataType, t2[3].dims.length), E = R("output", t2[0].dataType, t2[0].dims.length);
      return S.registerUniforms([{ name: "scale", type: "f32" }, { name: "global_shape", type: "u32", length: g2.length }, { name: "global_strides", type: "u32", length: y.length }, { name: "input_output_strides", type: "u32", length: y.length }]), `
        ${S.declareVariables(x, v, T, I, E)}

        ${S.mainStart(Bt)}
          let half_rotary_emb_dim = uniforms.${T.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${v.broadcastedIndicesToOffset("bsnh.xy", R("", v.type.tensor, 2))};
            let position_id =
                u32(${v.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r2});
            let j = i + select(half_rotary_emb_dim, 1, ${r2});
            let re = ${x.getByOffset("i")} * ${T.get("position_id", "bsnh[3]")} -
                ${x.getByOffset("j")} * ${I.get("position_id", "bsnh[3]")};
            ${E.setByOffset("i", "re")}
            let im = ${x.getByOffset("i")} * ${I.get("position_id", "bsnh[3]")} +
                ${x.getByOffset("j")} * ${T.get("position_id", "bsnh[3]")};
            ${E.setByOffset("j", "im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k", x.getByOffset("k"))}
          }
        }`;
    };
    return { name: "RotaryEmbedding", shaderCache: { hint: J({ interleaved: r2 }).cacheKey, inputDependencies: ["rank", "rank", "rank", "rank"] }, getShaderSource: _, getRunData: () => ({ outputs: [{ dims: t2[0].dims, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(k.size(g2) / Bt) }, programUniforms: b }) };
  }, Wl = (t2, e3) => {
    tb(t2.inputs, e3), t2.compute(mn(t2.inputs, e3));
  };
});
var rb;
var nb;
var Gl;
var ob;
var Hl;
var Fl = V(() => {
  "use strict";
  Ce();
  ee();
  tn();
  Do();
  Bo();
  pt();
  Mo();
  oe();
  rb = (t2, e3) => {
    if (e3.doRotary && t2.length <= 7) throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");
    let r2 = t2[0], n2 = t2[1], o2 = t2[2], i2 = t2[3], a2 = t2[4];
    if (e3.doRotary !== 0 && t2.length <= 7) throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");
    if (e3.localWindowSize !== -1) throw new Error("Local attention is not supported");
    if (e3.softcap !== 0) throw new Error("Softcap is not supported");
    if (e3.rotaryInterleaved !== 0) throw new Error("Rotary interleaved is not supported");
    if (e3.smoothSoftmax) throw new Error("Smooth softmax is not supported");
    if (r2.dims.length !== 3 && r2.dims.length !== 5) throw new Error("Input query is expected to have 3 or 5 dimensions");
    let u2 = false, d2 = r2.dims[0], c2 = r2.dims[1], p2 = r2.dims.length === 3 ? u2 ? r2.dims[2] / 3 : r2.dims[2] : e3.numHeads * r2.dims[4], m2 = c2, g2 = 0, y = !n2 || n2.dims.length === 0, b = Math.floor(y ? p2 / (e3.numHeads + 2 * e3.kvNumHeads) : p2 / e3.numHeads);
    y && (p2 = b * e3.numHeads);
    let _ = i2 && i2.dims.length !== 0, S = a2 && a2.dims.length !== 0;
    if (_ && i2.dims.length === 4 && i2.dims[0] === d2 && i2.dims[1] !== e3.kvNumHeads && i2.dims[2] === e3.kvNumHeads && i2.dims[3] === b) throw new Error("BSNH pastKey/pastValue is not supported");
    if (_ && S) {
      if (i2.dims.length !== 4) throw new Error('Input "past_key" is expected to have 4 dimensions');
      if (a2.dims.length !== 4) throw new Error('Input "past_value" is expected to have 4 dimensions');
      g2 = i2.dims[2];
    } else if (_ || S) throw new Error('Input "past_key" and "past_value" shall be both present or both absent');
    let v = 1;
    if (n2 && n2.dims.length > 0) {
      if (r2.dims.length !== 3) throw new Error('Input "query" is expected to have 3 dimensions when key is given');
      if (n2.dims.length < 3 || n2.dims.length > 5) throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');
      if (r2.dims[0] !== n2.dims[0]) throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');
      if (n2.dims.length === 3) {
        if (r2.dims[2] % n2.dims[2] !== 0) throw new Error('Dimension 2 of "query" should be a multiple of "key"');
        m2 = n2.dims[1];
      } else if (n2.dims.length === 5) {
        if (n2.dims[2] !== e3.numHeads || n2.dims[3] !== 2 || n2.dims[4] !== b) throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');
        if (o2) throw new Error('Expect "value" be none when "key" has packed kv format.');
        m2 = n2.dims[1];
      } else {
        if (n2.dims[1] !== e3.numHeads || n2.dims[3] !== b) throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');
        m2 = n2.dims[2];
      }
    } else {
      if (r2.dims.length !== 3 && r2.dims.length !== 5) throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');
      if (r2.dims.length === 5 && (r2.dims[2] !== e3.numHeads || r2.dims[3] !== 3)) throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');
      v = 3;
    }
    let T = 0, I = false, E = e3.kvNumHeads ? b * e3.kvNumHeads : p2;
    if (o2 && o2.dims.length > 0) {
      if (o2.dims.length !== 3 && o2.dims.length !== 4) throw new Error('Input "value" is expected to have 3 or 4 dimensions');
      if (r2.dims[0] !== o2.dims[0]) throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');
      if (o2.dims.length === 3) {
        if (m2 !== o2.dims[1]) throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');
        E = o2.dims[2];
      } else {
        if (m2 !== o2.dims[2]) throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');
        E = o2.dims[1] * o2.dims[3], I = true;
      }
    }
    let A = t2.length > 4 ? t2[5] : void 0;
    if (A) {
      if (A.dims.length === 0) throw new Error("seqlens_k must be at least 1D, got scalar.");
      let N = A.dims.reduce((F, q) => F * q, 1);
      if (N !== d2) throw new Error(`seqlens_k must have batch_size (${d2}) elements, got ${N}.`);
      for (let F = 0; F < A.dims.length; F++) if (A.dims[F] !== 1 && A.dims[F] !== d2) throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${d2}), got dims[${F}] = ${A.dims[F]}.`);
    }
    return { batchSize: d2, sequenceLength: c2, pastSequenceLength: g2, kvSequenceLength: m2, totalSequenceLength: -1, maxSequenceLength: -1, inputHiddenSize: 0, hiddenSize: p2, vHiddenSize: E, headSize: b, vHeadSize: Math.floor(E / e3.kvNumHeads), numHeads: e3.numHeads, kvNumHeads: e3.kvNumHeads, nReps: e3.numHeads / e3.kvNumHeads, pastPresentShareBuffer: false, maskType: T, scale: e3.scale, broadcastResPosBias: false, passPastInKv: I, qkvFormat: v };
  }, nb = J({ perm: [0, 2, 1, 3] }), Gl = (t2, e3, r2) => {
    let n2 = e3, o2 = r2.kvNumHeads;
    return e3.dims.length === 3 && r2.kvSequenceLength !== 0 && (n2 = e3.reshape([r2.batchSize, r2.kvSequenceLength, o2, r2.headSize]), n2 = t2.compute(ze(n2, nb.perm), { inputs: [n2], outputs: [-1] })[0]), n2;
  }, ob = (t2, e3, r2, n2) => {
    let o2 = 7, i2 = ["type", "type"], a2 = [t2 * e3], u2 = t2 * e3, d2 = [{ type: 12, data: u2 }, { type: 12, data: e3 }, { type: 12, data: t2 }], c2 = (p2) => {
      let m2 = O("seq_lens", r2.dataType, r2.dims), g2 = O("total_seq_lens", n2.dataType, n2.dims), y = R("pos_ids", o2, a2), b = [{ name: "output_size", type: "u32" }, { name: "sequence_length", type: "u32" }, { name: "batch_size", type: "u32" }];
      return `
  ${p2.registerUniforms(b).declareVariables(m2, g2, y)}
  ${p2.mainStart()}
    ${p2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g2.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${m2.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx", "pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx", "pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx", "seqlen")}
    };
  }
  `;
    };
    return { name: "GeneratePositionIds", shaderCache: { hint: `${t2};${e3}`, inputDependencies: i2 }, getRunData: () => ({ outputs: [{ dims: a2, dataType: o2 }], dispatchGroup: { x: Math.ceil(u2 / 64) }, programUniforms: d2 }), getShaderSource: c2 };
  }, Hl = (t2, e3) => {
    if (t2.inputs.length > 14 && t2.inputs[14] || t2.inputs.length > 15 && t2.inputs[15]) throw new Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");
    let r2 = rb(t2.inputs, e3);
    if (t2.inputs[0].dims.length === 5) throw new Error("Packed QKV is not implemented");
    if (t2.inputs[1]?.dims.length === 5) throw new Error("Packed KV is not implemented");
    let n2 = t2.inputs[0], o2 = t2.inputs[1] && t2.inputs[1].dims.length > 0 ? t2.inputs[1] : void 0, i2 = t2.inputs[2] && t2.inputs[2].dims.length > 0 ? t2.inputs[2] : void 0, a2 = t2.inputs[3] && t2.inputs[3].dims.length !== 0 ? t2.inputs[3] : void 0, u2 = t2.inputs[4] && t2.inputs[4].dims.length !== 0 ? t2.inputs[4] : void 0, d2 = t2.inputs.length > 4 ? t2.inputs[5] : void 0, c2 = t2.inputs.length > 5 ? t2.inputs[6] : void 0, p2 = r2.kvNumHeads ? r2.kvNumHeads : r2.numHeads, m2 = J({ axis: 2, numOutputs: 3, splitSizes: [r2.numHeads * r2.headSize, p2 * r2.headSize, p2 * r2.headSize] }), [g2, y, b] = !o2 && !i2 ? t2.compute(zo([n2], m2), { inputs: [n2], outputs: [-1, -1, -1] }) : [n2, o2, i2], _, S;
    if (e3.doRotary) {
      let I = t2.compute(ob(r2.batchSize, r2.sequenceLength, d2, c2), { inputs: [d2, c2], outputs: [-1] })[0], E = t2.inputs[7], A = t2.inputs[8], D = J({ interleaved: e3.rotaryInterleaved !== 0, numHeads: r2.numHeads, rotaryEmbeddingDim: 0, scale: e3.scale }), w = [g2, I, E, A], U = [-1];
      _ = t2.compute(mn(w, D), { inputs: w, outputs: U })[0], w.splice(0, 1, y);
      let N = J({ interleaved: e3.rotaryInterleaved !== 0, numHeads: r2.kvNumHeads, rotaryEmbeddingDim: 0, scale: e3.scale });
      S = t2.compute(mn(w, N), { inputs: w, outputs: U })[0];
    }
    let x = dr(t2, r2.batchSize, r2.numHeads, r2.sequenceLength, r2.headSize, e3.doRotary ? _ : g2, void 0, 0), v = Gl(t2, e3.doRotary ? S : y, r2), T = Gl(t2, b, r2);
    Ft(t2, x, v, T, void 0, void 0, a2, u2, void 0, r2, d2, c2);
  };
});
var ql;
var ib;
var ab;
var Kl;
var jl = V(() => {
  "use strict";
  ee();
  te();
  pt();
  oe();
  ql = (t2, e3, r2, n2, o2, i2, a2, u2) => {
    let d2 = fe(i2), c2 = d2 === 1 ? "f32" : `vec${d2}f`, p2 = d2 === 1 ? "vec2f" : `mat2x${d2}f`, m2 = o2 * a2, g2 = 64;
    m2 === 1 && (g2 = 256);
    let y = [o2, a2, i2 / d2], b = [o2, a2, 2], _ = ["rank", "type", "type"], S = [];
    S.push(...W(y, b));
    let x = (v) => {
      let T = O("x", e3.dataType, 3, d2), I = O("scale", r2.dataType, r2.dims), E = O("bias", n2.dataType, n2.dims), A = R("output", 1, 3, 2), D = [T, I, E, A];
      return `
  var<workgroup> workgroup_shared : array<${p2}, ${g2}>;
  const workgroup_size = ${g2}u;
  ${v.declareVariables(...D)}
  ${v.mainStart(g2)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${c2}(0);
    var squared_sum = ${c2}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${c2}(${T.get("batch", "channel", "h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${p2}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${Ze("workgroup_shared[0][0]", d2)} / f32(hight * ${d2});
      let squared_sum_final = ${Ze("workgroup_shared[0][1]", d2)} / f32(hight * ${d2});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u2}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`;
    };
    return t2.compute({ name: "InstanceNormComputeChannelScaleShift", shaderCache: { hint: `${d2};${u2};${g2}`, inputDependencies: _ }, getRunData: () => ({ outputs: [{ dims: b, dataType: 1 }], dispatchGroup: { x: m2 }, programUniforms: S }), getShaderSource: x }, { inputs: [e3, r2, n2], outputs: [-1] })[0];
  }, ib = (t2, e3, r2) => {
    let n2 = e3[0].dims, o2 = n2, i2 = 2, a2 = n2[0], u2 = n2[1], d2 = k.sizeFromDimension(n2, i2), c2 = fe(d2), p2 = k.size(o2) / c2, m2 = ql(t2, e3[0], e3[1], e3[2], a2, d2, u2, r2.epsilon), g2 = [a2, u2, d2 / c2], y = [a2, u2], b = ["type", "none"], _ = (S) => {
      let x = O("x", e3[0].dataType, g2.length, c2), v = O("scale_shift", 1, y.length, 2), T = R("output", e3[0].dataType, g2.length, c2), I = [x, v, T];
      return `
  ${S.registerUniform("output_size", "u32").declareVariables(...I)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${T.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${v.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${x.getByOffset("global_idx")} * ${T.type.value}(scale_shift.x) + ${T.type.value}(scale_shift.y);
      ${T.setByOffset("global_idx", "value")};
  }`;
    };
    t2.compute({ name: "InstanceNormalization", shaderCache: { hint: `${c2}`, inputDependencies: b }, getRunData: () => ({ outputs: [{ dims: o2, dataType: e3[0].dataType }], dispatchGroup: { x: Math.ceil(p2 / 64) }, programUniforms: [{ type: 12, data: p2 }, ...W(g2, y, g2)] }), getShaderSource: _ }, { inputs: [e3[0], m2] });
  }, ab = (t2, e3, r2) => {
    let n2 = e3[0].dims, o2 = n2, i2 = n2[0], a2 = n2[n2.length - 1], u2 = k.sizeFromDimension(n2, 1) / a2, d2 = fe(a2), c2 = k.size(o2) / d2, p2 = [{ type: 12, data: u2 }, { type: 12, data: Math.floor(a2 / d2) }], m2 = ["type", "type"], g2 = false, y = [0, n2.length - 1];
    for (let x = 0; x < n2.length - 2; x++) g2 = g2 || n2[x + 1] !== 1, y.push(x + 1);
    g2 = g2 && n2[n2.length - 1] !== 1;
    let b = g2 ? t2.compute(ze(t2.inputs[0], y), { inputs: [t2.inputs[0]], outputs: [-1] })[0] : t2.inputs[0].reshape(Array.from({ length: n2.length }, (x, v) => n2[y[v]])), _ = ql(t2, b, e3[1], e3[2], i2, u2, a2, r2.epsilon), S = (x) => {
      let v = we(e3[0].dataType), T = d2 === 1 ? "vec2f" : `mat${d2}x2f`, I = (D) => {
        let w = D === 0 ? "x" : "y", U = d2 === 1 ? "f32" : `vec${d2}f`;
        switch (d2) {
          case 1:
            return `${v}(${U}(scale.${w}))`;
          case 2:
            return `vec2<${v}>(${U}(scale[0].${w}, scale[1].${w}))`;
          case 4:
            return `vec4<${v}>(${U}(scale[0].${w}, scale[1].${w}, scale[2].${w}, scale[3].${w}))`;
          default:
            throw new Error(`Not supported compoents ${d2}`);
        }
      }, E = O("input", e3[0].dataType, e3[0].dims, d2), A = R("output", e3[0].dataType, o2, d2);
      return `
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${T}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${A.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${x.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${I(0)}, ${I(1)});
  }`;
    };
    t2.compute({ name: "InstanceNormalizationNHWC", shaderCache: { hint: `${d2}`, inputDependencies: m2 }, getRunData: () => ({ outputs: [{ dims: o2, dataType: e3[0].dataType }], dispatchGroup: { x: Math.ceil(c2 / 64) }, programUniforms: p2 }), getShaderSource: S }, { inputs: [e3[0], _] });
  }, Kl = (t2, e3) => {
    e3.format === "NHWC" ? ab(t2, t2.inputs, e3) : ib(t2, t2.inputs, e3);
  };
});
var sb;
var ub;
var Zl;
var Ql = V(() => {
  "use strict";
  ee();
  te();
  oe();
  sb = (t2) => {
    if (!t2 || t2.length < 2) throw new Error("layerNorm requires at least 2 inputs.");
  }, ub = (t2, e3, r2) => {
    let n2 = e3.simplified, o2 = t2[0].dims, i2 = t2[1], a2 = !n2 && t2[2], u2 = o2, d2 = k.normalizeAxis(e3.axis, o2.length), c2 = k.sizeToDimension(o2, d2), p2 = k.sizeFromDimension(o2, d2), m2 = k.size(i2.dims), g2 = a2 ? k.size(a2.dims) : 0;
    if (m2 !== p2 || a2 && g2 !== p2) throw new Error(`Size of X.shape()[axis:] == ${p2}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${m2} and bias size of ${g2}`);
    let y = [];
    for (let E = 0; E < o2.length; ++E) E < d2 ? y.push(o2[E]) : y.push(1);
    let b = fe(p2), _ = ["type", "type"], S = [{ type: 12, data: c2 }, { type: 1, data: p2 }, { type: 12, data: Math.floor(p2 / b) }, { type: 1, data: e3.epsilon }];
    a2 && _.push("type");
    let x = r2 > 1, v = r2 > 2, T = (E) => {
      let A = we(t2[0].dataType), D = [O("x", t2[0].dataType, t2[0].dims, b), O("scale", i2.dataType, i2.dims, b)];
      a2 && D.push(O("bias", a2.dataType, a2.dims, b)), D.push(R("output", t2[0].dataType, u2, b)), x && D.push(R("mean_data_output", 1, y)), v && D.push(R("inv_std_output", 1, y));
      let w = [{ name: "norm_count", type: "u32" }, { name: "norm_size", type: "f32" }, { name: "norm_size_vectorized", type: "u32" }, { name: "epsilon", type: "f32" }];
      return `
  ${E.registerUniforms(w).declareVariables(...D)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${bo("f32", b)};
    var mean_square_vector = ${bo("f32", b)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Mt(A, b, "x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${Ze("mean_vector", b)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${Ze("mean_square_vector", b)} / uniforms.norm_size ${n2 ? "" : "- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Mt(A, b, "x[j + offset]")};
      let f32scale = ${Mt(A, b, "scale[j]")};
      output[j + offset] = ${D[0].type.value}((f32input ${n2 ? "" : "- mean"}) * inv_std_dev * f32scale
        ${a2 ? `+ ${Mt(A, b, "bias[j]")}` : ""}
      );
    }

    ${x ? "mean_data_output[global_idx] = mean" : ""};
    ${v ? "inv_std_output[global_idx] = inv_std_dev" : ""};
  }`;
    }, I = [{ dims: u2, dataType: t2[0].dataType }];
    return x && I.push({ dims: y, dataType: 1 }), v && I.push({ dims: y, dataType: 1 }), { name: "LayerNormalization", shaderCache: { hint: `${b};${r2};${n2}`, inputDependencies: _ }, getRunData: () => ({ outputs: I, dispatchGroup: { x: Math.ceil(c2 / 64) }, programUniforms: S }), getShaderSource: T };
  }, Zl = (t2, e3) => {
    sb(t2.inputs), t2.compute(ub(t2.inputs, e3, t2.outputCount));
  };
});
var db;
var Xl;
var Yl = V(() => {
  "use strict";
  te();
  un();
  dn();
  db = (t2) => {
    if (!t2 || t2.length !== 2) throw new Error("MatMul requires 2 inputs.");
    if (t2[0].dims[t2[0].dims.length - 1] !== t2[1].dims[t2[1].dims.length - 2]) throw new Error("shared dimension does not match.");
  }, Xl = (t2) => {
    db(t2.inputs);
    let e3 = ot.calcShape(t2.inputs[0].dims, t2.inputs[1].dims, true);
    if (!e3) throw new Error("Can't use matmul on the given tensors");
    let r2 = e3[e3.length - 1], n2 = t2.inputs[0].dims[t2.inputs[0].dims.length - 1];
    if (r2 < 8 && n2 < 8) t2.compute(sn(t2.inputs, { activation: "" }, e3));
    else {
      let o2 = e3[e3.length - 2], i2 = k.size(t2.inputs[0].dims.slice(0, -2)), a2 = k.size(t2.inputs[1].dims.slice(0, -2));
      if (i2 !== 1 && o2 === 1 && a2 === 1) {
        let u2 = t2.inputs[0].reshape([1, i2, n2]), d2 = t2.inputs[1].reshape([1, n2, r2]), c2 = [1, i2, r2], p2 = [u2, d2];
        t2.compute(ur(p2, { activation: "" }, e3, c2), { inputs: p2 });
      } else t2.compute(ur(t2.inputs, { activation: "" }, e3));
    }
  };
});
var lb;
var cb;
var pb;
var Jl;
var ec;
var tc = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  lb = (t2, e3) => {
    if (t2.length < 3 || t2.length > 4) throw new Error("MatMulNBits requires 3 or 4 inputs");
    let r2 = t2[0], n2 = r2.dims.length;
    if (r2.dims[n2 - 1] !== e3.k) throw new Error("The last dim of input shape does not match the k value");
    let o2 = Math.floor((e3.k + e3.blockSize - 1) / e3.blockSize), i2 = e3.blockSize / 8 * e3.bits, a2 = t2[1];
    if (!k.areEqual(a2.dims, [e3.n, o2, i2])) throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");
    let d2 = t2[2].dims;
    if (k.size(d2) !== e3.n * o2) throw new Error("scales input size error.");
    if (t2.length === 4) {
      let p2 = t2[3].dims, m2 = e3.n * (e3.bits === 8 ? o2 : Math.floor((o2 * e3.bits + 7) / 8));
      if (k.size(p2) !== m2) throw new Error("zeroPoints input size error.");
    }
  }, cb = (t2, e3) => {
    let r2 = t2[0].dims, n2 = r2.length, o2 = r2[n2 - 2], i2 = e3.k, a2 = e3.n, u2 = r2.slice(0, n2 - 2), d2 = k.size(u2), p2 = t2[1].dims[2] / 4, m2 = t2[0].dataType, g2 = fe(e3.k), y = fe(p2), b = fe(a2), _ = u2.concat([o2, a2]), S = o2 > 1 && a2 / b % 2 === 0 ? 2 : 1, x = k.size(_) / b / S, v = 64, T = [], I = [d2, o2, i2 / g2], E = k.convertShape(t2[1].dims).slice();
    E.splice(-1, 1, p2 / y), T.push(...W(I)), T.push(...W(E)), T.push(...W(t2[2].dims)), t2.length === 4 && T.push(...W(k.convertShape(t2[3].dims)));
    let A = [d2, o2, a2 / b];
    T.push(...W(A));
    let D = (w) => {
      let U = I.length, N = O("a", t2[0].dataType, U, g2), F = O("b", 12, E.length, y), q = O("scales", t2[2].dataType, t2[2].dims.length), Y = [N, F, q], z = t2.length === 4 ? O("zero_points", 12, t2[3].dims.length) : void 0;
      z && Y.push(z);
      let L = A.length, Q = R("output", t2[0].dataType, L, b), X = we(t2[0].dataType), Z = (() => {
        switch (g2) {
          case 1:
            return `array<${X}, 8>`;
          case 2:
            return `mat4x2<${X}>`;
          case 4:
            return `mat2x4<${X}>`;
          default:
            throw new Error(`${g2}-component is not supported.`);
        }
      })(), ne = Math.floor(32 / e3.bits), ie = Math.floor(ne / 8), le = () => {
        let M = "";
        for (let G = 0; G < ie; G++) {
          let be = G * e3.bits * 4, ke = be + e3.bits;
          M += `
          // reuse a data (pass ${G})
            var input_offset${G > 0 ? G : ""} = ${G === 0 ? N.indicesToOffset(`${N.type.indices}(batch, row, word_offset)`) : "input_offset"};
            var a_data${G > 0 ? G : ""}: ${Z};
            for (var j${G > 0 ? G : ""}: u32 = 0; j${G > 0 ? G : ""} < ${8 / g2}; j${G > 0 ? G : ""}++) {
              a_data${G > 0 ? G : ""}[j${G > 0 ? G : ""}] = ${N.getByOffset(`input_offset${G > 0 ? G : ""}`)};
              input_offset${G > 0 ? G : ""}++;
            }
          `;
          for (let ve = 0; ve < b * S; ve++) M += `
            b_value = ${y === 1 ? `b${ve}_data` : `b${ve}_data[i]`};
            ${e3.bits === 2 ? `{
              let half_word = b_value >> ${G * 16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }` : `b_value_lower = unpack4xU8((b_value >> ${be}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${ke}u) & b_mask);`}
            b_quantized_values = ${Z}(${Array.from({ length: 4 }, (Oe, ge) => `${X}(b_value_lower[${ge}]), ${X}(b_value_upper[${ge}])`).join(", ")});
            b_dequantized_values = ${g2 === 1 ? `${Z}(${Array.from({ length: 8 }, (Oe, ge) => `(b_quantized_values[${ge}] - ${z ? `zero_point${ve}` : "zero_point"}) * scale${ve}`).join(", ")});` : `(b_quantized_values - ${Z}(${Array(8).fill(`${z ? `zero_point${ve}` : "zero_point"}`).join(",")})) * scale${ve};`};
            workgroup_shared[local_id.x * ${S} + ${Math.floor(ve / b)}]${b > 1 ? `[${ve % b}]` : ""} += ${Array.from({ length: 8 / g2 }, (Oe, ge) => `${g2 === 1 ? `a_data${G > 0 ? G : ""}[${ge}] * b_dequantized_values[${ge}]` : `dot(a_data${G > 0 ? G : ""}[${ge}], b_dequantized_values[${ge}])`}`).join(" + ")};
          `;
        }
        return M;
      }, Me = () => {
        let M = `
            var col_index = col * ${b};
            ${z ? `
            let zero_point_values_per_byte: u32 = ${Math.floor(8 / e3.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;` : `
            // The default zero point is ${Math.pow(2, e3.bits - 1)} for unsigned ${e3.bits}-bit quantization.
            let zero_point = ${X}(${Math.pow(2, e3.bits - 1).toFixed(1)});`}
            `;
        for (let G = 0; G < b * S; G++) M += `
            let scale${G} = ${q.getByOffset("col_index * nBlocksPerCol + block")};
            ${z ? `
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${e3.bits}u);
            zero_point_word = ${z.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${G} = ${X}((zero_point_word) & ${e3.bits === 2 ? "0x3u" : "0xFu"});` : ""}
            col_index += 1;`;
        return M;
      }, $e = () => {
        let M = `col_index = col * ${b};`;
        for (let G = 0; G < b * S; G++) M += `
            let b${G}_data = ${F.getByIndices(`${F.type.indices}(col_index, block, word)`)};
            col_index += 1;`;
        return M += `
            var b_value: u32;
            let b_mask: u32 = ${e3.bits === 2 ? "0x03030303u" : "0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${Z};
            var b_dequantized_values: ${Z};`, M;
      };
      return `
        var<workgroup> workgroup_shared: array<${Q.type.value}, ${S * v}>;
        ${w.declareVariables(...Y, Q)}
        ${w.mainStart([v, 1, 1])}
          let output_indices = ${Q.offsetToIndices(`(global_idx / ${v}) * ${S}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${v}) {
            //process one block
            var word_offset: u32 = block * ${e3.blockSize / g2};
            ${Me()}
            for (var word: u32 = 0; word < ${p2}; word += ${y}) {
              ${$e()}
              for (var i: u32 = 0; i < ${y}; i++) {
                ${le()}
                word_offset += ${ne / g2};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${S}) {
            var output_value: ${Q.type.value} = ${Q.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${v}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${S};
            }
            ${Q.setByIndices(`${Q.type.indices}(batch, row, col + local_id.x)`, "output_value")};
          }
        }`;
    };
    return { name: "MatMulNBits", shaderCache: { hint: `${e3.blockSize};${e3.bits};${g2};${y};${b};${S};${v}`, inputDependencies: Array(t2.length).fill("rank") }, getRunData: () => ({ outputs: [{ dims: _, dataType: m2 }], dispatchGroup: { x }, programUniforms: T }), getShaderSource: D };
  }, pb = (t2, e3) => {
    let r2 = t2[0].dims, n2 = r2.length, o2 = r2[n2 - 2], i2 = e3.k, a2 = e3.n, u2 = r2.slice(0, n2 - 2), d2 = k.size(u2), p2 = t2[1].dims[2] / 4, m2 = t2[0].dataType, g2 = fe(e3.k), y = fe(p2), b = u2.concat([o2, a2]), _ = 128, S = a2 % 8 === 0 ? 8 : a2 % 4 === 0 ? 4 : 1, x = _ / S, v = Math.floor(32 / e3.bits), T = x * y * v, I = T / g2, E = T / e3.blockSize, A = k.size(b) / S, D = [], w = [d2, o2, i2 / g2], U = k.convertShape(t2[1].dims).slice();
    U.splice(-1, 1, p2 / y), D.push(...W(w)), D.push(...W(U)), D.push(...W(t2[2].dims)), t2.length === 4 && D.push(...W(k.convertShape(t2[3].dims)));
    let N = [d2, o2, a2];
    D.push(...W(N));
    let F = (q) => {
      let Y = w.length, z = O("a", t2[0].dataType, Y, g2), L = O("b", 12, U.length, y), Q = O("scales", t2[2].dataType, t2[2].dims.length), X = [z, L, Q], Z = t2.length === 4 ? O("zero_points", 12, t2[3].dims.length) : void 0;
      Z && X.push(Z);
      let ne = N.length, ie = R("output", t2[0].dataType, ne), le = we(t2[0].dataType), Me = () => {
        switch (g2) {
          case 1:
            return `
          let a_data0 = vec4<${le}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${le}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;
          case 2:
            return `
          let a_data0 = vec4<${le}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${le}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;
          case 4:
            return `
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;
          default:
            throw new Error(`${g2}-component is not supported.`);
        }
      };
      return `
        var<workgroup> sub_a: array<${z.type.value}, ${I}>;
        var<workgroup> inter_results: array<array<${ie.type.value}, ${x}>, ${S}>;
        ${q.declareVariables(...X, ie)}
        ${q.mainStart([x, S, 1])}
          let output_indices = ${ie.offsetToIndices(`workgroup_index * ${S}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${E} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${I};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${I}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${z.getByIndices(`${z.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${z.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${E} + local_id.x;
            ${Z ? `
            let zero_point_values_per_byte: u32 = ${Math.floor(8 / e3.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${e3.bits}u);
            let zero_point_word = ${Z.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${le}((zero_point_word) & ${e3.bits === 2 ? "0x3u" : "0xFu"});` : `
            // The default zero point is ${Math.pow(2, e3.bits - 1)} for unsigned ${e3.bits}-bit quantization.
            let zero_point = ${le}(${Math.pow(2, e3.bits - 1).toFixed(1)});`}
            let scale = ${Q.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${L.getByIndices(`${L.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${e3.blockSize / g2};
            for (var i: u32 = 0; i < ${y}; i++) {
              let b_value = ${y === 1 ? "b_data" : "b_data[i]"};
              ${(() => {
        let $e = Math.floor(v / 8), M = "";
        for (let G = 0; G < $e; G++) {
          let be = G * e3.bits * 4, ke = be + e3.bits;
          M += `
              ${Me()}
              {${e3.bits === 2 ? `
                let half_word = b_value >> ${G * 16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);` : `
                let b_value_lower = unpack4xU8((b_value >> ${be}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${ke}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${le}>(${Array.from({ length: 4 }, (ve, Oe) => `${le}(b_value_lower[${Oe}]), ${le}(b_value_upper[${Oe}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${le}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({ length: 2 }, (ve, Oe) => `${`dot(a_data${Oe}, b_dequantized_values[${Oe}])`}`).join(" + ")};
              }
              word_offset += ${8 / g2};`;
        }
        return M;
      })()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${S}) {
            var output_value: ${ie.type.value} = ${ie.type.value}(0);
            for (var b = 0u; b < ${x}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${ie.setByIndices(`${ie.type.indices}(batch, row, col + local_idx)`, "output_value")}
            }
          }
        }`;
    };
    return { name: "BlockwiseMatMulNBits32", shaderCache: { hint: `${e3.blockSize};${g2};${y};${x};${S}`, inputDependencies: Array(t2.length).fill("rank") }, getRunData: () => ({ outputs: [{ dims: b, dataType: m2 }], dispatchGroup: { x: A }, programUniforms: D }), getShaderSource: F };
  }, Jl = (t2, e3) => {
    lb(t2.inputs, e3), e3.blockSize === 32 && t2.adapterInfo.isVendor("intel") && t2.adapterInfo.isArchitecture("gen-12lp") ? t2.compute(pb(t2.inputs, e3)) : t2.compute(cb(t2.inputs, e3));
  }, ec = (t2) => J(t2);
});
var mb;
var fb;
var hb;
var gb;
var bb;
var yb;
var _b;
var wb;
var rc;
var nc = V(() => {
  "use strict";
  ee();
  te();
  oe();
  mb = (t2) => {
    if (!t2 || t2.length < 1) throw new Error("Too few inputs");
    if (t2[0].dataType !== 1 && t2[0].dataType !== 10) throw new Error("Input type must be float or float16.");
    if (t2.length >= 2) {
      let e3 = t2[0].dims.length * 2 === t2[1].dims[0];
      if (t2.length === 4 && (e3 = t2[3].dims[0] * 2 === t2[1].dims[0]), !e3) throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].");
    }
  }, fb = (t2, e3, r2) => {
    let n2 = "";
    for (let o2 = e3 - 1; o2 >= 0; --o2) n2 += `
            k = i32(${t2.indicesGet("indices", o2)}) - ${j("uniforms.pads", o2, r2)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${j("uniforms.x_shape", o2, e3)})) {
              break;
            }
            offset += k * i32(${j("uniforms.x_strides", o2, e3)});
        `;
    return `
          value = ${t2.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${n2}
            value = x[offset];
          }
      `;
  }, hb = (t2, e3, r2) => {
    let n2 = "";
    for (let o2 = e3 - 1; o2 >= 0; --o2) n2 += `
                k = i32(${t2.indicesGet("indices", o2)}) - ${j("uniforms.pads", o2, r2)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${j("uniforms.x_shape", o2, e3)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${j("uniforms.x_shape", o2, e3)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${j("uniforms.x_strides", o2, e3)});
            `;
    return `
              var offset = 0;
              var k = 0;
              ${n2}
              value = x[offset];
          `;
  }, gb = (t2, e3, r2) => {
    let n2 = "";
    for (let o2 = e3 - 1; o2 >= 0; --o2) n2 += `
                k = i32(${t2.indicesGet("indices", o2)}) - ${j("uniforms.pads", o2, r2)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${j("uniforms.x_shape", o2, e3)})) {
                  k = i32(${j("uniforms.x_shape", o2, e3)}) - 1;
                }
                offset += k * i32(${j("uniforms.x_strides", o2, e3)});
            `;
    return `
              var offset = 0;
              var k = 0;
              ${n2}
              value = x[offset];
          `;
  }, bb = (t2, e3, r2) => {
    let n2 = "";
    for (let o2 = e3 - 1; o2 >= 0; --o2) n2 += `
                k = i32(${t2.indicesGet("indices", o2)}) - ${j("uniforms.pads", o2, r2)};
                if (k < 0)  {
                  k += i32(${j("uniforms.x_shape", o2, e3)}]);
                }
                if (k >= i32(${j("uniforms.x_shape", o2, e3)})) {
                  k -= i32(${j("uniforms.x_shape", o2, e3)});
                }
                offset += k * i32(${j("uniforms.x_strides", o2, e3)});
            `;
    return `
              var offset = 0;
              var k = 0;
              ${n2}
              value = x[offset];
          `;
  }, yb = (t2, e3, r2) => {
    switch (r2.mode) {
      case 0:
        return fb(t2, e3, r2.pads.length);
      case 1:
        return hb(t2, e3, r2.pads.length);
      case 2:
        return gb(t2, e3, r2.pads.length);
      case 3:
        return bb(t2, e3, r2.pads.length);
      default:
        throw new Error("Invalid mode");
    }
  }, _b = (t2, e3) => {
    let r2 = k.padShape(t2[0].dims.slice(), e3.pads), n2 = t2[0].dims, o2 = k.size(r2), i2 = [{ type: 12, data: o2 }, { type: 6, data: e3.pads }], a2 = t2.length >= 3 && t2[2].data;
    e3.mode === 0 && i2.push({ type: a2 ? t2[2].dataType : 1, data: e3.value }), i2.push(...W(t2[0].dims, r2));
    let u2 = ["rank"], d2 = (c2) => {
      let p2 = R("output", t2[0].dataType, r2.length), m2 = O("x", t2[0].dataType, n2.length), g2 = m2.type.value, y = yb(p2, n2.length, e3), b = [{ name: "output_size", type: "u32" }, { name: "pads", type: "i32", length: e3.pads.length }];
      return e3.mode === 0 && b.push({ name: "constant_value", type: a2 ? g2 : "f32" }), `
            ${c2.registerUniforms(b).declareVariables(m2, p2)}
            ${c2.mainStart()}
            ${c2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${p2.offsetToIndices("global_idx")};

            var value = ${g2}(0);
            ${y}
            output[global_idx] = value;
        }`;
    };
    return { name: "Pad", shaderCache: { hint: `${e3.mode}${a2}`, inputDependencies: u2 }, getRunData: () => ({ outputs: [{ dims: r2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(k.size(r2) / 64) }, programUniforms: i2 }), getShaderSource: d2 };
  }, wb = (t2, e3) => {
    if (t2.length > 1) {
      let r2 = t2[1].getBigInt64Array(), n2 = t2.length >= 3 && t2[2].data ? t2[2].dataType === 10 ? t2[2].getUint16Array()[0] : t2[2].getFloat32Array()[0] : 0, o2 = t2[0].dims.length, i2 = new Int32Array(2 * o2).fill(0);
      if (t2.length >= 4) {
        let u2 = t2[3].getBigInt64Array();
        for (let d2 = 0; d2 < u2.length; d2++) i2[Number(u2[d2])] = Number(r2[d2]), i2[Number(u2[d2]) + o2] = Number(r2[d2 + u2.length]);
      } else r2.forEach((u2, d2) => i2[Number(d2)] = Number(u2));
      let a2 = [];
      return i2.forEach((u2) => a2.push(u2)), { mode: e3.mode, value: n2, pads: a2 };
    } else return e3;
  }, rc = (t2, e3) => {
    mb(t2.inputs);
    let r2 = wb(t2.inputs, e3);
    t2.compute(_b(t2.inputs, r2), { inputs: [0] });
  };
});
var fn;
var oc;
var ic;
var ac;
var sc;
var $b;
var vb;
var uc;
var dc;
var lc;
var cc;
var pc;
var mc;
var fc;
var hc;
var gc;
var bc;
var yc;
var _c;
var wc = V(() => {
  "use strict";
  Le();
  ee();
  te();
  oe();
  fn = (t2) => {
    if (_e.webgpu.validateInputContent && (!t2 || t2.length !== 1)) throw new Error("Pool ops requires 1 input.");
  }, oc = (t2, e3, r2) => {
    let n2 = e3.format === "NHWC", o2 = t2.dims.slice();
    n2 && o2.splice(1, 0, o2.pop());
    let i2 = Object.hasOwnProperty.call(e3, "dilations"), a2 = e3.kernelShape.slice(), u2 = e3.strides.slice(), d2 = i2 ? e3.dilations.slice() : [], c2 = e3.pads.slice();
    zt.adjustPoolAttributes(r2, o2, a2, u2, d2, c2);
    let p2 = zt.computePoolOutputShape(r2, o2, u2, d2, a2, c2, e3.autoPad, e3.ceilMode), m2 = Object.assign({}, e3);
    i2 ? Object.assign(m2, { kernelShape: a2, strides: u2, pads: c2, dilations: d2, cacheKey: e3.cacheKey }) : Object.assign(m2, { kernelShape: a2, strides: u2, pads: c2, cacheKey: e3.cacheKey });
    let g2 = p2.slice();
    return g2.push(g2.splice(1, 1)[0]), [m2, n2 ? g2 : p2];
  }, ic = (t2, e3) => {
    let r2 = e3.format === "NHWC", n2 = k.size(t2), o2 = k.size(e3.kernelShape), i2 = [{ type: 12, data: n2 }, { type: 12, data: o2 }], a2 = [{ name: "outputSize", type: "u32" }, { name: "kernelSize", type: "u32" }];
    if (e3.kernelShape.length <= 2) {
      let u2 = e3.kernelShape[e3.kernelShape.length - 1], d2 = e3.strides[e3.strides.length - 1], c2 = e3.pads[e3.pads.length / 2 - 1], p2 = e3.pads[e3.pads.length - 1], m2 = !!(c2 + p2);
      i2.push({ type: 12, data: u2 }, { type: 12, data: d2 }, { type: 12, data: c2 }, { type: 12, data: p2 }), a2.push({ name: "kw", type: "u32" }, { name: "sw", type: "u32" }, { name: "pwStart", type: "u32" }, { name: "pwEnd", type: "u32" });
      let g2 = false;
      if (e3.kernelShape.length === 2) {
        let y = e3.kernelShape[e3.kernelShape.length - 2], b = e3.strides[e3.strides.length - 2], _ = e3.pads[e3.pads.length / 2 - 2], S = e3.pads[e3.pads.length - 2];
        g2 = !!(_ + S), i2.push({ type: 12, data: y }, { type: 12, data: b }, { type: 12, data: _ }, { type: 12, data: S }), a2.push({ name: "kh", type: "u32" }, { name: "sh", type: "u32" }, { name: "phStart", type: "u32" }, { name: "phEnd", type: "u32" });
      }
      return [i2, a2, true, m2, g2];
    } else {
      if (r2) throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");
      let u2 = k.computeStrides(e3.kernelShape);
      i2.push({ type: 12, data: u2 }, { type: 12, data: e3.pads }, { type: 12, data: e3.strides }), a2.push({ name: "kernelStrides", type: "u32", length: u2.length }, { name: "pads", type: "u32", length: e3.pads.length }, { name: "strides", type: "u32", length: e3.strides.length });
      let d2 = e3.pads.reduce((c2, p2) => c2 + p2);
      return [i2, a2, !!d2, false, false];
    }
  }, ac = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2, p2, m2) => {
    let g2 = o2.format === "NHWC", y = e3.type.value, b = R("output", e3.type.tensor, n2);
    if (o2.kernelShape.length <= 2) {
      let _ = "", S = "", x = "", v = r2 - (g2 ? 2 : 1);
      if (p2 ? _ = `
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${v}] = indices[${v}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${v}] < 0 || xIndices[${v}]
                      >= uniforms.x_shape[${v}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${e3.indicesToOffset("xIndices")}];
                  ${i2}
                }` : _ = `
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${v}] = indices[${v}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${e3.indicesToOffset("xIndices")}];
                  ${i2}
                }`, o2.kernelShape.length === 2) {
        let I = r2 - (g2 ? 3 : 2);
        m2 ? S = `
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              ` : S = `
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `, x = `
              }
            `;
      }
      return `
            ${t2.registerUniforms(d2).declareVariables(e3, b)}

            ${t2.mainStart()}
              ${t2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${b.offsetToIndices("global_idx")};
              var xIndices = ${b.offsetToIndices("global_idx")};

              var value = ${y}(${u2});
              var pad = 0;
              ${S}
              ${_}
              ${x}
              ${a2}

              output[global_idx] = value;
            }`;
    } else {
      if (g2) throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");
      let _ = o2.kernelShape.length, S = o2.pads.length, x = "";
      return c2 ? x = `
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${e3.indicesToOffset("xIndices")}];
                ${i2}
              }` : x = `
              }
              let x_val = x[${e3.indicesToOffset("xIndices")}];
              ${i2}
            `, `
            ${t2.registerUniforms(d2).declareVariables(e3, b)}

            ${t2.mainStart()}
              ${t2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${b.offsetToIndices("global_idx")};
              var xIndices = ${b.offsetToIndices("global_idx")};

              var offsets: array<u32, ${_}>;

              var value = ${y}(${u2});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${_ - 1}u; j++) {
                  offsets[j] = offset / ${j("uniforms.kernelStrides", "j", _)};
                  offset -= offsets[j] * ${j("uniforms.kernelStrides", "j", _)};
                }
                offsets[${_ - 1}] = offset;

                isPad = false;
                for (var j = ${r2 - _}u; j < ${r2}u; j++) {
                  xIndices[j] = indices[j] * ${j("uniforms.strides", `j - ${r2 - _}u`, _)}
                    + offsets[j - ${r2 - _}u] - ${j("uniforms.pads", "j - 2u", S)};
                  ${x}
              }
              ${a2}

              output[global_idx] = value;
            }`;
    }
  }, sc = (t2) => `${t2.format};${t2.ceilMode};${t2.autoPad};${t2.kernelShape.length}`, $b = (t2) => `${sc(t2)};${t2.countIncludePad}`, vb = (t2) => `${sc(t2)};${t2.storageOrder};${t2.dilations}`, uc = (t2) => ({ format: t2.format, autoPad: ["NOTSET", "VALID", "SAME_UPPER", "SAME_LOWER"][t2.auto_pad], ceilMode: t2.ceil_mode, kernelShape: t2.kernel_shape, strides: t2.strides, pads: t2.pads }), dc = (t2, e3, r2, n2) => {
    let [o2, i2] = oc(e3, n2, r2), a2 = O("x", e3.dataType, e3.dims.length), u2 = a2.type.value, d2 = "value += x_val;", c2 = "";
    o2.countIncludePad ? c2 += `value /= ${u2}(uniforms.kernelSize);` : c2 += `value /= ${u2}(i32(uniforms.kernelSize) - pad);`;
    let [p2, m2, g2, y, b] = ic(i2, o2);
    p2.push(...W(e3.dims, i2));
    let _ = ["rank"];
    return { name: t2, shaderCache: { hint: `${n2.cacheKey};${g2};${y};${b}`, inputDependencies: _ }, getRunData: () => ({ outputs: [{ dims: i2, dataType: e3.dataType }], dispatchGroup: { x: Math.ceil(k.size(i2) / 64) }, programUniforms: p2 }), getShaderSource: (S) => ac(S, a2, e3.dims.length, i2.length, o2, d2, c2, 0, m2, g2, y, b) };
  }, lc = (t2) => {
    let e3 = t2.count_include_pad !== 0, r2 = uc(t2);
    if (r2.ceilMode !== 0) throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");
    let n2 = { countIncludePad: e3, ...r2, cacheKey: "" };
    return { ...n2, cacheKey: $b(n2) };
  }, cc = (t2, e3) => {
    fn(t2.inputs), t2.compute(dc("AveragePool", t2.inputs[0], false, e3));
  }, pc = { autoPad: "", ceilMode: 0, countIncludePad: false, kernelShape: [], strides: [], pads: [], storageOrder: 0, dilations: [] }, mc = (t2) => {
    let e3 = t2.format;
    return { format: e3, ...pc, cacheKey: e3 };
  }, fc = (t2, e3) => {
    fn(t2.inputs), t2.compute(dc("GlobalAveragePool", t2.inputs[0], true, e3));
  }, hc = (t2, e3, r2, n2) => {
    let [o2, i2] = oc(e3, n2, r2), a2 = `
      value = max(x_val, value);
    `, u2 = "", d2 = O("x", e3.dataType, e3.dims.length), c2 = ["rank"], [p2, m2, g2, y, b] = ic(i2, o2);
    return p2.push(...W(e3.dims, i2)), { name: t2, shaderCache: { hint: `${n2.cacheKey};${g2};${y};${b}`, inputDependencies: c2 }, getRunData: () => ({ outputs: [{ dims: i2, dataType: e3.dataType }], dispatchGroup: { x: Math.ceil(k.size(i2) / 64) }, programUniforms: p2 }), getShaderSource: (_) => ac(_, d2, e3.dims.length, i2.length, o2, a2, u2, e3.dataType === 10 ? -65504 : -1e5, m2, g2, y, b) };
  }, gc = (t2, e3) => {
    fn(t2.inputs), t2.compute(hc("MaxPool", t2.inputs[0], false, e3));
  }, bc = (t2) => {
    let e3 = t2.storage_order, r2 = t2.dilations, n2 = uc(t2);
    if (e3 !== 0) throw new Error("column major storage order is not yet supported for MaxPool");
    if (n2.ceilMode !== 0) throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");
    let o2 = { storageOrder: e3, dilations: r2, ...n2, cacheKey: "" };
    return { ...o2, cacheKey: vb(o2) };
  }, yc = (t2) => {
    let e3 = t2.format;
    return { format: e3, ...pc, cacheKey: e3 };
  }, _c = (t2, e3) => {
    fn(t2.inputs), t2.compute(hc("GlobalMaxPool", t2.inputs[0], true, e3));
  };
});
var Sb;
var Tb;
var $c;
var vc;
var xc = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Sb = (t2, e3) => {
    if (t2.length < 2 || t2.length > 3) throw new Error("DequantizeLinear requires 2 or 3 inputs.");
    if (t2.length === 3 && t2[1].dims === t2[2].dims) throw new Error("x-scale and x-zero-point must have the same shape.");
    if (t2.length === 3 && t2[0].dataType !== t2[2].dataType) throw new Error("x and x-zero-point must have the same data type.");
    if (t2[1].dims.length !== 0 && t2[1].dims.length !== 1 && t2[1].dims.length !== t2[0].dims.length) throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");
    if (t2.length > 2) {
      if (t2[0].dataType !== t2[2].dataType) throw new Error("x and x-zero-point must have the same data type.");
      if (t2[1].dims.length !== t2[2].dims.length) throw new Error("scale and zero-point inputs must have the same rank.");
      if (!t2[1].dims.map((r2, n2) => r2 === t2[2].dims[n2]).reduce((r2, n2) => r2 && n2, true)) throw new Error("scale and zero-point inputs must have the same shape.");
    }
    if (e3.blockSize > 0) {
      if (t2[1].dims.length === 0 || t2[1].dims.length === 1 && t2[1].dims[0] === 1) throw new Error("blockSize must be set only for block quantization.");
      if (!t2[1].dims.map((o2, i2) => i2 === e3.axis || o2 === t2[0].dims[i2]).reduce((o2, i2) => o2 && i2, true)) throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");
      if (t2[1].dims.length !== t2[0].dims.length) throw new Error("For block qunatization the scale input rank must be the same as the x rank.");
      let r2 = t2[0].dims[e3.axis], n2 = t2[1].dims[e3.axis];
      if (e3.blockSize < Math.ceil(r2 / n2) || e3.blockSize > Math.ceil(r2 / (n2 - 1) - 1)) throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].");
    }
  }, Tb = (t2, e3) => {
    let r2 = k.normalizeAxis(e3.axis, t2[0].dims.length), n2 = t2[0].dataType, o2 = n2 === 3, i2 = t2[0].dims, a2 = t2[1].dataType, u2 = k.size(i2), d2 = n2 === 3 || n2 === 2, c2 = d2 ? [Math.ceil(k.size(t2[0].dims) / 4)] : t2[0].dims, p2 = t2[1].dims, m2 = t2.length > 2 ? t2[2] : void 0, g2 = m2 ? d2 ? [Math.ceil(k.size(m2.dims) / 4)] : m2.dims : void 0, y = p2.length === 0 || p2.length === 1 && p2[0] === 1, b = y === false && p2.length === 1, _ = fe(u2), S = y && (!d2 || _ === 4), x = S ? _ : 1, v = S && !d2 ? _ : 1, T = O("input", d2 ? 12 : n2, c2.length, v), I = O("scale", a2, p2.length), E = m2 ? O("zero_point", d2 ? 12 : n2, g2.length) : void 0, A = R("output", a2, i2.length, x), D = [T, I];
    E && D.push(E);
    let w = [c2, p2];
    m2 && w.push(g2);
    let U = [{ type: 12, data: u2 / x }, { type: 12, data: r2 }, { type: 12, data: e3.blockSize }, ...W(...w, i2)], N = (F) => {
      let q = [{ name: "output_size", type: "u32" }, { name: "axis", type: "u32" }, { name: "block_size", type: "u32" }];
      return `
      ${F.registerUniforms(q).declareVariables(...D, A)}
      ${F.mainStart()}
          ${F.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${A.offsetToIndices("global_idx")};

          // Set input x
          ${d2 ? `
            let input = ${T.getByOffset("global_idx / 4")};
            let x_vec = ${o2 ? "unpack4xI8(input)" : "unpack4xU8(input)"};
            let x_value = ${x === 1 ? "x_vec[global_idx % 4]" : "x_vec"};` : `let x_value = ${T.getByOffset("global_idx")};`};

          // Set scale input
          ${y ? `let scale_value= ${I.getByOffset("0")}` : b ? `
            let scale_index = ${A.indicesGet("output_indices", "uniforms.axis")};
            let scale_value= ${I.getByOffset("scale_index")};` : `
            var scale_indices: ${I.type.indices} = output_indices;
            let index = ${I.indicesGet("scale_indices", "uniforms.axis")} / uniforms.block_size;
            ${I.indicesSet("scale_indices", "uniforms.axis", "index")};
            let scale_value= ${I.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E ? y ? d2 ? `
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${o2 ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]` : `let zero_point_value = ${E.getByOffset("0")}` : b ? d2 ? `
                let zero_point_index = ${A.indicesGet("output_indices", "uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${o2 ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]` : `
                let zero_point_index = ${A.indicesGet("output_indices", "uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};` : d2 ? `
                let zero_point_offset = ${I.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${o2 ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];` : `let zero_point_value = ${E.getByIndices("scale_indices")};` : `let zero_point_value = ${d2 ? o2 ? "i32" : "u32" : T.type.value}(0);`};
      // Compute and write output
      ${A.setByOffset("global_idx", `${A.type.value}(x_value - zero_point_value) * scale_value`)};
      }`;
    };
    return { name: "DequantizeLinear", shaderCache: { hint: e3.cacheKey, inputDependencies: E ? ["rank", "rank", "rank"] : ["rank", "rank"] }, getShaderSource: N, getRunData: () => ({ outputs: [{ dims: i2, dataType: a2 }], dispatchGroup: { x: Math.ceil(u2 / x / 64), y: 1, z: 1 }, programUniforms: U }) };
  }, $c = (t2, e3) => {
    Sb(t2.inputs, e3), t2.compute(Tb(t2.inputs, e3));
  }, vc = (t2) => J({ axis: t2.axis, blockSize: t2.blockSize });
});
var Ib;
var Cb;
var Sc;
var Tc = V(() => {
  "use strict";
  Le();
  ee();
  oe();
  Ib = (t2, e3, r2) => {
    let n2 = t2 === e3, o2 = t2 < e3 && r2 < 0, i2 = t2 > e3 && r2 > 0;
    if (n2 || o2 || i2) throw new Error("Range these inputs' contents are invalid.");
  }, Cb = (t2, e3, r2, n2) => {
    let o2 = Math.abs(Math.ceil((e3 - t2) / r2)), i2 = [o2], a2 = o2, u2 = [{ type: 12, data: a2 }, { type: n2, data: t2 }, { type: n2, data: r2 }, ...W(i2)], d2 = (c2) => {
      let p2 = R("output", n2, i2.length), m2 = p2.type.value, g2 = [{ name: "outputSize", type: "u32" }, { name: "start", type: m2 }, { name: "delta", type: m2 }];
      return `
        ${c2.registerUniforms(g2).declareVariables(p2)}
        ${c2.mainStart()}
        ${c2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${m2}(global_idx) * uniforms.delta;
      }`;
    };
    return { name: "Range", shaderCache: { hint: `${n2}` }, getShaderSource: d2, getRunData: () => ({ outputs: [{ dims: i2, dataType: n2 }], dispatchGroup: { x: Math.ceil(a2 / 64) }, programUniforms: u2 }) };
  }, Sc = (t2) => {
    let e3 = 0, r2 = 0, n2 = 0;
    t2.inputs[0].dataType === 6 ? (e3 = t2.inputs[0].getInt32Array()[0], r2 = t2.inputs[1].getInt32Array()[0], n2 = t2.inputs[2].getInt32Array()[0]) : t2.inputs[0].dataType === 1 && (e3 = t2.inputs[0].getFloat32Array()[0], r2 = t2.inputs[1].getFloat32Array()[0], n2 = t2.inputs[2].getFloat32Array()[0]), _e.webgpu.validateInputContent && Ib(e3, r2, n2), t2.compute(Cb(e3, r2, n2, t2.inputs[0].dataType), { inputs: [] });
  };
});
var Ab;
var Eb;
var Ic;
var Cc;
var Ac = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  Ab = (t2, e3, r2, n2) => {
    if (t2 !== "none" && n2 !== "i32" && n2 !== "u32" && n2 !== "f32") throw new Error(`Input ${n2} is not supported with reduction ${t2}.`);
    let o2 = `{
                var oldValue = 0;
                loop {
                  let newValueF32 =`, i2 = `;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${e3}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;
    switch (t2) {
      case "none":
        return `${e3}=${r2};`;
      case "add":
        return n2 === "i32" || n2 === "u32" ? `atomicAdd(&${e3}, bitcast<${n2}>(${r2}));` : `
              ${o2}bitcast<${n2}>(oldValue) + (${r2})${i2}`;
      case "max":
        return n2 === "i32" || n2 === "u32" ? `atomicMax(&${e3}, bitcast<${n2}>(${r2}));` : `
                ${o2}max(bitcast<f32>(oldValue), (${r2}))${i2}`;
      case "min":
        return n2 === "i32" || n2 === "u32" ? `atomicMin(&${e3}, bitcast<${n2}>(${r2}));` : `${o2}min(bitcast<${n2}>(oldValue), (${r2}))${i2}`;
      case "mul":
        return `${o2}(bitcast<${n2}>(oldValue) * (${r2}))${i2}`;
      default:
        throw new Error(`Reduction ${t2} is not supported.`);
    }
  }, Eb = (t2, e3) => {
    let r2 = t2[0].dims, n2 = t2[1].dims, o2 = r2, i2 = 1, a2 = Math.ceil(k.sizeToDimension(n2, n2.length - 1) / i2), u2 = n2[n2.length - 1], d2 = k.sizeFromDimension(r2, u2), c2 = [{ type: 12, data: a2 }, { type: 12, data: u2 }, { type: 12, data: d2 }, ...W(t2[1].dims, t2[2].dims, o2)], p2 = (m2) => {
      let g2 = O("indices", t2[1].dataType, t2[1].dims.length), y = O("updates", t2[2].dataType, t2[2].dims.length, i2), b = e3.reduction !== "none" && e3.reduction !== "" ? Fs("output", t2[0].dataType, o2.length) : R("output", t2[0].dataType, o2.length, i2);
      return `
      ${m2.registerUniform("output_size", "u32").registerUniform("last_index_dimension", "u32").registerUniform("num_updates_elements", "u32").declareVariables(g2, y, b)}
      ${m2.mainStart()}
        ${m2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${t2[0].dims.length === 1 ? `
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;` : `
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Ab(e3.reduction, "output[data_offset + i]", "value", b.type.value)}
  }

      }`;
    };
    return { name: "ScatterND", shaderCache: { hint: `${e3.cacheKey}_${e3.reduction}`, inputDependencies: ["rank", "rank"] }, getRunData: () => ({ outputs: [{ dims: o2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(a2 / 64) }, programUniforms: c2 }), getShaderSource: p2 };
  }, Ic = (t2) => J({ reduction: t2.reduction }), Cc = (t2, e3) => {
    t2.compute(Eb(t2.inputs, e3), { inputs: [t2.inputs[1], t2.inputs[2]], outputs: [] });
  };
});
var kb;
var Pb;
var Ob;
var Ec;
var Db;
var zb;
var Bb;
var Mb;
var Rb;
var Ub;
var Nb;
var Vb;
var kc;
var Lb;
var Wb;
var Gb;
var Hb;
var Fb;
var Pc;
var Oc;
var Dc = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  kb = (t2, e3) => {
    if (t2.every((r2) => r2 > 0 || (() => {
      throw new Error("Resize requires scales input values to be positive");
    })), t2.length > 0) {
      if (e3.mode === "linear") {
        if (!(t2.length === 2 || t2.length === 3 || t2.length === 4 && t2[0] === 1 && t2[1] === 1 || t2.length === 4 && t2[0] === 1 && t2[3] === 1 || t2.length === 5 && t2[0] === 1 && t2[1] === 1)) throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`);
      } else if (e3.mode === "cubic" && !(t2.length === 2 || t2.length === 4 && t2[0] === 1 && t2[1] === 1 || t2.length === 4 && t2[0] === 1 && t2[3] === 1)) throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode");
    }
  }, Pb = (t2, e3, r2) => {
    e3.every((o2) => o2 >= 0 && o2 < r2 || (() => {
      throw new Error("Resize requires axes input values to be positive and less than rank");
    }));
    let n2 = new Array(r2).fill(1);
    return e3.forEach((o2, i2) => n2[o2] = t2[i2]), n2;
  }, Ob = (t2, e3, r2, n2, o2, i2) => {
    let [a2, u2, d2] = r2 > 10 ? [1, 2, 3] : [-1, t2.length > 1 ? 1 : -1, -1], c2 = t2[0].dims.length;
    if (a2 > 0 && t2.length > a2 && t2[a2].dims.length > 0) t2[a2].getFloat32Array().forEach((p2) => i2.push(p2));
    else if (e3.coordinateTransformMode === "tf_crop_and_resize") throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");
    if (u2 > 0 && t2.length > u2 && t2[u2].dims.length === 1 && t2[u2].dims[0] > 0) {
      if (t2[u2].getFloat32Array().forEach((p2) => n2.push(p2)), n2.length !== 0 && n2.length !== c2 && r2 >= 18 && n2.length !== e3.axes.length) throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");
      kb(n2, e3), e3.axes.length > 0 && Pb(n2, e3.axes, c2).forEach((p2, m2) => n2[m2] = p2);
    }
    if (d2 > 0 && t2.length > d2 && t2[d2].dims.length === 1 && t2[d2].dims[0] > 0 && (t2[d2].getBigInt64Array().forEach((p2) => o2.push(Number(p2))), o2.length !== 0 && o2.length !== c2 && r2 >= 18 && o2.length !== e3.axes.length)) throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");
    if (e3.axes.length > 0) {
      if (n2.length !== 0 && n2.length !== e3.axes.length) throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');
      if (o2.length !== 0 && o2.length !== e3.axes.length) throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified');
    }
    if (typeof n2 < "u" && typeof o2 < "u" && n2.length > 0 && o2.length > c2) throw new Error("Resize requires only of scales or sizes to be specified");
  }, Ec = (t2, e3, r2, n2) => `
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${t2}) * (${e3});
  let whole = ${n2}(big / (${r2}));
  let fract = ${n2}(big % (${r2})) / ${n2}(${r2});
  return whole + fract;
`, Db = (t2, e3) => `fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${e3} { ` + (() => {
    switch (t2) {
      case "asymmetric":
        return `
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${e3}(xResized) / ${e3}(xScale);
          } else {
            ${Ec("xResized", "lengthOriginal", "lengthResized", e3)}
          }
        `;
      case "pytorch_half_pixel":
        return `if (lengthResized > 1) {
                    return (${e3}(xResized) + 0.5) / ${e3}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;
      case "tf_half_pixel_for_nn":
        return `return (${e3}(xResized) + 0.5) / ${e3}(xScale);`;
      case "align_corners":
        return `if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${Ec("xResized", "lengthOriginal - 1", "lengthResized - 1", e3)}
                  }`;
      case "tf_crop_and_resize":
        return `if (lengthResized > 1) {
                    return ${e3}(roiStart) * ${e3}(lengthOriginal - 1) +
                        (${e3}(xResized) * ${e3}(roiEnd - roiStart) * ${e3}(lengthOriginal - 1)) /
                        ${e3}(lengthResized - 1);
                  } else {
                    return 0.5 * ${e3}(roiStart + roiEnd) * ${e3}(lengthOriginal - 1);
                  }`;
      case "half_pixel_symmetric":
        return `const outputWidth = ${e3}xScale * ${e3}(lengthResized);
                  const adjustment = ${e3}(lengthResized) / outputWidth;
                  const center = ${e3}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${e3}(xResized) + 0.5) / ${e3}(xScale)) - 0.5;`;
      case "half_pixel":
        return `return ((${e3}(xResized) + 0.5) / ${e3}(xScale)) - 0.5;`;
      default:
        throw new Error(`Coordinate transform mode ${t2} is not supported`);
    }
  })() + "}", zb = (t2, e3, r2) => `fn getNearestPixelFromOriginal(xOriginal: ${r2}, isDownSample: bool) -> ${r2} {` + (() => {
    switch (t2) {
      case "round_prefer_ceil":
        return "if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";
      case "floor":
        return "return floor(xOriginal);";
      case "ceil":
        return "return ceil(xOriginal);";
      case "round_prefer_floor":
        return "if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";
      default:
        if (e3 < 11) return "if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";
        throw new Error(`Nearest mode ${t2} is not supported`);
    }
  })() + "}", Bb = (t2, e3, r2) => {
    let n2 = new Array(r2).fill(0).concat(new Array(r2).fill(1)), o2 = t2.length === 0 ? n2 : t2.slice();
    return e3.length > 0 ? (e3.forEach((i2, a2) => {
      n2[i2] = o2[a2], n2[a2 + r2] = o2[e3.length + a2];
    }), n2) : o2;
  }, Mb = (t2, e3, r2, n2) => {
    let o2 = [];
    if (r2.length > 0) if (n2.length > 0) {
      if (t2.forEach((i2) => o2.push(i2)), Math.max(...n2) > t2.length) throw new Error("axes is out of bound");
      n2.forEach((i2, a2) => o2[i2] = r2[a2]);
    } else r2.forEach((i2) => o2.push(i2));
    else {
      if (e3.length === 0) throw new Error("Resize requires either scales or sizes.");
      o2 = t2.map((i2, a2) => Math.round(i2 * e3[a2]));
    }
    return o2;
  }, Rb = (t2, e3, r2) => {
    let n2 = (() => {
      switch (r2.keepAspectRatioPolicy) {
        case "not_larger":
          return r2.axes.length > 0 ? Math.min(...r2.axes.map((i2) => e3[i2]), Number.MAX_VALUE) : Math.min(...e3, Number.MAX_VALUE);
        case "not_smaller":
          return r2.axes.length > 0 ? Math.max(...r2.axes.map((i2) => e3[i2]), Number.MIN_VALUE) : Math.max(...e3, Number.MIN_VALUE);
        default:
          throw new Error(`Keep aspect ratio policy ${r2.keepAspectRatioPolicy} is not supported`);
      }
    })();
    e3.fill(1, 0, e3.length);
    let o2 = t2.slice();
    return r2.axes.length > 0 ? (r2.axes.forEach((i2) => e3[i2] = n2), r2.axes.forEach((i2) => o2[i2] = Math.round(t2[i2] * e3[i2]))) : (e3.fill(n2, 0, e3.length), o2.forEach((i2, a2) => o2[a2] = Math.round(i2 * e3[a2]))), o2;
  }, Ub = (t2, e3, r2, n2, o2) => `
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${t2.type.indices}) -> array<${t2.type.value}, ${r2.length}> {
      var original_indices: array<${t2.type.value}, ${r2.length}>;
      for (var i:u32 = 0; i < ${r2.length}; i++) {
        var output_index = ${t2.indicesGet("output_indices", "i")};
        var scale = ${j("uniforms.scales", "i", n2)};
        var roi_low = ${j("uniforms.roi", "i", o2)};
        var roi_hi = ${j("uniforms.roi", `i + ${e3.length}`, o2)};
        if (scale == 1.0) {
          original_indices[i] = ${t2.type.value}(output_index);
        } else {
          var input_shape_i = ${j("uniforms.input_shape", "i", e3.length)};
          var output_shape_i = ${j("uniforms.output_shape", "i", r2.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`, Nb = (t2, e3, r2, n2, o2, i2, a2) => `
    fn calculateInputIndicesFromOutputIndices(output_indices: ${e3.type.indices}) -> ${t2.type.indices} {
      var input_indices: ${t2.type.indices};
      for (var i:u32 = 0; i < ${n2.length}; i++) {
        var output_index = ${e3.indicesGet("output_indices", "i")};
        var input_index: u32;
        var scale = ${j("uniforms.scales", "i", o2)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${j("uniforms.roi", "i", i2)};
          var roi_hi = ${j("uniforms.roi", `i + ${r2.length}`, i2)};
          var input_shape_i = ${j("uniforms.input_shape", "i", r2.length)};
          var output_shape_i = ${j("uniforms.output_shape", "i", n2.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${a2} || (original_idx >= 0 && original_idx < ${e3.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${e3.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${t2.indicesSet("input_indices", "i", "input_index")}
      }
      return input_indices;
    }`, Vb = (t2, e3) => `
    fn checkInputIndices(input_indices: ${t2.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${e3.length}; i++) {
        var input_index = ${t2.indicesGet("input_indices", "i")};
        if (input_index < 0 || input_index >= ${j("uniforms.input_shape", "i", e3.length)}) {
          return false;
        }
      }
      return true;
    }`, kc = (t2, e3, r2, n2) => t2.rank > n2 ? `
    ${t2.indicesSet("input_indices", e3, "channel")};
    ${t2.indicesSet("input_indices", r2, "batch")};
` : "", Lb = (t2, e3, r2, n2, o2) => {
    let [a2, u2, d2, c2] = r2.length === 2 ? [-1, 0, 1, -1] : [0, 2, 3, 1], p2 = t2.type.value;
    return `
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p2} {
      var input_indices: ${t2.type.indices};
      ${t2.indicesSet("input_indices", u2, `max(0, min(row, ${r2[u2]} - 1))`)};
      ${t2.indicesSet("input_indices", d2, `max(0, min(col, ${r2[d2]} - 1))`)};
      ${kc(t2, c2, a2, 2)}
      return ${t2.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${e3.type.indices}) -> ${p2} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p2} = originalIndices[${u2}];
      var col:${p2} = originalIndices[${d2}];
      ${n2 ? `if (row < 0 || row > (${r2[u2]} - 1) || col < 0 || col > (${r2[d2]} - 1)) {
        return ${o2};
      }` : ""};
      row = max(0, min(row, ${r2[u2]} - 1));
      col = max(0, min(col, ${r2[d2]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r2.length > 2 ? `u32(originalIndices[${c2}])` : "0"};
      var batch: u32 =  ${r2.length > 2 ? `u32(originalIndices[${a2}])` : "0"};
      var x11: ${p2} = getInputValue(batch, channel, row1, col1);
      var x12: ${p2} = getInputValue(batch, channel, row1, col2);
      var x21: ${p2} = getInputValue(batch, channel, row2, col1);
      var x22: ${p2} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p2} = abs(row - ${p2}(row1));
      var dx2: ${p2} = abs(${p2}(row2) - row);
      var dy1: ${p2} = abs(col - ${p2}(col1));
      var dy2: ${p2} = abs(${p2}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`;
  }, Wb = (t2, e3, r2, n2, o2, i2, a2, u2, d2, c2) => {
    let p2 = r2.length === 2, m2 = true, [g2, y] = p2 ? [0, 1] : m2 ? [2, 3] : [1, 2], b = t2.type.value, _ = (S) => {
      let x = S === g2 ? "row" : "col";
      return `
      fn ${x}CubicInterpolation(input_indices: ${t2.type.indices}, output_indices: ${e3.type.indices}) -> ${b} {
        var output_index = ${e3.indicesGet("output_indices", S)};
        var originalIdx: ${b} = getOriginalCoordinateFromResizedCoordinate(output_index, ${o2[S]},
        ${n2[S]}, ${r2[S]}, ${i2[S]}, ${i2[S]} + ${r2.length});
        var fractOriginalIdx: ${b} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u2} && (originalIdx < 0 || originalIdx > (${r2[S]} - 1))) {
          return ${d2};
        }
        var data: array<${b}, 4> = array<${b}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${x}: ${b} = originalIdx + ${b}(i);
          if (${x} < 0 || ${x} >= ${r2[S]}) {
            ${c2 ? `coefs[i + 1] = 0.0;
                        continue;` : u2 ? `return ${d2};` : `${x} = max(0, min(${x}, ${r2[S]} - 1));`};
          }
        var input_indices_copy: ${t2.type.indices} = input_indices;
          ${t2.indicesSet("input_indices_copy", S, `u32(${x})`)};
          data[i + 1] = ${S === g2 ? t2.getByIndices("input_indices_copy") : "rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`;
    };
    return `
    ${_(g2)};
    ${_(y)};
  fn getCubicInterpolationCoefs(s: ${b}) -> array<${b}, 4> {
    var absS = abs(s);
    var coeffs: array<${b}, 4> = array<${b}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${b} = 1.0 - absS;
    var twoMinusAbsS: ${b} = 2.0 - absS;
    var onePlusAbsS: ${b} = 1.0 + absS;
    coeffs[0] = ((${a2} * onePlusAbsS - 5 * ${a2}) * onePlusAbsS + 8 * ${a2}) * onePlusAbsS - 4 * ${a2};
    coeffs[1] = ((${a2} + 2) * absS - (${a2} + 3)) * absS * absS + 1;
    coeffs[2] = ((${a2} + 2) * oneMinusAbsS - (${a2} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${a2} * twoMinusAbsS - 5 * ${a2}) * twoMinusAbsS + 8 * ${a2}) * twoMinusAbsS - 4 * ${a2};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${b}, 4>, coefs: array<${b}, 4>) -> ${b} {
    var coefsSum: ${b} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${e3.type.indices}) -> ${b} {
    var input_indices: ${t2.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `;
  }, Gb = (t2, e3, r2, n2, o2) => {
    let [a2, u2, d2, c2, p2] = r2.length === 3 ? [-1, 0, 1, 2, -1] : [0, 2, 3, 4, 1], m2 = t2.type.value;
    return `
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${m2} {
      var input_indices: ${t2.type.indices};
      ${t2.indicesSet("input_indices", u2, `max(0, min(depth, ${r2[u2]} - 1))`)};
      ${t2.indicesSet("input_indices", d2, `max(0, min(height, ${r2[d2]} - 1))`)};
      ${t2.indicesSet("input_indices", c2, `max(0, min(width, ${r2[c2]} - 1))`)};
      ${kc(t2, p2, a2, 3)}
      return ${t2.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${e3.type.indices}) -> ${m2} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${m2} = originalIndices[${u2}];
      var height:${m2} = originalIndices[${d2}];
      var width:${m2} = originalIndices[${c2}];
      ${n2 ? `if (depth < 0 || depth > (${r2[u2]} - 1) || height < 0 || height > (${r2[d2]} - 1) || width < 0 || (width > ${r2[c2]} - 1)) {
      return ${o2};
        }` : ""};

    depth = max(0, min(depth, ${r2[u2]} - 1));
      height = max(0, min(height, ${r2[d2]} - 1));
      width = max(0, min(width, ${r2[c2]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r2.length > 3 ? `u32(originalIndices[${p2}])` : "0"};
      var batch: u32 =  ${r2.length > 3 ? `u32(originalIndices[${a2}])` : "0"};

      var x111: ${m2} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${m2} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${m2} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${m2} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${m2} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${m2} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${m2} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${m2} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${m2} = abs(depth - ${m2}(depth1));
      var dx2: ${m2} = abs(${m2}(depth2) - depth);
      var dy1: ${m2} = abs(height - ${m2}(height1));
      var dy2: ${m2} = abs(${m2}(height2) - height);
      var dz1: ${m2} = abs(width - ${m2}(width1));
      var dz2: ${m2} = abs(${m2}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`;
  }, Hb = (t2, e3, r2, n2, o2, i2) => {
    let a2 = t2.dims, u2 = Bb(i2, e3.axes, a2.length), d2 = Mb(a2, n2, o2, e3.axes), c2 = n2.slice();
    n2.length === 0 && (c2 = a2.map((v, T) => v === 0 ? 1 : d2[T] / v), e3.keepAspectRatioPolicy !== "stretch" && (d2 = Rb(a2, c2, e3)));
    let p2 = R("output", t2.dataType, d2.length), m2 = O("input", t2.dataType, a2.length), g2 = k.size(d2), y = a2.length === d2.length && a2.every((v, T) => v === d2[T]), b = e3.coordinateTransformMode === "tf_crop_and_resize", _ = e3.extrapolationValue, S = m2.type.value, x = (v) => `
      ${y ? "" : `
      ${Db(e3.coordinateTransformMode, S)};
      ${(() => {
      switch (e3.mode) {
        case "nearest":
          return `
              ${Vb(m2, a2)};
              ${zb(e3.nearestMode, r2, S)};
              ${Nb(m2, p2, a2, d2, c2.length, u2.length, b)};
              `;
        case "linear":
          return `
              ${Ub(p2, a2, d2, c2.length, u2.length)};
              ${(() => {
            if (a2.length === 2 || a2.length === 4) return `${Lb(m2, p2, a2, b, _)}`;
            if (a2.length === 3 || a2.length === 5) return `${Gb(m2, p2, a2, b, _)}`;
            throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.");
          })()};
            `;
        case "cubic":
          return `
            ${(() => {
            if (a2.length === 2 || a2.length === 4) return `${Wb(m2, p2, a2, d2, c2, u2, e3.cubicCoeffA, b, e3.extrapolationValue, e3.excludeOutside)}`;
            throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.");
          })()};
            `;
        default:
          throw Error("Invalid resize mode");
      }
    })()};
      `}
      ${v.registerUniform("output_size", "u32").registerUniform("scales", "f32", c2.length).registerUniform("roi", "f32", u2.length).declareVariables(m2, p2)}
      ${v.mainStart()}
        ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y ? "output[global_idx] = input[global_idx];" : `
        let output_indices = ${p2.offsetToIndices("global_idx")};
        var input_indices: ${m2.type.indices};
        ${(() => {
      switch (e3.mode) {
        case "nearest":
          return `input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${m2.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${e3.extrapolationValue};
                }`;
        case "linear":
          return `output[global_idx] = ${a2.length === 2 || a2.length === 4 ? "bilinearInterpolation" : "trilinearInterpolation"}(output_indices);`;
        case "cubic":
          return "output[global_idx] = bicubicInterpolation(output_indices);";
        default:
          throw Error(`Unsupported resize mode: ${e3.mode}`);
      }
    })()};
`}
      }`;
    return { name: "Resize", shaderCache: { hint: `${e3.cacheKey}|${r2}|${c2.length > 0 ? e3.mode === "cubic" ? c2 : c2.length : ""}|${o2.length > 0 ? o2 : ""}|${u2.length > 0 ? u2 : ""}|${y}|${e3.mode === "nearest" ? a2.length : a2}`, inputDependencies: ["rank"] }, getShaderSource: x, getRunData: () => ({ outputs: [{ dims: d2, dataType: t2.dataType }], dispatchGroup: { x: Math.ceil(g2 / 64) }, programUniforms: [{ type: 12, data: g2 }, { type: 1, data: c2 }, { type: 1, data: u2 }, ...W(a2, d2)] }) };
  }, Fb = (t2) => {
    let e3 = t2.customDataBuffer;
    return new Uint32Array(e3.buffer, e3.byteOffset, 1)[0];
  }, Pc = (t2, e3) => {
    let r2 = [], n2 = [], o2 = [], i2 = Fb(t2);
    if (e3.antialias !== 0) throw Error("Only default value (0) for Antialias attribute is supported");
    Ob(t2.inputs, e3, i2, r2, n2, o2), t2.compute(Hb(t2.inputs[0], e3, i2, r2, n2, o2), { inputs: [0] });
  }, Oc = (t2) => {
    let e3 = t2.antialias, r2 = t2.axes, n2 = t2.coordinateTransformMode, o2 = t2.cubicCoeffA, i2 = t2.excludeOutside !== 0, a2 = t2.extrapolationValue, u2 = t2.keepAspectRatioPolicy, d2 = t2.mode, c2 = t2.nearestMode === "" ? "simple" : t2.nearestMode;
    return J({ antialias: e3, axes: r2, coordinateTransformMode: n2, cubicCoeffA: o2, excludeOutside: i2, extrapolationValue: a2, keepAspectRatioPolicy: u2, mode: d2, nearestMode: c2 });
  };
});
var qb;
var Kb;
var zc;
var Bc = V(() => {
  "use strict";
  ee();
  te();
  oe();
  qb = (t2) => {
    if (!t2 || t2.length < 3) throw new Error("layerNorm requires at least 3 inputs.");
    let e3 = t2[0], r2 = t2[1], n2 = t2[2];
    if (e3.dataType !== r2.dataType || e3.dataType !== n2.dataType) throw new Error("All inputs must have the same data type");
    if (e3.dims.length !== 3 && e3.dims.length !== 2) throw new Error("Input must be 2D or 3D");
    if (r2.dims.length !== 3 && r2.dims.length !== 2) throw new Error("Skip must be 2D or 3D");
    let o2 = e3.dims[e3.dims.length - 1], i2 = e3.dims[e3.dims.length - 2];
    if (r2.dims[r2.dims.length - 1] !== o2) throw new Error("Skip must have the same hidden size as input");
    if (r2.dims[r2.dims.length - 2] !== i2) throw new Error("Skip must have the same sequence length as input");
    if (n2.dims.length !== 1) throw new Error("Gamma must be 1D");
    if (n2.dims[n2.dims.length - 1] !== o2) throw new Error("Gamma must have the same hidden size as input");
    if (t2.length > 3) {
      let a2 = t2[3];
      if (a2.dims.length !== 1) throw new Error("Beta must be 1D");
      if (a2.dims[a2.dims.length - 1] !== o2) throw new Error("Beta must have the same hidden size as input");
    }
    if (t2.length > 4) {
      let a2 = t2[4];
      if (a2.dims.length !== 1) throw new Error("Bias must be 1D");
      if (a2.dims[a2.dims.length - 1] !== o2) throw new Error("Bias must have the same hidden size as input");
    }
  }, Kb = (t2, e3, r2, n2) => {
    let o2 = e3.simplified, i2 = t2[0].dims, a2 = k.size(i2), u2 = i2, d2 = a2, c2 = i2.slice(-1)[0], p2 = n2 ? i2.slice(0, -1).concat(1) : [], m2 = !o2 && t2.length > 3, g2 = t2.length > 4, y = n2 && r2 > 1, b = n2 && r2 > 2, _ = r2 > 3, S = 64, x = fe(c2), v = [{ type: 12, data: d2 }, { type: 12, data: x }, { type: 12, data: c2 }, { type: 1, data: e3.epsilon }], T = (E) => {
      let A = [{ name: "output_size", type: "u32" }, { name: "components", type: "u32" }, { name: "hidden_size", type: "u32" }, { name: "epsilon", type: "f32" }], D = [O("x", t2[0].dataType, t2[0].dims, x), O("skip", t2[1].dataType, t2[1].dims, x), O("gamma", t2[2].dataType, t2[2].dims, x)];
      m2 && D.push(O("beta", t2[3].dataType, t2[3].dims, x)), g2 && D.push(O("bias", t2[4].dataType, t2[4].dims, x)), D.push(R("output", t2[0].dataType, u2, x)), y && D.push(R("mean_output", 1, p2)), b && D.push(R("inv_std_output", 1, p2)), _ && D.push(R("input_skip_bias_sum", t2[0].dataType, u2, x));
      let w = we(t2[0].dataType), U = we(1, x);
      return `

      ${E.registerUniforms(A).declareVariables(...D)}
      var<workgroup> sum_shared : array<${U}, ${S}>;
      var<workgroup> sum_squared_shared : array<${U}, ${S}>;

      ${E.mainStart([S, 1, 1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S - 1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g2 ? "bias[offset1d + i]" : w + "(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${_ ? "input_skip_bias_sum[offset + i] = value;" : ""}
          output[offset + i] = value;
          let f32_value = ${Mt(w, x, "value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${Ze("sum", x)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${Ze("square_sum", x)} / f32(uniforms.hidden_size) ${o2 ? "" : "- mean * mean"} + uniforms.epsilon);
        ${y ? "mean_output[global_idx] = mean;" : ""}
        ${b ? "inv_std_output[global_idx] = inv_std_dev;" : ""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${o2 ? "" : `- ${w}(mean)`}) *
            ${w}(inv_std_dev) * gamma[offset1d + i]
            ${m2 ? "+ beta[offset1d + i]" : ""};
        }
      }`;
    }, I = [{ dims: u2, dataType: t2[0].dataType }];
    return r2 > 1 && I.push({ dims: p2, dataType: 1 }), r2 > 2 && I.push({ dims: p2, dataType: 1 }), r2 > 3 && I.push({ dims: i2, dataType: t2[0].dataType }), { name: "SkipLayerNormalization", shaderCache: { hint: `${x};${y};${b};${_}`, inputDependencies: t2.map((E, A) => "type") }, getShaderSource: T, getRunData: () => ({ outputs: I, dispatchGroup: { x: Math.ceil(d2 / c2) }, programUniforms: v }) };
  }, zc = (t2, e3) => {
    qb(t2.inputs);
    let n2 = [0];
    t2.outputCount > 1 && n2.push(-3), t2.outputCount > 2 && n2.push(-3), t2.outputCount > 3 && n2.push(3), t2.compute(Kb(t2.inputs, e3, t2.outputCount, false), { outputs: n2 });
  };
});
var jb;
var hn;
var Zb;
var Mc;
var Qb;
var Xb;
var Rc;
var Uc;
var Nc = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  oe();
  jb = (t2, e3) => {
    if (!t2 || t2.length < 1) throw new Error("too few inputs");
    if (e3.axes.length !== 0) {
      if (e3.axes.length !== e3.starts.length || e3.axes.length !== e3.ends.length) throw new Error("axes, starts and ends must have the same length");
    } else if (e3.starts.length !== e3.ends.length) throw new Error("starts and ends must have the same length");
    t2.slice(1).forEach((r2, n2) => {
      if (t2[n2 + 1].dataType !== 6 && t2[n2 + 1].dataType !== 7) throw new Error(`Input ${n2} must be an array of int32 or int64`);
    });
  }, hn = (t2, e3) => {
    let r2 = [];
    if (t2.length > e3) if (t2[e3].dataType === 7) t2[e3].getBigInt64Array().forEach((n2) => r2.push(Number(n2)));
    else if (t2[e3].dataType === 6) t2[e3].getInt32Array().forEach((n2) => r2.push(Number(n2)));
    else throw new Error(`Input ${e3} must be an array of int32 or int64`);
    return r2;
  }, Zb = (t2, e3) => {
    if (t2.length > 1) {
      let r2 = hn(t2, 1), n2 = hn(t2, 2), o2 = hn(t2, 3);
      return o2.length === 0 && (o2 = [...Array(t2[0].dims.length).keys()]), J({ starts: r2, ends: n2, axes: o2 });
    } else return e3;
  }, Mc = (t2, e3, r2, n2, o2) => {
    let i2 = t2;
    return t2 < 0 && (i2 += r2[n2[e3]]), o2[e3] < 0 ? Math.max(0, Math.min(i2, r2[n2[e3]] - 1)) : Math.max(0, Math.min(i2, r2[n2[e3]]));
  }, Qb = (t2, e3, r2) => `fn calculateInputIndices(output_indices: ${e3.type.indices}) -> ${t2.type.indices} {
          var input_indices: ${t2.type.indices};
          var carry = 0u;
          for (var i = ${r2.length - 1}; i >= 0; i--) {
            let input_shape_i = ${j("uniforms.input_shape", "i", r2.length)};
            let steps_i = ${j("uniforms.steps", "i", r2.length)};
            let signs_i = ${j("uniforms.signs", "i", r2.length)};
            let starts_i = ${j("uniforms.starts", "i", r2.length)};
            var output_index = ${e3.indicesGet("output_indices", "i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${t2.indicesSet("input_indices", "i", "input_index")};
          }
          return input_indices;
      }`, Xb = (t2, e3) => {
    let r2 = t2[0].dims, n2 = k.size(r2), o2 = e3.axes.length > 0 ? k.normalizeAxes(e3.axes, r2.length) : [...Array(r2.length).keys()], i2 = hn(t2, 4);
    i2.forEach((x) => x !== 0 || (() => {
      throw new Error("step cannot be 0");
    })), i2.length === 0 && (i2 = Array(o2.length).fill(1));
    let a2 = e3.starts.map((x, v) => Mc(x, v, r2, o2, i2)), u2 = e3.ends.map((x, v) => Mc(x, v, r2, o2, i2));
    if (o2.length !== a2.length || o2.length !== u2.length) throw new Error("start, ends and axes should have the same number of elements");
    if (o2.length !== r2.length) for (let x = 0; x < r2.length; ++x) o2.includes(x) || (a2.splice(x, 0, 0), u2.splice(x, 0, r2[x]), i2.splice(x, 0, 1));
    let d2 = i2.map((x) => Math.sign(x));
    i2.forEach((x, v, T) => {
      if (x < 0) {
        let I = (u2[v] - a2[v]) / x, E = a2[v], A = E + I * i2[v];
        a2[v] = A, u2[v] = E, T[v] = -x;
      }
    });
    let c2 = r2.slice(0);
    o2.forEach((x, v) => {
      c2[x] = Math.ceil((u2[x] - a2[x]) / i2[x]);
    });
    let p2 = { dims: c2, dataType: t2[0].dataType }, m2 = R("output", t2[0].dataType, c2.length), g2 = O("input", t2[0].dataType, t2[0].dims.length), y = k.size(c2), b = [{ name: "outputSize", type: "u32" }, { name: "starts", type: "u32", length: a2.length }, { name: "signs", type: "i32", length: d2.length }, { name: "steps", type: "u32", length: i2.length }], _ = [{ type: 12, data: y }, { type: 12, data: a2 }, { type: 6, data: d2 }, { type: 12, data: i2 }, ...W(t2[0].dims, c2)], S = (x) => `
      ${x.registerUniforms(b).declareVariables(g2, m2)}
        ${Qb(g2, m2, r2)}
        ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${m2.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${m2.setByOffset("global_idx", g2.getByIndices("input_indices"))}
      }`;
    return { name: "Slice", shaderCache: { hint: `${d2.length}_${a2.length}_${i2.length}`, inputDependencies: ["rank"] }, getShaderSource: S, getRunData: () => ({ outputs: [p2], dispatchGroup: { x: Math.ceil(n2 / 64) }, programUniforms: _ }) };
  }, Rc = (t2, e3) => {
    jb(t2.inputs, e3);
    let r2 = Zb(t2.inputs, e3);
    t2.compute(Xb(t2.inputs, r2), { inputs: [0] });
  }, Uc = (t2) => {
    let e3 = t2.starts, r2 = t2.ends, n2 = t2.axes;
    return J({ starts: e3, ends: r2, axes: n2 });
  };
});
var Yb;
var Jb;
var Vc;
var Lc;
var Wc = V(() => {
  "use strict";
  ee();
  te();
  Ce();
  pt();
  oe();
  Yb = (t2) => {
    if (!t2 || t2.length !== 1) throw new Error("Softmax op requires 1 input.");
  }, Jb = (t2, e3) => {
    let r2 = t2.inputs[0], n2 = r2.dims, o2 = k.size(n2), i2 = n2.length, a2 = k.normalizeAxis(e3.axis, i2), u2 = a2 < n2.length - 1, d2, c2 = [];
    u2 ? (c2 = Array.from({ length: i2 }, (D, w) => w), c2[a2] = i2 - 1, c2[i2 - 1] = a2, d2 = t2.compute(ze(r2, c2), { inputs: [r2], outputs: [-1] })[0]) : d2 = r2;
    let p2 = d2.dims, m2 = p2[i2 - 1], g2 = o2 / m2, y = fe(m2), b = m2 / y, _ = 64;
    g2 === 1 && (_ = 256);
    let S = (D, w) => w === 4 ? `max(max(${D}.x, ${D}.y), max(${D}.z, ${D}.w))` : w === 2 ? `max(${D}.x, ${D}.y)` : w === 3 ? `max(max(${D}.x, ${D}.y), ${D}.z)` : D, x = O("x", d2.dataType, d2.dims, y), v = R("result", d2.dataType, d2.dims, y), T = x.type.value, I = we(d2.dataType) === "f32" ? `var threadMax = ${T}(-3.4028234663852886e+38f);` : `var threadMax = ${T}(-65504.0h);`, E = (D) => `
      var<workgroup> rowMaxShared : ${T};
      var<workgroup> rowSumShared : ${T};
      var<workgroup> threadShared : array<${T}, ${_}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${T} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${T}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${D.registerUniform("packedCols", "i32").declareVariables(x, v)}
      ${D.mainStart(_)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${_};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${I}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${T}(${S("threadShared[0]", y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${T}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${T}(${Ze("threadShared[0]", y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${T}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`, A = t2.compute({ name: "Softmax", shaderCache: { hint: `${y};${_}`, inputDependencies: ["type"] }, getRunData: () => ({ outputs: [{ dims: p2, dataType: d2.dataType }], dispatchGroup: { x: g2 }, programUniforms: [{ type: 6, data: b }] }), getShaderSource: E }, { inputs: [d2], outputs: [u2 ? -1 : 0] })[0];
    u2 && t2.compute(ze(A, c2), { inputs: [A] });
  }, Vc = (t2, e3) => {
    Yb(t2.inputs), Jb(t2, e3);
  }, Lc = (t2) => J({ axis: t2.axis });
});
var Gc;
var ey;
var ty;
var ry;
var Hc;
var Fc = V(() => {
  "use strict";
  ee();
  te();
  oe();
  Gc = (t2) => Array.from(t2.getBigInt64Array(), Number), ey = (t2) => {
    if (!t2 || t2.length !== 2) throw new Error("Tile requires 2 inputs.");
    if (t2[0].dataType !== 1 && t2[0].dataType !== 10 && t2[0].dataType !== 6 && t2[0].dataType !== 12) throw new Error("Tile only support float, float16, int32, and uint32 data types");
    if (t2[1].dataType !== 7) throw new Error("Tile `repeats` input should be of int64 data type");
    if (t2[1].dims.length !== 1) throw new Error("Tile `repeats` input should be 1-D");
    if (Gc(t2[1]).length !== t2[0].dims.length) throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor");
  }, ty = (t2, e3) => {
    let r2 = [];
    for (let n2 = 0; n2 < t2.length; ++n2) r2.push(t2[n2] * e3[n2]);
    return r2;
  }, ry = (t2, e3) => {
    let r2 = t2[0].dims, n2 = e3 ?? Gc(t2[1]), o2 = ty(r2, n2), i2 = k.size(o2), a2 = t2[0].dataType, u2 = O("input", a2, r2.length), d2 = R("output", a2, o2.length), c2 = (p2) => `
      const inputShape = ${u2.indices(...r2)};
      ${p2.registerUniform("output_size", "u32").declareVariables(u2, d2)}
      ${p2.mainStart()}
      ${p2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d2.offsetToIndices("global_idx")};
      var input_indices: ${u2.type.indices};
      for (var i = 0; i < ${r2.length}; i++) {
        let input_dim_i = ${u2.indicesGet("uniforms.input_shape", "i")};
        let input_dim_value = ${d2.indicesGet("output_indices", "i")}  % input_dim_i;

        ${u2.indicesSet("input_indices", "i", "input_dim_value")}
      }
      ${d2.setByOffset("global_idx", u2.getByIndices("input_indices"))}
    }`;
    return { name: "Tile", shaderCache: { hint: `${n2}`, inputDependencies: ["rank"] }, getRunData: () => ({ outputs: [{ dims: o2, dataType: t2[0].dataType }], dispatchGroup: { x: Math.ceil(i2 / 64) }, programUniforms: [{ type: 12, data: i2 }, ...W(t2[0].dims, o2)] }), getShaderSource: c2 };
  }, Hc = (t2) => {
    ey(t2.inputs), t2.compute(ry(t2.inputs), { inputs: [0] });
  };
});
var ny;
var oy;
var qc;
var Kc = V(() => {
  "use strict";
  ee();
  te();
  oe();
  ny = (t2, e3, r2, n2, o2) => {
    let i2 = R("output_data", o2, r2.length, 4), a2 = O("a_data", e3[1].dataType, e3[1].dims.length, 4), u2 = O("b_data", e3[2].dataType, e3[2].dims.length, 4), d2 = O("c_data", e3[0].dataType, e3[0].dims.length, 4), c2, p2 = (m2, g2, y) => `select(${g2}, ${m2}, ${y})`;
    if (!n2) c2 = i2.setByOffset("global_idx", p2(a2.getByOffset("global_idx"), u2.getByOffset("global_idx"), d2.getByOffset("global_idx")));
    else {
      let m2 = (g2, y, b = "") => {
        let _ = `a_data[index_a${y}][component_a${y}]`, S = `b_data[index_b${y}][component_b${y}]`, x = `bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;
        return `
            let output_indices${y} = ${i2.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${a2.broadcastedIndicesToOffset(`output_indices${y}`, i2)};
            let offset_b${y} = ${u2.broadcastedIndicesToOffset(`output_indices${y}`, i2)};
            let offset_c${y} = ${d2.broadcastedIndicesToOffset(`output_indices${y}`, i2)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g2}[${y}] = ${b}(${p2(_, S, x)});
          `;
      };
      o2 === 9 ? c2 = `
            var data = vec4<u32>(0);
            ${m2("data", 0, "u32")}
            ${m2("data", 1, "u32")}
            ${m2("data", 2, "u32")}
            ${m2("data", 3, "u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));` : c2 = `
            ${m2("output_data[global_idx]", 0)}
            ${m2("output_data[global_idx]", 1)}
            ${m2("output_data[global_idx]", 2)}
            ${m2("output_data[global_idx]", 3)}
          `;
    }
    return `
        ${t2.registerUniform("vec_size", "u32").declareVariables(d2, a2, u2, i2)}
        ${t2.mainStart()}
        ${t2.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${c2}
      }`;
  }, oy = (t2) => {
    let e3 = t2[1].dims, r2 = t2[2].dims, n2 = t2[0].dims, o2 = t2[1].dataType, i2 = !(k.areEqual(e3, r2) && k.areEqual(r2, n2)), a2 = e3, u2 = k.size(e3);
    if (i2) {
      let c2 = ot.calcShape(ot.calcShape(e3, r2, false), n2, false);
      if (!c2) throw new Error("Can't perform where op on the given tensors");
      a2 = c2, u2 = k.size(a2);
    }
    let d2 = Math.ceil(u2 / 4);
    return { name: "Where", shaderCache: { inputDependencies: ["rank", "rank", "rank"] }, getShaderSource: (c2) => ny(c2, t2, a2, i2, o2), getRunData: () => ({ outputs: [{ dims: a2, dataType: o2 }], dispatchGroup: { x: Math.ceil(u2 / 64 / 4) }, programUniforms: [{ type: 12, data: d2 }, ...W(n2, e3, r2, a2)] }) };
  }, qc = (t2) => {
    t2.compute(oy(t2.inputs));
  };
});
var jc;
var Zc = V(() => {
  "use strict";
  wu();
  tn();
  xu();
  Tu();
  cd();
  vd();
  Td();
  Ld();
  jd();
  Xd();
  el();
  ul();
  ml();
  gl();
  yl();
  $l();
  Sl();
  Cl();
  kl();
  Dl();
  Ml();
  Fl();
  jl();
  Ql();
  Yl();
  tc();
  Do();
  nc();
  wc();
  xc();
  Tc();
  Ac();
  Jr();
  Dc();
  Mo();
  Bc();
  Nc();
  Wc();
  Bo();
  Fc();
  pt();
  nn();
  Kc();
  jc = /* @__PURE__ */ new Map([["Abs", [Iu]], ["Acos", [Cu]], ["Acosh", [Au]], ["Add", [pd]], ["ArgMax", [_u, _o]], ["ArgMin", [yu, _o]], ["Asin", [Eu]], ["Asinh", [ku]], ["Atan", [Pu]], ["Atanh", [Ou]], ["Attention", [$u]], ["AveragePool", [cc, lc]], ["BatchNormalization", [vu]], ["BiasAdd", [Su]], ["BiasSplitGelu", [ld]], ["Cast", [zu, Du]], ["Ceil", [Mu]], ["Clip", [Bu]], ["Concat", [xd, Sd]], ["Conv", [Ao, Co]], ["ConvTranspose", [Kd, Fd]], ["Cos", [Ru]], ["Cosh", [Uu]], ["CumSum", [Zd, Qd]], ["DepthToSpace", [Yd, Jd]], ["DequantizeLinear", [$c, vc]], ["DFT", [al, sl]], ["Div", [md]], ["Einsum", [cl, pl]], ["Elu", [Nu, ar]], ["Equal", [fd]], ["Erf", [Vu]], ["Exp", [Lu]], ["Expand", [hl]], ["FastGelu", [bl]], ["Floor", [Wu]], ["FusedConv", [Ao, Co]], ["Gather", [wl, _l]], ["GatherElements", [El, Al]], ["GatherBlockQuantized", [Tl, Il]], ["GatherND", [vl, xl]], ["Gelu", [Gu]], ["Gemm", [Ol, Pl]], ["GlobalAveragePool", [fc, mc]], ["GlobalMaxPool", [_c, yc]], ["Greater", [yd]], ["GreaterOrEqual", [wd]], ["GridSample", [zl, Bl]], ["GroupQueryAttention", [Hl]], ["HardSigmoid", [Xu, Qu]], ["HardSwish", [Yu]], ["InstanceNormalization", [Kl]], ["LayerNormalization", [Zl]], ["LeakyRelu", [Hu, ar]], ["Less", [_d]], ["LessOrEqual", [$d]], ["Log", [sd]], ["MatMul", [Xl]], ["MatMulNBits", [Jl, ec]], ["MaxPool", [gc, bc]], ["Mul", [hd]], ["MultiHeadAttention", [Nl, Ul]], ["Neg", [qu]], ["Not", [Fu]], ["Pad", [rc]], ["Pow", [gd]], ["QuickGelu", [ud, ar]], ["Range", [Sc]], ["Reciprocal", [Ku]], ["ReduceMin", [pu]], ["ReduceMean", [su]], ["ReduceMax", [cu]], ["ReduceSum", [fu]], ["ReduceProd", [mu]], ["ReduceL1", [uu]], ["ReduceL2", [du]], ["ReduceLogSum", [gu]], ["ReduceLogSumExp", [lu]], ["ReduceSumSquare", [hu]], ["Relu", [ju]], ["Resize", [Pc, Oc]], ["RotaryEmbedding", [Wl]], ["ScatterND", [Cc, Ic]], ["Sigmoid", [Zu]], ["Sin", [Ju]], ["Sinh", [ed]], ["Slice", [Rc, Uc]], ["SkipLayerNormalization", [zc]], ["Split", [Vl, Ll]], ["Sqrt", [td]], ["Softmax", [Vc, Lc]], ["Sub", [bd]], ["Tan", [rd]], ["Tanh", [od]], ["ThresholdedRelu", [ad, ar]], ["Tile", [Hc]], ["Transpose", [js, Zs]], ["Where", [qc]]]);
});
var gn;
var Qc = V(() => {
  "use strict";
  Le();
  nt();
  oe();
  gn = class {
    constructor(e3) {
      this.backend = e3;
      this.repo = /* @__PURE__ */ new Map(), this.attributesBound = false;
    }
    getArtifact(e3) {
      return this.repo.get(e3);
    }
    setArtifact(e3, r2) {
      this.repo.set(e3, r2);
    }
    run(e3, r2, n2, o2, i2) {
      Ve(e3.programInfo.name);
      let a2 = this.backend.device, u2 = this.backend.getComputePassEncoder();
      this.backend.writeTimestamp(this.backend.pendingDispatchNumber * 2);
      let d2 = [];
      for (let p2 of r2) d2.push({ binding: d2.length, resource: { buffer: p2.buffer } });
      for (let p2 of n2) d2.push({ binding: d2.length, resource: { buffer: p2.buffer } });
      i2 && d2.push({ binding: d2.length, resource: i2 });
      let c2 = a2.createBindGroup({ layout: e3.computePipeline.getBindGroupLayout(0), entries: d2, label: e3.programInfo.name });
      if (this.backend.sessionStatus === "capturing") {
        let p2 = { kernelId: this.backend.currentKernelId, computePipeline: e3.computePipeline, bindGroup: c2, dispatchGroup: o2 };
        this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p2);
      }
      u2.setPipeline(e3.computePipeline), u2.setBindGroup(0, c2), u2.dispatchWorkgroups(...o2), this.backend.writeTimestamp(this.backend.pendingDispatchNumber * 2 + 1), this.backend.pendingDispatchNumber++, (this.backend.pendingDispatchNumber >= this.backend.maxDispatchNumber || this.backend.queryType === "at-passes") && this.backend.endComputePass(), this.backend.pendingDispatchNumber >= this.backend.maxDispatchNumber && this.backend.flush(), Re(e3.programInfo.name);
    }
    dispose() {
    }
    build(e3, r2) {
      Ve(e3.name);
      let n2 = this.backend.device, o2 = [];
      [{ feature: "shader-f16", extension: "f16" }, { feature: "subgroups", extension: "subgroups" }].forEach((m2) => {
        n2.features.has(m2.feature) && o2.push(`enable ${m2.extension};`);
      });
      let a2 = qs(r2, this.backend.device.limits), u2 = e3.getShaderSource(a2), d2 = `${o2.join(`
`)}
${a2.additionalImplementations}
${u2}`, c2 = n2.createShaderModule({ code: d2, label: e3.name });
      se("verbose", () => `[WebGPU] ${e3.name} shader code: ${d2}`);
      let p2 = n2.createComputePipeline({ compute: { module: c2, entryPoint: "main" }, layout: "auto", label: e3.name });
      return Re(e3.name), { programInfo: e3, computePipeline: p2, uniformVariablesInfo: a2.variablesInfo };
    }
    normalizeDispatchGroupSize(e3) {
      let r2 = typeof e3 == "number" ? e3 : e3.x, n2 = typeof e3 == "number" ? 1 : e3.y || 1, o2 = typeof e3 == "number" ? 1 : e3.z || 1, i2 = this.backend.device.limits.maxComputeWorkgroupsPerDimension;
      if (r2 <= i2 && n2 <= i2 && o2 <= i2) return [r2, n2, o2];
      let a2 = r2 * n2 * o2, u2 = Math.ceil(Math.sqrt(a2));
      if (u2 > i2) {
        if (u2 = Math.ceil(Math.cbrt(a2)), u2 > i2) throw new Error("Total dispatch size exceeds WebGPU maximum.");
        return [u2, u2, u2];
      } else return [u2, u2, 1];
    }
  };
});
var Xc = {};
Wt(Xc, { WebGpuBackend: () => Uo });
var iy;
var ay;
var Ro;
var Uo;
var Yc = V(() => {
  "use strict";
  Le();
  ee();
  nt();
  so();
  Hs();
  Zc();
  Qc();
  iy = (t2, e3) => {
    if (e3.length !== t2.length) throw new Error(`inputDependencies length ${e3.length} is not equal to inputTensors length ${t2.length}.`);
    let r2 = [];
    for (let n2 = 0; n2 < t2.length; ++n2) {
      let o2 = t2[n2].dataType;
      switch (e3[n2]) {
        case "none": {
          r2.push("");
          break;
        }
        case "type": {
          r2.push(`${o2}`);
          break;
        }
        case "rank": {
          let i2 = t2[n2].dims.length;
          r2.push(`${o2};${i2}`);
          break;
        }
        case "dims": {
          let i2 = t2[n2].dims.join(",");
          r2.push(`${o2};${i2}`);
          break;
        }
        default:
          throw new Error(`unsupported input dependency: ${e3[n2]}`);
      }
    }
    return r2.join("|");
  }, ay = (t2, e3, r2) => {
    let n2 = t2.name;
    return t2.shaderCache?.hint && (n2 += "[" + t2.shaderCache.hint + "]"), n2 += ":" + r2 + `:${iy(e3, t2.shaderCache?.inputDependencies ?? new Array(e3.length).fill("dims"))}`, n2;
  }, Ro = class {
    constructor(e3) {
      e3 && (this.architecture = e3.architecture, this.vendor = e3.vendor);
    }
    isArchitecture(e3) {
      return this.architecture === e3;
    }
    isVendor(e3) {
      return this.vendor === e3;
    }
  }, Uo = class {
    constructor() {
      this.currentSessionId = null;
      this.currentKernelId = null;
      this.commandEncoder = null;
      this.computePassEncoder = null;
      this.maxDispatchNumber = 16;
      this.pendingDispatchNumber = 0;
      this.pendingKernels = [];
      this.pendingQueries = /* @__PURE__ */ new Map();
      this.sessionStatus = "default";
      this.capturedCommandList = /* @__PURE__ */ new Map();
      this.capturedPendingKernels = /* @__PURE__ */ new Map();
      this.sessionExternalDataMapping = /* @__PURE__ */ new Map();
    }
    get currentKernelCustomData() {
      if (this.currentKernelId === null) throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");
      let e3 = this.kernelCustomData.get(this.currentKernelId);
      return e3 || (e3 = {}, this.kernelCustomData.set(this.currentKernelId, e3)), e3;
    }
    async initialize(e3, r2) {
      this.env = e3;
      let n2 = [], o2 = { requiredLimits: { maxComputeWorkgroupStorageSize: r2.limits.maxComputeWorkgroupStorageSize, maxComputeWorkgroupsPerDimension: r2.limits.maxComputeWorkgroupsPerDimension, maxStorageBufferBindingSize: r2.limits.maxStorageBufferBindingSize, maxBufferSize: r2.limits.maxBufferSize, maxComputeInvocationsPerWorkgroup: r2.limits.maxComputeInvocationsPerWorkgroup, maxComputeWorkgroupSizeX: r2.limits.maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY: r2.limits.maxComputeWorkgroupSizeY, maxComputeWorkgroupSizeZ: r2.limits.maxComputeWorkgroupSizeZ }, requiredFeatures: n2 }, i2 = (d2) => r2.features.has(d2) && n2.push(d2) && true;
      i2("chromium-experimental-timestamp-query-inside-passes") || i2("timestamp-query"), i2("shader-f16"), i2("subgroups"), this.device = await r2.requestDevice(o2);
      let a2 = r2, u2 = r2.info ?? (typeof a2.requestAdapterInfo == "function" ? await a2.requestAdapterInfo() : void 0);
      this.adapterInfo = new Ro(u2), this.gpuDataManager = Gs(this), this.programManager = new gn(this), this.kernels = /* @__PURE__ */ new Map(), this.kernelPersistentData = /* @__PURE__ */ new Map(), this.kernelCustomData = /* @__PURE__ */ new Map(), Gr(e3.logLevel, !!e3.debug), this.device.onuncapturederror = (d2) => {
        d2.error instanceof GPUValidationError && console.error(`An uncaught WebGPU validation error was raised: ${d2.error.message}`);
      }, Object.defineProperty(this.env.webgpu, "device", { value: this.device, writable: false, enumerable: true, configurable: true }), Object.defineProperty(this.env.webgpu, "adapter", { value: r2, writable: false, enumerable: true, configurable: false }), this.setQueryType();
    }
    dispose() {
      typeof this.querySet < "u" && this.querySet.destroy(), this.gpuDataManager.dispose(), this.device && this.env?.webgpu && this.device.lost.then(() => {
        delete this.env.webgpu.device;
      });
    }
    getCommandEncoder() {
      return this.commandEncoder || (this.commandEncoder = this.device.createCommandEncoder()), this.commandEncoder;
    }
    getComputePassEncoder() {
      if (!this.computePassEncoder) {
        let e3 = this.getCommandEncoder(), r2 = {};
        this.queryType === "at-passes" && (r2.timestampWrites = { querySet: this.querySet, beginningOfPassWriteIndex: this.pendingDispatchNumber * 2, endOfPassWriteIndex: this.pendingDispatchNumber * 2 + 1 }), this.computePassEncoder = e3.beginComputePass(r2);
      }
      return this.computePassEncoder;
    }
    endComputePass() {
      this.computePassEncoder && (this.computePassEncoder.end(), this.computePassEncoder = null);
    }
    flush() {
      if (!this.commandEncoder) return;
      Ve(), this.endComputePass();
      let e3;
      this.queryType !== "none" && (this.commandEncoder.resolveQuerySet(this.querySet, 0, this.pendingDispatchNumber * 2, this.queryResolveBuffer, 0), e3 = this.device.createBuffer({ size: this.pendingDispatchNumber * 2 * 8, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }), this.pendingQueries.set(e3, this.pendingKernels), this.pendingKernels = [], this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer, 0, e3, 0, this.pendingDispatchNumber * 2 * 8)), this.device.queue.submit([this.commandEncoder.finish()]), this.gpuDataManager.refreshPendingBuffers(), this.commandEncoder = null, this.pendingDispatchNumber = 0, this.queryType !== "none" && e3.mapAsync(GPUMapMode.READ).then(() => {
        let r2 = new BigUint64Array(e3.getMappedRange()), n2 = this.pendingQueries.get(e3);
        for (let o2 = 0; o2 < r2.length / 2; o2++) {
          let i2 = n2[o2], a2 = i2.kernelId, u2 = this.kernels.get(a2), d2 = u2.kernelType, c2 = u2.kernelName, p2 = i2.programName, m2 = i2.inputTensorViews, g2 = i2.outputTensorViews, y = r2[o2 * 2], b = r2[o2 * 2 + 1];
          typeof this.queryTimeBase > "u" && (this.queryTimeBase = y);
          let _ = Number(y - this.queryTimeBase), S = Number(b - this.queryTimeBase);
          if (!Number.isSafeInteger(_) || !Number.isSafeInteger(S)) throw new RangeError("incorrect timestamp range");
          if (this.env.webgpu.profiling?.ondata) this.env.webgpu.profiling.ondata({ version: 1, inputsMetadata: m2.map((x) => ({ dims: x.dims, dataType: rt(x.dataType) })), outputsMetadata: g2.map((x) => ({ dims: x.dims, dataType: rt(x.dataType) })), kernelId: a2, kernelType: d2, kernelName: c2, programName: p2, startTime: _, endTime: S });
          else {
            let x = "";
            m2.forEach((T, I) => {
              x += `input[${I}]: [${T.dims}] | ${rt(T.dataType)}, `;
            });
            let v = "";
            g2.forEach((T, I) => {
              v += `output[${I}]: [${T.dims}] | ${rt(T.dataType)}, `;
            }), console.log(`[profiling] kernel "${a2}|${d2}|${c2}|${p2}" ${x}${v}start time: ${_} ns, execution time: ${S - _} ns`);
          }
          Cr("GPU", `${p2}::${y}::${b}`);
        }
        e3.unmap(), this.pendingQueries.delete(e3);
      }), Re();
    }
    run(e3, r2, n2, o2, i2, a2) {
      Ve(e3.name);
      let u2 = [];
      for (let T = 0; T < r2.length; ++T) {
        let I = r2[T].data;
        if (I === 0) continue;
        let E = this.gpuDataManager.get(I);
        if (!E) throw new Error(`no GPU data for input: ${I}`);
        u2.push(E);
      }
      let { outputs: d2, dispatchGroup: c2, programUniforms: p2 } = e3.getRunData(r2), m2 = n2.length === 0 ? d2.map((T, I) => I) : n2;
      if (m2.length !== d2.length) throw new Error(`Output size ${m2.length} must be equal to ${d2.length}.`);
      let g2 = [], y = [];
      for (let T = 0; T < d2.length; ++T) {
        if (!Number.isInteger(m2[T]) || m2[T] < -3 || m2[T] >= a2) throw new Error(`Invalid output index: ${m2[T]}`);
        if (m2[T] === -3) continue;
        let I = m2[T] === -1, E = m2[T] === -2, A = I || E ? i2(d2[T].dataType, d2[T].dims) : o2(m2[T], d2[T].dataType, d2[T].dims);
        if (g2.push(A), A.data === 0) continue;
        let D = this.gpuDataManager.get(A.data);
        if (!D) throw new Error(`no GPU data for output: ${A.data}`);
        if (I && this.temporaryData.push(D), E) {
          let w = this.kernelPersistentData.get(this.currentKernelId);
          w || (w = [], this.kernelPersistentData.set(this.currentKernelId, w)), w.push(D);
        }
        y.push(D);
      }
      if (u2.length !== r2.length || y.length !== g2.length) {
        if (y.length === 0) return Re(e3.name), g2;
        throw new Error(`Program ${e3.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`);
      }
      let b;
      if (p2) {
        let T = 0, I = [];
        p2.forEach((w) => {
          let U = typeof w.data == "number" ? [w.data] : w.data;
          if (U.length === 0) return;
          let N = w.type === 10 ? 2 : 4, F, q;
          w.type === 10 ? (q = U.length > 4 ? 16 : U.length > 2 ? 8 : U.length * N, F = U.length > 4 ? 16 : N * U.length) : (q = U.length <= 2 ? U.length * N : 16, F = 16), T = Math.ceil(T / q) * q, I.push(T);
          let Y = w.type === 10 ? 8 : 4;
          T += U.length > 4 ? Math.ceil(U.length / Y) * F : U.length * N;
        });
        let E = 16;
        T = Math.ceil(T / E) * E;
        let A = new ArrayBuffer(T);
        p2.forEach((w, U) => {
          let N = I[U], F = typeof w.data == "number" ? [w.data] : w.data;
          if (w.type === 6) new Int32Array(A, N, F.length).set(F);
          else if (w.type === 12) new Uint32Array(A, N, F.length).set(F);
          else if (w.type === 10) new Uint16Array(A, N, F.length).set(F);
          else if (w.type === 1) new Float32Array(A, N, F.length).set(F);
          else throw new Error(`Unsupported uniform type: ${rt(w.type)}`);
        });
        let D = this.gpuDataManager.create(T, GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM);
        this.device.queue.writeBuffer(D.buffer, 0, A, 0, T), this.gpuDataManager.release(D.id), b = { offset: 0, size: T, buffer: D.buffer };
      }
      let _ = this.programManager.normalizeDispatchGroupSize(c2), S = _[1] === 1 && _[2] === 1, x = ay(e3, r2, S), v = this.programManager.getArtifact(x);
      if (v || (v = this.programManager.build(e3, _), this.programManager.setArtifact(x, v), se("info", () => `[artifact] key: ${x}, programName: ${e3.name}`)), p2 && v.uniformVariablesInfo) {
        if (p2.length !== v.uniformVariablesInfo.length) throw new Error(`Uniform variables count mismatch: expect ${v.uniformVariablesInfo.length}, got ${p2.length} in program "${v.programInfo.name}".`);
        for (let T = 0; T < p2.length; T++) {
          let I = p2[T], E = I.type, A = typeof I.data == "number" ? 1 : I.data.length, [D, w] = v.uniformVariablesInfo[T];
          if (E !== D || A !== w) throw new Error(`Uniform variable ${T} mismatch: expect type ${D} with size ${w}, got type ${E} with size ${A} in program "${v.programInfo.name}".`);
        }
      }
      if (se("info", () => `[ProgramManager] run "${e3.name}" (key=${x}) with ${_[0]}x${_[1]}x${_[2]}`), this.queryType !== "none" || this.sessionStatus === "capturing") {
        let T = { kernelId: this.currentKernelId, programName: v.programInfo.name, inputTensorViews: r2, outputTensorViews: g2 };
        this.pendingKernels.push(T), this.sessionStatus === "capturing" && this.capturedPendingKernels.get(this.currentSessionId).push(T);
      }
      return this.programManager.run(v, u2, y, _, b), Re(e3.name), g2;
    }
    upload(e3, r2) {
      this.gpuDataManager.upload(e3, r2);
    }
    memcpy(e3, r2) {
      this.gpuDataManager.memcpy(e3, r2);
    }
    async download(e3, r2) {
      await this.gpuDataManager.download(e3, r2);
    }
    alloc(e3) {
      return this.gpuDataManager.create(e3).id;
    }
    free(e3) {
      return this.gpuDataManager.release(e3);
    }
    createKernel(e3, r2, n2, o2) {
      let i2 = jc.get(e3);
      if (!i2) throw new Error(`kernel not implemented: ${e3}`);
      let a2 = { kernelType: e3, kernelName: o2, kernelEntry: i2[0], attributes: [i2[1], n2] };
      this.kernels.set(r2, a2);
    }
    releaseKernel(e3) {
      let r2 = this.kernelPersistentData.get(e3);
      if (r2) {
        for (let n2 of r2) this.gpuDataManager.release(n2.id);
        this.kernelPersistentData.delete(e3);
      }
      this.kernelCustomData.delete(e3), this.kernels.delete(e3);
    }
    computeKernel(e3, r2, n2) {
      let o2 = this.kernels.get(e3);
      if (!o2) throw new Error(`kernel not created: ${e3}`);
      let i2 = o2.kernelType, a2 = o2.kernelName, u2 = o2.kernelEntry, d2 = o2.attributes;
      if (this.currentKernelId !== null) throw new Error(`kernel "[${i2}] ${a2}" is not allowed to be called recursively`);
      this.currentKernelId = e3, d2[0] && (d2[1] = d2[0](d2[1]), d2[0] = void 0), se("info", () => `[WebGPU] Start to run kernel "[${i2}] ${a2}"...`);
      let c2 = this.env.debug;
      this.temporaryData = [];
      try {
        return c2 && this.device.pushErrorScope("validation"), u2(r2, d2[1]), 0;
      } catch (p2) {
        return n2.push(Promise.resolve(`[WebGPU] Kernel "[${i2}] ${a2}" failed. ${p2}`)), 1;
      } finally {
        c2 && n2.push(this.device.popErrorScope().then((p2) => p2 ? `GPU validation error for kernel "[${i2}] ${a2}": ${p2.message}` : null));
        for (let p2 of this.temporaryData) this.gpuDataManager.release(p2.id);
        this.temporaryData = [], this.currentKernelId = null;
      }
    }
    registerBuffer(e3, r2, n2, o2) {
      let i2 = this.sessionExternalDataMapping.get(e3);
      i2 || (i2 = /* @__PURE__ */ new Map(), this.sessionExternalDataMapping.set(e3, i2));
      let a2 = i2.get(r2), u2 = this.gpuDataManager.registerExternalBuffer(n2, o2, a2);
      return i2.set(r2, [u2, n2]), u2;
    }
    unregisterBuffers(e3) {
      let r2 = this.sessionExternalDataMapping.get(e3);
      r2 && (r2.forEach((n2) => this.gpuDataManager.unregisterExternalBuffer(n2[0])), this.sessionExternalDataMapping.delete(e3));
    }
    getBuffer(e3) {
      let r2 = this.gpuDataManager.get(e3);
      if (!r2) throw new Error(`no GPU data for buffer: ${e3}`);
      return r2.buffer;
    }
    createDownloader(e3, r2, n2) {
      return async () => {
        let o2 = await mo(this, e3, r2);
        return Fr(o2.buffer, n2);
      };
    }
    writeTimestamp(e3) {
      this.queryType === "inside-passes" && this.computePassEncoder.writeTimestamp(this.querySet, e3);
    }
    setQueryType() {
      this.queryType = "none", (this.env.webgpu.profiling?.mode === "default" || (typeof this.env.trace > "u" ? this.env.wasm.trace : this.env.trace)) && (this.device.features.has("chromium-experimental-timestamp-query-inside-passes") ? this.queryType = "inside-passes" : this.device.features.has("timestamp-query") && (this.queryType = "at-passes"), this.queryType !== "none" && typeof this.querySet > "u" && (this.querySet = this.device.createQuerySet({ type: "timestamp", count: this.maxDispatchNumber * 2 }), this.queryResolveBuffer = this.device.createBuffer({ size: this.maxDispatchNumber * 2 * 8, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE })));
    }
    captureBegin() {
      se("info", "captureBegin"), this.capturedCommandList.get(this.currentSessionId) || this.capturedCommandList.set(this.currentSessionId, []), this.capturedPendingKernels.get(this.currentSessionId) || this.capturedPendingKernels.set(this.currentSessionId, []), this.flush(), this.sessionStatus = "capturing";
    }
    captureEnd() {
      se("info", "captureEnd"), this.flush(), this.sessionStatus = "default";
    }
    replay() {
      se("info", "replay"), this.sessionStatus = "replaying";
      let e3 = this.capturedCommandList.get(this.currentSessionId), r2 = this.capturedPendingKernels.get(this.currentSessionId), n2 = e3.length;
      this.pendingKernels = [];
      for (let o2 = 0; o2 < n2; o2++) {
        let i2 = this.getComputePassEncoder(), a2 = e3[o2];
        this.writeTimestamp(this.pendingDispatchNumber * 2), i2.setPipeline(a2.computePipeline), i2.setBindGroup(0, a2.bindGroup), i2.dispatchWorkgroups(...a2.dispatchGroup), this.writeTimestamp(this.pendingDispatchNumber * 2 + 1), this.pendingDispatchNumber++, this.queryType !== "none" && this.pendingKernels.push(r2[o2]), (this.pendingDispatchNumber >= this.maxDispatchNumber || this.queryType === "at-passes") && this.endComputePass(), this.pendingDispatchNumber >= this.maxDispatchNumber && this.flush();
      }
      this.flush(), this.sessionStatus = "default";
    }
    onCreateSession() {
      this.gpuDataManager.onCreateSession();
    }
    onReleaseSession(e3) {
      this.unregisterBuffers(e3), this.capturedCommandList.has(e3) && this.capturedCommandList.delete(e3), this.capturedPendingKernels.has(e3) && this.capturedPendingKernels.delete(e3), this.gpuDataManager.onReleaseSession(e3);
    }
    onRunStart(e3) {
      this.currentSessionId = e3, this.setQueryType();
    }
  };
});
var Jc = {};
Wt(Jc, { init: () => sy });
var lr;
var No;
var sy;
var ep = V(() => {
  "use strict";
  ee();
  nt();
  te();
  Ns();
  lr = class t2 {
    constructor(e3, r2, n2, o2) {
      this.module = e3;
      this.dataType = r2;
      this.data = n2;
      this.dims = o2;
    }
    getFloat32Array() {
      if (this.dataType !== 1) throw new Error("Invalid data type");
      let e3 = k.size(this.dims);
      return e3 === 0 ? new Float32Array() : new Float32Array(this.module.HEAP8.buffer, this.data, e3);
    }
    getBigInt64Array() {
      if (this.dataType !== 7) throw new Error("Invalid data type");
      let e3 = k.size(this.dims);
      return e3 === 0 ? new BigInt64Array() : new BigInt64Array(this.module.HEAP8.buffer, this.data, e3);
    }
    getInt32Array() {
      if (this.dataType !== 6) throw new Error("Invalid data type");
      let e3 = k.size(this.dims);
      return e3 === 0 ? new Int32Array() : new Int32Array(this.module.HEAP8.buffer, this.data, e3);
    }
    getUint16Array() {
      if (this.dataType !== 10 && this.dataType !== 4) throw new Error("Invalid data type");
      let e3 = k.size(this.dims);
      return e3 === 0 ? new Uint16Array() : new Uint16Array(this.module.HEAP8.buffer, this.data, e3);
    }
    reshape(e3) {
      if (k.size(e3) !== k.size(this.dims)) throw new Error("Invalid new shape");
      return new t2(this.module, this.dataType, this.data, e3);
    }
  }, No = class {
    constructor(e3, r2, n2) {
      this.module = e3;
      this.backend = r2;
      this.customDataOffset = 0;
      this.customDataSize = 0;
      this.adapterInfo = r2.adapterInfo;
      let o2 = e3.PTR_SIZE, i2 = n2 / e3.PTR_SIZE, a2 = o2 === 4 ? "i32" : "i64";
      this.opKernelContext = Number(e3.getValue(o2 * i2++, a2));
      let u2 = Number(e3.getValue(o2 * i2++, a2));
      this.outputCount = Number(e3.getValue(o2 * i2++, a2)), this.customDataOffset = Number(e3.getValue(o2 * i2++, "*")), this.customDataSize = Number(e3.getValue(o2 * i2++, a2));
      let d2 = [];
      for (let c2 = 0; c2 < u2; c2++) {
        let p2 = Number(e3.getValue(o2 * i2++, a2)), m2 = Number(e3.getValue(o2 * i2++, "*")), g2 = Number(e3.getValue(o2 * i2++, a2)), y = [];
        for (let b = 0; b < g2; b++) y.push(Number(e3.getValue(o2 * i2++, a2)));
        d2.push(new lr(e3, p2, m2, y));
      }
      this.inputs = d2;
    }
    get kernelCustomData() {
      return this.backend.currentKernelCustomData;
    }
    get customDataBuffer() {
      return this.module.HEAPU8.subarray(this.customDataOffset, this.customDataOffset + this.customDataSize);
    }
    compute(e3, r2) {
      let n2 = r2?.inputs?.map((u2) => typeof u2 == "number" ? this.inputs[u2] : u2) ?? this.inputs, o2 = r2?.outputs ?? [], i2 = (u2, d2, c2) => new lr(this.module, d2, this.output(u2, c2), c2), a2 = (u2, d2) => {
        let c2 = xt(u2, d2);
        if (!c2) throw new Error(`Unsupported data type: ${u2}`);
        let p2 = c2 > 0 ? this.backend.gpuDataManager.create(c2).id : 0;
        return new lr(this.module, u2, p2, d2);
      };
      return this.backend.run(e3, n2, o2, i2, a2, this.outputCount);
    }
    output(e3, r2) {
      let n2 = this.module.stackSave();
      try {
        let o2 = this.module.PTR_SIZE, i2 = o2 === 4 ? "i32" : "i64", a2 = this.module.stackAlloc((1 + r2.length) * o2);
        this.module.setValue(a2, r2.length, i2);
        for (let u2 = 0; u2 < r2.length; u2++) this.module.setValue(a2 + o2 * (u2 + 1), r2[u2], i2);
        return this.module._JsepOutput(this.opKernelContext, e3, a2);
      } catch (o2) {
        throw new Error(`Failed to generate kernel's output[${e3}] with dims [${r2}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${o2}`);
      } finally {
        this.module.stackRestore(n2);
      }
    }
  }, sy = async (t2, e3, r2, n2) => {
    let o2 = e3.jsepInit;
    if (!o2) throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");
    if (t2 === "webgpu") {
      let i2 = (Yc(), er(Xc)).WebGpuBackend, a2 = new i2();
      await a2.initialize(r2, n2), o2("webgpu", [a2, (u2) => a2.alloc(Number(u2)), (u2) => a2.free(u2), (u2, d2, c2, p2 = false) => {
        if (p2) se("verbose", () => `[WebGPU] jsepCopyGpuToGpu: src=${Number(u2)}, dst=${Number(d2)}, size=${Number(c2)}`), a2.memcpy(Number(u2), Number(d2));
        else {
          se("verbose", () => `[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u2)}, gpuDataId=${Number(d2)}, size=${Number(c2)}`);
          let m2 = e3.HEAPU8.subarray(Number(u2 >>> 0), Number(u2 >>> 0) + Number(c2));
          a2.upload(Number(d2), m2);
        }
      }, async (u2, d2, c2) => {
        se("verbose", () => `[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u2}, dataOffset=${d2}, size=${c2}`), await a2.download(Number(u2), () => e3.HEAPU8.subarray(Number(d2) >>> 0, Number(d2 + c2) >>> 0));
      }, (u2, d2, c2) => a2.createKernel(u2, Number(d2), c2, e3.UTF8ToString(e3._JsepGetNodeName(Number(d2)))), (u2) => a2.releaseKernel(u2), (u2, d2, c2, p2) => {
        se("verbose", () => `[WebGPU] jsepRun: sessionHandle=${c2}, kernel=${u2}, contextDataOffset=${d2}`);
        let m2 = new No(e3, a2, Number(d2));
        return a2.computeKernel(Number(u2), m2, p2);
      }, () => a2.captureBegin(), () => a2.captureEnd(), () => a2.replay()]);
    } else {
      let i2 = new Zr(r2);
      o2("webnn", [i2, () => i2.reserveTensorId(), (a2) => i2.releaseTensorId(a2), async (a2, u2, d2, c2, p2) => i2.ensureTensor(a2, u2, d2, c2, p2), (a2, u2) => {
        i2.uploadTensor(a2, u2);
      }, async (a2, u2) => i2.downloadTensor(a2, u2), (a2, u2) => i2.registerMLContext(a2, u2), !!r2.trace]);
    }
  };
});
var uy;
var Or;
var Dr;
var Ut;
var dy;
var tp;
var rr;
var zr;
var Br;
var rp;
var Mr;
var Rr;
var Ur;
var Jn = V(() => {
  "use strict";
  Le();
  Is();
  As();
  ee();
  $t();
  Vr();
  io();
  uy = (t2, e3) => {
    ye()._OrtInit(t2, e3) !== 0 && me("Can't initialize onnxruntime.");
  }, Or = async (t2) => {
    uy(t2.wasm.numThreads, or(t2.logLevel));
  }, Dr = async (t2, e3) => {
    ye().asyncInit?.();
    let r2 = t2.webgpu.adapter;
    if (e3 === "webgpu") {
      if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
      if (r2) {
        if (typeof r2.limits != "object" || typeof r2.features != "object" || typeof r2.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
      } else {
        let n2 = t2.webgpu.powerPreference;
        if (n2 !== void 0 && n2 !== "low-power" && n2 !== "high-performance") throw new Error(`Invalid powerPreference setting: "${n2}"`);
        let o2 = t2.webgpu.forceFallbackAdapter;
        if (o2 !== void 0 && typeof o2 != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${o2}"`);
        if (r2 = await navigator.gpu.requestAdapter({ powerPreference: n2, forceFallbackAdapter: o2 }), !r2) throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.');
      }
    }
    if (e3 === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
    {
      let n2 = (ep(), er(Jc)).init;
      e3 === "webgpu" && await n2("webgpu", ye(), t2, r2), e3 === "webnn" && await n2("webnn", ye(), t2);
    }
  }, Ut = /* @__PURE__ */ new Map(), dy = (t2) => {
    let e3 = ye(), r2 = e3.stackSave();
    try {
      let n2 = e3.PTR_SIZE, o2 = e3.stackAlloc(2 * n2);
      e3._OrtGetInputOutputCount(t2, o2, o2 + n2) !== 0 && me("Can't get session input/output count.");
      let a2 = n2 === 4 ? "i32" : "i64";
      return [Number(e3.getValue(o2, a2)), Number(e3.getValue(o2 + n2, a2))];
    } finally {
      e3.stackRestore(r2);
    }
  }, tp = (t2, e3) => {
    let r2 = ye(), n2 = r2.stackSave(), o2 = 0;
    try {
      let i2 = r2.PTR_SIZE, a2 = r2.stackAlloc(2 * i2);
      r2._OrtGetInputOutputMetadata(t2, e3, a2, a2 + i2) !== 0 && me("Can't get session input/output metadata.");
      let d2 = Number(r2.getValue(a2, "*"));
      o2 = Number(r2.getValue(a2 + i2, "*"));
      let c2 = r2.HEAP32[o2 / 4];
      if (c2 === 0) return [d2, 0];
      let p2 = r2.HEAPU32[o2 / 4 + 1], m2 = [];
      for (let g2 = 0; g2 < p2; g2++) {
        let y = Number(r2.getValue(o2 + 8 + g2 * i2, "*"));
        m2.push(y !== 0 ? r2.UTF8ToString(y) : Number(r2.getValue(o2 + 8 + (g2 + p2) * i2, "*")));
      }
      return [d2, c2, m2];
    } finally {
      r2.stackRestore(n2), o2 !== 0 && r2._OrtFree(o2);
    }
  }, rr = (t2) => {
    let e3 = ye(), r2 = e3._malloc(t2.byteLength);
    if (r2 === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${t2.byteLength}.`);
    return e3.HEAPU8.set(t2, r2), [r2, t2.byteLength];
  }, zr = async (t2, e3) => {
    let r2, n2, o2 = ye();
    Array.isArray(t2) ? [r2, n2] = t2 : t2.buffer === o2.HEAPU8.buffer ? [r2, n2] = [t2.byteOffset, t2.byteLength] : [r2, n2] = rr(t2);
    let i2 = 0, a2 = 0, u2 = 0, d2 = [], c2 = [], p2 = [];
    try {
      if ([a2, d2] = await Cs(e3), e3?.externalData && o2.mountExternalData) {
        let I = [];
        for (let E of e3.externalData) {
          let A = typeof E == "string" ? E : E.path, D = typeof E == "string" ? E : E.data;
          I.push(ir(D).then((w) => {
            o2.mountExternalData(A, w);
          }));
        }
        await Promise.all(I);
      }
      for (let I of e3?.executionProviders ?? []) if ((typeof I == "string" ? I : I.name) === "webnn") {
        if (o2.shouldTransferToMLTensor = false, typeof I != "string") {
          let A = I, D = A?.context, w = A?.gpuDevice, U = A?.deviceType, N = A?.powerPreference;
          D ? o2.currentContext = D : w ? o2.currentContext = await o2.webnnCreateMLContext(w) : o2.currentContext = await o2.webnnCreateMLContext({ deviceType: U, powerPreference: N });
        } else o2.currentContext = await o2.webnnCreateMLContext();
        break;
      }
      i2 = await o2._OrtCreateSession(r2, n2, a2), o2.webgpuOnCreateSession?.(i2), i2 === 0 && me("Can't create a session."), o2.jsepOnCreateSession?.(), o2.currentContext && (o2.webnnRegisterMLContext(i2, o2.currentContext), o2.currentContext = void 0, o2.shouldTransferToMLTensor = true);
      let [m2, g2] = dy(i2), y = !!e3?.enableGraphCapture, b = [], _ = [], S = [], x = [], v = [];
      for (let I = 0; I < m2; I++) {
        let [E, A, D] = tp(i2, I);
        E === 0 && me("Can't get an input name."), c2.push(E);
        let w = o2.UTF8ToString(E);
        b.push(w), S.push(A === 0 ? { name: w, isTensor: false } : { name: w, isTensor: true, type: rt(A), shape: D });
      }
      for (let I = 0; I < g2; I++) {
        let [E, A, D] = tp(i2, I + m2);
        E === 0 && me("Can't get an output name."), p2.push(E);
        let w = o2.UTF8ToString(E);
        _.push(w), x.push(A === 0 ? { name: w, isTensor: false } : { name: w, isTensor: true, type: rt(A), shape: D });
        {
          if (y && e3?.preferredOutputLocation === void 0) {
            v.push("gpu-buffer");
            continue;
          }
          let U = typeof e3?.preferredOutputLocation == "string" ? e3.preferredOutputLocation : e3?.preferredOutputLocation?.[w] ?? "cpu", N = o2.webnnIsGraphOutput;
          if (U === "cpu" && N && N(i2, w)) {
            v.push("ml-tensor-cpu-output");
            continue;
          }
          if (U !== "cpu" && U !== "cpu-pinned" && U !== "gpu-buffer" && U !== "ml-tensor") throw new Error(`Not supported preferred output location: ${U}.`);
          if (y && U !== "gpu-buffer") throw new Error(`Not supported preferred output location: ${U}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
          v.push(U);
        }
      }
      let T = null;
      return v.some((I) => I === "gpu-buffer" || I === "ml-tensor" || I === "ml-tensor-cpu-output") && (u2 = o2._OrtCreateBinding(i2), u2 === 0 && me("Can't create IO binding."), T = { handle: u2, outputPreferredLocations: v, outputPreferredLocationsEncoded: v.map((I) => I === "ml-tensor-cpu-output" ? "ml-tensor" : I).map((I) => oo(I)) }), Ut.set(i2, [i2, c2, p2, T, y, false]), [i2, b, _, S, x];
    } catch (m2) {
      throw c2.forEach((g2) => o2._OrtFree(g2)), p2.forEach((g2) => o2._OrtFree(g2)), u2 !== 0 && o2._OrtReleaseBinding(u2) !== 0 && me("Can't release IO binding."), i2 !== 0 && o2._OrtReleaseSession(i2) !== 0 && me("Can't release session."), m2;
    } finally {
      o2._free(r2), a2 !== 0 && o2._OrtReleaseSessionOptions(a2) !== 0 && me("Can't release session options."), d2.forEach((m2) => o2._free(m2)), o2.unmountExternalData?.();
    }
  }, Br = (t2) => {
    let e3 = ye(), r2 = Ut.get(t2);
    if (!r2) throw new Error(`cannot release session. invalid session id: ${t2}`);
    let [n2, o2, i2, a2, u2] = r2;
    a2 && (u2 && e3._OrtClearBoundOutputs(a2.handle) !== 0 && me("Can't clear bound outputs."), e3._OrtReleaseBinding(a2.handle) !== 0 && me("Can't release IO binding.")), e3.jsepOnReleaseSession?.(t2), e3.webnnOnReleaseSession?.(t2), e3.webgpuOnReleaseSession?.(t2), o2.forEach((d2) => e3._OrtFree(d2)), i2.forEach((d2) => e3._OrtFree(d2)), e3._OrtReleaseSession(n2) !== 0 && me("Can't release session."), Ut.delete(t2);
  }, rp = async (t2, e3, r2, n2, o2, i2, a2 = false) => {
    if (!t2) {
      e3.push(0);
      return;
    }
    let u2 = ye(), d2 = u2.PTR_SIZE, c2 = t2[0], p2 = t2[1], m2 = t2[3], g2 = m2, y, b;
    if (c2 === "string" && (m2 === "gpu-buffer" || m2 === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
    if (a2 && m2 !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${i2} when enableGraphCapture is true.`);
    if (m2 === "gpu-buffer") {
      let x = t2[2].gpuBuffer;
      b = xt(vt(c2), p2);
      {
        let v = u2.jsepRegisterBuffer;
        if (!v) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        y = v(n2, i2, x, b);
      }
    } else if (m2 === "ml-tensor") {
      let x = t2[2].mlTensor;
      b = xt(vt(c2), p2);
      let v = u2.webnnRegisterMLTensor;
      if (!v) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
      y = v(n2, x, vt(c2), p2);
    } else {
      let x = t2[2];
      if (Array.isArray(x)) {
        b = d2 * x.length, y = u2._malloc(b), r2.push(y);
        for (let v = 0; v < x.length; v++) {
          if (typeof x[v] != "string") throw new TypeError(`tensor data at index ${v} is not a string`);
          u2.setValue(y + v * d2, Ge(x[v], r2), "*");
        }
      } else {
        let v = u2.webnnIsGraphInput, T = u2.webnnIsGraphOutput;
        if (c2 !== "string" && v && T) {
          let I = u2.UTF8ToString(o2);
          if (v(n2, I) || T(n2, I)) {
            let E = vt(c2);
            b = xt(E, p2), g2 = "ml-tensor";
            let A = u2.webnnCreateTemporaryTensor, D = u2.webnnUploadTensor;
            if (!A || !D) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
            let w = await A(n2, E, p2);
            D(w, new Uint8Array(x.buffer, x.byteOffset, x.byteLength)), y = w;
          } else b = x.byteLength, y = u2._malloc(b), r2.push(y), u2.HEAPU8.set(new Uint8Array(x.buffer, x.byteOffset, b), y);
        } else b = x.byteLength, y = u2._malloc(b), r2.push(y), u2.HEAPU8.set(new Uint8Array(x.buffer, x.byteOffset, b), y);
      }
    }
    let _ = u2.stackSave(), S = u2.stackAlloc(4 * p2.length);
    try {
      p2.forEach((v, T) => u2.setValue(S + T * d2, v, d2 === 4 ? "i32" : "i64"));
      let x = u2._OrtCreateTensor(vt(c2), y, b, S, p2.length, oo(g2));
      x === 0 && me(`Can't create tensor for input/output. session=${n2}, index=${i2}.`), e3.push(x);
    } finally {
      u2.stackRestore(_);
    }
  }, Mr = async (t2, e3, r2, n2, o2, i2) => {
    let a2 = ye(), u2 = a2.PTR_SIZE, d2 = Ut.get(t2);
    if (!d2) throw new Error(`cannot run inference. invalid session id: ${t2}`);
    let c2 = d2[0], p2 = d2[1], m2 = d2[2], g2 = d2[3], y = d2[4], b = d2[5], _ = e3.length, S = n2.length, x = 0, v = [], T = [], I = [], E = [], A = [], D = a2.stackSave(), w = a2.stackAlloc(_ * u2), U = a2.stackAlloc(_ * u2), N = a2.stackAlloc(S * u2), F = a2.stackAlloc(S * u2);
    try {
      [x, v] = Ts(i2), _t("wasm prepareInputOutputTensor");
      for (let L = 0; L < _; L++) await rp(r2[L], T, E, t2, p2[e3[L]], e3[L], y);
      for (let L = 0; L < S; L++) await rp(o2[L], I, E, t2, m2[n2[L]], _ + n2[L], y);
      wt("wasm prepareInputOutputTensor");
      for (let L = 0; L < _; L++) a2.setValue(w + L * u2, T[L], "*"), a2.setValue(U + L * u2, p2[e3[L]], "*");
      for (let L = 0; L < S; L++) a2.setValue(N + L * u2, I[L], "*"), a2.setValue(F + L * u2, m2[n2[L]], "*");
      if (g2 && !b) {
        let { handle: L, outputPreferredLocations: Q, outputPreferredLocationsEncoded: X } = g2;
        if (p2.length !== _) throw new Error(`input count from feeds (${_}) is expected to be always equal to model's input count (${p2.length}).`);
        _t("wasm bindInputsOutputs");
        for (let Z = 0; Z < _; Z++) {
          let ne = e3[Z];
          await a2._OrtBindInput(L, p2[ne], T[Z]) !== 0 && me(`Can't bind input[${Z}] for session=${t2}.`);
        }
        for (let Z = 0; Z < S; Z++) {
          let ne = n2[Z];
          o2[Z]?.[3] ? (A.push(I[Z]), a2._OrtBindOutput(L, m2[ne], I[Z], 0) !== 0 && me(`Can't bind pre-allocated output[${Z}] for session=${t2}.`)) : a2._OrtBindOutput(L, m2[ne], 0, X[ne]) !== 0 && me(`Can't bind output[${Z}] to ${Q[Z]} for session=${t2}.`);
        }
        wt("wasm bindInputsOutputs"), Ut.set(t2, [c2, p2, m2, g2, y, true]);
      }
      a2.jsepOnRunStart?.(c2), a2.webnnOnRunStart?.(c2);
      let q;
      g2 ? q = await a2._OrtRunWithBinding(c2, g2.handle, S, N, x) : q = await a2._OrtRun(c2, U, w, _, F, S, N, x), q !== 0 && me("failed to call OrtRun().");
      let Y = [], z = [];
      _t("wasm ProcessOutputTensor");
      for (let L = 0; L < S; L++) {
        let Q = Number(a2.getValue(N + L * u2, "*"));
        if (Q === I[L] || A.includes(I[L])) {
          Y.push(o2[L]), Q !== I[L] && a2._OrtReleaseTensor(Q) !== 0 && me("Can't release tensor.");
          continue;
        }
        let X = a2.stackSave(), Z = a2.stackAlloc(4 * u2), ne = false, ie, le = 0;
        try {
          a2._OrtGetTensorData(Q, Z, Z + u2, Z + 2 * u2, Z + 3 * u2) !== 0 && me(`Can't access output tensor data on index ${L}.`);
          let $e = u2 === 4 ? "i32" : "i64", M = Number(a2.getValue(Z, $e));
          le = a2.getValue(Z + u2, "*");
          let G = a2.getValue(Z + u2 * 2, "*"), be = Number(a2.getValue(Z + u2 * 3, $e)), ke = [];
          for (let ge = 0; ge < be; ge++) ke.push(Number(a2.getValue(G + ge * u2, $e)));
          a2._OrtFree(G) !== 0 && me("Can't free memory for tensor dims.");
          let ve = ke.reduce((ge, Te) => ge * Te, 1);
          ie = rt(M);
          let Oe = g2?.outputPreferredLocations[n2[L]];
          if (ie === "string") {
            if (Oe === "gpu-buffer" || Oe === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
            let ge = [];
            for (let Te = 0; Te < ve; Te++) {
              let qe = a2.getValue(le + Te * u2, "*"), Ne = a2.getValue(le + (Te + 1) * u2, "*"), Se = Te === ve - 1 ? void 0 : Ne - qe;
              ge.push(a2.UTF8ToString(qe, Se));
            }
            Y.push([ie, ke, ge, "cpu"]);
          } else if (Oe === "gpu-buffer" && ve > 0) {
            let ge = a2.jsepGetBuffer;
            if (!ge) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
            let Te = ge(le), qe = xt(M, ve);
            if (qe === void 0 || !Lr(ie)) throw new Error(`Unsupported data type: ${ie}`);
            ne = true, Y.push([ie, ke, { gpuBuffer: Te, download: a2.jsepCreateDownloader(Te, qe, ie), dispose: () => {
              a2._OrtReleaseTensor(Q) !== 0 && me("Can't release tensor.");
            } }, "gpu-buffer"]);
          } else if (Oe === "ml-tensor" && ve > 0) {
            let ge = a2.webnnEnsureTensor, Te = a2.webnnIsGraphInputOutputTypeSupported;
            if (!ge || !Te) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
            if (xt(M, ve) === void 0 || !Wr(ie)) throw new Error(`Unsupported data type: ${ie}`);
            if (!Te(t2, ie, false)) throw new Error(`preferredLocation "ml-tensor" for ${ie} output is not supported by current WebNN Context.`);
            let Ne = await ge(t2, le, M, ke, false);
            ne = true, Y.push([ie, ke, { mlTensor: Ne, download: a2.webnnCreateMLTensorDownloader(le, ie), dispose: () => {
              a2.webnnReleaseTensorId(le), a2._OrtReleaseTensor(Q);
            } }, "ml-tensor"]);
          } else if (Oe === "ml-tensor-cpu-output" && ve > 0) {
            let ge = a2.webnnCreateMLTensorDownloader(le, ie)(), Te = Y.length;
            ne = true, z.push((async () => {
              let qe = [Te, await ge];
              return a2.webnnReleaseTensorId(le), a2._OrtReleaseTensor(Q), qe;
            })()), Y.push([ie, ke, [], "cpu"]);
          } else {
            let ge = Ht(ie), Te = new ge(ve);
            new Uint8Array(Te.buffer, Te.byteOffset, Te.byteLength).set(a2.HEAPU8.subarray(le, le + Te.byteLength)), Y.push([ie, ke, Te, "cpu"]);
          }
        } finally {
          a2.stackRestore(X), ie === "string" && le && a2._free(le), ne || a2._OrtReleaseTensor(Q);
        }
      }
      g2 && !y && (a2._OrtClearBoundOutputs(g2.handle) !== 0 && me("Can't clear bound outputs."), Ut.set(t2, [c2, p2, m2, g2, y, false]));
      for (let [L, Q] of await Promise.all(z)) Y[L][2] = Q;
      return wt("wasm ProcessOutputTensor"), Y;
    } finally {
      a2.webnnOnRunEnd?.(c2), a2.stackRestore(D), T.forEach((q) => a2._OrtReleaseTensor(q)), I.forEach((q) => a2._OrtReleaseTensor(q)), E.forEach((q) => a2._free(q)), x !== 0 && a2._OrtReleaseRunOptions(x), v.forEach((q) => a2._free(q));
    }
  }, Rr = (t2) => {
    let e3 = ye(), r2 = Ut.get(t2);
    if (!r2) throw new Error("invalid session id");
    let n2 = r2[0], o2 = e3._OrtEndProfiling(n2);
    o2 === 0 && me("Can't get an profile file name."), e3._OrtFree(o2);
  }, Ur = (t2) => {
    let e3 = [];
    for (let r2 of t2) {
      let n2 = r2[2];
      !Array.isArray(n2) && "buffer" in n2 && e3.push(n2.buffer);
    }
    return e3;
  };
});
var Nt;
var Fe;
var cr;
var yn;
var _n;
var bn;
var Vo;
var Lo;
var jt;
var Zt;
var cy;
var np;
var op;
var ip;
var ap;
var sp;
var up;
var dp;
var Wo = V(() => {
  "use strict";
  Le();
  Jn();
  $t();
  kr();
  Nt = () => !!_e.wasm.proxy && typeof document < "u", cr = false, yn = false, _n = false, Lo = /* @__PURE__ */ new Map(), jt = (t2, e3) => {
    let r2 = Lo.get(t2);
    r2 ? r2.push(e3) : Lo.set(t2, [e3]);
  }, Zt = () => {
    if (cr || !yn || _n || !Fe) throw new Error("worker not ready");
  }, cy = (t2) => {
    switch (t2.data.type) {
      case "init-wasm":
        cr = false, t2.data.err ? (_n = true, Vo[1](t2.data.err)) : (yn = true, Vo[0]()), bn && (URL.revokeObjectURL(bn), bn = void 0);
        break;
      case "init-ep":
      case "copy-from":
      case "create":
      case "release":
      case "run":
      case "end-profiling": {
        let e3 = Lo.get(t2.data.type);
        t2.data.err ? e3.shift()[1](t2.data.err) : e3.shift()[0](t2.data.out);
        break;
      }
      default:
    }
  }, np = async () => {
    if (!yn) {
      if (cr) throw new Error("multiple calls to 'initWasm()' detected.");
      if (_n) throw new Error("previous call to 'initWasm()' failed.");
      if (cr = true, Nt()) return new Promise((t2, e3) => {
        Fe?.terminate(), vs().then(([r2, n2]) => {
          try {
            Fe = n2, Fe.onerror = (i2) => e3(i2), Fe.onmessage = cy, Vo = [t2, e3];
            let o2 = { type: "init-wasm", in: _e };
            !o2.in.wasm.wasmPaths && (r2 || to) && (o2.in.wasm.wasmPaths = { wasm: new URL("ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href }), Fe.postMessage(o2), bn = r2;
          } catch (o2) {
            e3(o2);
          }
        }, e3);
      });
      try {
        await Pr(_e.wasm), await Or(_e), yn = true;
      } catch (t2) {
        throw _n = true, t2;
      } finally {
        cr = false;
      }
    }
  }, op = async (t2) => {
    if (Nt()) return Zt(), new Promise((e3, r2) => {
      jt("init-ep", [e3, r2]);
      let n2 = { type: "init-ep", in: { epName: t2, env: _e } };
      Fe.postMessage(n2);
    });
    await Dr(_e, t2);
  }, ip = async (t2) => Nt() ? (Zt(), new Promise((e3, r2) => {
    jt("copy-from", [e3, r2]);
    let n2 = { type: "copy-from", in: { buffer: t2 } };
    Fe.postMessage(n2, [t2.buffer]);
  })) : rr(t2), ap = async (t2, e3) => {
    if (Nt()) {
      if (e3?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
      return Zt(), new Promise((r2, n2) => {
        jt("create", [r2, n2]);
        let o2 = { type: "create", in: { model: t2, options: { ...e3 } } }, i2 = [];
        t2 instanceof Uint8Array && i2.push(t2.buffer), Fe.postMessage(o2, i2);
      });
    } else return zr(t2, e3);
  }, sp = async (t2) => {
    if (Nt()) return Zt(), new Promise((e3, r2) => {
      jt("release", [e3, r2]);
      let n2 = { type: "release", in: t2 };
      Fe.postMessage(n2);
    });
    Br(t2);
  }, up = async (t2, e3, r2, n2, o2, i2) => {
    if (Nt()) {
      if (r2.some((a2) => a2[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
      if (o2.some((a2) => a2)) throw new Error("pre-allocated output tensor is not supported for proxy.");
      return Zt(), new Promise((a2, u2) => {
        jt("run", [a2, u2]);
        let d2 = r2, c2 = { type: "run", in: { sessionId: t2, inputIndices: e3, inputs: d2, outputIndices: n2, options: i2 } };
        Fe.postMessage(c2, Ur(d2));
      });
    } else return Mr(t2, e3, r2, n2, o2, i2);
  }, dp = async (t2) => {
    if (Nt()) return Zt(), new Promise((e3, r2) => {
      jt("end-profiling", [e3, r2]);
      let n2 = { type: "end-profiling", in: t2 };
      Fe.postMessage(n2);
    });
    Rr(t2);
  };
});
var lp;
var py;
var wn;
var cp = V(() => {
  "use strict";
  Le();
  Wo();
  ee();
  Er();
  io();
  lp = (t2, e3) => {
    switch (t2.location) {
      case "cpu":
        return [t2.type, t2.dims, t2.data, "cpu"];
      case "gpu-buffer":
        return [t2.type, t2.dims, { gpuBuffer: t2.gpuBuffer }, "gpu-buffer"];
      case "ml-tensor":
        return [t2.type, t2.dims, { mlTensor: t2.mlTensor }, "ml-tensor"];
      default:
        throw new Error(`invalid data location: ${t2.location} for ${e3()}`);
    }
  }, py = (t2) => {
    switch (t2[3]) {
      case "cpu":
        return new je(t2[0], t2[2], t2[1]);
      case "gpu-buffer": {
        let e3 = t2[0];
        if (!Lr(e3)) throw new Error(`not supported data type: ${e3} for deserializing GPU tensor`);
        let { gpuBuffer: r2, download: n2, dispose: o2 } = t2[2];
        return je.fromGpuBuffer(r2, { dataType: e3, dims: t2[1], download: n2, dispose: o2 });
      }
      case "ml-tensor": {
        let e3 = t2[0];
        if (!Wr(e3)) throw new Error(`not supported data type: ${e3} for deserializing MLTensor tensor`);
        let { mlTensor: r2, download: n2, dispose: o2 } = t2[2];
        return je.fromMLTensor(r2, { dataType: e3, dims: t2[1], download: n2, dispose: o2 });
      }
      default:
        throw new Error(`invalid data location: ${t2[3]}`);
    }
  }, wn = class {
    async fetchModelAndCopyToWasmMemory(e3) {
      return ip(await ir(e3));
    }
    async loadModel(e3, r2) {
      Ve();
      let n2;
      typeof e3 == "string" ? n2 = await this.fetchModelAndCopyToWasmMemory(e3) : n2 = e3, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await ap(n2, r2), Re();
    }
    async dispose() {
      return sp(this.sessionId);
    }
    async run(e3, r2, n2) {
      Ve();
      let o2 = [], i2 = [];
      Object.entries(e3).forEach((g2) => {
        let y = g2[0], b = g2[1], _ = this.inputNames.indexOf(y);
        if (_ === -1) throw new Error(`invalid input '${y}'`);
        o2.push(b), i2.push(_);
      });
      let a2 = [], u2 = [];
      Object.entries(r2).forEach((g2) => {
        let y = g2[0], b = g2[1], _ = this.outputNames.indexOf(y);
        if (_ === -1) throw new Error(`invalid output '${y}'`);
        a2.push(b), u2.push(_);
      });
      let d2 = o2.map((g2, y) => lp(g2, () => `input "${this.inputNames[i2[y]]}"`)), c2 = a2.map((g2, y) => g2 ? lp(g2, () => `output "${this.outputNames[u2[y]]}"`) : null), p2 = await up(this.sessionId, i2, d2, u2, c2, n2), m2 = {};
      for (let g2 = 0; g2 < p2.length; g2++) m2[this.outputNames[u2[g2]]] = a2[g2] ?? py(p2[g2]);
      return Re(), m2;
    }
    startProfiling() {
    }
    endProfiling() {
      dp(this.sessionId);
    }
  };
});
var mp = {};
Wt(mp, { OnnxruntimeWebAssemblyBackend: () => $n, initializeFlags: () => pp, wasmBackend: () => my });
var pp;
var $n;
var my;
var fp = V(() => {
  "use strict";
  Le();
  Wo();
  cp();
  pp = () => {
    (typeof _e.wasm.initTimeout != "number" || _e.wasm.initTimeout < 0) && (_e.wasm.initTimeout = 0);
    let t2 = _e.wasm.simd;
    if (typeof t2 != "boolean" && t2 !== void 0 && t2 !== "fixed" && t2 !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${t2}". Reset it to \`false\` and ignore SIMD feature checking.`), _e.wasm.simd = false), typeof _e.wasm.proxy != "boolean" && (_e.wasm.proxy = false), typeof _e.wasm.trace != "boolean" && (_e.wasm.trace = false), typeof _e.wasm.numThreads != "number" || !Number.isInteger(_e.wasm.numThreads) || _e.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) _e.wasm.numThreads = 1;
    else {
      let e3 = typeof navigator > "u" ? qn("node:os").cpus().length : navigator.hardwareConcurrency;
      _e.wasm.numThreads = Math.min(4, Math.ceil((e3 || 1) / 2));
    }
  }, $n = class {
    async init(e3) {
      pp(), await np(), await op(e3);
    }
    async createInferenceSessionHandler(e3, r2) {
      let n2 = new wn();
      return await n2.loadModel(e3, r2), n2;
    }
  }, my = new $n();
});
Le();
Le();
Le();
var ds = "1.29.0";
{
  let t2 = (fp(), er(mp)).wasmBackend;
  Pt("webgpu", t2, 5), Pt("webnn", t2, 5), Pt("cpu", t2, 10), Pt("wasm", t2, 10);
}
Object.defineProperty(_e.versions, "web", { value: ds, enumerable: true });

// node_modules/web-audio-separation/dist/index.js
function t(e3) {
  let t2 = 0;
  for (let n2 of e3) for (let e4 = 0; e4 < n2.length; e4++) {
    let r2 = Math.abs(n2[e4]);
    r2 > t2 && (t2 = r2);
  }
  return t2;
}
function n(e3, t2) {
  return e3.map((e4) => {
    let n2 = new Float32Array(e4.length);
    for (let r2 = 0; r2 < e4.length; r2++) n2[r2] = e4[r2] * t2;
    return n2;
  });
}
function r(e3, t2, n2) {
  let r2 = Math.max(e3.length, t2.length), i2 = Math.max(e3[0]?.length ?? 0, t2[0]?.length ?? 0), a2 = [];
  for (let o2 = 0; o2 < r2; o2++) {
    let r3 = e3[o2], s2 = t2[o2], c2 = new Float32Array(i2);
    for (let e4 = 0; e4 < i2; e4++) {
      let t3 = r3 && e4 < r3.length ? r3[e4] : 0, i3 = s2 && e4 < s2.length ? s2[e4] : 0;
      c2[e4] = t3 - i3 * n2;
    }
    a2.push(c2);
  }
  return a2;
}
function i(e3, r2 = 1, i2) {
  let a2 = t(e3), o2 = 1;
  return a2 > r2 ? o2 = r2 / a2 : i2 !== void 0 && a2 < i2 && a2 > 0 && (o2 = i2 / a2), n(e3, o2);
}
var a = /* @__PURE__ */ (function(e3) {
  return e3.LoadingModel = "loading-model", e3.Demixing = "demixing", e3.WritingOutput = "writing-output", e3;
})({});
var o = class {
  constructor(e3) {
    this.outputDir = e3.outputDir || "./output", this.outputFormat = e3.outputFormat || "wav", this.normalizationThreshold = e3.normalizationThreshold ?? 0.9, this.amplificationThreshold = e3.amplificationThreshold ?? 0.6, this.logLevel = e3.logLevel || "info", this.sampleRate = e3.sampleRate || 44100, this.onProgress = e3.onProgress, this.modelPath = e3.modelPath, this.modelData = e3.modelData || {}, this.modelName = e3.modelName, this.modelUrl = e3.modelUrl, this.primaryStemName = e3.primaryStemName || "vocals", this.secondaryStemName = e3.secondaryStemName || "instrumental", this.outputSingleStem = e3.outputSingleStem, this.invertUsingSpec = e3.invertUsingSpec ?? false;
  }
  log(e3, t2) {
    this.shouldLog(e3) && console.log(`[${e3.toUpperCase()}] ${t2}`);
  }
  debug(e3) {
    this.log("debug", e3);
  }
  info(e3) {
    this.log("info", e3);
  }
  warning(e3) {
    this.log("warning", e3);
  }
  error(e3) {
    this.log("error", e3);
  }
  shouldLog(e3) {
    let t2 = [
      "error",
      "warning",
      "info",
      "debug"
    ], n2 = t2.indexOf(this.logLevel);
    return t2.indexOf(e3) <= n2;
  }
  reportProgress(e3) {
    if (this.onProgress) try {
      this.onProgress(e3);
    } catch (e4) {
      this.warning(`onProgress callback threw: ${e4}`);
    }
  }
  getStemOutputPath(e3, t2) {
    return t2 && t2[e3] ? t2[e3] : `${this.outputDir}/${this.modelName}_${e3}.${this.outputFormat}`;
  }
  async prepareMix(e3) {
    if (Array.isArray(e3)) return e3;
    if (e3 instanceof Float32Array) return [e3, e3];
    throw Error("Invalid audio data format (expect 1-D or 2-D Float32Array)");
  }
  async normalize(e3, t2 = 1, n2) {
    return i(e3, t2, n2);
  }
};
var s = class e {
  static async loadAudioFile(e3, t2 = 44100) {
    let n2 = await (await fetch(e3)).arrayBuffer(), r2 = await new OfflineAudioContext(2, 1, t2).decodeAudioData(n2), i2 = [];
    for (let e4 = 0; e4 < r2.numberOfChannels; e4++) i2.push(r2.getChannelData(e4));
    return i2.length === 1 && i2.push(new Float32Array(i2[0])), i2;
  }
  static async saveAudioFile(t2, n2, r2) {
    return e.createWAVBlob(t2, n2);
  }
  static createWAVBlob(e3, t2) {
    let n2 = e3[0].length, r2 = e3.length, i2 = r2 * 2, a2 = n2 * i2, o2 = 44 + a2, s2 = new ArrayBuffer(o2), c2 = new DataView(s2), l2 = (e4, t3) => {
      for (let n3 = 0; n3 < t3.length; n3++) c2.setUint8(e4 + n3, t3.charCodeAt(n3));
    };
    l2(0, "RIFF"), c2.setUint32(4, o2 - 8, true), l2(8, "WAVE"), l2(12, "fmt "), c2.setUint32(16, 16, true), c2.setUint16(20, 1, true), c2.setUint16(22, r2, true), c2.setUint32(24, t2, true), c2.setUint32(28, t2 * i2, true), c2.setUint16(32, i2, true), c2.setUint16(34, 16, true), l2(36, "data"), c2.setUint32(40, a2, true);
    let u2 = 44;
    for (let t3 = 0; t3 < n2; t3++) for (let n3 = 0; n3 < r2; n3++) {
      let r3 = Math.max(-1, Math.min(1, e3[n3][t3])), i3 = Math.floor(r3 * 32767);
      c2.setInt16(u2, i3, true), u2 += 2;
    }
    return new Blob([s2], { type: "audio/wav" });
  }
  static interleaveChannels(e3) {
    let t2 = e3[0].length, n2 = e3.length, r2 = new Float32Array(t2 * n2);
    for (let i2 = 0; i2 < t2; i2++) for (let t3 = 0; t3 < n2; t3++) r2[i2 * n2 + t3] = e3[t3][i2];
    return r2;
  }
  static deinterleaveChannels(e3, t2) {
    let n2 = e3.length / t2, r2 = [];
    for (let i2 = 0; i2 < t2; i2++) {
      r2[i2] = new Float32Array(n2);
      for (let a2 = 0; a2 < n2; a2++) r2[i2][a2] = e3[a2 * t2 + i2];
    }
    return r2;
  }
};
async function c(e3 = {}) {
  var t2 = e3, n2 = !!globalThis.window, r2 = !!globalThis.WorkerGlobalScope;
  globalThis.process?.versions?.node && globalThis.process?.type;
  var i2 = import.meta.url;
  if (n2 || r2) try {
    new URL(".", i2).href;
  } catch {
  }
  console.log.bind(console);
  var a2 = console.error.bind(console), o2, s2 = false;
  function c2(e4) {
    for (var t3 = 0, n3 = e4.length, r3 = new Uint8Array(n3), i3; t3 < n3; ++t3) i3 = e4.charCodeAt(t3), r3[t3] = ~i3 >> 8 & i3;
    return r3;
  }
  function l2() {
    try {
      return K.toResizableBuffer();
    } catch {
    }
    return K.buffer;
  }
  function u2() {
    if (!E?.buffer?.resizable) {
      var e4 = l2();
      E = new Int8Array(e4), C = new Int16Array(e4), t2.HEAPU8 = M = new Uint8Array(e4), k2 = new Uint16Array(e4), w = new Int32Array(e4), A = new Uint32Array(e4), t2.HEAPF32 = D = new Float32Array(e4), O2 = new Float64Array(e4), T = new BigInt64Array(e4), j2 = new BigUint64Array(e4);
    }
  }
  function d2() {
    var e4 = t2.preRun;
    e4 && (typeof e4 == "function" && (e4 = [e4]), F.push(...e4)), N(F);
  }
  function f2() {
    X.d();
  }
  function p2() {
    var e4 = t2.postRun;
    e4 && (typeof e4 == "function" && (e4 = [e4]), P.push(...e4)), N(P);
  }
  function m2(e4) {
    throw t2.onAbort?.(e4), e4 = `Aborted(${e4})`, a2(e4), s2 = true, e4 += ". Build with -sASSERTIONS for more info.", new WebAssembly.RuntimeError(e4);
  }
  var h2;
  function g2() {
    return c2('\0asm\0\0\0G\f`\x7F\x7F`\x7F\0`\x7F\x7F\x7F\x7F\0`}}`|}`\0\x7F`|\x7F|`\x07\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F`}\x7F\x7F`\x7F\x7F\x7F\x7F\x7F\0`\x7F\x7F\x7F`\0\0\raa\0ab\0\0\0\0\0\x07\b	\n\v\x07\x82\x80\x80\b\x7FA\xB0\xA5\v\x07-\vc\0d\0e\0f\0g\0h\0\ni\0\vj\0	k\0\x07l\0m\0\f\n\xF6\x8B\x80|\x7F#\0Ak"$\0@ \0\xBC"A\xFF\xFF\xFF\xFF\x07q"A\xDA\x9F\xA4\xFAM@ A\x80\x80\x80\xCCI\r \0\xBB!\0\f\v A\xD1\xA7\xED\x83M@ \0\xBB! A\xE3\x97\xDB\x80M@ A\0H@ D-DT\xFB!\xF9?\xA0\x8C!\0\f\v D-DT\xFB!\xF9\xBF\xA0!\0\f\vD-DT\xFB!	\xC0D-DT\xFB!	@ A\0N\x1B \xA0\x9A!\0\f\v A\xD5\xE3\x88\x87M@ A\xDF\xDB\xBF\x85M@ \0\xBB! A\0H@ D\xD2!3\x7F|\xD9@\xA0!\0\f\v D\xD2!3\x7F|\xD9\xC0\xA0\x8C!\0\f\vD-DT\xFB!@D-DT\xFB!\xC0 A\0H\x1B \0\xBB\xA0!\0\f\v A\x80\x80\x80\xFC\x07O@ \0 \0\x93!\0\f\v \0 A\bj! +\b!@@@@ AqAk\0\v !\0\f\v !\0\f\v \x9A!\0\f\v \x8C!\0\v Aj$\0 \0\v\xE6\x7F|#\0Ak"$\0} \0\xBC"A\xFF\xFF\xFF\xFF\x07q"A\xDA\x9F\xA4\xFAM@C\0\0\x80? A\x80\x80\x80\xCCI\r \0\xBB\f\v A\xD1\xA7\xED\x83M@ A\xE4\x97\xDB\x80O@D-DT\xFB!	@D-DT\xFB!	\xC0 A\0H\x1B \0\xBB\xA0\x8C\f\v \0\xBB! A\0H@ D-DT\xFB!\xF9?\xA0\f\vD-DT\xFB!\xF9? \xA1\f\v A\xD5\xE3\x88\x87M@ A\xE0\xDB\xBF\x85O@D-DT\xFB!@D-DT\xFB!\xC0 A\0H\x1B \0\xBB\xA0\f\v A\0H@D\xD2!3\x7F|\xD9\xC0 \0\xBB\xA1\f\v \0\xBBD\xD2!3\x7F|\xD9\xC0\xA0\f\v \0 \0\x93 A\x80\x80\x80\xFC\x07O\r\0 \0 A\bj! +\b!@@@@ AqAk\0\v \f\v \x9A\f\v \x8C\f\v \v Aj$\0\vK| \0 \0 \0\xA2"\xA2"  \xA2\xA2 D\xA7F;\x8C\x87\xCD\xC6>\xA2Dt\xE7\xCA\xE2\xF9\0*\xBF\xA0\xA2  D\xB2\xFBn\x89\x81?\xA2Dw\xAC\xCBTUU\xC5\xBF\xA0\xA2 \0\xA0\xA0\xB6\vO| \0 \0\xA2"\0 \0 \0\xA2"\xA2 \0DiP\xEE\xE0B\x93\xF9>\xA2D\'\xE8\x87\xC0V\xBF\xA0\xA2 DB:\xE1SU\xA5?\xA2 \0D\x81^\f\xFD\xFF\xFF\xDF\xBF\xA2D\0\0\0\0\0\0\xF0?\xA0\xA0\xA0\xB6\vT\x7F~@A\xB0!(\0"\xAD \0\xADB\x07|B\xF8\xFF\xFF\xFF\x83|"B\xFF\xFF\xFF\xFFX@ \xA7"\0?\0AtM\r \0\r\vA\xB4!A06\0A\x7F\vA\xB0! \x006\0 \v\xDF\v\b\x7F@ \0E\r\0 \0A\bk" \0Ak(\0"Axq"\0j!@ Aq\r\0 AqE\r  (\0"k"A\xC8!(\0I\r \0 j!\0@@@A\xCC!(\0 G@ (\f! A\xFFM@  (\b"G\rA\xB8!A\xB8!(\0A~ Avwq6\0\f\v (!\x07  G@ (\b" 6\f  6\b\f\v ("\x7F Aj ("E\r Aj\v!@ ! "Aj! ("\r\0 Aj! ("\r\0\v A\x006\0\f\v ("AqAG\rA\xC0! \x006\0  A~q6  \0Ar6  \x006\0\v  6\f  6\b\f\vA\0!\v \x07E\r\0@ ("At"(\xE8# F@ A\xE8#j 6\0 \rA\xBC!A\xBC!(\0A~ wq6\0\f\v@  \x07(F@ \x07 6\f\v \x07 6\v E\r\v  \x076 ("@  6  6\v ("E\r\0  6  6\v  O\r\0 ("AqE\r\0@@@@ AqE@A\xD0!(\0 F@A\xD0! 6\0A\xC4!A\xC4!(\0 \0j"\x006\0  \0Ar6 A\xCC!(\0G\rA\xC0!A\x006\0A\xCC!A\x006\0\vA\xCC!(\0"\x07 F@A\xCC! 6\0A\xC0!A\xC0!(\0 \0j"\x006\0  \0Ar6 \0 j \x006\0\v Axq \0j!\0 (\f! A\xFFM@ (\b" F@A\xB8!A\xB8!(\0A~ Avwq6\0\f\v  6\f  6\b\f\v (!\b  G@ (\b" 6\f  6\b\f\v ("\x7F Aj ("E\r Aj\v!@ ! "Aj! ("\r\0 Aj! ("\r\0\v A\x006\0\f\v  A~q6  \0Ar6 \0 j \x006\0\f\vA\0!\v \bE\r\0@ ("At"(\xE8# F@ A\xE8#j 6\0 \rA\xBC!A\xBC!(\0A~ wq6\0\f\v@  \b(F@ \b 6\f\v \b 6\v E\r\v  \b6 ("@  6  6\v ("E\r\0  6  6\v  \0Ar6 \0 j \x006\0  \x07G\r\0A\xC0! \x006\0\v \0A\xFFM@ \0A\xF8qA\xE0!j!\x7FA\xB8!(\0"A \0Avt"\0qE@A\xB8! \0 r6\0 \f\v (\b\v!\0  6\b \0 6\f  6\f  \x006\b\vA! \0A\xFF\xFF\xFF\x07M@ \0A& \0A\bvg"kvAq AtrA>s!\v  6 B\x007 AtA\xE8#j!\x7F@\x7FA\xBC!(\0"A t"qE@A\xBC!  r6\0  6\0A!A\b\f\v \0A AvkA\0 AG\x1Bt! (\0!@ "(Axq \0F\r Av! At!  Aqj"("\r\0\v  6A! !A\b\v!\0 "\f\v (\b" 6\f  6\bA!\0A\b!A\0\v!  j 6\0  6\f \0 j 6\0A\xD8!A\xD8!(\0Ak"\0A\x7F \0\x1B6\0\v\v\xA8\0@ A\x80\bN@ \0D\0\0\0\0\0\0\xE0\x7F\xA2!\0 A\xFFI@ A\xFF\x07k!\f\v \0D\0\0\0\0\0\0\xE0\x7F\xA2!\0A\xFD  A\xFDO\x1BA\xFEk!\f\v A\x81xJ\r\0 \0D\0\0\0\0\0\0`\xA2!\0 A\xB8pK@ A\xC9\x07j!\f\v \0D\0\0\0\0\0\0`\xA2!\0A\xF0h  A\xF0hM\x1BA\x92j!\v \0 A\xFF\x07j\xADB4\x86\xBF\xA2\v\0 \0@ \0Ak(\0\x07\v\v\xC1\'\v\x7F#\0Ak"\n$\0@@@@@@@@@@ \0A\xF4M@A\xB8!(\0"A \0A\vjA\xF8q \0A\vI\x1B"Av"\0v"Aq@@ A\x7FsAq \0j"At"A\xE0!j"\0 (\xE8!"(\b"F@A\xB8! A~ wq6\0\f\v  \x006\f \0 6\b\v A\bj!\0  Ar6  j" (Ar6\f\v\v A\xC0!(\0"\bM\r @@A \0t"A\0 kr  \0tqh"At"A\xE0!j" (\xE8!"\0(\b"F@A\xB8! A~ wq"6\0\f\v  6\f  6\b\v \0 Ar6 \0 j"\x07  k"Ar6 \0 j 6\0 \b@ \bAxqA\xE0!j!A\xCC!(\0!\x7F A \bAvt"qE@A\xB8!  r6\0 \f\v (\b\v!  6\b  6\f  6\f  6\b\v \0A\bj!\0A\xCC! \x076\0A\xC0! 6\0\f\v\vA\xBC!(\0"\vE\r \vhAt(\xE8#"(Axq k! !@@ ("\0E@ ("\0E\r\v \0(Axq k"   I"\x1B! \0  \x1B! \0!\f\v\v (!	  (\f"\0G@ (\b" \x006\f \0 6\b\f\n\v ("\x7F Aj ("E\r Aj\v!@ !\x07 "\0Aj! \0("\r\0 \0Aj! \0("\r\0\v \x07A\x006\0\f	\vA\x7F! \0A\xBF\x7FK\r\0 \0A\vj"Axq!A\xBC!(\0"\x07E\r\0A!\bA\0 k! \0A\xF4\xFF\xFF\x07M@ A& A\bvg"\0kvAq \0AtkA>j!\b\v@@@ \bAt(\xE8#"E@A\0!\0\f\vA\0!\0 A \bAvkA\0 \bAG\x1Bt!@@ (Axq k" O\r\0 ! "\r\0A\0! !\0\f\v \0 ("   AvAqj("F\x1B \0 \x1B!\0 At! \r\0\v\v \0 rE@A\0!A \bt"\0A\0 \0kr \x07q"\0E\r \0hAt(\xE8#!\0\v \0E\r\v@ \0(Axq k" I!   \x1B! \0  \x1B! \0("\x7F  \0(\v"\0\r\0\v\v E\r\0 A\xC0!(\0 kO\r\0 (!\b  (\f"\0G@ (\b" \x006\f \0 6\b\f\b\v ("\x7F Aj ("E\r Aj\v!@ ! "\0Aj! \0("\r\0 \0Aj! \0("\r\0\v A\x006\0\f\x07\v A\xC0!(\0"M@A\xCC!(\0!\0@  k"AO@ \0 j" Ar6 \0 j 6\0 \0 Ar6\f\v \0 Ar6 \0 j" (Ar6A\0!A\0!\vA\xC0! 6\0A\xCC! 6\0 \0A\bj!\0\f	\v A\xC4!(\0"I@A\xC4!  k"6\0A\xD0!A\xD0!(\0"\0 j"6\0  Ar6 \0 Ar6 \0A\bj!\0\f	\vA\0!\0 A/j"\x7FA\x90%(\0@A\x98%(\0\f\vA\x9C%B\x7F7\0A\x94%B\x80\xA0\x80\x80\x80\x807\0A\x90% \nA\fjApqA\xD8\xAA\xD5\xAAs6\0A\xA4%A\x006\0A\xF4$A\x006\0A\x80 \v"j"A\0 k"\x07q" M\r\bA\xF0$(\0"@A\xE8$(\0"\b j"	 \bM\r	  	I\r	\v@A\xF4$-\0\0AqE@@@@@A\xD0!(\0"@A\xF8$!\0@ \0(\0"\b M@  \b \0(jI\r\v \0(\b"\0\r\0\v\vA\0"A\x7FF\r !A\x94%(\0"\0Ak" q@  k  jA\0 \0kqj!\v  M\rA\xF0$(\0"\0@A\xE8$(\0" j"\x07 M\r \0 \x07I\r\v "\0 G\r\f\v  k \x07q"" \0(\0 \0(jF\r !\0\v \0A\x7FF\r A0j M@ \0!\f\vA\x98%(\0"  kjA\0 kq"A\x7FF\r  j! \0!\f\v A\x7FG\r\vA\xF4$A\xF4$(\0Ar6\0\v !A\0!\0 A\x7FF\r \0A\x7FF\r \0 M\r \0 k" A(jM\r\vA\xE8$A\xE8$(\0 j"\x006\0A\xEC$(\0 \0I@A\xEC$ \x006\0\v@A\xD0!(\0"@A\xF8$!\0@  \0(\0" \0("jF\r \0(\b"\0\r\0\v\f\vA\xC8!(\0"\0A\0 \0 M\x1BE@A\xC8! 6\0\vA\0!\0A\xFC$ 6\0A\xF8$ 6\0A\xD8!A\x7F6\0A\xDC!A\x90%(\x006\0A\x84%A\x006\0@ \0At" A\xE0!j"6\xE8!  6\xEC! \0Aj"\0A G\r\0\vA\xC4! A(k"\0Ax kA\x07q"k"6\0A\xD0!  j"6\0  Ar6 \0 jA(6A\xD4!A\xA0%(\x006\0\f\v  M\r  K\r \0(\fA\bq\r \0  j6A\xD0! Ax kA\x07q"\0j"6\0A\xC4!A\xC4!(\0 j" \0k"\x006\0  \0Ar6  jA(6A\xD4!A\xA0%(\x006\0\f\vA\0!\0\f\vA\0!\0\f\vA\xC8!(\0 K@A\xC8! 6\0\v  j!A\xF8$!\0@@  \0(\0"G@ \0(\b"\0\r\f\v\v \0-\0\fA\bqE\r\vA\xF8$!\0@@ \0(\0" M@   \0(j"I\r\v \0(\b!\0\f\v\vA\xC4! A(k"\0Ax kA\x07q"k"\x076\0A\xD0!  j"6\0  \x07Ar6 \0 jA(6A\xD4!A\xA0%(\x006\0  A\' kA\x07qjA/k"\0 \0 AjI\x1B"A\x1B6 A\x80%)\x007 A\xF8$)\x007\bA\x80% A\bj6\0A\xFC$ 6\0A\xF8$ 6\0A\x84%A\x006\0 Aj!\0@ \0A\x076 \0A\bj \0Aj!\0 I\r\0\v  F\r\0  (A~q6   k"Ar6  6\0\x7F A\xFFM@ A\xF8qA\xE0!j!\0\x7FA\xB8!(\0"A Avt"qE@A\xB8!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\fA\f!A\b\f\vA!\0 A\xFF\xFF\xFF\x07M@ A& A\bvg"\0kvAq \0AtrA>s!\0\v  \x006 B\x007 \0AtA\xE8#j!@@A\xBC!(\0"A \0t"qE@A\xBC!  r6\0  6\0\f\v A \0AvkA\0 \0AG\x1Bt!\0 (\0!@ "(Axq F\r \0Av! \0At!\0  Aqj"("\r\0\v  6\v  6A\b! "!\0A\f\f\v (\b"\0 6\f  6\b  \x006\bA\0!\0A!A\f\v j 6\0  j \x006\0\vA\xC4!(\0"\0 M\r\0A\xC4! \0 k"6\0A\xD0!A\xD0!(\0"\0 j"6\0  Ar6 \0 Ar6 \0A\bj!\0\f\vA\xB4!A06\0A\0!\0\f\v \0 6\0 \0 \0( j6 Ax kA\x07qj"\b Ar6 Ax kA\x07qj"  \bj"k!\x07@A\xD0!(\0 F@A\xD0! 6\0A\xC4!A\xC4!(\0 \x07j"\x006\0  \0Ar6\f\vA\xCC!(\0 F@A\xCC! 6\0A\xC0!A\xC0!(\0 \x07j"\x006\0  \0Ar6 \0 j \x006\0\f\v ("\0AqAF@ \0Axq!	 (\f!@ \0A\xFFM@ (\b" F@A\xB8!A\xB8!(\0A~ \0Avwq6\0\f\v  6\f  6\b\f\v (!@  G@ (\b"\0 6\f  \x006\b\f\v@ ("\0\x7F Aj ("\0E\r Aj\v!@ ! \0"Aj! \0("\0\r\0 Aj! ("\0\r\0\v A\x006\0\f\vA\0!\v E\r\0@ ("\0At"(\xE8# F@ A\xE8#j 6\0 \rA\xBC!A\xBC!(\0A~ \0wq6\0\f\v@  (F@  6\f\v  6\v E\r\v  6 ("\0@  \x006 \0 6\v ("\0E\r\0  \x006 \0 6\v \x07 	j!\x07  	j"(!\0\v  \0A~q6  \x07Ar6  \x07j \x076\0 \x07A\xFFM@ \x07A\xF8qA\xE0!j!\0\x7FA\xB8!(\0"A \x07Avt"qE@A\xB8!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\f\vA! \x07A\xFF\xFF\xFF\x07M@ \x07A& \x07A\bvg"\0kvAq \0AtrA>s!\v  6 B\x007 AtA\xE8#j!\0@@A\xBC!(\0"A t"qE@A\xBC!  r6\0 \0 6\0\f\v \x07A AvkA\0 AG\x1Bt! \0(\0!@ "\0(Axq \x07F\r Av! At! \0 Aqj"("\r\0\v  6\v  \x006  6\f  6\b\f\v \0(\b" 6\f \0 6\b A\x006  \x006\f  6\b\v \bA\bj!\0\f\v@ \bE\r\0@ ("At"(\xE8# F@ A\xE8#j \x006\0 \0\rA\xBC! \x07A~ wq"\x076\0\f\v@  \b(F@ \b \x006\f\v \b \x006\v \0E\r\v \0 \b6 ("@ \0 6  \x006\v ("E\r\0 \0 6  \x006\v@ AM@   j"\0Ar6 \0 j"\0 \0(Ar6\f\v  Ar6  j" Ar6  j 6\0 A\xFFM@ A\xF8qA\xE0!j!\0\x7FA\xB8!(\0"A Avt"qE@A\xB8!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\f\vA!\0 A\xFF\xFF\xFF\x07M@ A& A\bvg"\0kvAq \0AtrA>s!\0\v  \x006 B\x007 \0AtA\xE8#j!@@ \x07A \0t"qE@A\xBC!  \x07r6\0  6\0  6\f\v A \0AvkA\0 \0AG\x1Bt!\0 (\0!@ "(Axq F\r \0Av! \0At!\0  Aqj"\x07("\r\0\v \x07 6  6\v  6\f  6\b\f\v (\b"\0 6\f  6\b A\x006  6\f  \x006\b\v A\bj!\0\f\v@ 	E\r\0@ ("At"(\xE8# F@ A\xE8#j \x006\0 \0\rA\xBC! \vA~ wq6\0\f\v@  	(F@ 	 \x006\f\v 	 \x006\v \0E\r\v \0 	6 ("@ \0 6  \x006\v ("E\r\0 \0 6  \x006\v@ AM@   j"\0Ar6 \0 j"\0 \0(Ar6\f\v  Ar6  j" Ar6  j 6\0 \b@ \bAxqA\xE0!j!\0A\xCC!(\0!\x7FA \bAvt"\x07 qE@A\xB8!  \x07r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\vA\xCC! 6\0A\xC0! 6\0\v A\bj!\0\v \nAj$\0 \0\v*\x7F \0A\xC3\0j\n"\0E@A\0\v \0A\xC3\0jA@q"Ak \x006\0 \v\x94\x1B&\x7F{}@  F\r\0     F\x1B"F\r\0 ("\bA\0J@ \bAj!\' \xB2!DA!A!	@ \0  Atj(\0"& 	l"(mAt!\b@@@@@@ &Ak\0\v !\n  Atj"\x07! \x07 \bAt"\vj"\x07!\f \x07 \vj!\rA\0! \b 	l!	@ \bAG@ 	A\0L\r \bAL\r \bAt! 	A0l! 	At! \bA0l! \bAt! \bAk!\x1B D\xFD!2@ \n j! \n j!  j!  j! \n 	Atj!  \bAt" j!!A\0!\v@  \vAt"\x07j"\xFD\0!0  \vAr"At"j\xFD\0\0!- \x07 !j""\xFD\0!. \x07 j"#\xFD\0!/ \x07 \nj  \x07j\xFD\0\0"3 \xFD\0\0"4\xFD\xE4"5 "\xFD\0\0"6 #\xFD\0\0"7\xFD\xE4"8\xFD\xE4\xFD\v\0 \n j - 0\xFD\xE4"9 / .\xFD\xE4":\xFD\xE4\xFD\v\0 \f At"j*\0!E \f \vAt"j\xFD	\0!1 \x07 j" - 0\xFD\xE5"- 2 6 7\xFD\xE5\xFD\xE6"6\xFD\xE4"0  j\xFD	\0"7\xFD\xE6 3 4\xFD\xE5"3 2 / .\xFD\xE5\xFD\xE6".\xFD\xE4"/ D  j*\0\x94\xFD"4\xFD\xE6\xFD\xE4\xFD\v  / 7\xFD\xE6 0 4\xFD\xE6\xFD\xE5\xFD\v\0 \r j*\0!F \r j\xFD	\0!0 \x07 j" 1 9 :\xFD\xE5"/\xFD\xE6 5 8\xFD\xE5"4 D E\x94\xFD"5\xFD\xE6\xFD\xE4\xFD\v  4 1\xFD\xE6 / 5\xFD\xE6\xFD\xE5\xFD\v\0 \x07 j"\x07 0 - 6\xFD\xE5"-\xFD\xE6 3 .\xFD\xE5". D F\x94\xFD"/\xFD\xE6\xFD\xE4\xFD\v \x07 . 0\xFD\xE6 - /\xFD\xE6\xFD\xE5\xFD\v\0 \vAj"\v \x1BH\r\0\v  j! \n  j!\n \b j" 	H\r\0\v\f\v 	A\0L\r\0 	A0l!\v 	At! D\xFD!2A\0!\x07 	At!\f@ \xFD\0@!0 \xFD\0\0!- \xFD\0`!. \xFD\0 !/ \n \xFD\0"1 \xFD\0P"3\xFD\xE4"4 \xFD\0p"5 \xFD\00"6\xFD\xE4"7\xFD\xE4\xFD\v \n - 0\xFD\xE4"8 / .\xFD\xE4"9\xFD\xE4\xFD\v\0 \n \fj"\r 1 3\xFD\xE5"1 2 / .\xFD\xE5\xFD\xE6".\xFD\xE4\xFD\v \r - 0\xFD\xE5"0 2 5 6\xFD\xE5\xFD\xE6"-\xFD\xE4\xFD\v\0 \n j"\r 4 7\xFD\xE5\xFD\v \r 8 9\xFD\xE5\xFD\v\0 \n \vj"\r 1 .\xFD\xE5\xFD\v \r 0 -\xFD\xE5\xFD\v\0 A\x80j! \nA j!\n \x07Aj"\x07 	H\r\0\v\v\f\v !\n  Atj!A\0!\f \b 	l!	@ \bAN@ 	A\0L\r \bAt! \bAk! D\xFD!0@ \n 	Atj!  \bAt"j!A\0!\x07@  \x07Ar"Atj\xFD	\0\0!-  \x07Atj\xFD	\0\0!2  \x07At"\vj"\r\xFD\0!.  At"j"\xFD\0\0!/ \n \vj  \vj\xFD\0\0"1 \r\xFD\0\0"3\xFD\xE4\xFD\v\0 \n j \xFD\0\0 \r\xFD\0\xFD\xE4\xFD\v\0 \v j"\v 2 / .\xFD\xE5".\xFD\xE6 1 3\xFD\xE5"/ 0 -\xFD\xE6 2\xFD\r\0\0\0\0"-\xFD\xE6\xFD\xE4\xFD\v \v / 2\xFD\xE6 . -\xFD\xE6\xFD\xE5\xFD\v\0 \x07Aj"\x07 H\r\0\v  j! \n j!\n \b \fj"\f 	H\r\0\v\f\v 	A\0L\r\0 \bAt!A\0!\v@ \n \xFD\0\0  \bAt"\fj"\x07\xFD\0\0\xFD\xE4\xFD\v\0 \n 	Atj"\r \xFD\0\0 \x07\xFD\0\0\xFD\xE5\xFD\v\0 \n \xFD\0 \x07\xFD\0\xFD\xE4\xFD\v \r \xFD\0 \x07\xFD\0\xFD\xE5\xFD\v  j! \n \fj!\n \b \vj"\v 	H\r\0\v\v\f\v !\n  Atj"\x07!\r \x07 \bAtj!A\0!@ \bAN@ \b 	l"\vA\0J@ \bA0l! \vAt! \bAt! \bAk! DC\xD7\xB3]?\x94\xFD!2@ \n j!  j! \n \vAtj!\x1B  \bAt"j!A\0!	@ \n 	At"\x07j  \x07j\xFD\0\0"- \x07 j"\xFD\0\0 \x07 j"\f\xFD\0\0\xFD\xE4".\xFD\xE4\xFD\v\0 \n 	Ar"At"j  j\xFD\0\0"/ \xFD\0 \f\xFD\0\xFD\xE4"1\xFD\xE4\xFD\v\0  	At"j\xFD	\0!0  At"j*\0!E \x07 \x1Bj" / 1\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"/ 2 \xFD\0\0 \f\xFD\0\0\xFD\xE5\xFD\xE6"1\xFD\xE4"3 \r j\xFD	\0"4\xFD\xE6 - .\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"- 2 \xFD\0 \f\xFD\0\xFD\xE5\xFD\xE6".\xFD\xE5"5 D \r j*\0\x94\xFD"6\xFD\xE6\xFD\xE4\xFD\v  5 4\xFD\xE6 3 6\xFD\xE6\xFD\xE5\xFD\v\0 \x07 j"\x07 0 / 1\xFD\xE5"/\xFD\xE6 - .\xFD\xE4"- D E\x94\xFD".\xFD\xE6\xFD\xE4\xFD\v \x07 - 0\xFD\xE6 / .\xFD\xE6\xFD\xE5\xFD\v\0 	Aj"	 H\r\0\v  j! \n j!\n \b j" \vH\r\0\v\v\f\vA\xD5\nA\xC4	A\x9FA\xE4\b\0\0\v\f\vA\xDD\nA\xC4	A\x8C\bA\xF8\b\0\0\v 	!\n !	  Atj"\v! \v \bAt"\x07j"\v! \x07 \vj"\v! \x07 \vj!A\0!@ \bAN@ \nA\0J@ \bA\xD0\0l! \bA0l! \bAt! \bAt!\x1B \bAk! \b \nl"At! A0l! At! DCy?\x94\xFD!2 DCqxs?\x94\xFD!0@ 	 j! 	 j!  	 j!!  j!  j!"  \x1Bj!# 	 Atj!)  \bAt"*j!+A\0!\v@ # \vAt"\x07j"\f\xFD\0!- \x07 +j"\r\xFD\0!. \x07 j"$\xFD\0!/ \x07 "j"%\xFD\0!1 \x07 	j  \x07j",\xFD\0\0 \r\xFD\0\0": \f\xFD\0\0";\xFD\xE4"3 %\xFD\0\0"< $\xFD\0\0"=\xFD\xE4"4\xFD\xE4\xFD\xE4\xFD\v\0 	 \vAr"\rAt"\fj . -\xFD\xE4"5 1 /\xFD\xE4"6\xFD\xE4  \fj"$\xFD\0\0\xFD\xE4\xFD\v\0  \vAt"\fj\xFD	\0!7  \rAt"\rj*\0!E \f j\xFD	\0!8 \r j*\0!F \f j\xFD	\0!9 \r j*\0!G \x07 )j"% 0 : ;\xFD\xE5":\xFD\xE6 2 < =\xFD\xE5";\xFD\xE6\xFD\xE4"< 5\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 6\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5 $\xFD\0\0"=\xFD\xE4">\xFD\xE4"? \f j\xFD	\0"@\xFD\xE6 3\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 4\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5 ,\xFD\0\0"A\xFD\xE4"B 0 . -\xFD\xE5"-\xFD\xE6 2 1 /\xFD\xE5".\xFD\xE6\xFD\xE4"/\xFD\xE5"1 D \r j*\0\x94\xFD"C\xFD\xE6\xFD\xE4\xFD\v % 1 @\xFD\xE6 ? C\xFD\xE6\xFD\xE5\xFD\v\0 \x07 !j"\f 9 2 :\xFD\xE6 0 ;\xFD\xE6\xFD\xE5"1 = 6\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 5\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"5\xFD\xE4"6\xFD\xE6 A 4\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 3\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"3 2 -\xFD\xE6 0 .\xFD\xE6\xFD\xE5"-\xFD\xE5". D G\x94\xFD"4\xFD\xE6\xFD\xE4\xFD\v \f . 9\xFD\xE6 6 4\xFD\xE6\xFD\xE5\xFD\v\0 \x07  j"\f 8 5 1\xFD\xE5".\xFD\xE6 - 3\xFD\xE4"- D F\x94\xFD"1\xFD\xE6\xFD\xE4\xFD\v \f - 8\xFD\xE6 . 1\xFD\xE6\xFD\xE5\xFD\v\0 \x07 j"\x07 7 > <\xFD\xE5"-\xFD\xE6 / B\xFD\xE4". D E\x94\xFD"/\xFD\xE6\xFD\xE4\xFD\v \x07 . 7\xFD\xE6 - /\xFD\xE6\xFD\xE5\xFD\v\0 \vAj"\v H\r\0\v  j! 	 *j!	 Aj" \nG\r\0\v\v\f\vA\xD5\nA\xC4	A\x92A\xDA\b\0\0\v\v    F"\x1B!   \x1B! \b &Akl j!  \'G Aj! (!	\r\0\v\v \vA\xB9\nA\xC4	A\xF2\x07A\xF8\b\0\0\v\xD5{\x7F  G@ \0(lE@ \0(\0"\nA m!\f@@ @ \nAJ\r  \nAtjA\xE0\0k!  \nAmAtj"\vAj!\0 \v\xFD\0\0"!\f\v \nA N@  \fAtj!	A\0!@  At"\vj"\r  A\x07tj"\0\xFD\0\0" \0\xFD\0"\xFD\r\b	\n\v\x1B\f\r\xFD\v \r  \xFD\r\0\x07\xFD\v\0 	 \vj"\v \0\xFD\0@" \0\xFD\0P"\xFD\r\b	\n\v\x1B\f\r\xFD\v \v  \xFD\r\0\x07\xFD\v\0 Aj" \fG\r\0\v\v  \nAmAtjAk"\0 \xFD\0 " \xFD\00"\xFD\r\b	\n\v\x1B\f\r"  \xFD\r\0\x07"\xFD\r\0\x07\x1B\xFD\v\0 \nA\xC0\0H"\rE@ A j!A!\v@ ! \0"	A k"\0 \xFD\0\x80"\x07 \xFD\0\x90"\b\xFD\r\b	\n\v\x1B\f\r" \x07 \b\xFD\r\0\x07"\x07\xFD\r\0\x07\x1B\xFD\v\0 	Ak \x07 \xFD\r\0\x07\x1B\xFD\v\0 A\x80j! \vAj"\v \fG\r\0\v\v \0Ak  \xFD\r\0\x07\x1B\xFD\v\0  \nAtjAk" \xFD\0`" \xFD\0p"\xFD\r\b	\n\v\x1B\f\r"  \xFD\r\0\x07"\xFD\r\0\x07\x1B\xFD\v\0 \rE@ A\xE0\0j!A!@ ! "\0A k" \xFD\0\x80"\x07 \xFD\0\x90"\b\xFD\r\b	\n\v\x1B\f\r" \x07 \b\xFD\r\0\x07"\x07\xFD\r\0\x07\x1B\xFD\v\0 \0Ak \x07 \xFD\r\0\x07\x1B\xFD\v\0 A\x80j! Aj" \fG\r\0\v\v Ak  \xFD\r\0\x07\x1B\xFD\v\0\v  \fAtj!	A\0!@  A\x07tj"\0  At"\vj"\r\xFD\0\0" \r\xFD\0"\xFD\r\x07\f\r\xFD\v \0  \xFD\r\0\b	\n\v\x1B\xFD\v\0 \0 	 \vj"\v\xFD\0\0" \v\xFD\0"\xFD\r\x07\f\r\xFD\vP \0  \xFD\r\0\b	\n\v\x1B\xFD\v@ Aj" \fG\r\0\v  \nA|qj"	Aj!\0  \nAtjA\xE0\0k! 	\xFD\0\0!A\0!	 \nA\xC0\0I@ !\f\vA!\v !@ \0\xFD\0\0"\x07 \xFD\r\0\x07\x1B!  \0\xFD\0" \x07\xFD\r\0\x07\x1B"\x07 \xFD\r\x07\f\r\xFD\v  \x07 \xFD\r\0\b	\n\v\x1B\xFD\v\0 A\x80k! \0A j!\0A!	 \vAj"\v \fG\r\0\v\v   \0\xFD\0\0"\xFD\r\0\x07\x1B"  \xFD\r\0\x07\x1B"\xFD\r\x07\f\r\xFD\v   \xFD\r\0\b	\n\v\x1B\xFD\v\0  \nAtjA k!  \nAlAmAtj"\0Aj! \0\xFD\0\0!@ 	E@ !\f\vA! !@ \xFD\0\0"\x07 \xFD\r\0\x07\x1B!  \xFD\0" \x07\xFD\r\0\x07\x1B"\x07 \xFD\r\x07\f\r\xFD\v  \x07 \xFD\r\0\b	\n\v\x1B\xFD\v\0 A\x80k! A j! Aj" \fG\r\0\v\v   \xFD\0\0"\xFD\r\0\x07\x1B"  \xFD\r\0\x07\x1B"\xFD\r\x07\f\r\xFD\v   \xFD\r\0\b	\n\v\x1B\xFD\v\0\v \0(!	@ @ 	A\0L\r 	Av!A\0!\0@  \0Atj"\n  \0Aq l \0AvjAtj"\f\xFD\0\0" \f\xFD\0"\xFD\r\x07\f\r\xFD\v \n  \xFD\r\0\b	\n\v\x1B\xFD\v\0 \0Aj"\0 	G\r\0\v\f\v 	A\0L\r\0 	Av!A\0!\0@  \0Aq l \0AvjAtj"\n  \0Atj"\f\xFD\0\0" \f\xFD\0"\xFD\r\0\x07\xFD\v\0 \n  \xFD\r\b	\n\v\x1B\f\r\xFD\v \0Aj"\0 	G\r\0\v\v\vA\xA4\bA\xC4	A\x8A	A\x8C	\0\0\v\xBC\x7F|#\0Ak"\v$\0@ \0\xBC"A\xFF\xFF\xFF\xFF\x07q"A\xDA\x9F\xA4\xEEM@  \0\xBB" D\x83\xC8\xC9m0_\xE4?\xA2D\0\0\0\0\0\x008C\xA0D\0\0\0\0\0\x008\xC3\xA0"D\0\0\0P\xFB!\xF9\xBF\xA2\xA0 Dcba\xB4Q\xBE\xA2\xA0"9\0 \xFC! D\0\0\0`\xFB!\xE9\xBFc@   D\0\0\0\0\0\0\xF0\xBF\xA0"D\0\0\0P\xFB!\xF9\xBF\xA2\xA0 Dcba\xB4Q\xBE\xA2\xA09\0 Ak!\f\v D\0\0\0`\xFB!\xE9?dE\r   D\0\0\0\0\0\0\xF0?\xA0"D\0\0\0P\xFB!\xF9\xBF\xA2\xA0 Dcba\xB4Q\xBE\xA2\xA09\0 Aj!\f\v A\x80\x80\x80\xFC\x07O@  \0 \0\x93\xBB9\0A\0!\f\v \v  AvA\x96k"Atk\xBE\xBB9\b \vA\bj!\n#\0A\xB0k"$\0  AkAm"A\0 A\0J\x1B"Ahlj!	A\x90\v(\0"\bA\0N@ \bAj! !@ A\xC0j Atj A\0H|D\0\0\0\0\0\0\0\0 At(\xA0\v\xB7\v9\0 Aj! Aj" G\r\0\v\v 	Ak!\x07A\0! \bA\0 \bA\0J\x1B!@A\0!D\0\0\0\0\0\0\0\0!@ \n Atj+\0 A\xC0j  kAtj+\0\xA2 \xA0! Aj"AG\r\0\v  Atj 9\0  F Aj!E\r\0\vA/ 	k!A0 	k! AtA\xA0\vj! \b!@@  Atj+\0!A\0! ! A\0J@@ A\xE0j Atj D\0\0\0\0\0\0p>\xA2\xFC\xB7"D\0\0\0\0\0\0p\xC1\xA2 \xA0\xFC6\0  AtjA\bk+\0 \xA0! Ak! Aj" G\r\0\v\v  \x07\b" D\0\0\0\0\0\0\xC0?\xA2\x9CD\0\0\0\0\0\0 \xC0\xA2\xA0" \xFC"\f\xB7\xA1!@@@\x7F \x07A\0L"E@ At j" (\xDC"  u" tk"6\xDC  \fj!\f  u\f\v \x07\r At j(\xDCAu\v"\rA\0L\r\f\vA!\r D\0\0\0\0\0\0\xE0?f\r\0A\0!\r\f\vA\0!A\0!A! A\0J@@ A\xE0j Atj"(\0!\x7F@  \x7FA\xFF\xFF\xFF\x07 E\rA\x80\x80\x80\b\v k6\0A!A\0\f\vA\0!A\v! Aj" G\r\0\v\v@ \r\0A\xFF\xFF\xFF!@@ \x07Ak\0\vA\xFF\xFF\xFF!\v At j" (\xDC q6\xDC\v \fAj!\f \rAG\r\0D\0\0\0\0\0\0\xF0? \xA1!A!\r \r\0 D\0\0\0\0\0\0\xF0? \x07\b\xA1!\v D\0\0\0\0\0\0\0\0a@A\0! !@  \bL\r\0@ A\xE0j Ak"Atj(\0 r!  \bJ\r\0\v E\r\0@ \x07Ak!\x07 A\xE0j Ak"Atj(\0E\r\0\v\f\vA!@ "Aj! A\xE0j \b kAtj(\0E\r\0\v  j!@ A\xC0j Aj"Atj  Atj(\0\xB79\0A\0!D\0\0\0\0\0\0\0\0!@ \n Atj+\0 A\xC0j  kAtj+\0\xA2 \xA0! Aj"AG\r\0\v  Atj 9\0  H\r\0\v !\f\v\v@ A 	k\b"D\0\0\0\0\0\0pAf@ A\xE0j Atj D\0\0\0\0\0\0p>\xA2\xFC"\xB7D\0\0\0\0\0\0p\xC1\xA2 \xA0\xFC6\0 Aj! 	!\x07\f\v \xFC!\v A\xE0j Atj 6\0\vD\0\0\0\0\0\0\xF0? \x07\b! A\0N@ !@  "Atj  A\xE0j Atj(\0\xB7\xA29\0 Ak! D\0\0\0\0\0\0p>\xA2! \r\0\v !@@ \b  k"  \bJ\x1B"\x07A\0H@D\0\0\0\0\0\0\0\0!\f\v  Atj!	A\0!D\0\0\0\0\0\0\0\0!@ At"\n+\xF0  	 \nj+\0\xA2 \xA0!  \x07G Aj!\r\0\v\v A\xA0j Atj 9\0 A\0J Ak!\r\0\v\vD\0\0\0\0\0\0\0\0! A\0N@@ "Ak!  A\xA0j Atj+\0\xA0! \r\0\v\v \v \x9A  \r\x1B9\0 A\xB0j$\0 \fA\x07q! \v+\0! A\0H@  \x9A9\0A\0 k!\f\v  9\0\v \vAj$\0 \v\xF9r*\x7F{	}@#\0Ak"$\0 \0"(\f!\0 A ("At" \x1BAtk""$\0   " \x1B"6\f  "6\b@@@@ "" rAqE@ A\bj!% \0Aq!\0@ E@   \0\x1B!@ (lE@  \x7F (x!@   \0\x1B" F\r\0     F\x1B"F\r\0 %("A\0J@ Ak!A!\0 !@   m" %  \0"\x07kAtj(\b"\0Aklk!  \0m!@@@@@@ \0Ak\0\v A\0L\r  Atj" At"\0j"\f \0j"\n \0j!\r  A\xA0\x7Flj"\bAk!   A\x7FslAtj"Ak! Al!\v At!A!\0 At! Al!@ \b \0Al"	Aj lAtj  \0 j lAtj\xFD\0\0"/  \0 j lAtj\xFD\0\0"1  \0 j lAtj\xFD\0\0"3\xFD\xE4"0  \0 j lAtj\xFD\0\0"4  \0 \vj lAtj\xFD\0\0"6\xFD\xE4"2\xFD\xE4\xFD\xE4\xFD\v\0  	Aj lAt"j / 0\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 2\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4\xFD\v\0 \b j 1 3\xFD\xE5"1\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6 4 6\xFD\xE5"3\xFD\fy?y?y?y?\xFD\xE6\xFD\xE4\xFD\v\0  	Aj lAt"	j / 2\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 0\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4\xFD\v\0 \b 	j 1\xFD\fy?y?y?y?\xFD\xE6 3\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5\xFD\v\0 \0 G \0Aj!\0\r\0\v AF\r AH\r Aj!\x1BA!@   j lAtj!   j lAtj!    j lAtj!!   \vj lAtj!&   j lAtj!\'  Al"\0Aj lAtj!(  \0Aj lAtj!)  \0Aj lAtj!*A!\b  \0Aj lAtj!+  \0Aj lAtj!,@ , \bAt"\0j"#Ak \0 j"-Ak\xFD\0\0"/ \f \bAt"A\bk"	j\xFD	\0\0"3 \0 &j"$\xFD\0\0"4\xFD\xE6 \f A\fk"j\xFD	\0\0"6 $Ak\xFD\0\0"5\xFD\xE6\xFD\xE4": 	 \nj\xFD	\0\0"7 \0 !j"$\xFD\0\0"8\xFD\xE6 \n j\xFD	\0\0"9 $Ak\xFD\0\0";\xFD\xE6\xFD\xE4"<\xFD\xE4"0 	 j\xFD	\0\0"= \0 \'j"$\xFD\0\0">\xFD\xE6  j\xFD	\0\0"? $Ak\xFD\0\0"@\xFD\xE6\xFD\xE4"A 	 \rj\xFD	\0\0"B \0  j"	\xFD\0\0"C\xFD\xE6 \r j\xFD	\0\0"D 	Ak\xFD\0\0"E\xFD\xE6\xFD\xE4"F\xFD\xE4"2\xFD\xE4\xFD\xE4\xFD\v\0 # -\xFD\0\0"1 3 5\xFD\xE6 6 4\xFD\xE6\xFD\xE5"6 7 ;\xFD\xE6 9 8\xFD\xE6\xFD\xE5"5\xFD\xE4"3 = @\xFD\xE6 ? >\xFD\xE6\xFD\xE5"7 B E\xFD\xE6 D C\xFD\xE6\xFD\xE5"8\xFD\xE4"4\xFD\xE4\xFD\xE5\xFD\v\0 \0 +j"	Ak / 2\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 0\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"9 6 5\xFD\xE5"6\xFD\fy?y?y?y?\xFD\xE6 7 8\xFD\xE5"5\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE4"7\xFD\xE5\xFD\v\0 * \x1B \bkAt"j"#Ak 7 9\xFD\xE4\xFD\v\0 	 < :\xFD\xE5":\xFD\fy?y?y?y?\xFD\xE6 F A\xFD\xE5"7\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE4"8 1 4\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 3\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE5"9\xFD\xE4\xFD\v\0 # 8 9\xFD\xE5\xFD\v\0 \0 )j"\0Ak / 0\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 2\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"/ 5\xFD\fy?y?y?y?\xFD\xE6 6\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5"0\xFD\xE5\xFD\v\0  (j"	Ak 0 /\xFD\xE4\xFD\v\0 \0 7\xFD\fy?y?y?y?\xFD\xE6 :\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5"/ 1 3\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 4\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE5"0\xFD\xE4\xFD\v\0 	 / 0\xFD\xE5\xFD\v\0 \bAj"\b L\r\0\v  F Aj!E\r\0\v\f\v A\0L\r  Atj" Atj!\b At!	  AtjAk!A\0!\0@  \0Al" lAtj  \0 lAtj\xFD\0\0"/  \0 j lAtj\xFD\0\0"0  \0 	j lAtj\xFD\0\0"2\xFD\xE4"1\xFD\xE4\xFD\v\0  Aj lAtj 2 0\xFD\xE5\xFD\f\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xFD\xE6\xFD\v\0  Aj lAtj / 1\xFD\f\0\0\0\xBF\0\0\0\xBF\0\0\0\xBF\0\0\0\xBF\xFD\xE6\xFD\xE4\xFD\v\0 \0Aj"\0 G\r\0\vA\0! AH\r@A!\0  	j lAt!  j lAt!  lAt!\f Al"\n lAt!\r \nAj lAt!\v \nAj lAt!@  \0Ak"At"\nj"\x1B \rj  \nj"\n \fj\xFD\0\0"/ \n j\xFD\0\0"0  \0AtA\bk"j\xFD	\0\0"2\xFD\xE6  \0At" j" j\xFD\0\0"1  At"j\xFD	\0\0"3\xFD\xE6\xFD\xE4"4 \n j\xFD\0\0"6 \b j\xFD	\0\0"5\xFD\xE6  j\xFD\0\0": \b j\xFD	\0\0"7\xFD\xE6\xFD\xE4"8\xFD\xE4"9\xFD\xE4\xFD\v\0   j"\n \rj \f j\xFD\0\0"; 1 2\xFD\xE6 0 3\xFD\xE6\xFD\xE5"0 : 5\xFD\xE6 6 7\xFD\xE6\xFD\xE5"2\xFD\xE4"1\xFD\xE4\xFD\v\0 \v \x1Bj 0 2\xFD\xE5\xFD\f\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xFD\xE6"0 / 9\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"/\xFD\xE4\xFD\v\0   \0kAtj j"Ak / 0\xFD\xE5\xFD\v\0 \n \vj 8 4\xFD\xE5\xFD\f\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xFD\xE6"/ ; 1\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"0\xFD\xE4\xFD\v\0  / 0\xFD\xE5\xFD\v\0 \0Aj"\0 H\r\0\v Aj" G\r\0\v\f\v !\0  l"A\0J@A\0!@  Atj \0 Atj"\xFD\0\0"/  Atj\xFD\0\0"0\xFD\xE4\xFD\v\0   j"AtjAk / 0\xFD\xE5\xFD\v\0  H\r\0\v\v  Atj!\b@ AH\r\0 AG@ A\0J@A\0!@  j"At!  Atj!	 \0 Atj!A!@  Ak"\fAt"\nj"\r\xFD\0\0!/ 	 At"\vj \v j"\v\xFD\0\0"0 \v At"j\xFD\0\0"2 \b AtjA\bk\xFD	\0\0"1\xFD\xE6 \r j\xFD\0\0"3 \b \fAtj\xFD	\0\0"4\xFD\xE6\xFD\xE5"6\xFD\xE4\xFD\v\0   kAtj"\f 6 0\xFD\xE5\xFD\v\0 	 \nj / 2 4\xFD\xE6 3 1\xFD\xE6\xFD\xE4"0\xFD\xE4\xFD\v\0 \fAk / 0\xFD\xE5\xFD\v\0 Aj" H\r\0\v " H\r\0\v\v Aq\r\v A\0L\r\0  At"j! \0 j AtjAk!\bA\0!@  Atj"	 \b Atj\xFD\0\0\xFD\xE1\xFD\v\0 	Ak \0  j"AtjAk\xFD\0\0\xFD\v\0  H\r\0\v\v\f\vA\xDD\nA\xC4	A\xCBA\xEE\b\0\0\v  Atj"\0! \0 At"\bj"	!  l"A\0J@  At"\fj!\n At!\r At!\v A0l! At! !\0 !@ \0 j\xFD\0\0!/ \0 \fj\xFD\0\0!0  \vj"Ak \0\xFD\0\0"2 \0 j\xFD\0\0"1\xFD\xE5\xFD\v\0  / 0\xFD\xE5\xFD\v\0  2 1\xFD\xE4"2 0 /\xFD\xE4"/\xFD\xE4\xFD\v\0  \rj"Ak 2 /\xFD\xE5\xFD\v\0 \0 Atj"\0 \nI\r\0\v\v \b 	j!\f@ AH\r\0@ AG@ A\0L\r A0l! At! Aj!\x1BA\0!\b A0l!\n At!\r@  \bAt"j!	 \x1B \bAtj!\0A!@ 	 Ak"Atj"  \0\xFD\0\0"/ \0 j"!\xFD\0\0"0  AtA\bk"\vj\xFD	\0\0"2\xFD\xE6 !\xFD\0"1  At"j\xFD	\0\0"3\xFD\xE6\xFD\xE4"4\xFD\xE4"6 \0 Atj"!\xFD\0\0"5 \v j\xFD	\0\0":\xFD\xE6 !\xFD\0"7  j\xFD	\0\0"8\xFD\xE6\xFD\xE4"9 \0 j"!\xFD\0\0"; \v \fj\xFD	\0\0"<\xFD\xE6 !\xFD\0"= \f j\xFD	\0\0">\xFD\xE6\xFD\xE4"?\xFD\xE4"@\xFD\xE4\xFD\v\0   kAt"\vj jAk" \nj 6 @\xFD\xE5\xFD\v\0 \r  j / 4\xFD\xE5"/ 7 :\xFD\xE6 5 8\xFD\xE6\xFD\xE5"4 = <\xFD\xE6 ; >\xFD\xE6\xFD\xE5"6\xFD\xE5"5\xFD\xE4\xFD\v\0  At" j / 5\xFD\xE5\xFD\v\0 	 Atj" 4 6\xFD\xE4"/ 1 2\xFD\xE6 0 3\xFD\xE6\xFD\xE5"0 \0\xFD\0"2\xFD\xE4"1\xFD\xE4\xFD\v\0 	 \vj"\v \nj / 1\xFD\xE5\xFD\v\0 \r j ? 9\xFD\xE5"/ 2 0\xFD\xE5"0\xFD\xE4\xFD\v\0 \v  j / 0\xFD\xE5\xFD\v\0 \0A j!\0 Aj" H\r\0\v  \bj"\b H\r\0\v AqE\r\f\v A\0L\r\v A0l! At!\b At!	 A0l!  At"Ak"\0j!\f \0 j!\nA\0!\0@ \n \0Atj" 	j\xFD\0\0!/ \f \0At"\rj"\v \xFD\0\0"0  j\xFD\0\0"2  Atj\xFD\0\0"1\xFD\xE5\xFD\f\xF35\xBF\xF35\xBF\xF35\xBF\xF35\xBF\xFD\xE6"3\xFD\xE4\xFD\v\0 \b \vj 0 3\xFD\xE5\xFD\v\0  \rj" j 1 2\xFD\xE4\xFD\f\xF35\xBF\xF35\xBF\xF35\xBF\xF35\xBF\xFD\xE6"0 /\xFD\xE5\xFD\v\0  j 0 /\xFD\xE4\xFD\v\0 \0 j"\0 H\r\0\v\v\v    F"\0\x1B!   \0\x1B! \x07Aj!\0 \x07 G\r\0\v\v \f\vA\xB9\nA\xC4	A\xB0A\xEE\b\0\0\v G"\x1B! (t!   \x1B"\0 G@  AtjAk\xFD\0\0!/ \xFD\0p!2 \xFD\0\0!0 \0 \xFD\00"1\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 \xFD\00"3\xFD\r\b	\n\v\x1B\f\r"4 \xFD\0"6 \xFD\0P"5\xFD\r\b	\n\v\x1B\f\r":\xFD\r\0\x07"7\xFD\xE6 \xFD\0 "8\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 \xFD\0@"9\xFD\r\b	\n\v\x1B\f\r"; \xFD\0 "< \xFD\0`"=\xFD\r\b	\n\v\x1B\f\r">\xFD\r\0\x07"?\xFD\xE6\xFD\xE4"@\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 9\xFD\r\0\x07"9 < =\xFD\r\0\x07"<\xFD\r\0\x07"=\xFD\xE4"A \xFD\0"B\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 3\xFD\r\0\x07"3 6 5\xFD\r\0\x07"6\xFD\r\b	\n\v\x1B\f\r"5\xFD\xE6 \xFD\0\0"C 9 <\xFD\r\b	\n\v\x1B\f\r"9\xFD\xE6\xFD\xE4"< \xFD\0P"D 4 :\xFD\r\b	\n\v\x1B\f\r"4\xFD\xE6 \xFD\0@": ; >\xFD\r\b	\n\v\x1B\f\r";\xFD\xE6\xFD\xE4">\xFD\xE4"E\xFD\xE4\xFD\v \0 3 6\xFD\r\0\x07"3 8 7\xFD\xE6 1 ?\xFD\xE6\xFD\xE5"1\xFD\xE5"6 > <\xFD\xE5"7\xFD\xE5\xFD\v@ \0 6 7\xFD\xE4\xFD\v  \0 : 4\xFD\xE6 D ;\xFD\xE6\xFD\xE5"4 C 5\xFD\xE6 B 9\xFD\xE6\xFD\xE5"6\xFD\xE5"5 = @\xFD\xE5":\xFD\xE5\xFD\v0 \0 1 3\xFD\xE4"1 6 4\xFD\xE4"3\xFD\xE5\xFD\v` \0 E A\xFD\xE5\xFD\vp \0 : 5\xFD\xE4\xFD\vP \0 1 3\xFD\xE4\xFD\v\0 \0 0\xFD\0"G 0\xFD"H\x92"I 0\xFD"J 0\xFD"L\x92"M\x938 \0 G H\x938@ \0 /\xFD"G /\xFD"H\x93"KC\xF35?\x94 /\xFD\0"N\x928  \0 G H\x92C\xF35\xBF\x94"G /\xFD"H\x9380 \0 KC\xF35\xBF\x94 N\x928` \0 G H\x928p \0 L J\x938P \0 I M\x928\0 A\bN@A Am" AL\x1B!A!\x07@ 2  \x07A\x07t"j"\xFD\00"0\xFD\r\b	\n\v\x1B\f\r!/ 2 0\xFD\r\0\x07!0 \xFD\0p!2 \0 j"  \x07A\xE0\0lj"\xFD\0"1 0 \xFD\0"3 \xFD\0P"4\xFD\r\0\x07"6\xFD\r\b	\n\v\x1B\f\r"5\xFD\xE6 \xFD\0\0": \xFD\0\0"7 \xFD\0@"8\xFD\r\0\x07"9 \xFD\0 "; \xFD\0`"<\xFD\r\0\x07"=\xFD\r\b	\n\v\x1B\f\r">\xFD\xE6\xFD\xE4"? \xFD\0P"@ / 3 4\xFD\r\b	\n\v\x1B\f\r"3\xFD\r\b	\n\v\x1B\f\r"4\xFD\xE6 \xFD\0@"A 7 8\xFD\r\b	\n\v\x1B\f\r"7 ; <\xFD\r\b	\n\v\x1B\f\r"8\xFD\r\b	\n\v\x1B\f\r";\xFD\xE6\xFD\xE4"<\xFD\xE4"B \xFD\00"C / 3\xFD\r\0\x07"/\xFD\xE6 \xFD\0 "3 7 8\xFD\r\0\x07"7\xFD\xE6\xFD\xE4"8 9 =\xFD\r\0\x07"9\xFD\xE4"=\xFD\xE5\xFD\vp  3 /\xFD\xE6 C 7\xFD\xE6\xFD\xE5"/ 0 6\xFD\r\0\x07"0\xFD\xE4"3 : 5\xFD\xE6 1 >\xFD\xE6\xFD\xE5"1 A 4\xFD\xE6 @ ;\xFD\xE6\xFD\xE5"4\xFD\xE4"6\xFD\xE5\xFD\v`  9 8\xFD\xE5"5 4 1\xFD\xE5"1\xFD\xE4\xFD\vP  0 /\xFD\xE5"/ < ?\xFD\xE5"0\xFD\xE5\xFD\v@  1 5\xFD\xE5\xFD\v0  / 0\xFD\xE4\xFD\v   = B\xFD\xE4\xFD\v  3 6\xFD\xE4\xFD\v\0 \x07Aj"\x07 G\r\0\v\v\f\vA\xA4\bA\xC4	A\xBC\nA\xFF	\0\0\v A\0J@A\0!@  At"j  "j\xFD\0\0"/ " Ar"j\xFD\0\0"0\xFD\r\0\b	\n\v\x1B\xFD\v\0  j / 0\xFD\r\x07\f\r\xFD\v\0 Aj" G\r\0\v\v     \0\x1B  (x %A\x7F\f  F\r G"\0! AH\r\0 Am!\x07   \x1B! (t!   \0\x1B!A\0!@   A\x07tj"\0\xFD\0"/ \0\xFD\0P"0\xFD\r\0\x07"2 \0\xFD\00"1 \0\xFD\0p"3\xFD\r\0\x07"4\xFD\r\0\x07"6  A\xE0\0lj"\xFD\00"5 \0\xFD\0\0": \0\xFD\0@"7\xFD\r\b	\n\v\x1B\f\r"8 \0\xFD\0 "9 \0\xFD\0`";\xFD\r\b	\n\v\x1B\f\r"<\xFD\r\0\x07"=\xFD\xE6 \xFD\0 "> / 0\xFD\r\b	\n\v\x1B\f\r"/ 1 3\xFD\r\b	\n\v\x1B\f\r"0\xFD\r\0\x07"1\xFD\xE6\xFD\xE4"3\xFD\xE5"? \xFD\0\0"@ : 7\xFD\r\0\x07": 9 ;\xFD\r\0\x07"7\xFD\r\b	\n\v\x1B\f\r"9\xFD\xE6 \xFD\0"; 2 4\xFD\r\b	\n\v\x1B\f\r"2\xFD\xE6\xFD\xE5"4 \xFD\0@"A 8 <\xFD\r\b	\n\v\x1B\f\r"8\xFD\xE6 \xFD\0P"< / 0\xFD\r\b	\n\v\x1B\f\r"/\xFD\xE6\xFD\xE5"0\xFD\xE5"B\xFD\xE4\xFD\vp  : 7\xFD\r\0\x07": > =\xFD\xE6 5 1\xFD\xE6\xFD\xE5"1\xFD\xE5"5 ; 9\xFD\xE6 @ 2\xFD\xE6\xFD\xE4"2 < 8\xFD\xE6 A /\xFD\xE6\xFD\xE4"/\xFD\xE5"7\xFD\xE5\xFD\v`  3 6\xFD\xE4"3 2 /\xFD\xE4"/\xFD\xE5\xFD\vP  1 :\xFD\xE4"2 4 0\xFD\xE4"0\xFD\xE5\xFD\v@  ? B\xFD\xE5\xFD\v0  5 7\xFD\xE4\xFD\v   3 /\xFD\xE4\xFD\v  2 0\xFD\xE4\xFD\v\0 A\x80j! Aj" \x07G\r\0\v\v    \x1B A\fj A\bj \x1B(\0A\0\r\f\v  "   "   \0\x1BG \0s"\0\x1B"A\r A\bj \0EAtj(\0!\0 (t! (lE@@ \0 G@ *p!G *`!H *P!I *@!J *0!L * !M *!K *\0!N \0 \xFD\0"/ \xFD\0p"0\xFD\xE5"2 \xFD\00"1 \xFD\0P"3\xFD\xE5"4\xFD\xE5"6 4 2\xFD\xE4"2 \xFD\0 "4\xFD\xE6 \xFD\0\0"5 \xFD\0`":\xFD\xE4"7 \xFD\0 "8 \xFD\0@"9\xFD\xE4";\xFD\xE5"< \xFD\00"=\xFD\xE6\xFD\xE5">\xFD\r\b	\n\v\x1B\f\r"? / 0\xFD\xE4"/ 8 9\xFD\xE5"0\xFD\xE5"8 \xFD\0\0"9\xFD\xE6 5 :\xFD\xE5"5 1 3\xFD\xE4"1\xFD\xE5"3 \xFD\0":\xFD\xE6\xFD\xE5"@ 0 /\xFD\xE4"/ \xFD\0@"0\xFD\xE6 1 5\xFD\xE4"1 \xFD\0P"5\xFD\xE6\xFD\xE5"A\xFD\r\b	\n\v\x1B\f\r"B\xFD\r\b	\n\v\x1B\f\r\xFD\v` \0 ; 7\xFD\xE4"7 2 =\xFD\xE6 < 4\xFD\xE6\xFD\xE4"2\xFD\r\b	\n\v\x1B\f\r"4 3 9\xFD\xE6 : 8\xFD\xE6\xFD\xE4"3 / 5\xFD\xE6 1 0\xFD\xE6\xFD\xE4"/\xFD\r\b	\n\v\x1B\f\r"0\xFD\r\b	\n\v\x1B\f\r\xFD\vP \0 ? B\xFD\r\0\x07\xFD\v@ \0 4 0\xFD\r\0\x07\xFD\v0 \0 6 >\xFD\r\0\x07 @ A\xFD\r\0\x07\xFD\r\b	\n\v\x1B\f\r\xFD\v  \0 7 2\xFD\r\0\x07 3 /\xFD\r\0\x07\xFD\r\b	\n\v\x1B\f\r\xFD\v A\x07J@A Am" AL\x1B! \0Ak!\bA!@ \b A\x07t"j"  j"\xFD\0"/ \xFD\0p"0\xFD\xE5"2 \xFD\00"1 \xFD\0P"3\xFD\xE5"4\xFD\xE5"6 4 2\xFD\xE4"2  A\xE0\0lj"\x07\xFD\0 "4\xFD\xE6 \xFD\0\0"5 \xFD\0`":\xFD\xE4"7 \xFD\0 "8 \xFD\0@"9\xFD\xE4";\xFD\xE5"< \x07\xFD\00"=\xFD\xE6\xFD\xE5">\xFD\r\b	\n\v\x1B\f\r"? / 0\xFD\xE4"/ 8 9\xFD\xE5"0\xFD\xE5"8 \x07\xFD\0\0"9\xFD\xE6 5 :\xFD\xE5"5 1 3\xFD\xE4"1\xFD\xE5"3 \x07\xFD\0":\xFD\xE6\xFD\xE5"@ 0 /\xFD\xE4"/ \x07\xFD\0@"0\xFD\xE6 1 5\xFD\xE4"1 \x07\xFD\0P"5\xFD\xE6\xFD\xE5"A\xFD\r\b	\n\v\x1B\f\r"B\xFD\r\b	\n\v\x1B\f\r\xFD\vp  ; 7\xFD\xE4"7 2 =\xFD\xE6 < 4\xFD\xE6\xFD\xE4"2\xFD\r\b	\n\v\x1B\f\r"4 3 9\xFD\xE6 : 8\xFD\xE6\xFD\xE4"3 / 5\xFD\xE6 1 0\xFD\xE6\xFD\xE4"/\xFD\r\b	\n\v\x1B\f\r"0\xFD\r\b	\n\v\x1B\f\r\xFD\v`  ? B\xFD\r\0\x07\xFD\vP  4 0\xFD\r\0\x07\xFD\v@  6 >\xFD\r\0\x07"0 @ A\xFD\r\0\x07"1\xFD\r\b	\n\v\x1B\f\r\xFD\v0  7 2\xFD\r\0\x07"2 3 /\xFD\r\0\x07"/\xFD\r\b	\n\v\x1B\f\r\xFD\v   0 1\xFD\r\0\x07\xFD\v  2 /\xFD\r\0\x07\xFD\v\0 Aj" G\r\0\v\v \0 I I\x92"I N K\x93"O\x928\f \0 N K\x92"K J J\x92"J\x938\b \0 O I\x938 \0 J K\x928\0 \0 Atj"Ak M H\x93"IC\xF3\xB5\xBF\x94 L G\x92C\xF3\xB5\xBF\x94"J\x928\0 A\bk G L\x93"G G\x928\0 A\fk IC\xF3\xB5?\x94 J\x928\0 Ak M H\x92"G G\x928\0\f\vA\xA4\bA\xC4	A\x96\vA\xC4\b\0\0\v\x7F (x!   \0 F\x1B" \0G@A! %("A\0J@A!@  % "Aj"Atj(\0" "\x07l"m!@@@@@@ Ak\0\v \x07A\0L\r  Atj" At"j" j"\f j!\n \0 A\xA0\x7Flj"\bAk!   \x07A\x7FslAtj"\0Ak! \x07Al!\r \x07At!\v \x07Al!A! \x07At!@ \b Al"Aj lAt"	j\xFD\0\0!/ \b Aj lAt"\x1Bj\xFD\0\0!0 \0  \x07j lAtj \b Aj lAtj\xFD\0\0"2  	j\xFD\0\0"1 1\xFD\xE4"1  \x1Bj\xFD\0\0"3 3\xFD\xE4"3\xFD\xE4\xFD\xE4\xFD\v\0 \0  j lAtj 2 1\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 3\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"4 / /\xFD\xE4"/\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6 0 0\xFD\xE4"0\xFD\fy?y?y?y?\xFD\xE6\xFD\xE4"6\xFD\xE5\xFD\v\0 \0  j lAtj 2 3\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 1\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"2 /\xFD\fy?y?y?y?\xFD\xE6 0\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5"/\xFD\xE5\xFD\v\0 \0  \vj lAtj / 2\xFD\xE4\xFD\v\0 \0  \rj lAtj 6 4\xFD\xE4\xFD\v\0  \x07G Aj!\r\0\v AF\r AH\r Aj!\x1BA!@   \rj lAtj!   \vj lAtj!    j lAtj!!   j lAtj!&   \x07j lAtj!\'  Al"\bAj lAtj!(  \bAj lAtj!)  \bAj lAtj!*  \bAj lAtj!+A!\0  \bAj lAtj!,@ , \0At"\bj"\xFD\0\0!/ + \x1B \0kAt"	j"#\xFD\0\0!0 \b *j"-\xFD\0\0!2 	 )j"	\xFD\0\0!1 \b \'j"$Ak \b (j".Ak\xFD\0\0"3 Ak\xFD\0\0"? #Ak\xFD\0\0"@\xFD\xE4"4 -Ak\xFD\0\0"A 	Ak\xFD\0\0"B\xFD\xE4"6\xFD\xE4\xFD\xE4\xFD\v\0 $ / 0\xFD\xE5"5 2 1\xFD\xE5":\xFD\xE4 .\xFD\0\0"7\xFD\xE4\xFD\v\0 \n \0At"	A\bk"j\xFD	\0\0!8 \n 	A\fk"	j\xFD	\0\0!9 \f j\xFD	\0\0!; 	 \fj\xFD	\0\0!<  j\xFD	\0\0!= 	 j\xFD	\0\0!> \b &j"# 3 4\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 6\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"C / 0\xFD\xE4"/\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6 2 1\xFD\xE4"0\xFD\fy?y?y?y?\xFD\xE6\xFD\xE4"2\xFD\xE5"1  j\xFD	\0\0"D\xFD\xE6 ? @\xFD\xE5"?\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6 A B\xFD\xE5"@\xFD\fy?y?y?y?\xFD\xE6\xFD\xE4"A 7 5\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 :\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"B\xFD\xE4"E 	 j\xFD	\0\0"F\xFD\xE6\xFD\xE4\xFD\v\0 #Ak 1 F\xFD\xE6 E D\xFD\xE6\xFD\xE5\xFD\v\0 \b !j" = 3 6\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 4\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"1 /\xFD\fy?y?y?y?\xFD\xE6 0\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5"/\xFD\xE5"0\xFD\xE6 > ?\xFD\fy?y?y?y?\xFD\xE6 @\xFD\fqxs?qxs?qxs?qxs?\xFD\xE6\xFD\xE5"3 7 :\xFD\fz7\x9E>z7\x9E>z7\x9E>z7\x9E>\xFD\xE6 5\xFD\f\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xBD\x1BO?\xFD\xE6\xFD\xE5\xFD\xE4"4\xFD\xE4"6\xFD\xE6\xFD\xE4\xFD\v\0 Ak 0 >\xFD\xE6 6 =\xFD\xE6\xFD\xE5\xFD\v\0 \b  j" ; / 1\xFD\xE4"/\xFD\xE6 < 4 3\xFD\xE5"0\xFD\xE6\xFD\xE4\xFD\v\0 Ak / <\xFD\xE6 0 ;\xFD\xE6\xFD\xE5\xFD\v\0 \b j"\b 8 2 C\xFD\xE4"/\xFD\xE6 9 B A\xFD\xE5"0\xFD\xE6\xFD\xE4\xFD\v\0 \bAk / 9\xFD\xE6 0 8\xFD\xE6\xFD\xE5\xFD\v\0 \0Aj"\0 L\r\0\v  \x07F Aj!E\r\0\v\f\v \x07A\0L\r  Atj"\b Atj! \x07At! \0 AtjAk!	A\0!@   lAtj \0 Al" lAtj\xFD\0\0"/ 	 Aj lAtj\xFD\0\0"0 0\xFD\xE4"0\xFD\xE4\xFD\v\0   \x07j lAtj / 0\xFD\f\0\0\0\xBF\0\0\0\xBF\0\0\0\xBF\0\0\0\xBF\xFD\xE6\xFD\xE4"/ \0 Aj lAtj\xFD\0\0\xFD\f\xD7\xB3\xDD?\xD7\xB3\xDD?\xD7\xB3\xDD?\xD7\xB3\xDD?\xFD\xE6"0\xFD\xE5\xFD\v\0   j lAtj / 0\xFD\xE4\xFD\v\0 Aj" \x07G\r\0\vA\0! AH\r@A! Al"	Aj lAt! 	Aj lAt!  	lAt!	  lAt!  \x07j lAt!\f  j lAt!\n@  Ak"At"\vj"\r j \0 \vj"\v 	j\xFD\0\0"/ \v j\xFD\0\0"0 \0  kAtj j"\x1BAk\xFD\0\0"2\xFD\xE4"1\xFD\xE4\xFD\v\0  At"j"\v j \0 j" 	j\xFD\0\0"3  j\xFD\0\0"4 \x1B\xFD\0\0"6\xFD\xE5"5\xFD\xE4\xFD\v\0 \f \rj / 1\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"/ 4 6\xFD\xE4\xFD\f\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xFD\xE6"1\xFD\xE5"4 \b AtA\bk"\x1Bj\xFD	\0\0"6\xFD\xE6 0 2\xFD\xE5\xFD\f\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xD7\xB3]?\xFD\xE6"0 3 5\xFD\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?\xFD\xE6\xFD\xE5"2\xFD\xE4"3 \b At"j\xFD	\0\0"5\xFD\xE6\xFD\xE5\xFD\v\0 \v \fj 4 5\xFD\xE6 3 6\xFD\xE6\xFD\xE4\xFD\v\0 \n \rj / 1\xFD\xE4"/  \x1Bj\xFD	\0\0"1\xFD\xE6 2 0\xFD\xE5"0  j\xFD	\0\0"2\xFD\xE6\xFD\xE5\xFD\v\0 \n \vj / 2\xFD\xE6 0 1\xFD\xE6\xFD\xE4\xFD\v\0 Aj" H\r\0\v Aj" \x07G\r\0\v\f\v \0!  \x07l"A\0J@A\0!\0@  \0Atj"\x07  \0Atj\xFD\0\0"/  \0 j"\0AtjAk\xFD\0\0"0\xFD\xE4\xFD\v\0 \x07 Atj / 0\xFD\xE5\xFD\v\0 \0 H\r\0\v\v  Atj!\b@ AH\r\0 AG@ A\0J@A\0!\0@ \0 j"\x07At!	  \0Atj!  \0Atj!A!\0@  \0At"j\xFD\0\0!/  	 \0kAtj"\xFD\0\0!0  \0Ak"\fAt"\nj"\r \n j\xFD\0\0"2 Ak\xFD\0\0"1\xFD\xE4\xFD\v\0  j" / 0\xFD\xE5\xFD\v\0 \r At"j 2 1\xFD\xE5"2 \b \0AtjA\bk\xFD	\0\0"1\xFD\xE6 / 0\xFD\xE4"/ \b \fAtj\xFD	\0\0"0\xFD\xE6\xFD\xE5\xFD\v\0  j 2 0\xFD\xE6 / 1\xFD\xE6\xFD\xE4\xFD\v\0 \0Aj"\0 H\r\0\v \x07"\0 H\r\0\v\v Aq\r\v A\0L\r\0  Atj!A\0!\0@  \0Atj"\x07\xFD\0\0!/  \0 j"\0AtjAk"\b \x07Ak\xFD\0\0"0 0\xFD\xE4\xFD\v\0 \b Atj /\xFD\f\0\0\0\xC0\0\0\0\xC0\0\0\0\xC0\0\0\0\xC0\xFD\xE6\xFD\v\0 \0 H\r\0\v\v\f\vA\xDD\nA\xC4	A\xF8A\x82	\0\0\v  Atj"!  At"\bj"!	  \x07l"A\0J@  At"j! A0l!\f At!\n At!\r At!\v \0! !\x07@  \rj"\xFD\0\0!/ \x07 \xFD\0\0"0  \vj"Ak\xFD\0\0"2\xFD\xE4"1 Ak\xFD\0\0"3 3\xFD\xE4"3\xFD\xE4\xFD\v\0 \x07 \nj 1 3\xFD\xE5\xFD\v\0 \x07 j 0 2\xFD\xE5"0 / /\xFD\xE4"/\xFD\xE5\xFD\v\0 \x07 \fj 0 /\xFD\xE4\xFD\v\0 \x07 Atj"\x07 I\r\0\v\v \b j!@ AH\r\0@ AG@ A\0L\r APl!\v At! At! \0Ak!A\0!\b@  \bAtj" Atj!\x1B  \bAtjAj!A!\x07@   \x07At"\fj"\n\xFD\0\0"/   \x07kAtj"\r\xFD\0\0"0\xFD\xE4"2 \f \x1Bj"\f\xFD\0\0"1   \x07kAtj"\xFD\0\0"3\xFD\xE4"4\xFD\xE4\xFD\v\0  \f\xFD\0"6 \xFD\0"5\xFD\xE5": \n\xFD\0"7 \r\xFD\0"8\xFD\xE5"9\xFD\xE4\xFD\v  At"\fj" / 0\xFD\xE5"/ 6 5\xFD\xE4"0\xFD\xE5"6  \x07At"\rAk"\nj\xFD	\0\0"5\xFD\xE6 1 3\xFD\xE5"1 7 8\xFD\xE4"3\xFD\xE4"7  \rA\bk"\rj\xFD	\0\0"8\xFD\xE6\xFD\xE4\xFD\v  6 8\xFD\xE6 7 5\xFD\xE6\xFD\xE5\xFD\v\0  \fj" 2 4\xFD\xE5"2 	 \nj\xFD	\0\0"4\xFD\xE6 9 :\xFD\xE5"6 	 \rj\xFD	\0\0"5\xFD\xE6\xFD\xE4\xFD\v  2 5\xFD\xE6 6 4\xFD\xE6\xFD\xE5\xFD\v\0  \fj" / 0\xFD\xE4"/ \n j\xFD	\0\0"0\xFD\xE6 3 1\xFD\xE5"2 \r j\xFD	\0\0"1\xFD\xE6\xFD\xE4\xFD\v  / 1\xFD\xE6 2 0\xFD\xE6\xFD\xE5\xFD\v\0  \vjA j! \x07Aj"\x07 H\r\0\v  \bj"\b H\r\0\v AqE\r\f\v A\0L\r\v A0l!\b At! \0 Atj!  AtjAk!	A\0!\x07@  \x07At jAt"j"\xFD\0\0!/ \0 j"\xFD\0\0!0 	 \x07Atj" Ak\xFD\0\0"2 Ak\xFD\0\0"1\xFD\xE4"3 3\xFD\xE4\xFD\v\0  Atj 0 /\xFD\xE4"3 2 1\xFD\xE5"2\xFD\xE5\xFD\f\xF3\xB5\xBF\xF3\xB5\xBF\xF3\xB5\xBF\xF3\xB5\xBF\xFD\xE6\xFD\v\0  j / 0\xFD\xE5"/ /\xFD\xE4\xFD\v\0  \bj 2 3\xFD\xE4\xFD\f\xF3\xB5\xBF\xF3\xB5\xBF\xF3\xB5\xBF\xF3\xB5\xBF\xFD\xE6\xFD\v\0  \x07j"\x07 H\r\0\v\v\v    F"\x1B!\0   \x1B! Ak l j!  G\r\0\v\v \0\f\vA\xA4\bA\xC4	A\xDFA\x82	\0\0\v G!\f\v \0 F\r AJ@ Am!A\0! \0!@   A\x07tj"\x07\xFD\0"/ \x07\xFD\0P"0\xFD\xE4"2 \x07\xFD\00"1 \x07\xFD\0p"3\xFD\xE4"4\xFD\xE4"6 2 4\xFD\xE5"2  A\xE0\0lj"\xFD\0 "4\xFD\xE6 \x07\xFD\0\0"5 \x07\xFD\0@":\xFD\xE4"7 \x07\xFD\0 "8 \x07\xFD\0`"9\xFD\xE4";\xFD\xE5"< \xFD\00"=\xFD\xE6\xFD\xE5">\xFD\r\b	\n\v\x1B\f\r"? / 0\xFD\xE5"/ 8 9\xFD\xE5"0\xFD\xE4"8 \xFD\0\0"9\xFD\xE6 \xFD\0"@ 5 :\xFD\xE5"5 1 3\xFD\xE5"1\xFD\xE5"3\xFD\xE6\xFD\xE5": / 0\xFD\xE5"/ \xFD\0@"0\xFD\xE6 5 1\xFD\xE4"1 \xFD\0P"5\xFD\xE6\xFD\xE5"A\xFD\r\b	\n\v\x1B\f\r"B\xFD\r\b	\n\v\x1B\f\r\xFD\vp  7 ;\xFD\xE4"7 2 =\xFD\xE6 < 4\xFD\xE6\xFD\xE4"2\xFD\r\b	\n\v\x1B\f\r"4 8 @\xFD\xE6 3 9\xFD\xE6\xFD\xE4"3 / 5\xFD\xE6 1 0\xFD\xE6\xFD\xE4"/\xFD\r\b	\n\v\x1B\f\r"0\xFD\r\b	\n\v\x1B\f\r\xFD\v`  ? B\xFD\r\0\x07\xFD\vP  4 0\xFD\r\0\x07\xFD\v@  6 >\xFD\r\0\x07"0 : A\xFD\r\0\x07"1\xFD\r\b	\n\v\x1B\f\r\xFD\v0  7 2\xFD\r\0\x07"2 3 /\xFD\r\0\x07"/\xFD\r\b	\n\v\x1B\f\r\xFD\v   0 1\xFD\r\0\x07\xFD\v  2 /\xFD\r\0\x07\xFD\v\0 A\x80j! Aj" G\r\0\v\v  \0   (x %A\f"\0 G! A\0L\r\0 A\fj A\bj \0 G\x1B(\0!A\0! AG@ Aq A\xFE\xFF\xFF\xFF\x07q!A\0!\x07@  Atj"\0 \0\xFD\0\0"/ \0\xFD\0"0\xFD\r\b	\n\v\x1B\f\r\xFD\v \0 / 0\xFD\r\0\x07\xFD\v\0 \0 \0\xFD\0 "/ \0\xFD\00"0\xFD\r\0\x07\xFD\v  \0 / 0\xFD\r\b	\n\v\x1B\f\r\xFD\v0 Aj! \x07Aj"\x07 G\r\0\vE\r\v  Atj"\0 \0\xFD\0\0"/ \0\xFD\0"0\xFD\r\b	\n\v\x1B\f\r\xFD\v \0 / 0\xFD\r\0\x07\xFD\v\0\v  A\bj Atj(\0"\0G@  "G\rA\0! A\0J@@ \0 At"Ar"j\xFD\0\0!/  j \0 j\xFD\0\0\xFD\v\0  j /\xFD\v\0 Aj" G\r\0\v\v A\bjA\0A \x1Bj(\0 G\r\v Aj$\0\f\vA\xDF\nA\xC4	A\xC7\vA\xAB	\0\0\vA\xA4\bA\xC4	A\xAF	A\xEB	\0\0\vA\xA4\bA\xC4	A\xDB	A\xAE\b\0\0\vA\x94\bA\xC4	A\xF4\vA\xAB	\0\0\vA\x80\bA\xC4	A\xFB\vA\xAB	\0\0\v\v\0 \0@ \0(p	 \0\x07\v\v\xC6"\x7F{\n}@@ \0A\0H\r\0@@@@@@@@@@ \0A\x81\x80\x80 I@@ E@ \0E\r\r \0AqE\r\f\r\v AG\r\0 \0E\r\f \0Aq\r\f\vA\xFC\0\n" 6l  \x006\0  \0 EvAv"6  At\v"6t  6p   ("AlAm"Atj"\v6x A\0J@ \0\xB3!&@  AqAtj AvA\xE0\0lj" \xB3"%C\xDB\xC9\xC0\x94 &\x95"$8\0  %C\xE4\xCB\x96\xC1\x94 &\x95"\'8P A@k \'8\0  %C\xDBI\xC1\x94 &\x95"%80  %8   $8 Aj" G\r\0\v\v Aj!\f Aj!\b A\bj! \0Av!\x07@ E@ \x07AF\rA\0!A\0! \x07! \0A\fq\r	 \bA6\0A! \0Av"AF\rA! \0Av"At G@A! !\f\n\v \fA6\0 AF\r\bA!  \0A\bv"AtG\r	 A6 AF@A!\f	\v \0A\nv"At G@A! !\f\n\vA! A6 AF\r\b \0A\fv"At G@A!\f\n\v A6  AF@A!\f	\v \0Av"At G@A! !\f\n\v A6$ AF@A!\f	\v \0Av"At G@A!\f\n\v A6( AF@A\x07!\f	\v \0Av"At G@A\x07! !\f\n\v A6, AF@A\b!\f	\v \0Av"At G@A\b!\f\n\v A60 AF@A	!\f	\v \0Av"At G@A	! !\f\n\v A64 AF@A\n!\f	\v \0Av"At G@A\n!\f\n\v A68 AF@A\v!\f	\v \0Av"At G@A\v! !\f\n\v A6< @A\f!\f	\v A6h B\x84\x80\x80\x80\xC0\x007` \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\vP A@k\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\v\0\f\vA! \x07AF@ B7\b\f\f\v \0An"Al \x07G@ \x07!\f\v \bA6\0 \x07AkAI@A!\f\v \0A\xE4\0n"Al G@A!\f\v \fA6\0 \x07AkAI@A!\f\v \0A\xF4n"Al G@A! !\f\v A6 \x07A\xFD\0kA\xFD\0I@A!\f\v \0A\xC4n"Al G@A!\f\v A6 \x07A\xF1kA\xF1I@A!\f\vA! \0A\xD4\xE1\0n"Al G@A! !\f\v A6  \x07A\xB5kA\xB5I\r  \0A\xA4\xE8n"AlG\r A6$ \x07A\x89\xFA\0kA\x89\xFA\0I@A!\f\v \0A\xB4\x89n"Al G@A! !\f\v A6( \x07A\xAD\xE2kA\xAD\xE2I@A\x07!\f\v \0A\x84\xAF\xDF\0n"Al G@A\x07!\f\v A6, \x07A\xE1\xEBkA\xE1\xEBI@A\b!\f\v \0A\x94\xEB\xDCn"Al G@A\b! !\f\v A60 \x07A\xE5\x9A\xF7\0kA\xE5\x9A\xF7\0I@A	!\f\vAA\0 \0A\xE3\x97\xD0K"\x1B G@A	!\f\v A64 @A\n!\f\v A6h \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\vX \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\vH \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\v8\f\r\v  6\f  \x076\b\f	\vA\xDD\nA\xC4	A\xAF\bA\x9B	\0\0\v AF\r@  An"AlG\r AF\r\v  AtjA6\b Aj! Ak !AO\r\0\v\v  6\f  \x076\b\f\v AF\r\0A  AL\x1B! !@ AqE@  F\r\n  AtjA6\b Aj"! Av"AG\r\f\v\vA  AL\x1B k!	A\0! !@ Aq\r  	F\r	  AtjA6\b @@ A\0L\r\0  jAt"E\r\0 \f \b \xFC\n\0\0\v \bA6\0\v Aj! Aj! AG Av!\r\0\v\v  6\f  \x076\b A\0L\r\vC\xDB\xC9@ \x07\xB3\x95!&  Atj"A\bj! Aj!\x1BA!\fA!A!@ \x07  \f"Aj"\fAtj(\0" "	l"m!@ AH\r\0 A\0L@ \v AtjAkB\x80\x80\x80\xFC7\0\f\vA At"Ar"\r \rAL\x1BAkAv"Aj!\n AM@ At!A! \nA\xFC\xFF\xFF\xFF\x07q"\bAt"Ar!A\0!@ \v At"j"AkB\x80\x80\x80\xFC7\0 &  	j"\xB2\x94!%A!@@ \rAH@A\0!\f\v  \x1Bj" j I@A\0!\f\v  j" j I@A\0!\f\v A\x81\x80\x80\x80J@A\0!\f\v  j! %\xFD!"\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@ "  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE\xFD\xFA\xFD\xE6"!\xFD\0"$!\' !\xFD"(!) !\xFD"*!+ !\xFD",!-  Atj" $\xFD (\xFD  *\xFD  ,\xFD "! \'\xFD )\xFD  +\xFD  -\xFD "#\xFD\r\b	\n\v\x1B\f\r\xFD\v  ! #\xFD\r\0\x07\xFD\v  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE!  Aj" \bG\r\0\v ! \b" \nF\r\v@ \v Atj % Aj"\xB3\x94"$8 \v Aj"Atj $8\0  L Aj!\r\0\v\v  Aj"G\r\0\v\f\v At!A! \nA\xFC\xFF\xFF\xFF\x07q"\bAt"Ar! \rAH! A\x81\x80\x80\x80J!A\0!@ \v At"j"\rA\x006\0 & 	 j"\xB2\x94!% \rAkA!@@\x7FA\0 \r\0A\0  \x1Bj" j I\r\0A\0  j" j I\r\0A\0 \r\0 Aj!  j! %\xFD!"\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@ "  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE\xFD\xFA\xFD\xE6"!\xFD\0"$!\' !\xFD"(!) !\xFD"*!+ !\xFD",!- \r Atj" $\xFD (\xFD  *\xFD  ,\xFD "! \'\xFD )\xFD  +\xFD  -\xFD "#\xFD\r\b	\n\v\x1B\f\r\xFD\v  ! #\xFD\r\0\x07\xFD\v "A\bj!  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE!  Aj" \bG\r\0\v \b \nF\r ! \b\v!@ \v Atj % Aj"\xB3\x94"\'"$8 \v Aj"Atj" \'8\0  L Aj!\r\0\v\f\v \v AtjA\bj! !\xFD!$\v $8\0 \r *\x008\0 Aj" G\r\0\v\v  G\r\0\v\f\v  6\f  \x076\b\f\vA k! !@@ AqE@  F\r\x07  AtjA6\b @  jAt"	@ \f \b 	\xFC\n\0\0\v \bA6\0\v Aj! Aj! AF Av!E\r\f\v\v AF\r\0A  AL\x1B!@ An"Al F@  F\r\x07  AtjA6\b Aj! Ak !AO\r\f\v\v AF\r\0A  AL\x1B!@  An"AlG\r  F\r  AtjA6\b Aj! Ak !AO\r\0\v\v  6\f  \x076\b AH\r\vC\xDB\xC9@ \x07\xB3\x95!%  AtjAj!A\0!A!A!\b@ \x07  Aj"Atj(\0" \b"l"\bm!	@ AH\r\0 	AH@ 	 Akl j!\f\v 	At!\x1B 	Ak"Aq!  Atj!A!\r Av"At! Aj"A\xFC\xFF\xFF\xFFq"\fAt!A\0! AI! A\xFF\xFF\xFF\xFFK!A\0!@ %  j"\xB2\x94!&A\0! !@@ \r\0   \x1Blj" j I\r\0 \r\0  j! \v Atj! &\xFD!"\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\0! @ "  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE\xFD\xFA\xFD\xE6"!\xFD\0"$!\' !\xFD"(!) !\xFD"*!+ !\xFD",!-  Atj"\n $\xFD (\xFD  *\xFD  ,\xFD "! \'\xFD )\xFD  +\xFD  -\xFD "#\xFD\r\b	\n\v\x1B\f\r\xFD\v \n ! #\xFD\r\0\x07\xFD\v\0  \xFD\f\0\0\0\0\0\0\0\0\0\0\0\0\xFD\xAE!  Aj" \fG\r\0\v \f" F\r\v@ @ !\f\v \v Atj"\n & Ar"\xB3\x94"$8 \n $8\0 Aj!\v  F\r\0@ \v Atj"\n & Aj"\xB3\x94"$8\f \n $8\b \n & Aj"\xB3\x94"$8 \n $8\0 Aj! !  G\r\0\v\v Aj!  	j! \rAj"\r G\r\0\v\v  G\r\0\v\vA! A\0L\r\0 Aj!A\0! AO@ A\xFC\xFF\xFF\xFF\x07q!\xFD\f\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@  Atj\xFD\0\0  \xFD\xB5!  Aj" G\r\0\v      \xFD\r\b	\n\v\f\r\0\0\xFD\xB5"     \xFD\r\x07\0\0\0\xFD\xB5\xFD\x1B\0!  F\r\v@  Atj(\0 l! Aj" G\r\0\v\v \0Av F@ \v 	 \x07\vA\0\vA\xA2\nA\xC4	A\x90\x07A\x93\n\0\0\v\0A\x9D\n\v\0A\v\0\v\v\xB6\0A\x80\b\v\x84buff[ib] == voutput\0finput==foutput\0in != out\0pffft_cplx_preprocess\0pffft_real_preprocess\0passf5_ps\0passf3_ps\0rfftf1_ps\0cfftf1_ps\0rfftb1_ps\0pffft_zreorder\0pffft_new_setup\0pffft_transform_internal\0.build/pffft-src/src/pffft_priv_impl.h\0pffft_cplx_finalize\0pffft_real_finalize\0decompose\0NEON\x002 + nf < IFAC_MAX_SIZE\0in != out && work1 != work2\0ido > 2\x000\0VALIGNED(finput) && VALIGNED(foutput)\0A\x90\v\v\xD7\0\0\0\0\0\0\0\0\0\0\0\0\x83\xF9\xA2\0DNn\0\xFC)\0\xD1W\'\0\xDD4\xF5\0b\xDB\xC0\0<\x99\x95\0A\x90C\0cQ\xFE\0\xBB\xDE\xAB\0\xB7a\xC5\0:n$\0\xD2MB\0I\xE0\0	\xEA.\0\x92\xD1\0\xEB\xFE\0)\xB1\0\xE8>\xA7\0\xF55\x82\0D\xBB.\0\x9C\xE9\x84\0\xB4&p\0A~_\0\xD6\x919\0S\x839\0\x9C\xF49\0\x8B_\x84\0(\xF9\xBD\0\xF8;\0\xDE\xFF\x97\0\x98\0/\xEF\0\nZ\x8B\0mm\0\xCF~6\0	\xCB\'\0FO\xB7\0\x9Ef?\0-\xEA_\0\xBA\'u\0\xE5\xEB\xC7\0={\xF1\0\xF79\x07\0\x92R\x8A\0\xFBk\xEA\0\xB1_\0\b]\x8D\x000V\0{\xFCF\0\xF0\xABk\0 \xBC\xCF\x006\xF4\x9A\0\xE3\xA9\0^a\x91\0\b\x1B\xE6\0\x85\x99e\0\xA0_\0\x8D@h\0\x80\xD8\xFF\0\'sM\01\0\xCAV\0\xC9\xA8s\0{\xE2`\0k\x8C\xC0\0\xC4G\0\xCDg\xC3\0	\xE8\xDC\0Y\x83*\0\x8Bv\xC4\0\xA6\x96\0D\xAF\xDD\0W\xD1\0\xA5>\0\x07\xFF\x003~?\0\xC22\xE8\0\x98O\xDE\0\xBB}2\0&=\xC3\0k\xEF\0\x9F\xF8^\x005:\0\x7F\xF2\xCA\0\xF1\x87\0|\x90!\0j$|\0\xD5n\xFA\x000-w\0;C\0\xB5\xC6\0\xC3\x9D\0\xAD\xC4\xC2\0,MA\0\f\0]\0\x86}F\0\xE3q-\0\x9B\xC6\x9A\x003b\0\0\xB4\xD2|\0\xB4\xA7\x97\x007U\xD5\0\xD7>\xF6\0\xA3\0Mv\xFC\0d\x9D*\0p\xD7\xAB\0c|\xF8\0z\xB0W\0\xE7\0\xC0IV\0;\xD6\xD9\0\xA7\x848\0$#\xCB\0\xD6\x8Aw\0ZT#\0\0\xB9\0\xF1\n\x1B\0\xCE\xDF\0\x9F1\xFF\0fj\0\x99Wa\0\xAC\xFBG\0~\x7F\xD8\0"e\xB7\x002\xE8\x89\0\xE6\xBF`\0\xEF\xC4\xCD\0l6	\0]?\xD4\0\xDE\xD7\0X;\xDE\0\xDE\x9B\x92\0\xD2"(\0(\x86\xE8\0\xE2XM\0\xC6\xCA2\0\b\xE3\0\xE0}\xCB\0\xC0P\0\xF3\xA7\0\xE0[\0.4\0\x83b\0\x83H\0\xF5\x8E[\0\xAD\xB0\x7F\0\xE9\xF2\0HJC\0g\xD3\0\xAA\xDD\xD8\0\xAE_B\0ja\xCE\0\n(\xA4\0\xD3\x99\xB4\0\xA6\xF2\0\\w\x7F\0\xA3\xC2\x83\0a<\x88\0\x8Asx\0\xAF\x8CZ\0o\xD7\xBD\0-\xA6c\0\xF4\xBF\xCB\0\x8D\x81\xEF\0&\xC1g\0U\xCAE\0\xCA\xD96\0(\xA8\xD2\0\xC2a\x8D\0\xC9w\0&\0F\x9B\0\xC4Y\xC4\0\xC8\xC5D\0M\xB2\x91\0\0\xF3\0\xD4C\xAD\0)I\xE5\0\xFD\xD5\0\0\xBE\xFC\0\x94\xCC\0p\xCE\xEE\0>\xF5\0\xEC\xF1\x80\0\xB3\xE7\xC3\0\xC7\xF8(\0\x93\x94\0\xC1q>\0.	\xB3\0\vE\xF3\0\x88\x9C\0\xAB {\0.\xB5\x9F\0G\x92\xC2\0{2/\0\fUm\0r\xA7\x90\0k\xE7\x001\xCB\x96\0yJ\0Ay\xE2\0\xF4\xDF\x89\0\xE8\x94\x97\0\xE2\xE6\x84\0\x991\x97\0\x88\xEDk\0__6\0\xBB\xFD\0H\x9A\xB4\0g\xA4l\0qrB\0\x8D]2\0\x9F\xB8\0\xBC\xE5	\0\x8D1%\0\xF7t9\x000\0\r\f\0K\bh\0,\xEEX\0G\xAA\x90\0t\xE7\0\xBD\xD6$\0\xF7}\xA6\0nHr\0\x9F\xEF\0\x8E\x94\xA6\0\xB4\x91\xF6\0\xD1SQ\0\xCF\n\xF2\0 \x983\0\xF5K~\0\xB2ch\0\xDD>_\0@]\0\x85\x89\x7F\0UR)\x007d\xC0\0m\xD8\x002H2\0[Lu\0Nq\xD4\0ETn\0\v	\xC1\0*\xF5i\0f\xD5\0\'\x07\x9D\0]P\0\xB4;\xDB\0\xEAv\xC5\0\x87\xF9\0Ik}\0\'\xBA\0\x96i)\0\xC6\xCC\xAC\0\xADT\0\x90\xE2j\0\x88\xD9\x89\0,rP\0\xA4\xBE\0w\x07\x94\0\xF30p\0\0\xFC\'\0\xEAq\xA8\0f\xC2I\0d\xE0=\0\x97\xDD\x83\0\xA3?\x97\0C\x94\xFD\0\r\x86\x8C\x001A\xDE\0\x929\x9D\0\xDDp\x8C\0\xB7\xE7\0\b\xDF;\07+\0\\\x80\xA0\0Z\x80\x93\0\x92\0\xE8\xD8\0l\x80\xAF\0\xDB\xFFK\x008\x90\0Yv\0b\xA5\0a\xCB\xBB\0\xC7\x89\xB9\0@\xBD\0\xD2\xF2\0Iu\'\0\xEB\xB6\xF6\0\xDB"\xBB\0\n\xAA\0\x89&/\0d\x83v\0	;3\0\x94\0Q:\xAA\0\xA3\xC2\0\xAF\xED\xAE\0\\&\0m\xC2M\0-z\x9C\0\xC0V\x97\0?\x83\0	\xF0\xF6\0+@\x8C\0m1\x99\x009\xB4\x07\0\f \0\xD8\xC3[\0\xF5\x92\xC4\0\xC6\xADK\0N\xCA\xA5\0\xA77\xCD\0\xE6\xA96\0\xAB\x92\x94\0\xDDBh\0c\xDE\0v\x8C\xEF\0h\x8BR\0\xFC\xDB7\0\xAE\xA1\xAB\0\xDF1\0\0\xAE\xA1\0\f\xFB\xDA\0dMf\0\xED\xB7\0)e0\0WV\xBF\0G\xFF:\0j\xF9\xB9\0u\xBE\xF3\0(\x93\xDF\0\xAB\x800\0f\x8C\xF6\0\xCB\0\xFA"\0\xD9\xE4\0=\xB3\xA4\0W\x1B\x8F\x006\xCD	\0NB\xE9\0\xBE\xA4\x003#\xB5\0\xF0\xAA\0Oe\xA8\0\xD2\xC1\xA5\0\v?\0[x\xCD\0#\xF9v\0{\x8B\0\x89r\0\xC6\xA6S\0on\xE2\0\xEF\xEB\0\0\x9BJX\0\xC4\xDA\xB7\0\xAAf\xBA\0v\xCF\xCF\0\xD1\0\xB1\xF1-\0\x8C\x99\xC1\0\xC3\xADw\0\x86H\xDA\0\xF7]\xA0\0\xC6\x80\xF4\0\xAC\xF0/\0\xDD\xEC\x9A\0?\\\xBC\0\xD0\xDEm\0\x90\xC7\0*\xDB\xB6\0\xA3%:\0\0\xAF\x9A\0\xADS\x93\0\xB6W\0)-\xB4\0K\x80~\0\xDA\x07\xA7\0v\xAA\0{Y\xA1\0*\0\xDC\xB7-\0\xFA\xE5\xFD\0\x89\xDB\xFE\0\x89\xBE\xFD\0\xE4vl\0\xA9\xFC\0>\x80p\0\x85n\0\xFD\x87\xFF\0(>\x07\0ag3\0*\x86\0M\xBD\xEA\0\xB3\xE7\xAF\0\x8Fmn\0\x95g9\x001\xBF[\0\x84\xD7H\x000\xDF\0\xC7-C\0%a5\0\xC9p\xCE\x000\xCB\xB8\0\xBFl\xFD\0\xA4\0\xA2\0l\xE4\0Z\xDD\xA0\0!oG\0b\xD2\0\xB9\\\x84\0paI\0kV\xE0\0\x99R\0PU7\0\xD5\xB7\x003\xF1\xC4\0n_\0]0\xE4\0\x85.\xA9\0\xB2\xC3\0\xA126\0\b\xB7\xA4\0\xEA\xB1\xD4\0\xF7!\0\x8Fi\xE4\0\'\xFFw\0\f\x80\0\x8D@-\0O\xCD\xA0\0 \xA5\x99\0\xB3\xA2\xD3\0/]\n\0\xB4\xF9B\0\xDA\xCB\0}\xBE\xD0\0\x9B\xDB\xC1\0\xAB\xBD\0\xCA\xA2\x81\0\bj\\\0.U\0\'\0U\0\x7F\xF0\0\xE1\x07\x86\0\vd\0\x96A\x8D\0\x87\xBE\xDE\0\xDA\xFD*\0k%\xB6\0{\x894\0\xF3\xFE\0\xB9\xBF\x9E\0hjO\0J*\xA8\0O\xC4Z\0-\xF8\xBC\0\xD7Z\x98\0\xF4\xC7\x95\0\rM\x8D\0 :\xA6\0\xA4W_\0?\xB1\0\x808\x95\0\xCC \0q\xDD\x86\0\xC9\xDE\xB6\0\xBF`\xF5\0Me\0\x07k\0\x8C\xB0\xAC\0\xB2\xC0\xD0\0QUH\0\xFB\0\x95r\xC3\0\xA3;\0\xC0@5\0\xDC{\0\xE0E\xCC\0N)\xFA\0\xD6\xCA\xC8\0\xE8\xF3A\0|d\xDE\0\x9Bd\xD8\0\xD9\xBE1\0\xA4\x97\xC3\0wX\xD4\0i\xE3\xC5\0\xF0\xDA\0\xBA:<\0FF\0Uu_\0\xD2\xBD\xF5\0n\x92\xC6\0\xAC.]\0D\xED\0>B\0a\xC4\x87\0)\xFD\xE9\0\xE7\xD6\xF3\0"|\xCA\0o\x915\0\b\xE0\xC5\0\xFF\xD7\x8D\0nj\xE2\0\xB0\xFD\xC6\0\x93\b\xC1\0|]t\0k\xAD\xB2\0\xCDn\x9D\0>r{\0\xC6j\0\xF7\xCF\xA9\0)s\xDF\0\xB5\xC9\xBA\0\xB7\0Q\0\xE2\xB2\r\0t\xBA$\0\xE5}`\0t\xD8\x8A\0\r,\0\x81\f\0~f\x94\0)\0\x9Fzv\0\xFD\xFD\xBE\0VE\xEF\0\xD9~6\0\xEC\xD9\0\x8B\xBA\xB9\0\xC4\x97\xFC\x001\xA8\'\0\xF1n\xC3\0\x94\xC56\0\xD8\xA8V\0\xB4\xA8\xB5\0\xCF\xCC\0\x89-\0oW4\0,V\x89\0\x99\xCE\xE3\0\xD6 \xB9\0k^\xAA\0>*\x9C\0_\xCC\0\xFD\vJ\0\xE1\xF4\xFB\0\x8E;m\0\xE2\x86,\0\xE9\xD4\x84\0\xFC\xB4\xA9\0\xEF\xEE\xD1\0.5\xC9\0/9a\x008!D\0\x1B\xD9\xC8\0\x81\xFC\n\0\xFBJj\0/\xD8\0S\xB4\x84\0N\x99\x8C\0T"\xCC\0*U\xDC\0\xC0\xC6\xD6\0\v\x96\0p\xB8\0i\x95d\0&Z`\0?R\xEE\0\x7F\0\xF4\xB5\0\xFC\xCB\xF5\x004\xBC-\x004\xBC\xEE\0\xE8]\xCC\0\xDD^`\0g\x8E\x9B\0\x923\xEF\0\xC9\xB8\0aX\x9B\0\xE1W\xBC\0Q\x83\xC6\0\xD8>\0\xDDqH\0-\xDD\0\xAF\xA1\0!,F\0Y\xF3\xD7\0\xD9z\x98\0\x9ET\xC0\0O\x86\xFA\0V\xFC\0\xE5y\xAE\0\x89"6\x008\xAD"\0g\x93\xDC\0U\xE8\xAA\0\x82&8\0\xCA\xE7\x9B\0Q\r\xA4\0\x993\xB1\0\xA9\xD7\0iH\0e\xB2\xF0\0\x7F\x88\xA7\0\x88L\x97\0\xF9\xD16\0!\x92\xB3\0{\x82J\0\x98\xCF!\0@\x9F\xDC\0\xDCGU\0\xE1t:\0g\xEBB\0\xFE\x9D\xDF\0^\xD4_\0{g\xA4\0\xBA\xACz\0U\xF6\xA2\0+\x88#\0A\xBAU\0Yn\b\0!*\x86\x009G\x83\0\x89\xE3\xE6\0\xE5\x9E\xD4\0I\xFB@\0\xFFV\xE9\0\xCA\0\xC5Y\x8A\0\x94\xFA+\0\xD3\xC1\xC5\0\xC5\xCF\0\xDBZ\xAE\0G\xC5\x86\0\x85Cb\0!\x86;\0,y\x94\0a\x87\0*L{\0\x80,\0C\xBF\0\x88&\x90\0x<\x89\0\xA8\xC4\xE4\0\xE5\xDB{\0\xC4:\xC2\0&\xF4\xEA\0\xF7g\x8A\0\r\x92\xBF\0e\xA3+\0=\x93\xB1\0\xBD|\v\0\xA4Q\xDC\0\'\xDDc\0i\xE1\xDD\0\x9A\x94\0\xA8)\x95\0h\xCE(\0	\xED\xB4\0D\x9F \0N\x98\xCA\0p\x82c\0~|#\0\xB92\0\xA7\xF5\x8E\0V\xE7\0!\xF1\b\0\xB5\x9D*\0o~M\0\xA5Q\0\xB5\xF9\xAB\0\x82\xDF\xD6\0\x96\xDDa\06\0\xC4:\x9F\0\x83\xA2\xA1\0r\xEDm\x009\x8Dz\0\x82\xB8\xA9\0k2\\\0F\'[\0\x004\xED\0\xD2\0w\0\xFC\xF4U\0YM\0\xE0q\x80\0A\xF3 \v=@\xFB!\xF9?\0\0\0\0-Dt>\0\0\0\x80\x98F\xF8<\0\0\0`Q\xCCx;\0\0\0\x80\x83\x1B\xF09\0\0\0@ %z8\0\0\0\x80"\x82\xE36\0\0\0\0\xF3i5\0A\xB0!\v\xB0');
  }
  function _(e4) {
    return e4;
  }
  async function v(e4) {
    return _(e4);
  }
  async function y(e4, t3) {
    try {
      var n3 = await v(e4);
      return await WebAssembly.instantiate(n3, t3);
    } catch (e5) {
      a2(`failed to asynchronously prepare wasm: ${e5}`), m2(e5);
    }
  }
  async function b(e4, t3, n3) {
    return y(t3, n3);
  }
  function x() {
    return { a: J2 };
  }
  async function S() {
    function e4(e5) {
      return X = e5.exports, q(X), u2(), X;
    }
    function n3(t3) {
      return e4(t3.instance);
    }
    var r3 = x(), i3 = t2.instantiateWasm;
    return i3 ? new Promise((t3) => {
      i3(r3, (n4) => t3(e4(n4)));
    }) : (h2 ??= g2(), n3(await b(o2, h2, r3)));
  }
  var C, w, T, E, D, O2, k2, A, j2, M, N = (e4) => {
    for (; e4.length > 0; ) e4.shift()(t2);
  }, P = [], F = [], I = globalThis.TextDecoder && new TextDecoder(), L = (e4, t3, n3, r3) => {
    var i3 = t3 + n3;
    if (r3) return i3;
    for (; e4[t3] && !(t3 >= i3); ) ++t3;
    return t3;
  }, R2 = (e4, t3 = 0, n3, r3) => {
    var i3 = L(e4, t3, n3, r3);
    if (i3 - t3 > 16 && e4.buffer && I) return I.decode(e4.subarray(t3, i3));
    for (var a3 = ""; t3 < i3; ) {
      var o3 = e4[t3++];
      if (!(o3 & 128)) {
        a3 += String.fromCharCode(o3);
        continue;
      }
      var s3 = e4[t3++] & 63;
      if ((o3 & 224) == 192) {
        a3 += String.fromCharCode((o3 & 31) << 6 | s3);
        continue;
      }
      var c3 = e4[t3++] & 63;
      if (o3 = (o3 & 240) == 224 ? (o3 & 15) << 12 | s3 << 6 | c3 : (o3 & 7) << 18 | s3 << 12 | c3 << 6 | e4[t3++] & 63, o3 < 65536) a3 += String.fromCharCode(o3);
      else {
        var l3 = o3 - 65536;
        a3 += String.fromCharCode(55296 | l3 >> 10, 56320 | l3 & 1023);
      }
    }
    return a3;
  }, z = (e4, t3, n3) => e4 ? R2(M, e4, t3, n3) : "", B = (e4, t3, n3, r3) => m2(`Assertion failed: ${z(e4)}, at: ` + [
    t3 ? z(t3) : "unknown filename",
    n3,
    r3 ? z(r3) : "unknown function"
  ]), V2 = () => 2147483648, H = (e4, t3) => Math.ceil(e4 / t3) * t3, U = (e4) => {
    var t3 = (e4 - K.buffer.byteLength + 65535) / 65536 | 0;
    try {
      return K.grow(t3), u2(), 1;
    } catch {
    }
  }, W2 = (e4) => {
    var t3 = M.length;
    e4 >>>= 0;
    var n3 = V2();
    if (e4 > n3) return false;
    for (var r3 = 1; r3 <= 4; r3 *= 2) {
      var i3 = t3 * (1 + 0.2 / r3);
      if (i3 = Math.min(i3, e4 + 100663296), U(Math.min(n3, H(Math.max(e4, i3), 65536)))) return true;
    }
    return false;
  };
  t2.noExitRuntime && t2.noExitRuntime, t2.print && t2.print, t2.printErr && (a2 = t2.printErr), t2.arguments && t2.arguments, t2.thisProgram && t2.thisProgram;
  var G = t2.preInit;
  if (G) for (typeof G == "function" && (t2.preInit = G = [G]); G.length > 0; ) G.shift()();
  var K;
  function q(e4) {
    t2._pffft_simd_size = e4.e, t2._pffft_simd_arch = e4.f, t2._pffft_new_setup = e4.g, t2._malloc = e4.h, t2._pffft_aligned_malloc = e4.i, t2._pffft_aligned_free = e4.j, t2._free = e4.k, t2._pffft_destroy_setup = e4.l, t2._pffft_transform_ordered = e4.m, K = e4.c, e4.__indirect_function_table;
  }
  var J2 = {
    a: B,
    b: W2
  };
  async function Y() {
    d2();
    var e4 = t2.setStatus;
    e4 && (e4("Running..."), await new Promise((e5) => setTimeout(e5, 1)), setTimeout(e4, 1, "")), !s2 && (f2(), t2.onRuntimeInitialized?.(), p2());
  }
  var X = await S();
  return await Y(), t2;
}
var l = 0;
var u = 1;
var d = 0;
var f = 3;
var p = class e2 {
  static {
    this.modulePromise = null;
  }
  constructor(e3, t2, n2) {
    if (this.setup = 0, this.inPtr = 0, this.outPtr = 0, this.workPtr = 0, this.normEnvelopeCache = /* @__PURE__ */ new Map(), e3 % 32 != 0) throw Error(`PffftSTFT: nFft (${e3}) must be a multiple of 32 (pffft real-transform requirement)`);
    this.nFft = e3, this.hopLength = t2, this.dimF = n2, this.hannWindow = new Float32Array(e3);
    for (let t3 = 0; t3 < e3; t3++) this.hannWindow[t3] = 0.5 * (1 - Math.cos(2 * Math.PI * t3 / e3));
    this.frameScratch = new Float32Array(e3);
  }
  async init() {
    if (e2.modulePromise ||= c(), this.mod = await e2.modulePromise, this.setup = this.mod._pffft_new_setup(this.nFft, d), this.setup === 0) throw Error(`PffftSTFT: pffft_new_setup(${this.nFft}, PFFFT_REAL) failed (returned NULL)`);
    let t2 = this.nFft * 4;
    if (this.inPtr = this.mod._pffft_aligned_malloc(t2), this.outPtr = this.mod._pffft_aligned_malloc(t2), this.workPtr = this.mod._pffft_aligned_malloc(t2), !this.inPtr || !this.outPtr || !this.workPtr) throw Error("PffftSTFT: pffft_aligned_malloc failed");
    let n2 = this.simdArchString();
    console.info(`pffft wasm FFT ready (simd_arch=${n2})`);
  }
  simdArchString() {
    let e3 = this.mod._pffft_simd_arch(), t2 = this.mod.HEAPU8, n2 = "";
    for (let r2 = e3; t2[r2] !== 0; r2++) n2 += String.fromCharCode(t2[r2]);
    return n2;
  }
  dimTFor(e3) {
    let t2 = this.nFft / 2;
    return Math.floor((e3 + 2 * t2 - this.nFft) / this.hopLength) + 1;
  }
  reflectPadInto(e3, t2, n2, r2, i2, a2) {
    for (let n3 = 0; n3 < r2; n3++) i2[a2 + n3] = e3[t2 + r2 - n3];
    for (let o2 = 0; o2 < n2; o2++) i2[a2 + r2 + o2] = e3[t2 + o2];
    for (let o2 = 0; o2 < r2; o2++) i2[a2 + r2 + n2 + o2] = e3[t2 + n2 - 2 - o2];
  }
  forward(e3, t2, n2) {
    let { nFft: r2, hopLength: i2, dimF: a2 } = this;
    if (n2 % i2 !== 0) throw Error(`PffftSTFT.forward: chunkSize (${n2}) must be an exact multiple of hopLength (${i2})`);
    let o2 = r2 / 2, s2 = this.dimTFor(n2), c2 = n2 + 2 * o2, u2 = new Float32Array(t2 * 4 * a2 * s2), d2 = new Float32Array(c2), p2 = this.mod.HEAPF32, m2 = this.inPtr >> 2, h2 = this.outPtr >> 2;
    for (let c3 = 0; c3 < t2; c3++) for (let t3 = 0; t3 < 2; t3++) {
      let g2 = (c3 * 2 + t3) * n2;
      this.reflectPadInto(e3, g2, n2, o2, d2, 0);
      let _ = 2 * t3 + 0, v = 2 * t3 + 1, y = (c3 * 4 + _) * a2 * s2, b = (c3 * 4 + v) * a2 * s2;
      for (let e4 = 0; e4 < s2; e4++) {
        let t4 = e4 * i2;
        for (let e5 = 0; e5 < r2; e5++) this.frameScratch[e5] = d2[t4 + e5] * this.hannWindow[e5];
        p2.set(this.frameScratch, m2), this.mod._pffft_transform_ordered(this.setup, this.inPtr, this.outPtr, this.workPtr, l);
        let n3 = this.mod.HEAPF32;
        for (let t5 = f; t5 < a2; t5++) {
          let r3, i3;
          t5 === 0 ? (r3 = n3[h2 + 0], i3 = 0) : (r3 = n3[h2 + 2 * t5], i3 = n3[h2 + 2 * t5 + 1]), u2[y + t5 * s2 + e4] = r3, u2[b + t5 * s2 + e4] = i3;
        }
      }
    }
    return u2;
  }
  getNormEnvelope(e3) {
    let t2 = this.normEnvelopeCache.get(e3);
    if (t2) return t2;
    let { nFft: n2, hopLength: r2 } = this, i2 = (e3 - 1) * r2 + n2;
    t2 = new Float32Array(i2);
    for (let i3 = 0; i3 < e3; i3++) {
      let e4 = i3 * r2;
      for (let r3 = 0; r3 < n2; r3++) {
        let n3 = this.hannWindow[r3];
        t2[e4 + r3] += n3 * n3;
      }
    }
    for (let e4 = 0; e4 < i2; e4++) t2[e4] += 1e-8;
    return this.normEnvelopeCache.set(e3, t2), t2;
  }
  inverse(e3, t2) {
    let { nFft: n2, hopLength: r2, dimF: i2 } = this, a2 = n2 / 2, o2 = e3.length, s2 = o2 / (t2 * 4 * i2);
    if (!Number.isInteger(s2)) throw Error(`PffftSTFT.inverse: specData length (${o2}) not consistent with batch=${t2}, dimF=${i2}`);
    let c2 = (s2 - 1) * r2 + n2, l2 = c2 - 2 * a2, d2 = n2 / 2, f2 = new Float32Array(t2 * 2 * l2), p2 = new Float32Array(c2), m2 = this.getNormEnvelope(s2), h2 = this.mod.HEAPF32, g2 = this.inPtr >> 2, _ = this.outPtr >> 2;
    for (let o3 = 0; o3 < t2; o3++) for (let t3 = 0; t3 < 2; t3++) {
      p2.fill(0);
      let c3 = 2 * t3 + 0, v = 2 * t3 + 1, y = (o3 * 4 + c3) * i2 * s2, b = (o3 * 4 + v) * i2 * s2;
      for (let t4 = 0; t4 < s2; t4++) {
        this.frameScratch.fill(0), i2 > 0 && (this.frameScratch[0] = e3[y + 0 * s2 + t4]), i2 > d2 && (this.frameScratch[1] = e3[y + d2 * s2 + t4]);
        let a3 = Math.min(i2, d2);
        for (let n3 = 1; n3 < a3; n3++) this.frameScratch[2 * n3] = e3[y + n3 * s2 + t4], this.frameScratch[2 * n3 + 1] = e3[b + n3 * s2 + t4];
        h2.set(this.frameScratch, g2), this.mod._pffft_transform_ordered(this.setup, this.inPtr, this.outPtr, this.workPtr, u);
        let o4 = this.mod.HEAPF32, c4 = t4 * r2;
        for (let e4 = 0; e4 < n2; e4++) {
          let t5 = o4[_ + e4] / n2 * this.hannWindow[e4];
          p2[c4 + e4] += t5;
        }
      }
      let x = (o3 * 2 + t3) * l2;
      for (let e4 = 0; e4 < l2; e4++) f2[x + e4] = p2[a2 + e4] / m2[a2 + e4];
    }
    return f2;
  }
};
var m = class extends o {
  constructor(e3, t2) {
    if (super(e3), this.nBins = 0, this.trim = 0, this.chunkSize = 0, this.genSize = 0, this.timings = /* @__PURE__ */ new Map(), this.segmentSize = t2.segmentSize || 256, this.overlap = t2.overlap || 0.25, this.batchSize = Math.max(1, t2.batchSize ?? 1), this.hopLength = t2.hopLength || 1024, this.enableDenoise = t2.enableDenoise || false, t2.stftBackend !== void 0 && this.warning(`stftBackend (${t2.stftBackend}) is deprecated and ignored; STFT/ISTFT always run through PffftSTFT now.`), this.executionProviders = t2.executionProviders ?? ["webgpu", "wasm"], this.debug(`MDX arch params: batchSize=${this.batchSize}, segmentSize=${this.segmentSize}`), this.debug(`MDX arch params: overlap=${this.overlap}, hopLength=${this.hopLength}, enableDenoise=${this.enableDenoise}`), this.debug(`MDX arch params: executionProviders=${this.executionProviders}`), this.compensate = this.modelData.compensate || 1, this.dimF = this.modelData.mdx_dim_f_set || 3072, this.dimT = 2 ** (this.modelData.mdx_dim_t_set || 8), this.nFft = this.modelData.mdx_n_fft_scale_set || 7680, this.configYaml = this.modelData.config_yaml, this.nFft % 32 != 0) throw Error(`MDXSeparator: nFft (${this.nFft}) must be a multiple of 32 (pffft real-transform requirement)`);
    this.debug(`MDX arch params: compensate=${this.compensate}, dimF=${this.dimF}, dimT=${this.dimT}, nFft=${this.nFft}`), this.debug(`MDX arch params: configYaml=${this.configYaml}`);
  }
  async loadModel() {
    this.debug("Loading ONNX model for inference..."), this.reportProgress({
      stage: a.LoadingModel,
      fraction: 0
    }), this.model || await this.downloadModel();
    let t2 = {
      executionProviders: this.executionProviders,
      logSeverityLevel: this.logLevel === "debug" ? 0 : 3
    }, n2 = _e.versions.web;
    _e.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${n2}/dist/`;
    let r2 = typeof crossOriginIsolated < "u" && crossOriginIsolated;
    r2 && (_e.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 1, 4));
    let i2 = typeof navigator < "u" && "gpu" in navigator;
    this.info(`Backend availability: webgpu=${i2 ? "possible (navigator.gpu present)" : "unavailable (no navigator.gpu)"}, crossOriginIsolated=${r2}`), this.info(`WASM fallback threads: ${r2 ? _e.wasm.numThreads : "default (single-threaded; serve with COOP/COEP headers to enable multithreading)"}`), this.model = await Pf.create(this.modelPath, t2), this.debug("Model loaded successfully using ONNXruntime inferencing session."), this.initializeModelSettings(), await this.stft.init(), this.reportProgress({
      stage: a.LoadingModel,
      fraction: 1
    });
  }
  async downloadModel() {
    let e3 = this.modelUrl ?? "https://huggingface.co/AI4future/RVC/resolve/main/UVR_MDXNET_KARA_2.onnx";
    this.info(`Downloading ${this.modelName} model from ${e3}...`);
    try {
      let t2 = await this.fetchModelWithCache(e3);
      this.modelPath = URL.createObjectURL(new Blob([t2])), this.info("Model downloaded successfully");
    } catch (e4) {
      throw this.error(`Error downloading model: ${e4}`), e4;
    }
  }
  async fetchModelWithCache(e3) {
    let t2;
    if (typeof caches < "u") try {
      t2 = await caches.open("web-demix2-models");
      let n3 = await t2.match(e3);
      if (n3) return this.info("Model cache hit: using cached bytes, skipping network download"), await n3.arrayBuffer();
      this.info("Model cache miss: downloading from network");
    } catch (e4) {
      this.debug(`Cache Storage unavailable, falling back to network: ${e4}`), t2 = void 0;
    }
    let n2 = await fetch(e3);
    if (!n2.ok) throw Error(`Failed to download model: ${n2.statusText}`);
    if (t2) try {
      await t2.put(e3, n2.clone()), this.info("Model stored in Cache Storage for future runs");
    } catch (e4) {
      this.debug(`Failed to store model in Cache Storage: ${e4}`);
    }
    return await n2.arrayBuffer();
  }
  initializeModelSettings() {
    this.debug("Initializing model settings..."), this.nBins = Math.floor(this.nFft / 2) + 1, this.trim = Math.floor(this.nFft / 2), this.chunkSize = this.hopLength * (this.segmentSize - 1), this.genSize = this.chunkSize - 2 * this.trim, this.stft ||= new p(this.nFft, this.hopLength, this.dimF), this.debug(`Model input params: nFft=${this.nFft} hopLength=${this.hopLength} dimF=${this.dimF}`), this.debug(`Model settings: nBins=${this.nBins}, trim=${this.trim}, chunkSize=${this.chunkSize}, genSize=${this.genSize}`);
    let e3 = Math.floor((this.chunkSize - this.nFft) / this.hopLength) + 1;
    this.debug(`Expected frames from chunk size: ${e3}, Target: ${this.segmentSize}`);
  }
  async separate(e3, i2) {
    this.audioFilePath = e3, this.debug(`Loading audio file ${e3}...`);
    let o2 = await s.loadAudioFile(e3, this.sampleRate);
    this.debug(`Preparing mix for input audio file ${this.audioFilePath}...`);
    let c2 = await this.prepareMix(o2);
    this.debug("Normalizing mix before demixing...");
    let l2 = t(c2), u2 = await this.normalize(c2, this.normalizationThreshold, this.amplificationThreshold), d2 = n(await this.demix(u2), l2);
    this.debug("Demixing completed.");
    let f2 = [];
    if (this.debug("Processing output files..."), this.reportProgress({
      stage: a.WritingOutput,
      fraction: 0
    }), this.primarySource ||= d2, !this.secondarySource) {
      if (this.debug("Producing secondary source"), this.invertUsingSpec) throw Error("invertUsingSpec is not implemented");
      this.debug("Inverting secondary stem by subtracting demixed stem from original mix"), this.secondarySource = r(u2, this.primarySource, this.compensate);
    }
    let p2 = this.outputSingleStem ? 1 : 2;
    if (!this.outputSingleStem || this.outputSingleStem.toLowerCase() === this.secondaryStemName.toLowerCase()) {
      let e4 = this.getStemOutputPath(this.secondaryStemName, i2);
      this.info(`Saving secondary ${this.secondaryStemName} stem to ${e4}...`);
      let t2 = await this.saveAudioOutput(e4, this.secondarySource, this.secondaryStemName);
      f2.push(t2), this.reportProgress({
        stage: a.WritingOutput,
        fraction: f2.length / p2
      });
    }
    if (!this.outputSingleStem || this.outputSingleStem.toLowerCase() === this.primaryStemName.toLowerCase()) {
      let e4 = this.getStemOutputPath(this.primaryStemName, i2);
      this.primarySource ||= d2, this.info(`Saving primary ${this.primaryStemName} stem to ${e4}...`);
      let t2 = await this.saveAudioOutput(e4, this.primarySource, this.primaryStemName);
      f2.push(t2), this.reportProgress({
        stage: a.WritingOutput,
        fraction: f2.length / p2
      });
    }
    return f2;
  }
  async prepareMix(e3) {
    return this.debug("Preparing mix for input audio..."), super.prepareMix(e3);
  }
  async normalize(e3, t2 = 1, n2) {
    return this.debug("Normalizing audio..."), super.normalize(e3, t2, n2);
  }
  async demix(e3, t2 = false) {
    let n2 = performance.now();
    this.timings.clear(), this.initializeModelSettings(), this.debug(`Original mix stored. Channels: ${e3.length}, samples: ${e3[0]?.length}`);
    let r2, i2;
    t2 ? (r2 = this.hopLength * (this.segmentSize - 1), i2 = 0.02, this.debug(`Chunk size for matching mix: ${r2}, Overlap: ${i2}`)) : (r2 = this.chunkSize, i2 = this.overlap, this.debug(`Standard chunk size: ${r2}, Overlap: ${i2}`));
    let o2 = r2 - 2 * this.trim;
    this.debug(`Generated size calculated: ${o2}`);
    let s2 = e3[0].length, c2 = o2 + this.trim - s2 % o2, l2 = this.trim + s2 + c2, u2 = new Float32Array(2 * l2);
    for (let t3 = 0; t3 < 2; t3++) {
      let n3 = t3 * l2;
      u2.set(e3[t3], n3 + this.trim);
    }
    this.debugArrayStats(u2, "runModel: padded mixture");
    let d2 = Math.floor((1 - i2) * r2);
    this.debug(`Step size for processing chunks: ${d2} as overlap is set to ${i2}.`);
    let f2 = [new Float32Array(l2), new Float32Array(l2)], p2 = new Float32Array(l2), m2 = /* @__PURE__ */ new Map(), h2 = (e4) => {
      let t3 = m2.get(e4);
      return t3 || (t3 = i2 === 0 ? new Float32Array(e4).fill(1) : this.hannWindowCpu(e4), m2.set(e4, t3)), t3;
    };
    this.debug(`Initialized CPU result/divider buffers of length ${l2}`);
    let g2 = 0, _ = l2 - r2, v = _ > 0 ? Math.floor(_ / d2) + 1 : 1;
    this.debug(`Mixture length: ${l2}, Effective length for stepping: ${_}`), this.debug(`Total chunks to process: ${v} in batches of ${this.batchSize}`);
    let y = [], b = (e4, t3) => {
      let n3 = performance.now();
      for (let n4 = 0; n4 < y.length; n4++) {
        let { start: r3, actualChunkSize: i3 } = y[n4], a2 = h2(i3);
        for (let o3 = 0; o3 < 2; o3++) {
          let s3 = (n4 * 2 + o3) * t3, c3 = f2[o3];
          for (let t4 = 0; t4 < i3; t4++) c3[r3 + t4] += e4[s3 + t4] * a2[t4];
        }
        for (let e5 = 0; e5 < i3; e5++) p2[r3 + e5] += a2[e5];
      }
      y.length = 0, this.addTiming("overlapAdd", performance.now() - n3);
    }, x = 0, S = async () => {
      let e4 = y.length;
      if (e4 === 0) return;
      let n3 = performance.now(), i3 = new Float32Array(e4 * 2 * r2);
      for (let t3 = 0; t3 < e4; t3++) {
        let { start: e5, actualChunkSize: n4 } = y[t3];
        for (let a2 = 0; a2 < 2; a2++) {
          let o4 = a2 * l2 + e5;
          i3.set(u2.subarray(o4, o4 + n4), (t3 * 2 + a2) * r2);
        }
      }
      this.addTiming("chunkPrep", performance.now() - n3), this.debug(`Running STFT -> model -> ISTFT on batch of ${e4} chunks`);
      let o3 = await this.runModel(i3, e4, r2, t2);
      b(o3, r2), x += e4, this.reportProgress({
        stage: a.Demixing,
        fraction: Math.min(x / v, 1),
        chunk: x,
        totalChunks: v
      });
    };
    for (let e4 = 0; e4 <= _ && e4 < l2; e4 += d2) {
      g2++;
      let t3 = e4, n3 = Math.min(e4 + r2, l2), i3 = n3 - t3;
      if (i3 < this.nFft) {
        this.debug(`Skipping chunk ${g2} - too small (${i3} < ${this.nFft})`);
        break;
      }
      this.debug(`Collecting chunk ${g2}/${v}: Start ${t3}, End ${n3}, Size ${i3}`), y.push({
        start: t3,
        actualChunkSize: i3
      }), y.length >= this.batchSize && await S();
    }
    await S();
    let C = performance.now(), w = this.trim;
    this.debug(`Extracting valid portion: start=${w}, end=${w + s2}, length=${s2}`);
    let T = [];
    for (let e4 = 0; e4 < 2; e4++) {
      let t3 = f2[e4], n3 = new Float32Array(s2);
      for (let e5 = 0; e5 < s2; e5++) n3[e5] = t3[w + e5] / (p2[w + e5] + 1e-8);
      T.push(n3);
    }
    this.debug(`Final source channels: ${T.length}, samples: ${T[0].length}`), this.addTiming("demixFinalize", performance.now() - C);
    let E = performance.now();
    return console.log(`demix took ${(E - n2).toFixed(2)}ms`), this.logTimingSummary(E - n2), console.debug("Demixing process completed."), T;
  }
  hannWindowCpu(e3) {
    let t2 = 1 - e3 % 2, n2 = new Float32Array(e3);
    for (let r2 = 0; r2 < e3; ++r2) {
      let i2 = 2 * Math.PI * r2 / (e3 + t2 - 1);
      n2[r2] = 0.5 - 0.5 * Math.cos(i2);
    }
    return n2;
  }
  addTiming(e3, t2) {
    this.timings.set(e3, (this.timings.get(e3) ?? 0) + t2);
  }
  async timed(e3, t2) {
    let n2 = performance.now(), r2 = await t2();
    return this.addTiming(e3, performance.now() - n2), r2;
  }
  logTimingSummary(e3) {
    let t2 = 0, n2 = [];
    for (let [r3, i2] of this.timings) t2 += i2, n2.push(`${r3}=${i2.toFixed(0)}ms(${(i2 / e3 * 100).toFixed(1)}%)`);
    let r2 = e3 - t2;
    n2.push(`other=${r2.toFixed(0)}ms(${(r2 / e3 * 100).toFixed(1)}%)`), console.log(`TIMING_SUMMARY demixTotal=${e3.toFixed(0)}ms ${n2.join(" ")}`);
  }
  async runModel(t2, n2, r2, i2) {
    this.debugArrayStats(t2, `runModel input (isMatchMix=${i2})`);
    let a2 = await this.timed("stftForward", () => this.stft.forward(t2, n2, r2));
    this.debugArrayStats(a2, "STFT output");
    let o2;
    if (i2) o2 = a2, this.debug("isMatchMix: spectrum prediction obtained directly from STFT output.");
    else {
      if (this.enableDenoise) throw Error("Denoising mode is not yet implemented");
      let t3 = new je("float32", a2, [
        n2,
        4,
        this.dimF,
        this.dimT
      ]);
      o2 = (await this.timed("onnxRun", () => this.model.run({ input: t3 }))).output.data, this.debug("Model run on the spectrum without denoising.");
    }
    let s2 = await this.timed("istft", () => this.stft.inverse(o2, n2));
    return this.debugArrayStats(s2, `runModel output (isMatchMix=${i2})`), s2;
  }
  async saveAudioOutput(e3, t2, n2) {
    this.debug(`Saving ${n2} to ${e3}`);
    try {
      this.debug(`Audio data has ${t2.length} channels with ${t2[0]?.length || 0} samples each`);
      let r2 = await this.normalize(t2, this.normalizationThreshold, this.amplificationThreshold), i2 = await s.saveAudioFile(r2, this.sampleRate, e3), a2 = URL.createObjectURL(i2);
      return this.info(`Created ${n2} output blob: ${i2.size} bytes`), a2;
    } catch (e4) {
      throw this.error(`Error saving ${n2} output: ${e4}`), e4;
    }
  }
  debugArrayStats(e3, t2) {
    if (this.logLevel !== "debug") return;
    let n2 = 0, r2 = 0, i2 = 0, a2 = 0, o2 = 0, s2 = e3.length;
    for (let t3 = 0; t3 < s2; t3++) {
      let s3 = e3[t3];
      if (Number.isNaN(s3)) {
        a2++;
        continue;
      }
      if (!Number.isFinite(s3)) {
        o2++;
        continue;
      }
      let c3 = Math.abs(s3);
      c3 > n2 && (n2 = c3), r2 += c3, c3 > 1e-8 && i2++;
    }
    let c2 = r2 / s2, l2 = (i2 / s2 * 100).toFixed(2);
    console.log(`${a2 > 0 ? "\u{1F6A8} NaN" : o2 > 0 ? "\u26A0\uFE0F Inf" : n2 < 1e-8 ? "\u{1F914} Zero" : "\u2705 OK"} ${t2}: length=${s2}, max=${n2.toFixed(6)}, mean=${c2.toFixed(6)}, nonZero=${i2}/${s2} (${l2}%)`), a2 > 0 && console.error(`   \u2514\u2500 Contains ${a2} NaN values!`), o2 > 0 && console.error(`   \u2514\u2500 Contains ${o2} Inf values!`), n2 < 1e-8 && a2 === 0 && console.warn("   \u2514\u2500 Array appears to be essentially zero");
  }
};
var h = {
  UVR_MDXNET_KARA_2: {
    architecture: "mdx",
    name: "UVR_MDXNET_KARA_2",
    downloadUrl: "https://huggingface.co/AI4future/RVC/resolve/main/UVR_MDXNET_KARA_2.onnx",
    modelData: {
      compensate: 1.065,
      mdx_dim_f_set: 2048,
      mdx_dim_t_set: 8,
      mdx_n_fft_scale_set: 5120,
      primary_stem: "Instrumental",
      is_karaoke: true
    },
    description: "Karaoke model: removes lead vocals but keeps backing vocals in the instrumental."
  },
  "UVR-MDX-NET-Voc_FT": {
    architecture: "mdx",
    name: "UVR-MDX-NET-Voc_FT",
    downloadUrl: "https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR-MDX-NET-Voc_FT.onnx",
    modelData: {
      compensate: 1.021,
      mdx_dim_f_set: 3072,
      mdx_dim_t_set: 8,
      mdx_n_fft_scale_set: 7680,
      primary_stem: "Vocals"
    },
    description: "Fine-tuned vocal model: removes all vocals (lead and backing) from the mix."
  },
  Kim_Vocal_2: {
    architecture: "mdx",
    name: "Kim_Vocal_2",
    downloadUrl: "https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/Kim_Vocal_2.onnx",
    modelData: {
      compensate: 1.009,
      mdx_dim_f_set: 3072,
      mdx_dim_t_set: 8,
      mdx_n_fft_scale_set: 7680,
      primary_stem: "Vocals"
    },
    description: "High-accuracy vocal model: removes all vocals (lead and backing) from the mix."
  },
  UVR_MDXNET_Main: {
    architecture: "mdx",
    name: "UVR_MDXNET_Main",
    downloadUrl: "https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR_MDXNET_Main.onnx",
    modelData: {
      compensate: 1.043,
      mdx_dim_f_set: 3072,
      mdx_dim_t_set: 8,
      mdx_n_fft_scale_set: 7680,
      primary_stem: "Vocals"
    },
    description: "General-purpose vocal model: removes all vocals (lead and backing) from the mix."
  },
  "UVR-MDX-NET-Inst_HQ_3": {
    architecture: "mdx",
    name: "UVR-MDX-NET-Inst_HQ_3",
    downloadUrl: "https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR-MDX-NET-Inst_HQ_3.onnx",
    modelData: {
      compensate: 1.022,
      mdx_dim_f_set: 3072,
      mdx_dim_t_set: 8,
      mdx_n_fft_scale_set: 6144,
      primary_stem: "Instrumental"
    },
    description: "High-quality instrumental model: removes all vocals (lead and backing), tuned for cleaner instrumentals."
  }
};
function g(e3, t2) {
  let n2 = h[e3];
  if (!n2) throw Error(`createSeparator: unknown model "${e3}". Known models: ${Object.keys(h).join(", ")}`);
  let r2 = n2.modelData.primary_stem === "Vocals" ? "vocals" : "instrumental", i2 = r2 === "vocals" ? "instrumental" : "vocals", a2 = {
    modelPath: n2.downloadUrl,
    modelName: n2.name,
    modelData: n2.modelData,
    modelUrl: n2.downloadUrl,
    primaryStemName: r2,
    secondaryStemName: i2,
    ...t2?.common
  };
  switch (n2.architecture) {
    case "mdx":
      return new m(a2, t2?.mdx ?? {});
    default: {
      let e4 = n2.architecture;
      throw Error(`createSeparator: unsupported architecture "${e4}"`);
    }
  }
}

// resources/vk-bridge/stems/src/flow-mdx-worker.js
var localWasmPaths = Object.freeze({
  mjs: new URL("./assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.mjs", import.meta.url).href,
  wasm: new URL("./assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href
});
Object.defineProperty(_e.wasm, "wasmPaths", {
  configurable: true,
  enumerable: true,
  get: () => localWasmPaths,
  set: () => void 0
});
_e.wasm.numThreads = 1;
_e.wasm.proxy = false;
var modelUrl = new URL("./models/UVR-MDX-NET-Inst_HQ_3.onnx", import.meta.url).href;
var separator;
var activeId = 0;
var releaseTimer;
function instance(id2) {
  activeId = id2;
  if (!separator) {
    separator = g("UVR-MDX-NET-Inst_HQ_3", {
      common: {
        modelPath: modelUrl,
        modelUrl,
        logLevel: "warning",
        onProgress: (event) => postMessage({
          type: "progress",
          id: activeId,
          progress: {
            ...event,
            percent: Number(event?.fraction || 0) * 100,
            message: event?.stage || "MDX Inst HQ 3 separation"
          }
        })
      },
      mdx: {
        segmentSize: 256,
        overlap: 0.1,
        batchSize: 1,
        hopLength: 1024,
        executionProviders: ["wasm"]
      }
    });
  }
  clearTimeout(releaseTimer);
  return separator;
}
function wav(channels, sampleRate) {
  const length = channels[0].length;
  const count = channels.length;
  const bytes = 44 + length * count * 2;
  const buffer = new ArrayBuffer(bytes);
  const view = new DataView(buffer);
  const text = (offset2, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset2 + index, value.charCodeAt(index));
    }
  };
  text(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, count, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * count * 2, true);
  view.setUint16(32, count * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, bytes - 44, true);
  let offset = 44;
  for (let frame = 0; frame < length; frame += 1) {
    for (let channel = 0; channel < count; channel += 1) {
      const value = Math.max(-1, Math.min(1, channels[channel][frame] || 0));
      view.setInt16(offset, value < 0 ? value * 32768 : value * 32767, true);
      offset += 2;
    }
  }
  return new Blob([buffer], { type: "audio/wav" });
}
function scheduleRelease() {
  clearTimeout(releaseTimer);
  releaseTimer = setTimeout(async () => {
    const current = separator;
    separator = void 0;
    try {
      await current?.model?.release?.();
    } catch {
    }
  }, 9e4);
}
self.onmessage = async (event) => {
  const { type, id: id2, left, right, sampleRate = 44100 } = event.data || {};
  if (type !== "separate") return;
  try {
    const engine = instance(id2);
    await engine.loadModel();
    const mix = await engine.normalize(
      [left, right],
      engine.normalizationThreshold,
      engine.amplificationThreshold
    );
    const instrumental = await engine.demix(mix);
    const vocal = instrumental.map((channel, channelIndex) => {
      const output = new Float32Array(channel.length);
      const source = mix[channelIndex];
      const compensate = engine.compensate || 1;
      for (let index = 0; index < output.length; index += 1) {
        output[index] = source[index] - channel[index] * compensate;
      }
      return output;
    });
    const outputVocals = await engine.normalize(
      vocal,
      engine.normalizationThreshold,
      engine.amplificationThreshold
    );
    const outputInstrumental = await engine.normalize(
      instrumental,
      engine.normalizationThreshold,
      engine.amplificationThreshold
    );
    postMessage({
      type: "result",
      id: id2,
      result: {
        stems: [
          { name: "Vocals", blob: wav(outputVocals, sampleRate) },
          { name: "Instrumental", blob: wav(outputInstrumental, sampleRate) }
        ],
        provider: "web-audio-separation-worker",
        providerLabel: "MDX INST HQ 3 \xB7 LOCAL WASM"
      }
    });
  } catch (error) {
    postMessage({ type: "error", id: id2, error: error?.stack || error?.message || String(error) });
  } finally {
    scheduleRelease();
  }
};
/*! Bundled license information:

onnxruntime-web/dist/ort.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.29.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)

onnxruntime-web/dist/ort.bundle.min.mjs:
  (**
   * @license
   * Copyright 2021 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2020 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2019 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
*/
