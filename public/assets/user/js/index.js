// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
var define;
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"../../../node_modules/axios/lib/helpers/bind.js":[function(require,module,exports) {
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],"../../../node_modules/axios/lib/utils.js":[function(require,module,exports) {
'use strict';

var bind = require('./helpers/bind');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

},{"./helpers/bind":"../../../node_modules/axios/lib/helpers/bind.js"}],"../../../node_modules/axios/lib/helpers/buildURL.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/core/InterceptorManager.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/core/transformData.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/cancel/isCancel.js":[function(require,module,exports) {
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],"../../../node_modules/axios/lib/helpers/normalizeHeaderName.js":[function(require,module,exports) {
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/core/enhanceError.js":[function(require,module,exports) {
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

},{}],"../../../node_modules/axios/lib/core/createError.js":[function(require,module,exports) {
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":"../../../node_modules/axios/lib/core/enhanceError.js"}],"../../../node_modules/axios/lib/core/settle.js":[function(require,module,exports) {
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":"../../../node_modules/axios/lib/core/createError.js"}],"../../../node_modules/axios/lib/helpers/cookies.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/helpers/isAbsoluteURL.js":[function(require,module,exports) {
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],"../../../node_modules/axios/lib/helpers/combineURLs.js":[function(require,module,exports) {
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],"../../../node_modules/axios/lib/core/buildFullPath.js":[function(require,module,exports) {
'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

},{"../helpers/isAbsoluteURL":"../../../node_modules/axios/lib/helpers/isAbsoluteURL.js","../helpers/combineURLs":"../../../node_modules/axios/lib/helpers/combineURLs.js"}],"../../../node_modules/axios/lib/helpers/parseHeaders.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/helpers/isURLSameOrigin.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/adapters/xhr.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var cookies = require('./../helpers/cookies');
var buildURL = require('./../helpers/buildURL');
var buildFullPath = require('../core/buildFullPath');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"./../utils":"../../../node_modules/axios/lib/utils.js","./../core/settle":"../../../node_modules/axios/lib/core/settle.js","./../helpers/cookies":"../../../node_modules/axios/lib/helpers/cookies.js","./../helpers/buildURL":"../../../node_modules/axios/lib/helpers/buildURL.js","../core/buildFullPath":"../../../node_modules/axios/lib/core/buildFullPath.js","./../helpers/parseHeaders":"../../../node_modules/axios/lib/helpers/parseHeaders.js","./../helpers/isURLSameOrigin":"../../../node_modules/axios/lib/helpers/isURLSameOrigin.js","../core/createError":"../../../node_modules/axios/lib/core/createError.js"}],"../../../node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../../../node_modules/axios/lib/defaults.js":[function(require,module,exports) {
var process = require("process");
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

},{"./utils":"../../../node_modules/axios/lib/utils.js","./helpers/normalizeHeaderName":"../../../node_modules/axios/lib/helpers/normalizeHeaderName.js","./adapters/xhr":"../../../node_modules/axios/lib/adapters/xhr.js","./adapters/http":"../../../node_modules/axios/lib/adapters/xhr.js","process":"../../../node_modules/process/browser.js"}],"../../../node_modules/axios/lib/core/dispatchRequest.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"./../utils":"../../../node_modules/axios/lib/utils.js","./transformData":"../../../node_modules/axios/lib/core/transformData.js","../cancel/isCancel":"../../../node_modules/axios/lib/cancel/isCancel.js","../defaults":"../../../node_modules/axios/lib/defaults.js"}],"../../../node_modules/axios/lib/core/mergeConfig.js":[function(require,module,exports) {
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};

},{"../utils":"../../../node_modules/axios/lib/utils.js"}],"../../../node_modules/axios/lib/core/Axios.js":[function(require,module,exports) {
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../utils":"../../../node_modules/axios/lib/utils.js","../helpers/buildURL":"../../../node_modules/axios/lib/helpers/buildURL.js","./InterceptorManager":"../../../node_modules/axios/lib/core/InterceptorManager.js","./dispatchRequest":"../../../node_modules/axios/lib/core/dispatchRequest.js","./mergeConfig":"../../../node_modules/axios/lib/core/mergeConfig.js"}],"../../../node_modules/axios/lib/cancel/Cancel.js":[function(require,module,exports) {
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],"../../../node_modules/axios/lib/cancel/CancelToken.js":[function(require,module,exports) {
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":"../../../node_modules/axios/lib/cancel/Cancel.js"}],"../../../node_modules/axios/lib/helpers/spread.js":[function(require,module,exports) {
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],"../../../node_modules/axios/lib/helpers/isAxiosError.js":[function(require,module,exports) {
'use strict';

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};

},{}],"../../../node_modules/axios/lib/axios.js":[function(require,module,exports) {
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./utils":"../../../node_modules/axios/lib/utils.js","./helpers/bind":"../../../node_modules/axios/lib/helpers/bind.js","./core/Axios":"../../../node_modules/axios/lib/core/Axios.js","./core/mergeConfig":"../../../node_modules/axios/lib/core/mergeConfig.js","./defaults":"../../../node_modules/axios/lib/defaults.js","./cancel/Cancel":"../../../node_modules/axios/lib/cancel/Cancel.js","./cancel/CancelToken":"../../../node_modules/axios/lib/cancel/CancelToken.js","./cancel/isCancel":"../../../node_modules/axios/lib/cancel/isCancel.js","./helpers/spread":"../../../node_modules/axios/lib/helpers/spread.js","./helpers/isAxiosError":"../../../node_modules/axios/lib/helpers/isAxiosError.js"}],"../../../node_modules/axios/index.js":[function(require,module,exports) {
module.exports = require('./lib/axios');
},{"./lib/axios":"../../../node_modules/axios/lib/axios.js"}],"component-functions/popup/alert.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var container = document.getElementsByClassName('js--components-function--popup-alert')[0];
var heading = document.getElementsByClassName('js--components-function--popup-alert__heading')[0];
var body = document.getElementsByClassName('js--components-function--popup-alert__body')[0];
var confirmBtn = document.getElementsByClassName('js--components-function--popup-alert__confirm-btn')[0];

var alertFunction = function alertFunction(title, message, fn) {
  // Call the default one if the custom one cannot be called
  if (!container || !heading || !body || !confirmBtn || !container.dataset.noneClass) {
    alert(message);
    fn && fn();
    return;
  }

  var fnToCall; // Remove listeners and hide the dialog when work is done

  var removeEventListenerAndHide = function removeEventListenerAndHide() {
    container.classList.add(container.dataset.noneClass);
    confirmBtn.removeEventListener('click', fnToCall);
  };

  fnToCall = function fnToCall() {
    removeEventListenerAndHide();
    fn && fn();
  };

  confirmBtn.addEventListener('click', fnToCall); // Add message

  heading.textContent = title;
  body.textContent = message;
  container.classList.remove(container.dataset.noneClass);
};

var _default = alertFunction;
exports.default = _default;
},{}],"component-functions/popup/confirm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var container = document.getElementsByClassName('js--components-function--popup-confirm')[0];
var heading = document.getElementsByClassName('js--components-function--popup-confirm__heading')[0];
var body = document.getElementsByClassName('js--components-function--popup-confirm__body')[0];
var closeBtn1 = document.getElementsByClassName('js--components-function--popup-confirm__close-btn-1')[0];
var closeBtn2 = document.getElementsByClassName('js--components-function--popup-confirm__close-btn-2')[0];
var confirmBtn = document.getElementsByClassName('js--components-function--popup-confirm__confirm-btn')[0];

var confirmFunction = function confirmFunction(title, message, noFn, yesFn) {
  // Call the default one if the custom one cannot be called
  if (!container || !heading || !body || !(closeBtn1 || closeBtn2) || !confirmBtn || !container.dataset.noneClass) {
    if (window.confirm(message)) {
      yesFn && yesFn();
    } else {
      noFn && noFn();
    }

    return;
  }

  var noFnToCall, yesFnToCall; // Remove listeners and hide the dialog when work is done

  var removeEventListenerAndHide = function removeEventListenerAndHide() {
    container.classList.add(container.dataset.noneClass);
    confirmBtn.removeEventListener('click', yesFnToCall);

    if (closeBtn1) {
      closeBtn1.removeEventListener('click', noFnToCall);
    }

    if (closeBtn2) {
      closeBtn2.removeEventListener('click', noFnToCall);
    }
  };

  yesFnToCall = function yesFnToCall() {
    removeEventListenerAndHide();
    yesFn && yesFn();
  };

  noFnToCall = function noFnToCall() {
    removeEventListenerAndHide();
    noFn && noFn();
  };

  confirmBtn.addEventListener('click', yesFnToCall);

  if (closeBtn1) {
    closeBtn1.addEventListener('click', noFnToCall);
  }

  if (closeBtn2) {
    closeBtn2.addEventListener('click', noFnToCall);
  } // Add message


  heading.textContent = title;
  body.textContent = message;
  container.classList.remove(container.dataset.noneClass);
};

var _default = confirmFunction;
exports.default = _default;
},{}],"component-functions/popup/prompt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var container = document.getElementsByClassName('js--components-function--popup-prompt')[0];
var form = document.getElementsByClassName('js--components-function--popup-prompt__form')[0];
var heading = document.getElementsByClassName('js--components-function--popup-prompt__heading')[0];
var body = document.getElementsByClassName('js--components-function--popup-prompt__body')[0];
var textarea = document.getElementsByClassName('js--components-function--popup-prompt__textarea')[0];
var closeBtn1 = document.getElementsByClassName('js--components-function--popup-prompt__close-btn-1')[0];
var closeBtn2 = document.getElementsByClassName('js--components-function--popup-prompt__close-btn-2')[0];

var promptFunction = function promptFunction(title, message, fn, defaultInput) {
  var minlength = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var maxlength = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 10;

  // Call the default one if the custom one cannot be called
  if (!container || !form || !heading || !body || !(closeBtn1 || closeBtn2) || !container.dataset.noneClass) {
    var ans = prompt(message, defaultInput);
    fn && fn(ans);
    return;
  }

  var fnToCallForm, fnToCallCancel; // Remove listeners and hide the dialog when work is done

  var removeEventListenerAndHide = function removeEventListenerAndHide() {
    container.classList.add(container.dataset.noneClass);
    form.removeEventListener('submit', fnToCallForm);
    closeBtn1 && closeBtn1.removeEventListener('click', fnToCallCancel);
    closeBtn2 && closeBtn2.removeEventListener('click', fnToCallCancel);
  }; // Function to call while submitting form


  fnToCallForm = function fnToCallForm(e) {
    e.preventDefault();
    var ans = textarea.value || undefined;
    removeEventListenerAndHide();
    fn && fn(ans);
  }; // Function to call if request is cancelled


  fnToCallCancel = function fnToCallCancel() {
    removeEventListenerAndHide();
    fn && fn();
  };

  form.addEventListener('submit', fnToCallForm);
  closeBtn1 && closeBtn1.addEventListener('click', fnToCallCancel);
  closeBtn2 && closeBtn2.addEventListener('click', fnToCallCancel); // Add message

  heading.textContent = title;
  body.textContent = message;
  textarea.textContent = defaultInput || '';
  textarea.value = defaultInput || '';
  textarea.minLength = minlength;
  textarea.maxLength = maxlength;
  container.classList.remove(container.dataset.noneClass);
};

