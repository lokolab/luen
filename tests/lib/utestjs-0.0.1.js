/**
 * Utestjs JavaScript testing library.
 *
 * Copyright (c) Krystian Pietruszka <kpietru@lokolab.net>
 * License MIT
 */

/**
 * @param {!string} name
 * @param {!Function} callback
 *
 * @return {!void}
 */
var test = function(name, callback) {
    document.querySelectorAll('#results')[0].innerHTML += '<dt>' + name + '</dt>';
    callback();
};

/** @type {!Object} */
var _testCounter = {
    all: function() {
        _testCounter._inner('#counter_all');
    },
    ok: function() {
        _testCounter._inner('#counter_ok');
    },
    error: function() {
        _testCounter._inner('#counter_error');
    },
    _inner: function(selector) {
        document.querySelectorAll(selector)[0].innerHTML = parseInt(
            document.querySelectorAll(selector)[0].innerHTML
        ) + 1;
    }
};

/**
 * @param {*} variable1
 * @param {*} variable2
 *
 * @return {!void}
 */
var assertSame = function(variable1, variable2) {
    if (variable1 === variable2) {
        var result = '<span style="color: green;">ok</span>';
        _testCounter.ok();
    } else {
        var result = '<span style="color: red;">error</span>';
        _testCounter.error();
    }
    document.querySelectorAll('#results')[0].innerHTML += '<dd>' + result + '</dd>';
    _testCounter.all();
};

/**
 * @param {*} Some arguments.
 *
 * @return {!void}
 */
var assertType = function() {
    var errors = 0;
    for (var i = 1, len = arguments.length; i < len; i++) {
        if (arguments[i] === '*') {
            var errors = 0;
            break;
        } else if (
            arguments[i] === null && arguments[0] === null ||
            typeof arguments[i] === 'function' && arguments[i] !== null && arguments[0] instanceof arguments[i] ||
            typeof arguments[i] === 'string' && typeof arguments[0] === arguments[i]
        ) {
            // empty
        } else {
            errors++;
        }
    }
    if (errors === (arguments.length - 1)) {
        var args = Array.prototype.slice.call(arguments);
        var arg = args.shift();
        var result = '<span style="color: red;">error</span>';
        _testCounter.error();
    } else {
        var result = '<span style="color: green;">ok</span>';
        _testCounter.ok();
    }
    document.querySelectorAll('#results')[0].innerHTML += '<dd>' + result + '</dd>';
    _testCounter.all();
};

/**
 * @param {!string} errorName
 * @param {!Function} callback
 *
 * @return {!void}
 */
var assertException = function(errorName, callback) {
    try {
        var result = '<span style="color: red;">error</span>';
        callback();
        var r = 'error';
    } catch(e) {
        var estr = '' + e;
        if (estr.match('^' + errorName + ':')) {
            var result = '<span style="color: green;">ok</span>';
            var r = 'ok';
        }
    }
    if (r === 'ok') {
        _testCounter.ok();
    } else {
        _testCounter.error();
    }
    document.querySelectorAll('#results')[0].innerHTML += '<dd>' + result + '</dd>';
    _testCounter.all();
};

