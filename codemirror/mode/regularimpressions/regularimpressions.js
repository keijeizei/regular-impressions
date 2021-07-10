// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("regularimpressions", function() {
  function words(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) {
      keys[array[i]] = true;
    }
    return keys;
  }

  var keywords = words([
                  "anyof", "anyexcept", "ifnextis", "ifnextisnot",
                  "ifprevis", "ifprevisnot", "end", "range", "regex",
                  "repeat", "start", "variable"]);

  var builtins = words(["and", "or", "to", "with"]);

  function tokenBase(stream, state) {

    if (stream.match(/^\s*comment/)) {
      stream.skipToEnd();
      return 'comment';
    }

    if (stream.match('inf')) {
      return 'number';
    }

    if (stream.match(/:\w*:/)) {
      return 'string';
    }

    var ch = stream.next();
    if (/[\[\]\(\),\{\}]/.test(ch)) {
      return null;
	  }

    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return "number";
    }

    stream.eatWhile(/[\w\$_]/);
    var word = stream.current().toLowerCase();

    if (keywords.hasOwnProperty(word)){
      return 'keyword';
    }
    if (builtins.hasOwnProperty(word)) {
      return 'builtin';
    }
    return "variable";
  }

  // Interface

  return {
    startState: function() {
      return {tokenize: null};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      return style;
    }
  };
});

CodeMirror.defineMIME("text/x-regularimpressions", "regularimpressions");

});
