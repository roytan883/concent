"use strict";

exports.__esModule = true;
exports.clearCbs = clearCbs;
exports.send = send;
exports.on = on;

var _constant = require("../../support/constant");

var sigs = [_constant.SIG_FN_START, _constant.SIG_FN_END, _constant.SIG_FN_QUIT, _constant.SIG_FN_ERR, _constant.SIG_MODULE_CONFIGURED, _constant.SIG_STATE_CHANGED];
var sig_cbs_ = {};
sigs.forEach(function (sig) {
  return sig_cbs_[sig] = [];
});

function _pushSigCb(sigMap, sigOrSigs, cb) {
  function pushCb(sig, cb) {
    var cbs = sigMap[sig];

    if (cb) {
      cbs.push(cb);
    } else {
      console.warn("invalid sig[" + sig + "]");
    }
  }

  if (Array.isArray(sigOrSigs)) {
    sigOrSigs.forEach(function (sig) {
      pushCb(sig, cb);
    });
  } else {
    pushCb(sigOrSigs, cb);
  }
}

function clearCbs() {
  sigs.forEach(function (sig) {
    return sig_cbs_[sig].length = 0;
  });
}

function send(sig, payload) {
  var cbs = sig_cbs_[sig];
  cbs.forEach(function (cb) {
    return cb({
      sig: sig,
      payload: payload
    });
  });
}

function on(sigOrSigs, cb) {
  _pushSigCb(sig_cbs_, sigOrSigs, cb);
}