"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = _default;

var _configureDepFns = _interopRequireDefault(require("../base/configure-dep-fns"));

var _constant = require("../../support/constant");

function _default(refCtx) {
  return function (computedItem, computedHandler, depKeysOrOpt) {
    var confMeta = {
      type: _constant.FN_CU,
      refCtx: refCtx,
      stateKeys: refCtx.stateKeys,
      retKeyFns: refCtx.computedRetKeyFns,
      module: refCtx.module,
      connect: refCtx.connect,
      dep: refCtx.computedDep
    };
    refCtx.__$$cuOrWaCalled = true;
    (0, _configureDepFns["default"])(_constant.CATE_REF, confMeta, computedItem, computedHandler, depKeysOrOpt);
  };
}