var _default = promptFunction;
exports.default = _default;
},{}],"component-functions/popup/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _alert = _interopRequireDefault(require("./alert"));

var _confirm = _interopRequireDefault(require("./confirm"));

var _prompt = _interopRequireDefault(require("./prompt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  alert: _alert.default,
  confirm: _confirm.default,
  prompt: _prompt.default
};
exports.default = _default;
},{"./alert":"component-functions/popup/alert.js","./confirm":"component-functions/popup/confirm.js","./prompt":"component-functions/popup/prompt.js"}],"component-functions/flash-messages.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollToFlashMessages = exports.clearFlashMessages = exports.addFlashMessage = void 0;
var flashMessages = document.querySelector('.js--components-function--flash-messages');

if (flashMessages) {
  flashMessages.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('js--components-function--flash-close-btn')) {
      var message = event.target.closest('.js--components-function--flash-messages__message');
      flashMessages.removeChild(message);
    }
  });
}

var clearFlashMessages = function clearFlashMessages() {
  if (flashMessages) {
    flashMessages.textContent = '';
  }
};

exports.clearFlashMessages = clearFlashMessages;

var scrollToFlashMessages = function scrollToFlashMessages() {
  window.scrollTo(0, 0);
};

exports.scrollToFlashMessages = scrollToFlashMessages;

var addFlashMessage = function addFlashMessage(type, message) {
  if (!flashMessages) {
    alert(message);
    return;
  }

  var heading, color, icon;

  if (type && type.toLowerCase() === 'success') {
    heading = 'Success';
    color = 'green';
    icon = '&checkmark;';
  } else if (type && type.toLowerCase() === 'error') {
    heading = 'Error';
    color = 'red';
    icon = '&Cross;';
  } else {
    heading = 'Warning';
    color = 'yellow';
    icon = '&excl;';
  }

  var markup = "<div class=\"flash-messages__message flash-messages__message--".concat(color, " js--components-function--flash-messages__message\"><div class=\"flash-messages__icon\">").concat(icon, "</div><div class=\"flash-messages__content\"><h4 class=\"flash-messages__heading\">").concat(heading, "</h4><div class=\"flash-messages__body\">").concat(message, "</div></div><button class=\"flash-messages__close-btn js--components-function--flash-close-btn\">&Cross;</button></div>");
  flashMessages.insertAdjacentHTML('afterbegin', markup);
  scrollToFlashMessages();
}; // export { addFlashMessage, clearFlashMessages };


exports.addFlashMessage = addFlashMessage;
},{}],"utils/handleError.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _flashMessages = require("../component-functions/flash-messages");

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(err) {
  var alert = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  (0, _flashMessages.clearFlashMessages)();
  var message = 'Something went wrong!',
      type = 'error';

  if (typeof err === 'string') {
    message = err;
  } else if (err.response && err.response.data) {
    if (err.response.data.message) {
      message = err.response.data.message;
    } // if (err.response.data.status) {
    //   type = err.response.data.status;
    // }

  }

  if (alert) {
    _index.default.alert('Error', message);

    return;
  }

  (0, _flashMessages.addFlashMessage)(type, message);
}
},{"../component-functions/flash-messages":"component-functions/flash-messages.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/add-to-cart-btn.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

Array.from(document.getElementsByClassName('js--ajax--add-cart-btn')).forEach(function (btn) {
  btn.addEventListener('click', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
      var product;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              product = this.dataset.product;

              if (product) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", _index.default.alert('Error', 'Cannot add product, please try again later!'));

            case 3:
              this.setAttribute('disabled', 'disabled');
              _context.prev = 4;
              _context.next = 7;
              return (0, _axios.default)({
                method: 'PATCH',
                url: '/api/v1/cart/add',
                data: {
                  product: product
                }
              });

            case 7:
              this.removeAttribute('disabled');

              _index.default.confirm('Redirect to cart', 'Product added to cart successfully. Go to cart page?', undefined, function () {
                window.location.href = '/cart';
              });

              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0, true);
              this.removeAttribute('disabled');

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 11]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
});
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../component-functions/popup/index":"component-functions/popup/index.js","../utils/handleError":"utils/handleError.js"}],"ajax/address.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Update/create address
(function () {
  var form = document.getElementById('address-form');
  var btn = document.getElementById('address-form-btn');

  if (form) {
    form.addEventListener('submit', /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(event) {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                event.preventDefault();

                _index.default.confirm('Confirm changes', 'Are you sure you want to save the changes?', undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  var data, addressId, isNew, res;
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          data = new FormData(_this);
                          addressId = data.get('addressId');
                          isNew = !addressId;

                          if (addressId) {
                            data.delete(addressId);
                          }

                          if (btn) {
                            btn.setAttribute('disabled', 'disabled');
                          }

                          _context.prev = 5;
                          _context.next = 8;
                          return (0, _axios.default)({
                            method: isNew ? 'POST' : 'PATCH',
                            url: "/api/v1/addresses/".concat(isNew ? '' : addressId),
                            data: data
                          });

                        case 8:
                          res = _context.sent;
                          (0, _flashMessages.clearFlashMessages)();

                          if (!isNew) {
                            _context.next = 14;
                            break;
                          }

                          (0, _flashMessages.addFlashMessage)('success', "Successfully added new adddress. Reloading...");
                          setTimeout(function () {
                            window.location.replace("/addresses/".concat(res.data.data.address.id));
                          }, 2000);
                          return _context.abrupt("return");

                        case 14:
                          (0, _flashMessages.addFlashMessage)('success', 'Updated information sucessfully!');

                          if (btn) {
                            btn.removeAttribute('disabled');
                          }

                          _context.next = 22;
                          break;

                        case 18:
                          _context.prev = 18;
                          _context.t0 = _context["catch"](5);
                          (0, _handleError.default)(_context.t0);

                          if (btn) {
                            btn.removeAttribute('disabled');
                          }

                        case 22:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, null, [[5, 18]]);
                })));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  }
})(); // Delete address


Array.from(document.getElementsByClassName('js--ajax--delete-address__btn')).forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    var _this2 = this;

    e.preventDefault();
    var addressId = this.dataset.addressId;
    var element = this.closest('.js--ajax--delete-address');

    if (!addressId || !element) {
      (0, _flashMessages.clearFlashMessages)();
      (0, _handleError.default)('Cannot delete address, please try again later', true);
      return;
    }

    _index.default.confirm('Confirm Delete', 'Are you sure, you want to delete this address?', undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _this2.setAttribute('disabled', 'disabled');

              _context3.prev = 1;
              _context3.next = 4;
              return (0, _axios.default)({
                method: 'DELETE',
                url: "/api/v1/addresses/".concat(addressId)
              });

            case 4:
              element.remove();
              (0, _flashMessages.addFlashMessage)('success', 'Deleted address sucessfully!');
              _context3.next = 13;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](1);

              _this2.removeAttribute('disabled');

              (0, _flashMessages.clearFlashMessages)();
              (0, _handleError.default)(_context3.t0, true);

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[1, 8]]);
    })));
  });
});
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/cart.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('cart-form');
var saveBtn = document.getElementById('cart-save-btn');
var deleteBtn = document.getElementById('cart-delete-btn');
var discardBtn = document.getElementById('cart-discard-btn');

var disableBtns = function disableBtns(loadingBtn) {
  var helper = function helper(btn, name) {
    if (btn) {
      btn.setAttribute('disabled', 'disabled');

      if (name === loadingBtn && btn.dataset.loadClass) {
        btn.classList.add(btn.dataset.loadClass);
      }
    }
  };

  helper(saveBtn, 'save');
  helper(deleteBtn, 'delete');
  helper(discardBtn, 'discard');
};

var enableBtns = function enableBtns() {
  var helper = function helper(btn, name) {
    if (btn) {
      btn.removeAttribute('disabled');

      if (btn.dataset.loadClass) {
        btn.classList.remove(btn.dataset.loadClass);
      }
    }
  };

  helper(saveBtn, 'save');
  helper(deleteBtn, 'delete');
  helper(discardBtn, 'discard');
}; //////////////////////// Form


if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    (0, _flashMessages.clearFlashMessages)();
    var currentForm = this;

    _index.default.confirm('Confirm changes', 'Are you sure, you want to save the changes?', undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var data, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = new FormData(currentForm);
              disableBtns('save');
              _context.prev = 2;
              _context.next = 5;
              return (0, _axios.default)({
                method: 'PUT',
                url: '/api/v1/cart',
                data: data
              });

            case 5:
              res = _context.sent;
              (0, _flashMessages.addFlashMessage)('success', "Successfully updated cart. Reloading...");
              setTimeout(function () {
                window.location.reload();
              }, 2000);
              _context.next = 14;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](2);
              (0, _handleError.default)(_context.t0);
              enableBtns();

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 10]]);
    })));
  });
} ///////////////// Clear Cart


if (deleteBtn) {
  deleteBtn.addEventListener('click', function (e) {
    (0, _flashMessages.clearFlashMessages)();

    _index.default.confirm('Clear Cart', "Are you sure, you want to clear the cart? Please note that this cannot be undone!", undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var res;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              disableBtns('delete');
              _context2.prev = 1;
              _context2.next = 4;
              return (0, _axios.default)({
                method: 'DELETE',
                url: "/api/v1/cart"
              });

            case 4:
              res = _context2.sent;
              (0, _flashMessages.addFlashMessage)('success', "Clear cart succesful! Reloading...");
              setTimeout(function () {
                window.location.reload();
              }, 2000);
              _context2.next = 13;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](1);
              (0, _handleError.default)(_context2.t0);
              enableBtns();

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[1, 9]]);
    })));
  });
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/change-my-email.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('change-my-email-form');
var btn = document.getElementById('change-my-email-form-btn');
var resendOtpOldBtn = document.getElementById('resend-otp-old-btn');
var resendOtpNewBtn = document.getElementById('resend-otp-new-btn');
var formVerify = document.getElementById('change-my-email-verify-form');
var btnVerify = document.getElementById('change-my-email-verify-form-btn');
var verifySection = document.getElementById('change-my-email-verify-section');

var disableVerifyFormBtns = function disableVerifyFormBtns() {
  if (btnVerify) {
    btnVerify.setAttribute('disabled', 'disabled');
  }

  if (resendOtpOldBtn) {
    resendOtpOldBtn.setAttribute('disabled', 'disabled');
  }

  if (resendOtpNewBtn) {
    resendOtpNewBtn.setAttribute('disabled', 'disabled');
  }
};

var enableVerifyFormBtns = function enableVerifyFormBtns() {
  if (btnVerify) {
    btnVerify.removeAttribute('disabled');
  }

  if (resendOtpOldBtn) {
    resendOtpOldBtn.removeAttribute('disabled');
  }

  if (resendOtpNewBtn) {
    resendOtpNewBtn.removeAttribute('disabled');
  }
};

var resendOtp = function resendOtp(type) {
  var currentBtn = type == 'old' ? resendOtpOldBtn : resendOtpNewBtn;

  if (!currentBtn) {
    return;
  }

  currentBtn.addEventListener('click', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              disableVerifyFormBtns();
              _context.prev = 1;
              _context.next = 4;
              return (0, _axios.default)({
                method: 'PATCH',
                url: "/api/v1/users/changeMyEmail/resendOtp/".concat(type)
              });

            case 4:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', "Resent otp to your ".concat(type, " email"));
              enableVerifyFormBtns();
              _context.next = 14;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](1);
              (0, _handleError.default)(_context.t0);
              enableVerifyFormBtns();

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 10]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
};

if (form && formVerify && verifySection && verifySection.dataset.displayNoneClass) {
  // Form with email only
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(event) {
      var formData, data, res;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                email: formData.get('email')
              };

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context2.prev = 4;
              _context2.next = 7;
              return (0, _axios.default)({
                method: 'PATCH',
                url: '/api/v1/users/changeMyEmail',
                data: data
              });

            case 7:
              res = _context2.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Otps send to your emails for verification');

              if (btn.dataset.loadClass) {
                btn.classList.remove(btn.dataset.loadClass);
              }

              verifySection.classList.remove(verifySection.dataset.displayNoneClass);
              _context2.next = 18;
              break;

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](4);
              (0, _handleError.default)(_context2.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[4, 14]]);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }()); // Verify email form

  resendOtp('old');
  resendOtp('new');
  formVerify.addEventListener('submit', /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(event) {
      var formData, data, res;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                newEmailOtp: formData.get('newEmailOtp'),
                oldEmailOtp: formData.get('oldEmailOtp')
              };
              disableVerifyFormBtns();
              _context3.prev = 4;
              _context3.next = 7;
              return (0, _axios.default)({
                method: 'PATCH',
                url: '/api/v1/users/changeMyEmail/verify',
                data: data
              });

            case 7:
              res = _context3.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Email changed successfully');
              setTimeout(function () {
                window.location.reload();
              }, 1000);
              _context3.next = 17;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3["catch"](4);
              (0, _handleError.default)(_context3.t0);
              enableVerifyFormBtns();

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[4, 13]]);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/checkout.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Show order confirmation
var showOrderConfirmation = function showOrderConfirmation(url) {
  var _orderConfirmation$da;

  var orderConfirmation = document.getElementById('orderConfirmation');
  var orderConfirmationBtn = document.getElementById('orderConfirmationBtn');
  var noneClass = orderConfirmation === null || orderConfirmation === void 0 ? void 0 : (_orderConfirmation$da = orderConfirmation.dataset) === null || _orderConfirmation$da === void 0 ? void 0 : _orderConfirmation$da.noneClass;

  var fnToCall = function fnToCall() {
    window.location.replace(url);
  }; // If orderConfirmation section is not there show alert instead


  if (!noneClass || !orderConfirmationBtn) {
    _index.default.alert('Sucessful', 'Your order has been placed. You will be receiving a confirmation email with order details', fnToCall);

    return;
  }

  orderConfirmation.classList.remove(noneClass);
  orderConfirmationBtn.addEventListener('click', function (e) {
    e.preventDefault();
    fnToCall();
  });
};

var form = document.getElementById('checkout-form');
var btn = document.getElementById('checkout-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
      var data, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              e.preventDefault();
              data = new FormData(this);

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 3;
              _context.next = 6;
              return (0, _axios.default)({
                method: 'POST',
                url: '/api/v1/orders/checkout',
                data: data
              });

            case 6:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              showOrderConfirmation("/orders/".concat(res.data.data.order.id));
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](3);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 11]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../component-functions/popup/index":"component-functions/popup/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/checkout-address.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/////////////////////////////////////////////////////////////////////
// Select address form
/////////////////////////////////////////////////////////////////////
(function () {
  var form = document.getElementById('checkout-select-address-form');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var address = new FormData(this).get('address');

    if (!address) {
      (0, _handleError.default)('Please select an address or checkout with a new address');
      return;
    }

    window.location.replace("/checkout/".concat(address));
  });
})(); /////////////////////////////////////////////////////////////////////
// New address form
/////////////////////////////////////////////////////////////////////


(function () {
  var form = document.getElementById('checkout-new-address-form');
  var btn = document.getElementById('checkout-new-address-form-btn');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function (e) {
    var _this = this;

    e.preventDefault();
    var data = new FormData(this);

    _index.default.confirm('Confirm', 'Save address and continue to checkcout?', undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var data, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = new FormData(_this);

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 2;
              _context.next = 5;
              return (0, _axios.default)({
                method: 'POST',
                url: '/api/v1/addresses',
                data: data
              });

            case 5:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Saved address sucessfully! Moving you to checkout page...');
              setTimeout(function () {
                window.location.replace("/checkout/".concat(res.data.data.address.id));
              }, 2000);
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](2);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 11]]);
    })));
  });
})();
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/forgot-password.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('forgot-password-form');
var btn = document.getElementById('forgot-password-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, email, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              email = formData.get('email');

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 4;
              _context.next = 7;
              return (0, _axios.default)({
                method: 'POST',
                url: '/api/v1/users/forgotPassword',
                data: {
                  email: email
                }
              });

            case 7:
              res = _context.sent;
              window.location = '/forgotPassword/success';
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 11]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js"}],"ajax/login.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('login-form');
var btn = document.getElementById('login-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, data, res, location;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                email: formData.get('email'),
                password: formData.get('password')
              };

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 4;
              _context.next = 7;
              return (0, _axios.default)({
                method: 'POST',
                url: '/api/v1/users/login',
                data: data
              });

            case 7:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Login sucessful. Redirecting...');
              location = new URLSearchParams(window.location.search).get('redirect');

              if (location) {
                location = decodeURIComponent(location);
              } else {
                location = '/';
              }

              setTimeout(function () {
                window.location = location;
              }, 1000);
              _context.next = 19;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 15]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/order-one.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

var _document$getElementB;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var cancelBtn = document.getElementById('order-one-cancel-btn');
var id = (_document$getElementB = document.getElementById('id')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value;

if (cancelBtn && id) {
  cancelBtn.addEventListener('click', function (e) {
    e.preventDefault();

    var cancelOrder = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(reason) {
        var res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (reason) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                cancelBtn.setAttribute('disabled', 'disabled');
                _context.prev = 3;
                _context.next = 6;
                return (0, _axios.default)({
                  method: 'DELETE',
                  url: "/api/v1/orders/".concat(id, "/cancel"),
                  data: {
                    reason: reason
                  }
                });

              case 6:
                res = _context.sent;
                (0, _flashMessages.addFlashMessage)('success', 'Cancelled order successfully! Reloading...');
                setTimeout(function () {
                  window.location.reload();
                }, 2000);
                _context.next = 15;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](3);
                (0, _handleError.default)(_context.t0);
                cancelBtn.removeAttribute('disabled');

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 11]]);
      }));

      return function cancelOrder(_x) {
        return _ref.apply(this, arguments);
      };
    }();

    _index.default.prompt('Cancel order', 'Please enter a reason for order cancellation', cancelOrder, undefined, 4, 200);
  });
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/reset-password.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('reset-password-form');
var btn = document.getElementById('reset-password-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, data, token, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                password: formData.get('password'),
                passwordConfirm: formData.get('passwordConfirm')
              };
              token = formData.get('token');

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 5;

              if (!(data.password !== data.passwordConfirm)) {
                _context.next = 10;
                break;
              }

              (0, _handleError.default)('Password and confirm password are not same');

              if (btn) {
                btn.removeAttribute('disabled');
              }

              return _context.abrupt("return");

            case 10:
              _context.next = 12;
              return (0, _axios.default)({
                method: 'PATCH',
                url: "/api/v1/users/resetPassword/".concat(token),
                data: data
              });

            case 12:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Password sucessfully reseted. Redirecting...');
              setTimeout(function () {
                window.location = '/myAccount';
              }, 1000);
              _context.next = 22;
              break;

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](5);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 18]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/review.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _index = _interopRequireDefault(require("../component-functions/popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

////////////////////////////////
// Posting/updating of review
////////////////////////////////
// Wraped inside iffe so that the variables donot conflict
(function () {
  var form = document.getElementById('review-form');
  var btn = document.getElementById('review-form-btn');

  if (form) {
    form.addEventListener('submit', /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
        var formData, data, productId, reviewId, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                event.preventDefault();
                formData = new FormData(this);
                data = {
                  star: formData.get('star'),
                  title: formData.get('title'),
                  description: formData.get('description') || ''
                };
                productId = formData.get('productId');
                reviewId = formData.get('reviewId');

                if (productId) {
                  _context.next = 8;
                  break;
                }

                (0, _handleError.default)('Cannot post/update comment, please try again later!');
                return _context.abrupt("return");

              case 8:
                if (btn) {
                  btn.setAttribute('disabled', 'disabled');
                }

                _context.prev = 9;
                _context.next = 12;
                return (0, _axios.default)({
                  method: reviewId ? 'PATCH' : 'POST',
                  url: "/api/v1/products/".concat(productId, "/reviews/").concat(reviewId || ''),
                  data: data
                });

              case 12:
                res = _context.sent;

                _index.default.alert('Success', "".concat(reviewId ? 'Updated your' : 'Posted your', " review successfully! Reload the page to see changes..."), function () {
                  window.location.reload();
                });

                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context["catch"](9);
                (0, _handleError.default)(_context.t0, true);

                if (btn) {
                  btn.removeAttribute('disabled');
                }

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 16]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  }
})(); ////////////////////////////////
// Liking/undo-liking of review
////////////////////////////////


Array.from(document.getElementsByClassName('js--ajax--review-each__like-btn')).forEach(function (likeBtn) {
  likeBtn.addEventListener('click', function (e) {
    var _this$dataset = this.dataset,
        reviewId = _this$dataset.reviewId,
        productId = _this$dataset.productId,
        likedClass = _this$dataset.likedClass;
    var likeCountElement = this.getElementsByClassName('js--ajax--review-each__like-btn--count')[0];

    if (!reviewId || !productId || !likeCountElement || !likedClass || likeCountElement.dataset.likeCount === undefined) {
      _index.default.alert('Error', 'Cannot like/unlike the post now, please retry later!');

      return;
    }

    var currentLikeCount = likeCountElement.dataset.likeCount * 1;
    var undo = this.classList.contains(likedClass);

    if (undo) {
      currentLikeCount -= 1;
    } else {
      currentLikeCount += 1;
    }

    likeCountElement.dataset.likeCount = currentLikeCount;
    likeCountElement.textContent = "".concat(currentLikeCount, " like").concat(currentLikeCount > 1 ? 's' : '');
    this.classList.toggle(likedClass);

    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return (0, _axios.default)({
                method: undo ? 'DELETE' : 'POST',
                url: "/api/v1/products/".concat(productId, "/reviews/").concat(reviewId, "/like/").concat(undo ? 'undo' : '')
              });

            case 3:
              _context2.next = 7;
              break;

            case 5:
              _context2.prev = 5;
              _context2.t0 = _context2["catch"](0);

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 5]]);
    }))();
  });
}); ////////////////////////////////
// Marking of review
////////////////////////////////

Array.from(document.getElementsByClassName('js--ajax--review-each--mark-btn')).forEach(function (markBtn) {
  markBtn.addEventListener('click', function (e) {
    var _this$dataset2 = this.dataset,
        reviewId = _this$dataset2.reviewId,
        productId = _this$dataset2.productId;
    var card = this.closest('.js--ajax--review-each');

    if (!reviewId || !productId || !card) {
      _index.default.alert('Error', 'Cannot mark review as inappropriate now, please try again later!');

      return;
    }

    _index.default.confirm('Confirm marking', 'Are you sure you want mark the review as inappropriate? This action cannot be undone and doing so will hide this review for you', undefined, function () {
      card.remove();

      _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return (0, _axios.default)({
                  method: 'POST',
                  url: "/api/v1/products/".concat(productId, "/reviews/").concat(reviewId, "/mark")
                });

              case 3:
                _context3.next = 7;
                break;

              case 5:
                _context3.prev = 5;
                _context3.t0 = _context3["catch"](0);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 5]]);
      }))();
    });
  });
}); ////////////////////////////////
// Deleting of review
////////////////////////////////

Array.from(document.getElementsByClassName('js--ajax--review-delete-btn')).forEach(function (deleteBtn) {
  deleteBtn.addEventListener('click', /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(e) {
      var _this = this;

      var _this$dataset3, reviewId, productId;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _this$dataset3 = this.dataset, reviewId = _this$dataset3.reviewId, productId = _this$dataset3.productId;

              if (!(!reviewId || !productId)) {
                _context5.next = 4;
                break;
              }

              _index.default.alert('Error', 'Cannot delete review now, please try again later!');

              return _context5.abrupt("return");

            case 4:
              _index.default.confirm('Confirm delete', 'Are you sure, you want to delete this review? This cannot be undone.', undefined, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _this.setAttribute('disabled', 'disabled');

                        _context4.prev = 1;
                        _context4.next = 4;
                        return (0, _axios.default)({
                          method: 'DELETE',
                          url: "/api/v1/products/".concat(productId, "/reviews/").concat(reviewId)
                        });

                      case 4:
                        _index.default.alert('Success', 'Deleted your review successfully! Reload the page to see changes...', function () {
                          window.location.reload();
                        });

                        _context4.next = 11;
                        break;

                      case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4["catch"](1);
                        (0, _handleError.default)(_context4.t0, true);

                        if (_this) {
                          _this.removeAttribute('disabled');
                        }

                      case 11:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, null, [[1, 7]]);
              })));

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }());
});
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/popup/index":"component-functions/popup/index.js"}],"ajax/signup.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('signup-form');
var btn = document.getElementById('signup-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, email, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              email = formData.get('email');

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 4;
              _context.next = 7;
              return (0, _axios.default)({
                method: 'POST',
                url: '/api/v1/users/signup',
                data: {
                  email: email
                }
              });

            case 7:
              res = _context.sent;
              window.location = '/signup/success';
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 11]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js"}],"ajax/signup-complete.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('signup-complete-form');
var btn = document.getElementById('signup-complete-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, data, token, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                name: formData.get('name'),
                mobile: formData.get('mobile'),
                email: formData.get('email'),
                password: formData.get('password'),
                passwordConfirm: formData.get('passwordConfirm')
              };
              token = formData.get('token');

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 5;

              if (!(data.password !== data.passwordConfirm)) {
                _context.next = 10;
                break;
              }

              (0, _handleError.default)('Password and confirm password are not same');

              if (btn) {
                btn.removeAttribute('disabled');
              }

              return _context.abrupt("return");

            case 10:
              _context.next = 12;
              return (0, _axios.default)({
                method: 'POST',
                url: "/api/v1/users/signup/complete/".concat(token),
                data: data
              });

            case 12:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Signup sucessful. Redirecting...');
              setTimeout(function () {
                window.location = '/myAccount';
              }, 1000);
              _context.next = 22;
              break;

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](5);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 18]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/update-me.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('update-me-form');
var btn = document.getElementById('update-me-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, data, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                name: formData.get('name'),
                mobile: formData.get('mobile')
              };

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 4;
              _context.next = 7;
              return (0, _axios.default)({
                method: 'PATCH',
                url: "/api/v1/users/updateMe",
                data: data
              });

            case 7:
              res = _context.sent;
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Updated information sucessfully!');

              if (btn) {
                btn.removeAttribute('disabled');
              }

              _context.next = 17;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 13]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"ajax/update-my-password.js":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _axios = _interopRequireDefault(require("axios"));

var _handleError = _interopRequireDefault(require("../utils/handleError"));

var _flashMessages = require("../component-functions/flash-messages");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var form = document.getElementById('update-my-password-form');
var btn = document.getElementById('update-my-password-form-btn');

if (form) {
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
      var formData, data, res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              formData = new FormData(this);
              data = {
                currentPassword: formData.get('currentPassword'),
                password: formData.get('password'),
                passwordConfirm: formData.get('passwordConfirm')
              };

              if (btn) {
                btn.setAttribute('disabled', 'disabled');
              }

              _context.prev = 4;

              if (!(data.password !== data.passwordConfirm)) {
                _context.next = 9;
                break;
              }

              (0, _handleError.default)('Password and confirm password are not same');

              if (btn) {
                btn.removeAttribute('disabled');
              }

              return _context.abrupt("return");

            case 9:
              _context.next = 11;
              return (0, _axios.default)({
                method: 'PATCH',
                url: '/api/v1/users/updateMyPassword',
                data: data
              });

            case 11:
              res = _context.sent;
              [document.getElementById('currentPassword'), document.getElementById('password'), document.getElementById('passwordConfirm')].forEach(function (el) {
                if (el) {
                  el.value = '';
                }
              });
              (0, _flashMessages.clearFlashMessages)();
              (0, _flashMessages.addFlashMessage)('success', 'Password changed sucessfully!');

              if (btn) {
                btn.removeAttribute('disabled');
              }

              _context.next = 22;
              break;

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](4);
              (0, _handleError.default)(_context.t0);

              if (btn) {
                btn.removeAttribute('disabled');
              }

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 18]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
},{"regenerator-runtime/runtime":"../../../node_modules/regenerator-runtime/runtime.js","axios":"../../../node_modules/axios/index.js","../utils/handleError":"utils/handleError.js","../component-functions/flash-messages":"component-functions/flash-messages.js"}],"component-functions/btn-confirm-redirect.js":[function(require,module,exports) {
"use strict";

var _index = _interopRequireDefault(require("./popup/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Array.from(document.getElementsByClassName('js--components-function--btn-confirm-redirect')).forEach(function (btn) {
  // console.log(btn.dataset);
  if (!btn.dataset.redirectTo) {
    return;
  }

  btn.addEventListener('click', function () {
    var _this = this;

    if (!this.dataset.confirmMessage) {
      window.location.href = this.dataset.redirectTo;
      return;
    }

    _index.default.confirm('Confirm redirect', this.dataset.confirmMessage, undefined, function () {
      window.location.href = _this.dataset.redirectTo;
    });
  });
});
},{"./popup/index":"component-functions/popup/index.js"}],"component-functions/dropdown.js":[function(require,module,exports) {
Array.from(document.getElementsByClassName('js--components-function--dropdown__btn')).forEach(function (btn) {
  btn.addEventListener('click', function () {
    var dropdown = this.closest('.js--components-function--dropdown');

    if (!dropdown) {
      return;
    }

    var list = dropdown.getElementsByClassName('js--components-function--dropdown__list')[0];

    if (!list) {
      return;
    } // console.log(this.dataset.showClass);


    if (list.dataset.showClass) {
      list.classList.toggle(list.dataset.showClass);
    }
  });
});
var lists = Array.from(document.getElementsByClassName('js--components-function--dropdown__list'));
window.addEventListener('click', function (event) {
  if (!event.target.matches('.js--components-function--dropdown') && !event.target.matches('.js--components-function--dropdown *')) {
    lists.forEach(function (list) {
      // 'menu-dropdown__list--show'
      if (list.dataset.showClass) {
        list.classList.remove(list.dataset.showClass);
      }
    });
  }
});
},{}],"component-functions/form-rating.js":[function(require,module,exports) {
var getValue = function getValue(anyElement) {
  var rating = anyElement.closest('.js--components-function--form-rating');
  var ans = 0;
  Array.from(rating.querySelectorAll('.js--components-function--form-rating__label input')).forEach(function (el, i) {
    if (el.checked) {
      ans = i + 1;
    }
  });
  return ans;
};

var setValue = function setValue(anyElement, value) {
  var rating = anyElement.closest('.js--components-function--form-rating');
  var selectedLabelClass = rating.dataset.selectedLabelClass;

  if (!selectedLabelClass) {
    return;
  } // console.log(selectedLabelClass);


  Array.from(rating.querySelectorAll('.js--components-function--form-rating__label')).forEach(function (label, i) {
    // console.log('ha: ', label);
    // console.log(i, value, i < value);
    if (i < value) {
      label.classList.add(selectedLabelClass);
    } else {
      label.classList.remove(selectedLabelClass);
    }
  });
};

Array.from(document.getElementsByClassName('js--components-function--form-rating')).forEach(function (rating) {
  var labels = rating.getElementsByClassName('js--components-function--form-rating__label');

  if (!rating.dataset.selectedLabelClass || labels.length !== 5) {
    return;
  }

  Array.from(labels).forEach(function (label, i) {
    label.dataset.radioNumberJavascript = i + 1;
    label.addEventListener('mouseover', function (e) {
      setValue(this, this.dataset.radioNumberJavascript);
    });
    label.addEventListener('mouseout', function (e) {
      setValue(this, getValue(this));
    });
  });
});
},{}],"component-functions/remove-on-click.js":[function(require,module,exports) {
Array.from(document.getElementsByClassName('js--components-function--remove-onclick__btn')).forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    var element = this.closest('.js--components-function--remove-onclick');

    if (!element) {
      return;
    }

    element.remove();
  });
});
},{}],"component-functions/search.js":[function(require,module,exports) {
var form = document.getElementsByClassName('js--components-function--search__form')[0];
var input = document.getElementsByClassName('js--components-function--search__input')[0];
var btn = document.getElementsByClassName('js--components-function--search__btn')[0]; // alert('Connected');

if (form && input && btn) {
  var showInput = input.dataset.showClass;

  if (showInput) {
    btn.querySelectorAll('*').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (!input.classList.contains(showInput)) {
          input.classList.add(showInput);
          return;
        } else if (input.value !== '') {
          // console.log(input.value);
          window.location.href = "/products/search/".concat(input.value); // form.submit();
        }
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (input.value !== '') {
        // console.log(input.value);
        window.location.href = "/products/search/".concat(input.value); // form.submit();
      }
    });
    window.addEventListener('click', function (e) {
      // console.log(e.target);
      if (!e.target.matches('.js--components-function--search__form *')) {
        input.classList.remove(showInput);
      }
    });
  }
}
},{}],"component-functions/sidebar.js":[function(require,module,exports) {
var sidebarContainer = document.querySelector('.js--components-function--sidebar__container');
var sidebar = document.querySelector('.js--components-function--sidebar');
var sidebarCross = document.querySelector('.js--components-function--sidebar__cross');
var hamburger = document.querySelector('.js--components-function--sidebar__hamburger');

if (sidebarContainer && sidebar && hamburger) {
  var toggleClass = sidebarContainer.dataset.toggleClass;

  if (toggleClass) {
    hamburger.addEventListener('click', function () {
      sidebarContainer.classList.add(toggleClass);
    });
    sidebarContainer.addEventListener('click', function (e) {
      // sidebarContainer.classList.toggle(toggleClass);
      // return;
      if (e.target !== sidebarCross && sidebar.contains(e.target)) {
        return;
      }

      sidebarContainer.classList.remove(toggleClass);
    });
  }
}
},{}],"component-functions/sliders.js":[function(require,module,exports) {
var setProperties = function setProperties(sliders, slided, slideTotal) {
  sliders.dataset.sliders = JSON.stringify({
    slided: slided,
    slideTotal: slideTotal
  });
};

var getProperties = function getProperties(sliders, slided, slideTotal) {
  return JSON.parse(sliders.dataset.sliders);
};

var startAutoScroll = function startAutoScroll(sliders) {
  var k = setInterval(function () {
    slide(sliders, 'right');
  }, 4000);
  sliders.dataset.autoScroll = k;
};

var stopAutoScroll = function stopAutoScroll(sliders) {
  if (sliders.dataset.autoScroll !== undefined) {
    clearInterval(sliders.dataset.autoScroll);
  }
};

var slide = function slide(sliders) {
  var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'left';
  var properties = getProperties(sliders);
  to = to.toLowerCase();

  if (to === 'left') {
    properties.slided -= 1;

    if (properties.slided < 0) {
      properties.slided = properties.slideTotal - 1;
    }
  } else {
    properties.slided += 1;

    if (properties.slided >= properties.slideTotal) {
      properties.slided = 0;
    }
  }

  var container = sliders.getElementsByClassName('home-intro-box__container')[0];

  if (container) {
    container.style.transform = "translateX(-".concat(sliders.offsetWidth * properties.slided, "px)");
  }

  setProperties(sliders, properties.slided, properties.slideTotal);
};

Array.from(document.getElementsByClassName('js--components-function--sliders')).forEach(function (sliders) {
  setProperties(sliders, 0, sliders.getElementsByClassName('js--components-function--sliders__each').length);
  var leftBtn = sliders.querySelector('.js--components-function--sliders__btn--left');
  var rightBtn = sliders.querySelector('.js--components-function--sliders__btn--right');
  startAutoScroll(sliders);

  if (leftBtn) {
    leftBtn.addEventListener('click', function () {
      stopAutoScroll(this.parentElement);
      slide(this.parentElement, 'left');
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener('click', function () {
      stopAutoScroll(this.parentElement);
      slide(this.parentElement, 'right');
    });
  }
});
},{}],"../../../staticData/locationDetailsParsed.json":[function(require,module,exports) {
module.exports = {
  "Andaman and Nicobar Islands": {
    "state": "Andaman and Nicobar Islands",
    "pincodeStartsWith": ["744"],
    "districts": {
      "Nicobar": 1,
      "North and Middle Andaman": 1,
      "South Andaman": 1
    }
  },
  "Andhra Pradesh": {
    "state": "Andhra Pradesh",
    "pincodeStartsWith": ["51", "52", "53"],
    "districts": {
      "Anantapur": 1,
      "Chittoor": 1,
      "East Godavari": 1,
      "Guntur": 1,
      "Krishna": 1,
      "Kurnool": 1,
      "Nellore": 1,
      "Prakasam": 1,
      "Srikakulam": 1,
      "Visakhapatnam": 1,
      "Vizianagaram": 1,
      "West Godavari": 1,
      "YSR Kadapa": 1
    }
  },
  "Arunachal Pradesh": {
    "state": "Arunachal Pradesh",
    "pincodeStartsWith": ["790", "791", "792"],
    "districts": {
      "Tawang": 1,
      "West Kameng": 1,
      "East Kameng": 1,
      "Papum Pare": 1,
      "Kurung Kumey": 1,
      "Kra Daadi": 1,
      "Lower Subansiri": 1,
      "Upper Subansiri": 1,
      "West Siang": 1,
      "East Siang": 1,
      "Siang": 1,
      "Upper Siang": 1,
      "Lower Siang": 1,
      "Lower Dibang Valley": 1,
      "Dibang Valley": 1,
      "Anjaw": 1,
      "Lohit": 1,
      "Namsai": 1,
      "Changlang": 1,
      "Tirap": 1,
      "Longding": 1
    }
  },
  "Assam": {
    "state": "Assam",
    "pincodeStartsWith": ["78"],
    "districts": {
      "Baksa": 1,
      "Barpeta": 1,
      "Biswanath": 1,
      "Bongaigaon": 1,
      "Cachar": 1,
      "Charaideo": 1,
      "Chirang": 1,
      "Darrang": 1,
      "Dhemaji": 1,
      "Dhubri": 1,
      "Dibrugarh": 1,
      "Goalpara": 1,
      "Golaghat": 1,
      "Hailakandi": 1,
      "Hojai": 1,
      "Jorhat": 1,
      "Kamrup Metropolitan": 1,
      "Kamrup": 1,
      "Karbi Anglong": 1,
      "Karimganj": 1,
      "Kokrajhar": 1,
      "Lakhimpur": 1,
      "Majuli": 1,
      "Morigaon": 1,
      "Nagaon": 1,
      "Nalbari": 1,
      "Dima Hasao": 1,
      "Sivasagar": 1,
      "Sonitpur": 1,
      "South Salmara-Mankachar": 1,
      "Tinsukia": 1,
      "Udalguri": 1,
      "West Karbi Anglong": 1
    }
  },
  "Bihar": {
    "state": "Bihar",
    "pincodeStartsWith": ["80", "81", "82", "83", "84", "85"],
    "districts": {
      "Araria": 1,
      "Arwal": 1,
      "Aurangabad": 1,
      "Banka": 1,
      "Begusarai": 1,
      "Bhagalpur": 1,
      "Bhojpur": 1,
      "Buxar": 1,
      "Darbhanga": 1,
      "East Champaran (Motihari)": 1,
      "Gaya": 1,
      "Gopalganj": 1,
      "Jamui": 1,
      "Jehanabad": 1,
      "Kaimur (Bhabua)": 1,
      "Katihar": 1,
      "Khagaria": 1,
      "Kishanganj": 1,
      "Lakhisarai": 1,
      "Madhepura": 1,
      "Madhubani": 1,
      "Munger (Monghyr)": 1,
      "Muzaffarpur": 1,
      "Nalanda": 1,
      "Nawada": 1,
      "Patna": 1,
      "Purnia (Purnea)": 1,
      "Rohtas": 1,
      "Saharsa": 1,
      "Samastipur": 1,
      "Saran": 1,
      "Sheikhpura": 1,
      "Sheohar": 1,
      "Sitamarhi": 1,
      "Siwan": 1,
      "Supaul": 1,
      "Vaishali": 1,
      "West Champaran": 1
    }
  },
  "Chandigarh": {
    "state": "Chandigarh",
    "pincodeStartsWith": ["16"],
    "districts": {
      "Chandigarh": 1
    }
  },
  "Chhattisgarh": {
    "state": "Chhattisgarh",
    "pincodeStartsWith": ["16"],
    "districts": {
      "Balod": 1,
      "Baloda Bazar": 1,
      "Balrampur": 1,
      "Bastar": 1,
      "Bemetara": 1,
      "Bijapur": 1,
      "Bilaspur": 1,
      "Dantewada (South Bastar)": 1,
      "Dhamtari": 1,
      "Durg": 1,
      "Gariyaband": 1,
      "Janjgir-Champa": 1,
      "Jashpur": 1,
      "Kabirdham (Kawardha)": 1,
      "Kanker (North Bastar)": 1,
      "Kondagaon": 1,
      "Korba": 1,
      "Korea (Koriya)": 1,
      "Mahasamund": 1,
      "Mungeli": 1,
      "Narayanpur": 1,
      "Raigarh": 1,
      "Raipur": 1,
      "Rajnandgaon": 1,
      "Sukma": 1,
      "Surajpur  ": 1,
      "Surguja": 1
    }
  },
  "Dadra and Nagar Haveli": {
    "state": "Dadra and Nagar Haveli",
    "pincodeStartsWith": ["396"],
    "districts": {
      "Dadra & Nagar Haveli": 1
    }
  },
  "Daman and Diu": {
    "state": "Daman and Diu",
    "pincodeStartsWith": ["396210"],
    "districts": {
      "Daman": 1,
      "Diu": 1
    }
  },
  "Delhi": {
    "state": "Delhi",
    "pincodeStartsWith": ["11"],
    "districts": {
      "Central Delhi": 1,
      "East Delhi": 1,
      "New Delhi": 1,
      "North Delhi": 1,
      "North East Delhi": 1,
      "North West  Delhi": 1,
      "Shahdara": 1,
      "South Delhi": 1,
      "South East Delhi": 1,
      "South West Delhi": 1,
      "West Delhi": 1
    }
  },
  "Goa": {
    "state": "Goa",
    "pincodeStartsWith": ["403"],
    "districts": {
      "North Goa": 1,
      "South Goa": 1
    }
  },
  "Gujarat": {
    "state": "Gujarat",
    "pincodeStartsWith": ["36", "37", "38", "39"],
    "districts": {
      "Ahmedabad": 1,
      "Amreli": 1,
      "Anand": 1,
      "Aravalli": 1,
      "Banaskantha (Palanpur)": 1,
      "Bharuch": 1,
      "Bhavnagar": 1,
      "Botad": 1,
      "Chhota Udepur": 1,
      "Dahod": 1,
      "Dangs (Ahwa)": 1,
      "Devbhoomi Dwarka": 1,
      "Gandhinagar": 1,
      "Gir Somnath": 1,
      "Jamnagar": 1,
      "Junagadh": 1,
      "Kachchh": 1,
      "Kheda (Nadiad)": 1,
      "Mahisagar": 1,
      "Mehsana": 1,
      "Morbi": 1,
      "Narmada (Rajpipla)": 1,
      "Navsari": 1,
      "Panchmahal (Godhra)": 1,
      "Patan": 1,
      "Porbandar": 1,
      "Rajkot": 1,
      "Sabarkantha (Himmatnagar)": 1,
      "Surat": 1,
      "Surendranagar": 1,
      "Tapi (Vyara)": 1,
      "Vadodara": 1,
      "Valsad": 1
    }
  },
  "Haryana": {
    "state": "Haryana",
    "pincodeStartsWith": ["12", "13"],
    "districts": {
      "Ambala": 1,
      "Bhiwani": 1,
      "Charkhi Dadri": 1,
      "Faridabad": 1,
      "Fatehabad": 1,
      "Gurgaon": 1,
      "Hisar": 1,
      "Jhajjar": 1,
      "Jind": 1,
      "Kaithal": 1,
      "Karnal": 1,
      "Kurukshetra": 1,
      "Mahendragarh": 1,
      "Mewat": 1,
      "Palwal": 1,
      "Panchkula": 1,
      "Panipat": 1,
      "Rewari": 1,
      "Rohtak": 1,
      "Sirsa": 1,
      "Sonipat": 1,
      "Yamunanagar": 1
    }
  },
  "Himachal Pradesh": {
    "state": "Himachal Pradesh",
    "pincodeStartsWith": ["17"],
    "districts": {
      "Bilaspur": 1,
      "Chamba": 1,
      "Hamirpur": 1,
      "Kangra": 1,
      "Kinnaur": 1,
      "Kullu": 1,
      "Lahaul &amp; Spiti": 1,
      "Mandi": 1,
      "Shimla": 1,
      "Sirmaur (Sirmour)": 1,
      "Solan": 1,
      "Una": 1
    }
  },
  "Jammu and Kashmir": {
    "state": "Jammu and Kashmir",
    "pincodeStartsWith": ["18", "19"],
    "districts": {
      "Anantnag": 1,
      "Bandipore": 1,
      "Baramulla": 1,
      "Budgam": 1,
      "Doda": 1,
      "Ganderbal": 1,
      "Jammu": 1,
      "Kargil": 1,
      "Kathua": 1,
      "Kishtwar": 1,
      "Kulgam": 1,
      "Kupwara": 1,
      "Leh": 1,
      "Poonch": 1,
      "Pulwama": 1,
      "Rajouri": 1,
      "Ramban": 1,
      "Reasi": 1,
      "Samba": 1,
      "Shopian": 1,
      "Srinagar": 1,
      "Udhampur": 1
    }
  },
  "Jharkhand": {
    "state": "Jharkhand",
    "pincodeStartsWith": ["80", "81", "82", "83", "84", "85"],
    "districts": {
      "Bokaro": 1,
      "Chatra": 1,
      "Deoghar": 1,
      "Dhanbad": 1,
      "Dumka": 1,
      "East Singhbhum": 1,
      "Garhwa": 1,
      "Giridih": 1,
      "Godda": 1,
      "Gumla": 1,
      "Hazaribag": 1,
      "Jamtara": 1,
      "Khunti": 1,
      "Koderma": 1,
      "Latehar": 1,
      "Lohardaga": 1,
      "Pakur": 1,
      "Palamu": 1,
      "Ramgarh": 1,
      "Ranchi": 1,
      "Sahibganj": 1,
      "Seraikela-Kharsawan": 1,
      "Simdega": 1,
      "West Singhbhum": 1
    }
  },
  "Karnataka": {
    "state": "Karnataka",
    "pincodeStartsWith": ["56", "57", "58", "59"],
    "districts": {
      "Bagalkot": 1,
      "Ballari (Bellary)": 1,
      "Belagavi (Belgaum)": 1,
      "Bengaluru (Bangalore) Rural": 1,
      "Bengaluru (Bangalore) Urban": 1,
      "Bidar": 1,
      "Chamarajanagar": 1,
      "Chikballapur": 1,
      "Chikkamagaluru (Chikmagalur)": 1,
      "Chitradurga": 1,
      "Dakshina Kannada": 1,
      "Davangere": 1,
      "Dharwad": 1,
      "Gadag": 1,
      "Hassan": 1,
      "Haveri": 1,
      "Kalaburagi (Gulbarga)": 1,
      "Kodagu": 1,
      "Kolar": 1,
      "Koppal": 1,
      "Mandya": 1,
      "Mysuru (Mysore)": 1,
      "Raichur": 1,
      "Ramanagara": 1,
      "Shivamogga (Shimoga)": 1,
      "Tumakuru (Tumkur)": 1,
      "Udupi": 1,
      "Uttara Kannada (Karwar)": 1,
      "Vijayapura (Bijapur)": 1,
      "Yadgir": 1
    }
  },
  "Kerala": {
    "state": "Kerala",
    "pincodeStartsWith": ["67", "68", "69"],
    "districts": {
      "Alappuzha": 1,
      "Ernakulam": 1,
      "Idukki": 1,
      "Kannur": 1,
      "Kasaragod": 1,
      "Kollam": 1,
      "Kottayam": 1,
      "Kozhikode": 1,
      "Malappuram": 1,
      "Palakkad": 1,
      "Pathanamthitta": 1,
      "Thiruvananthapuram": 1,
      "Thrissur": 1,
      "Wayanad": 1
    }
  },
  "Ladakh": {
    "state": "Ladakh",
    "pincodeStartsWith": ["18", "19"],
    "districts": {
      "Kargil": 1,
      "Leh": 1
    }
  },
  "Lakshadweep": {
    "state": "Lakshadweep",
    "pincodeStartsWith": ["682"],
    "districts": {
      "Agatti": 1,
      "Amini": 1,
      "Androth": 1,
      "Bithra": 1,
      "Chethlath": 1,
      "Kavaratti": 1,
      "Kadmath": 1,
      "Kalpeni": 1,
      "Kilthan": 1,
      "Minicoy": 1
    }
  },
  "Madhya Pradesh": {
    "state": "Madhya Pradesh",
    "pincodeStartsWith": ["45", "46", "47", "48"],
    "districts": {
      "Agar Malwa": 1,
      "Alirajpur": 1,
      "Anuppur": 1,
      "Ashoknagar": 1,
      "Balaghat": 1,
      "Barwani": 1,
      "Betul": 1,
      "Bhind": 1,
      "Bhopal": 1,
      "Burhanpur": 1,
      "Chhatarpur": 1,
      "Chhindwara": 1,
      "Damoh": 1,
      "Datia": 1,
      "Dewas": 1,
      "Dhar": 1,
      "Dindori": 1,
      "Guna": 1,
      "Gwalior": 1,
      "Harda": 1,
      "Hoshangabad": 1,
      "Indore": 1,
      "Jabalpur": 1,
      "Jhabua": 1,
      "Katni": 1,
      "Khandwa": 1,
      "Khargone": 1,
      "Mandla": 1,
      "Mandsaur": 1,
      "Morena": 1,
      "Narsinghpur": 1,
      "Neemuch": 1,
      "Panna": 1,
      "Raisen": 1,
      "Rajgarh": 1,
      "Ratlam": 1,
      "Rewa": 1,
      "Sagar": 1,
      "Satna": 1,
      "Sehore": 1,
      "Seoni": 1,
      "Shahdol": 1,
      "Shajapur": 1,
      "Sheopur": 1,
      "Shivpuri": 1,
      "Sidhi": 1,
      "Singrauli": 1,
      "Tikamgarh": 1,
      "Ujjain": 1,
      "Umaria": 1,
      "Vidisha": 1
    }
  },
  "Maharashtra": {
    "state": "Maharashtra",
    "pincodeStartsWith": ["40", "41", "42", "43", "44"],
    "districts": {
      "Ahmednagar": 1,
      "Akola": 1,
      "Amravati": 1,
      "Aurangabad": 1,
      "Beed": 1,
      "Bhandara": 1,
      "Buldhana": 1,
      "Chandrapur": 1,
      "Dhule": 1,
      "Gadchiroli": 1,
      "Gondia": 1,
      "Hingoli": 1,
      "Jalgaon": 1,
      "Jalna": 1,
      "Kolhapur": 1,
      "Latur": 1,
      "Mumbai City": 1,
      "Mumbai Suburban": 1,
      "Nagpur": 1,
      "Nanded": 1,
      "Nandurbar": 1,
      "Nashik": 1,
      "Osmanabad": 1,
      "Palghar": 1,
      "Parbhani": 1,
      "Pune": 1,
      "Raigad": 1,
      "Ratnagiri": 1,
      "Sangli": 1,
      "Satara": 1,
      "Sindhudurg": 1,
      "Solapur": 1,
      "Thane": 1,
      "Wardha": 1,
      "Washim": 1,
      "Yavatmal": 1
    }
  },
  "Manipur": {
    "state": "Manipur",
    "pincodeStartsWith": ["795"],
    "districts": {
      "Bishnupur": 1,
      "Chandel": 1,
      "Churachandpur": 1,
      "Imphal East": 1,
      "Imphal West": 1,
      "Jiribam": 1,
      "Kakching": 1,
      "Kamjong": 1,
      "Kangpokpi": 1,
      "Noney": 1,
      "Pherzawl": 1,
      "Senapati": 1,
      "Tamenglong": 1,
      "Tengnoupal": 1,
      "Thoubal": 1,
      "Ukhrul": 1
    }
  },
  "Meghalaya": {
    "state": "Meghalaya",
    "pincodeStartsWith": ["793", "794"],
    "districts": {
      "East Garo Hills": 1,
      "East Jaintia Hills": 1,
      "East Khasi Hills": 1,
      "North Garo Hills": 1,
      "Ri Bhoi": 1,
      "South Garo Hills": 1,
      "South West Garo Hills ": 1,
      "South West Khasi Hills": 1,
      "West Garo Hills": 1,
      "West Jaintia Hills": 1,
      "West Khasi Hills": 1
    }
  },
  "Mizoram": {
    "state": "Mizoram",
    "pincodeStartsWith": ["796"],
    "districts": {
      "Aizawl": 1,
      "Champhai": 1,
      "Kolasib": 1,
      "Lawngtlai": 1,
      "Lunglei": 1,
      "Mamit": 1,
      "Saiha": 1,
      "Serchhip": 1
    }
  },
  "Nagaland": {
    "state": "Nagaland",
    "pincodeStartsWith": ["797", "798"],
    "districts": {
      "Dimapur": 1,
      "Kiphire": 1,
      "Kohima": 1,
      "Longleng": 1,
      "Mokokchung": 1,
      "Mon": 1,
      "Peren": 1,
      "Phek": 1,
      "Tuensang": 1,
      "Wokha": 1,
      "Zunheboto": 1
    }
  },
  "Odisha": {
    "state": "Odisha",
    "pincodeStartsWith": ["75", "76", "77"],
    "districts": {
      "Angul": 1,
      "Balangir": 1,
      "Balasore": 1,
      "Bargarh": 1,
      "Bhadrak": 1,
      "Boudh": 1,
      "Cuttack": 1,
      "Deogarh": 1,
      "Dhenkanal": 1,
      "Gajapati": 1,
      "Ganjam": 1,
      "Jagatsinghapur": 1,
      "Jajpur": 1,
      "Jharsuguda": 1,
      "Kalahandi": 1,
      "Kandhamal": 1,
      "Kendrapara": 1,
      "Kendujhar (Keonjhar)": 1,
      "Khordha": 1,
      "Koraput": 1,
      "Malkangiri": 1,
      "Mayurbhanj": 1,
      "Nabarangpur": 1,
      "Nayagarh": 1,
      "Nuapada": 1,
      "Puri": 1,
      "Rayagada": 1,
      "Sambalpur": 1,
      "Sonepur": 1,
      "Sundargarh": 1
    }
  },
  "Puducherry": {
    "state": "Puducherry",
    "pincodeStartsWith": ["605"],
    "districts": {
      "Karaikal": 1,
      "Mahe": 1,
      "Pondicherry": 1,
      "Yanam": 1
    }
  },
  "Punjab": {
    "state": "Punjab",
    "pincodeStartsWith": ["14", "15"],
    "districts": {
      "Amritsar": 1,
      "Barnala": 1,
      "Bathinda": 1,
      "Faridkot": 1,
      "Fatehgarh Sahib": 1,
      "Fazilka": 1,
      "Ferozepur": 1,
      "Gurdaspur": 1,
      "Hoshiarpur": 1,
      "Jalandhar": 1,
      "Kapurthala": 1,
      "Ludhiana": 1,
      "Mansa": 1,
      "Moga": 1,
      "Muktsar": 1,
      "Nawanshahr (Shahid Bhagat Singh Nagar)": 1,
      "Pathankot": 1,
      "Patiala": 1,
      "Rupnagar": 1,
      "Sahibzada Ajit Singh Nagar (Mohali)": 1,
      "Sangrur": 1,
      "Tarn Taran": 1
    }
  },
  "Rajasthan": {
    "state": "Rajasthan",
    "pincodeStartsWith": ["30", "31", "32", "33", "34"],
    "districts": {
      "Ajmer": 1,
      "Alwar": 1,
      "Banswara": 1,
      "Baran": 1,
      "Barmer": 1,
      "Bharatpur": 1,
      "Bhilwara": 1,
      "Bikaner": 1,
      "Bundi": 1,
      "Chittorgarh": 1,
      "Churu": 1,
      "Dausa": 1,
      "Dholpur": 1,
      "Dungarpur": 1,
      "Hanumangarh": 1,
      "Jaipur": 1,
      "Jaisalmer": 1,
      "Jalore": 1,
      "Jhalawar": 1,
      "Jhunjhunu": 1,
      "Jodhpur": 1,
      "Karauli": 1,
      "Kota": 1,
      "Nagaur": 1,
      "Pali": 1,
      "Pratapgarh": 1,
      "Rajsamand": 1,
      "Sawai Madhopur": 1,
      "Sikar": 1,
      "Sirohi": 1,
      "Sri Ganganagar": 1,
      "Tonk": 1,
      "Udaipur": 1
    }
  },
  "Sikkim": {
    "state": "Sikkim",
    "pincodeStartsWith": ["737"],
    "districts": {
      "East Sikkim": 1,
      "North Sikkim": 1,
      "South Sikkim": 1,
      "West Sikkim": 1
    }
  },
  "Tamil Nadu": {
    "state": "Tamil Nadu",
    "pincodeStartsWith": ["60", "61", "62", "63", "64", "65", "66"],
    "districts": {
      "Ariyalur": 1,
      "Chennai": 1,
      "Coimbatore": 1,
      "Cuddalore": 1,
      "Dharmapuri": 1,
      "Dindigul": 1,
      "Erode": 1,
      "Kanchipuram": 1,
      "Kanyakumari": 1,
      "Karur": 1,
      "Krishnagiri": 1,
      "Madurai": 1,
      "Nagapattinam": 1,
      "Namakkal": 1,
      "Nilgiris": 1,
      "Perambalur": 1,
      "Pudukkottai": 1,
      "Ramanathapuram": 1,
      "Salem": 1,
      "Sivaganga": 1,
      "Thanjavur": 1,
      "Theni": 1,
      "Thoothukudi (Tuticorin)": 1,
      "Tiruchirappalli": 1,
      "Tirunelveli": 1,
      "Tiruppur": 1,
      "Tiruvallur": 1,
      "Tiruvannamalai": 1,
      "Tiruvarur": 1,
      "Vellore": 1,
      "Viluppuram": 1,
      "Virudhunagar": 1
    }
  },
  "Telangana": {
    "state": "Telangana",
    "pincodeStartsWith": ["50"],
    "districts": {
      "Adilabad": 1,
      "Bhadradri Kothagudem": 1,
      "Hyderabad": 1,
      "Jagtial": 1,
      "Jangaon": 1,
      "Jayashankar Bhoopalpally": 1,
      "Jogulamba Gadwal": 1,
      "Kamareddy": 1,
      "Karimnagar": 1,
      "Khammam": 1,
      "Komaram Bheem Asifabad": 1,
      "Mahabubabad": 1,
      "Mahabubnagar": 1,
      "Mancherial": 1,
      "Medak": 1,
      "Medchal": 1,
      "Nagarkurnool": 1,
      "Nalgonda": 1,
      "Nirmal": 1,
      "Nizamabad": 1,
      "Peddapalli": 1,
      "Rajanna Sircilla": 1,
      "Rangareddy": 1,
      "Sangareddy": 1,
      "Siddipet": 1,
      "Suryapet": 1,
      "Vikarabad": 1,
      "Wanaparthy": 1,
      "Warangal (Rural)": 1,
      "Warangal (Urban)": 1,
      "Yadadri Bhuvanagiri": 1
    }
  },
  "Tripura": {
    "state": "Tripura",
    "pincodeStartsWith": ["799"],
    "districts": {
      "Dhalai": 1,
      "Gomati": 1,
      "Khowai": 1,
      "North Tripura": 1,
      "Sepahijala": 1,
      "South Tripura": 1,
      "Unakoti": 1,
      "West Tripura": 1
    }
  },
  "Uttar Pradesh": {
    "state": "Uttar Pradesh",
    "pincodeStartsWith": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
    "districts": {
      "Agra": 1,
      "Aligarh": 1,
      "Allahabad": 1,
      "Ambedkar Nagar": 1,
      "Amethi (Chatrapati Sahuji Mahraj Nagar)": 1,
      "Amroha (J.P. Nagar)": 1,
      "Auraiya": 1,
      "Azamgarh": 1,
      "Baghpat": 1,
      "Bahraich": 1,
      "Ballia": 1,
      "Balrampur": 1,
      "Banda": 1,
      "Barabanki": 1,
      "Bareilly": 1,
      "Basti": 1,
      "Bhadohi": 1,
      "Bijnor": 1,
      "Budaun": 1,
      "Bulandshahr": 1,
      "Chandauli": 1,
      "Chitrakoot": 1,
      "Deoria": 1,
      "Etah": 1,
      "Etawah": 1,
      "Faizabad": 1,
      "Farrukhabad": 1,
      "Fatehpur": 1,
      "Firozabad": 1,
      "Gautam Buddha Nagar": 1,
      "Ghaziabad": 1,
      "Ghazipur": 1,
      "Gonda": 1,
      "Gorakhpur": 1,
      "Hamirpur": 1,
      "Hapur (Panchsheel Nagar)": 1,
      "Hardoi": 1,
      "Hathras": 1,
      "Jalaun": 1,
      "Jaunpur": 1,
      "Jhansi": 1,
      "Kannauj": 1,
      "Kanpur Dehat": 1,
      "Kanpur Nagar": 1,
      "Kanshiram Nagar (Kasganj)": 1,
      "Kaushambi": 1,
      "Kushinagar (Padrauna)": 1,
      "Lakhimpur - Kheri": 1,
      "Lalitpur": 1,
      "Lucknow": 1,
      "Maharajganj": 1,
      "Mahoba": 1,
      "Mainpuri": 1,
      "Mathura": 1,
      "Mau": 1,
      "Meerut": 1,
      "Mirzapur": 1,
      "Moradabad": 1,
      "Muzaffarnagar": 1,
      "Pilibhit": 1,
      "Pratapgarh": 1,
      "RaeBareli": 1,
      "Rampur": 1,
      "Saharanpur": 1,
      "Sambhal (Bhim Nagar)": 1,
      "Sant Kabir Nagar": 1,
      "Shahjahanpur": 1,
      "Shamali (Prabuddh Nagar)": 1,
      "Shravasti": 1,
      "Siddharth Nagar": 1,
      "Sitapur": 1,
      "Sonbhadra": 1,
      "Sultanpur": 1,
      "Unnao": 1,
      "Varanasi": 1
    }
  },
  "Uttarakhand": {
    "state": "Uttarakhand",
    "pincodeStartsWith": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
    "districts": {
      "Almora": 1,
      "Bageshwar": 1,
      "Chamoli": 1,
      "Champawat": 1,
      "Dehradun": 1,
      "Haridwar": 1,
      "Nainital": 1,
      "Pauri Garhwal": 1,
      "Pithoragarh": 1,
      "Rudraprayag": 1,
      "Tehri Garhwal": 1,
      "Udham Singh Nagar": 1,
      "Uttarkashi": 1
    }
  },
  "West Bengal": {
    "state": "West Bengal",
    "pincodeStartsWith": ["70", "71", "72", "73", "74"],
    "districts": {
      "Alipurduar": 1,
      "Bankura": 1,
      "Birbhum": 1,
      "Burdwan (Bardhaman)": 1,
      "Cooch Behar": 1,
      "Dakshin Dinajpur (South Dinajpur)": 1,
      "Darjeeling": 1,
      "Hooghly": 1,
      "Howrah": 1,
      "Jalpaiguri": 1,
      "Kalimpong": 1,
      "Kolkata": 1,
      "Malda": 1,
      "Murshidabad": 1,
      "Nadia": 1,
      "North 24 Parganas": 1,
      "Paschim Medinipur (West Medinipur)": 1,
      "Purba Medinipur (East Medinipur)": 1,
      "Purulia": 1,
      "South 24 Parganas": 1,
      "Uttar Dinajpur (North Dinajpur)": 1
    }
  }
};
},{}],"component-functions/state-district-select.js":[function(require,module,exports) {
"use strict";

var _locationDetailsParsed = _interopRequireDefault(require("../../../../staticData/locationDetailsParsed.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Array.from(document.getElementsByClassName('js--components-function--state-district-select')).forEach(function (stateSelect) {
  stateSelect.addEventListener('change', function (e) {
    var districtJsQuery = this.dataset.districtJsQuery;
    var state = this.value;

    if (!districtJsQuery || !state || !_locationDetailsParsed.default[state]) {
      return;
    }

    var districtSelect = document.querySelector(districtJsQuery);
    districtSelect.innerHTML = Object.keys(_locationDetailsParsed.default[state].districts).map(function (district) {
      return "<option value='".concat(district, "'>").concat(district, "</option>");
    }).join('');
  });
});
},{"../../../../staticData/locationDetailsParsed.json":"../../../staticData/locationDetailsParsed.json"}],"component-functions/toggle-on-click.js":[function(require,module,exports) {
Array.from(document.getElementsByClassName('js--components-function--toggle-on-click')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    var _this$dataset = this.dataset,
        toggleClass = _this$dataset.toggleClass,
        toggleElementId = _this$dataset.toggleElementId;

    if (!toggleClass) {
      return;
    }

    var element = document.getElementById(toggleElementId);

    if (!element) {
      return;
    }

    element.classList.toggle(toggleClass);
  });
});
},{}],"component-functions/increment-decrement-input-number.js":[function(require,module,exports) {
// Get input field here
var getInput = function getInput(btn) {
  var ancestor = btn.closest('.js--components-function--increment-decrement-input-number');

  if (!ancestor) {
    return null;
  }

  var input = ancestor.querySelector('.js--components-function--increment-decrement-input-number__input');
  return input;
}; // Decrease btn


Array.from(document.getElementsByClassName('js--components-function--increment-decrement-input-number__decrease')).forEach(function (decrement) {
  decrement.addEventListener('click', function () {
    var input = getInput(this);

    if (!input) {
      return;
    }

    input.stepDown();
  });
}); // Increase btn

Array.from(document.getElementsByClassName('js--components-function--increment-decrement-input-number__increase')).forEach(function (decrement) {
  decrement.addEventListener('click', function () {
    var input = getInput(this);

    if (!input) {
      return;
    }

    input.stepUp();
  });
});
},{}],"pages/each-product.js":[function(require,module,exports) {
var bigImg = document.querySelector('.js--page-each-product--big-img');
var imgs = document.querySelectorAll('.js--page-each-product--imgs');
var lens = document.querySelector('.js--page-each-product--lens');
var zoomedImg = document.querySelector('.js--page-each-product--zoomed-img');
var toZoom = document.querySelector('.js--page-each-product--to-zoom');
/* =========== Img changer ========== */

Array.from(imgs).forEach(function (img) {
  img.addEventListener('mouseover', function () {
    if (!bigImg) {
      return;
    }

    bigImg.src = this.src;
    zoomedImg.style.backgroundImage = "url(\"".concat(bigImg.src, "\")");
  });
});

if (lens && zoomedImg && toZoom && bigImg) {
  var ratioX, ratioY;
  zoomedImg.style.backgroundImage = "url(\"".concat(bigImg.src, "\")");
  /*execute a function when someone moves the cursor over the image, or the lens:*/

  lens.addEventListener('mousemove', moveLens);
  toZoom.addEventListener('mousemove', moveLens); // show hide zoomedImg and lens

  toZoom.addEventListener('mouseenter', showZoomEffect);
  toZoom.addEventListener('mouseleave', hideZoomEffect);

  function moveLens(e) {
    e.preventDefault();
    var pos = getCursorPos(e);
    var x = pos.x - lens.offsetWidth / 2;
    var y = pos.y - lens.offsetHeight / 2;

    if (x > toZoom.offsetWidth - lens.offsetWidth) {
      x = toZoom.offsetWidth - lens.offsetWidth;
    } else if (x < 0) {
      x = 0;
    }

    if (y > toZoom.offsetHeight - lens.offsetHeight) {
      y = toZoom.offsetHeight - lens.offsetHeight;
    } else if (y < 0) {
      y = 0;
    }

    lens.style.left = "".concat(x, "px");
    lens.style.top = "".concat(y, "px"); // const ratioX = zoomedImg.offsetWidth / lens.offsetWidth;
    // const ratioY = zoomedImg.offsetHeight / lens.offsetHeight;
    // zoomedImg.style.backgroundSize = `${toZoom.offsetWidth * ratioX}px ${
    //   toZoom.offsetHeight * ratioY
    // }px`;

    zoomedImg.style.backgroundPosition = "-".concat(x * ratioX, "px -").concat(y * ratioY, "px");
  }

  function showZoomEffect() {
    zoomedImg.style.display = 'block';
    lens.style.display = 'block';
    zoomedImg.style.height = "".concat(zoomedImg.offsetWidth, "px");
    ratioX = zoomedImg.offsetWidth / lens.offsetWidth;
    ratioY = zoomedImg.offsetHeight / lens.offsetHeight;
    zoomedImg.style.backgroundSize = "".concat(toZoom.offsetWidth * ratioX, "px ").concat(toZoom.offsetHeight * ratioY, "px");
  }

  function hideZoomEffect() {
    zoomedImg.style.display = 'none';
    lens.style.display = 'none';
  }

  function getCursorPos(e) {
    var a,
        x = 0,
        y = 0;
    e = e || window.event;
    a = toZoom.getBoundingClientRect();
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {
      x: x,
      y: y
    };
  }
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

require("./ajax/add-to-cart-btn");

require("./ajax/address");

require("./ajax/cart");

require("./ajax/change-my-email");

require("./ajax/checkout");

require("./ajax/checkout-address");

require("./ajax/forgot-password");

require("./ajax/login");

require("./ajax/order-one");

require("./ajax/reset-password");

require("./ajax/review");

require("./ajax/signup");

require("./ajax/signup-complete");

require("./ajax/update-me");

require("./ajax/update-my-password");

require("./component-functions/btn-confirm-redirect");

require("./component-functions/dropdown");

require("./component-functions/flash-messages");

require("./component-functions/form-rating");

require("./component-functions/remove-on-click");

require("./component-functions/search");

require("./component-functions/sidebar");

require("./component-functions/sliders");

require("./component-functions/state-district-select");

require("./component-functions/toggle-on-click");

require("./component-functions/increment-decrement-input-number");

require("./pages/each-product");
},{"./ajax/add-to-cart-btn":"ajax/add-to-cart-btn.js","./ajax/address":"ajax/address.js","./ajax/cart":"ajax/cart.js","./ajax/change-my-email":"ajax/change-my-email.js","./ajax/checkout":"ajax/checkout.js","./ajax/checkout-address":"ajax/checkout-address.js","./ajax/forgot-password":"ajax/forgot-password.js","./ajax/login":"ajax/login.js","./ajax/order-one":"ajax/order-one.js","./ajax/reset-password":"ajax/reset-password.js","./ajax/review":"ajax/review.js","./ajax/signup":"ajax/signup.js","./ajax/signup-complete":"ajax/signup-complete.js","./ajax/update-me":"ajax/update-me.js","./ajax/update-my-password":"ajax/update-my-password.js","./component-functions/btn-confirm-redirect":"component-functions/btn-confirm-redirect.js","./component-functions/dropdown":"component-functions/dropdown.js","./component-functions/flash-messages":"component-functions/flash-messages.js","./component-functions/form-rating":"component-functions/form-rating.js","./component-functions/remove-on-click":"component-functions/remove-on-click.js","./component-functions/search":"component-functions/search.js","./component-functions/sidebar":"component-functions/sidebar.js","./component-functions/sliders":"component-functions/sliders.js","./component-functions/state-district-select":"component-functions/state-district-select.js","./component-functions/toggle-on-click":"component-functions/toggle-on-click.js","./component-functions/increment-decrement-input-number":"component-functions/increment-decrement-input-number.js","./pages/each-product":"pages/each-product.js"}],"../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59815" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/index.js.map