/**
 * Luen JavaScript library with a friendly API.
 *
 * Copyright (c) Krystian Pietruszka <kpietru@lokolab.net>
 * License MIT
 *
 * Inspirations:
 * - jQuery JavaScript Library v2.2.4
 *   http://jquery.com/
 * - Cookie Functions -- "Night of the Living Cookie" Version (25-Jul-96)
 *   Written by:  Bill Dortch, hIdaho Design <bdortch@hidaho.com>
 *   http://www.cookiecentral.com/code/cookie.txt
 */

'use strict';

(function(window) {

    /** @type {!Object} */
    var document = window.document;

    /**
     * Luen
     *
     * @constructor
     *
     * @param {*} query
     *
     * @return {Luen} The invoked object.
     */
    window.Luen = function(query) {
        luen.assertType(query, '*');
        return this._initialize(query);
    };

    /**
     * @param {*} query
     *
     * @return {!Object}
     */
    window.luen = window.$ = function(query) {
        luen.assertType(query, '*');
        return new Luen(query);
    };

    /** @type {!string} */
    luen.VERSION = '0.0.1';

    /** @type {!Object} */
    luen.REGEX_NOT_WHITE = /[\n\r\t\f]/g;

    /** @type {!Object} */
    luen.fn = Luen.prototype = {

        /** @type {!string} */
        query: '',

        /** @type {!undefined, !Object} */
        context: undefined,

        /** @type {!number} */
        length: 0,

        /**
         * Initializes the class.
         *
         * @param {*} query
         *
         * @return {!Luen} The invoked object.
         */
        _initialize: function(query) {
            luen.assertType(query, '*');
            if (!query) {
                return this;
            }
            this.context = document;
            if (typeof query === 'string') {
                if (
                    // XML/HTML: <tag>
                    query.indexOf('<') >= 0 &&
                    query.match(/^\s*(<[\w\W]+>)[^>]*$/)
                ) {
                    // See: http://regex101.com/r/sE6fZ7/7
                    //var matchStrict = query.match(/^(<![\w\W]+>|<\?[\w\W]+\?>)?\s*(<\?[\w\W]+\?>\s*)*<([\w\W]+)(\s+[^>]*>|>)[\s\S]*<\/\3>\s*(.*)/);
                    //if (matchStrict && !matchStrict[5]) {
                        this.context = luen.parseDom('<luenRoot>' + query + '</luenRoot>');
                        var obj = luen.selector('luenRoot > *', this.getContext());
                    //}
                } else {
                    this.query = query;
                    var obj = luen.selector(query, this.getContext(), true);
                }
            } else if (typeof query === 'object') {
                if (query instanceof Luen) {
                    return query;
                }
                this.context = query;
                if (query instanceof NodeList) {
                    var obj = query;
                } else if (
                    // document, XMLDocument HTMLDocument, etc.
                    // XMLDocument problem with namespaces (set, get attributes, etc.).
                    // The best solution parse xml as html.
                    query instanceof Node
                ) {
                    var obj = [query];
                } else {
                    throw new TypeError('Invalid type, must be a valid object.');
                }
            } else if (typeof query === 'function') {
                return this.ready(query);
            } else {
                throw new TypeError('Invalid type, must be a string or a valid object.');
            }
            this.length = obj.length;
            return this.extend(obj);
        },

        /**
         * @param {!string} query
         *
         * @return {!Luen} The invoked object.
         */
        find: function(query) {
            luen.assertType(query, 'string');
            if (this.getQuery() && typeof this.getQuery() === 'string') {
                this.query = this.getQuery() + ' ' + query;
            } else {
                this.query = query;
            }
            var obj = luen.selector(this.getQuery(), this.getContext(), true);
            this.length = obj.length;
            return this.extend(obj);
        },

        /**
         * @param {!Object} obj
         *
         * @return {!Luen} The invoked object.
         */
        extend: function(obj) {
            luen.assertType(obj, 'object');
            return luen.extend(this, obj);
        },

        /**
         * @param {!Function} callback
         *
         * @return {!Luen} The invoked object.
         */
        ready: function(callback) {
            luen.assertType(callback, 'function');
            return this.on('DOMContentLoaded', callback);
        },

        /**
         * @param {!string}   event
         * @param {!Function} callback
         *
         * @return {!Luen} The invoked object.
         */
        on: function(event, callback) {
            luen.assertType(event, 'string');
            luen.assertType(callback, 'function');
            return this.each(function() {
                this.addEventListener(event, callback);
            });
        },

        /**
         * @param {!string}   event
         * @param {!Function} callback
         *
         * @return {!Luen} The invoked object.
         */
        off: function(event, callback) {
            luen.assertType(event, 'string');
            luen.assertType(callback, 'function');
            return this.each(function() {
                this.removeEventListener(event, callback);
            });
        },

        /**
         * @param {!Function} callback
         *
         * @return {!Luen} The invoked object.
         */
        each: function(callback) {
            luen.assertType(callback, 'function');
            return luen.each(this, callback);
        },

        /**
         * @return {string}
         */
        getQuery: function() {
            return this.query;
        },

        /**
         * @return {!Object}
         */
        getContext: function() {
            return this.context;
        },

        /**
         * @return {!number}
         */
        getLength: function() {
            return this.length;
        },

        /**
         * @return {!undefined|!string}
         */
        getName: function() {
            // 9 for document
            return this[0] && (this[0].nodeType === 1 || this[0].nodeType === 9)
                ? this[0].nodeName
                : undefined;
        },

        /**
         * @param {!string} action
         *
         * @return {!boolean}
         */
        is: function(action) {
            luen.assertType(action, 'string');
            var key = action.substring(1);
            return this.hasProperty(key) ? this.getProperty(key) : false;
        },

        /**
         * @param {!string} key
         *
         * @return {!boolean}
         */
        hasProperty: function(key) {
            luen.assertType(key, 'string');
            return this[0] && this[0] instanceof Node ? key in this[0] : false;
        },

        /**
         * @param {!string}                  key
         * @param {!string|!boolean|!number} value
         *
         * @return {!Luen} The invoked object.
         */
        setProperty: function(key, value) {
            luen.assertType(key, 'string');
            luen.assertType(value, 'string', 'boolean', 'number');
            return this.each(function() {
                this[key] = value;
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!undefined|!string|!boolean|!number}
         */
        getProperty: function(key) {
            luen.assertType(key, 'string');
            return this.hasProperty(key) ? this[0][key] : undefined;
        },

        /**
         * @param {!string} key
         *
         * @return {!Luen} The invoked object.
         */
        removeProperty: function(key) {
            luen.assertType(key, 'string');
            return this.each(function() {
                delete this[key];
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!boolean}
         */
        hasPropertyStyle: function(key) {
            luen.assertType(key, 'string');
            if (this[0] && this[0].nodeType === 1 && 'style' in this[0] && this[0].style[key]) {
                return true;
            }
            return false;
        },

        /**
         * @param {!string|!Object}    key
         * @param {!undefined|!string} value
         *
         * @return {!Luen} The invoked object.
         */
        setPropertyStyle: function(key, value) {
            luen.assertType(key, 'string', 'object');
            luen.assertType(value, 'undefined', 'string');
            if (typeof key === 'object') {
                var style = key;
            } else {
                var style = {};
                style[key] = value;
            }
            return this.each(function() {
                var self = this;
                luen.each(style, function(key, value) {
                    if ('style' in self) {
                        self.style[key] = value;
                    } else {
                        luen.extend(self, {"style": {}});
                        self.style[key] = value;
                    }
                });
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!undefined|!string}
         */
        getPropertyStyle: function(key) {
            luen.assertType(key, 'string');
            return this.hasPropertyStyle(key) ? this[0].style[key] : undefined;
        },

        /**
         * @param {!string}            key
         * @param {!undefined|!string} pseudo
         *
         * @return {!boolean}
         */
        hasComputedStyle: function(key, pseudo) {
            luen.assertType(key, 'string');
            luen.assertType(pseudo, 'undefined', 'string');
            if (!this[0] || this[0].nodeType !== 1 || this.getContext() !== document) {
                return false;
            }
            var p = typeof pseudo === 'undefined' ? null : pseudo;
            var get = this[0].ownerDocument.defaultView.getComputedStyle(this[0], p).getPropertyValue(key);
            return get === null || get === '' ? false : true;
        },

        /**
         * @param {!string}            key
         * @param {!undefined|!string} pseudo
         *
         * @return {!undefined|!string}
         */
        getComputedStyle: function(key, pseudo) {
            luen.assertType(key, 'string');
            luen.assertType(pseudo, 'undefined', 'string');
            if (!this.hasComputedStyle(key, pseudo)) {
                return undefined;
            }
            var p = typeof pseudo === 'undefined' ? null : pseudo;
            return this[0].ownerDocument.defaultView.getComputedStyle(this[0], p).getPropertyValue(key);
        },

        /**
         * @param {!string}            key
         * @param {!undefined|!string} pseudo
         *
         * @return {!boolean}
         */
        hasCss: function(key, pseudo) {
            luen.assertType(key, 'string');
            luen.assertType(pseudo, 'undefined', 'string');
            if (!this.hasPropertyStyle(luen._styleToCase(key)) && !this.hasComputedStyle(key, pseudo)) {
                return false;
            }
            return true;
        },

        /**
         * @param {!string|!Object}    key
         * @param {!undefined|!string} value
         *
         * @return {!Luen} The invoked object.
         */
        setCss: function(key, value) {
            luen.assertType(key, 'string', 'object');
            luen.assertType(value, 'undefined', 'string');
            if (typeof key === 'object') {
                var css = key;
            } else {
                var css = {};
                css[key] = value;
            }
            return this.each(function() {
                var elem = luen(this);
                luen.each(css, function(key, value) {
                    elem.setPropertyStyle(luen._styleToCase(key), value);
                });
            });
        },

        /**
         * @param {!string}            key
         * @param {!undefined|!string} pseudo
         *
         * @return {!string}
         */
        getCss: function(key, pseudo) {
            luen.assertType(key, 'string');
            luen.assertType(pseudo, 'undefined', 'string');
            if (this.hasPropertyStyle(luen._styleToCase(key))) {
                return this.getPropertyStyle(luen._styleToCase(key));
            }
            return this.getComputedStyle(key, pseudo);
        },

        /**
         * @param {!string} key
         *
         * @return {!boolean}
         */
        hasAttribute: function(key) {
            luen.assertType(key, 'string');
            return this[0] && this[0].nodeType === 1 ? this[0].hasAttribute(key) : false;
        },

        /**
         * @param {!string} key
         * @param {!string} value
         *
         * @return {!Luen} The invoked object.
         */
        setAttribute: function(key, value) {
            luen.assertType(key, 'string');
            luen.assertType(value, 'string');
            return this.each(function() {
                this.setAttribute(key, value);
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!undefined|!string}
         */
        getAttribute: function(key) {
            luen.assertType(key, 'string');
            if (!this.hasAttribute(key) || this[0].getAttribute(key) === null) {
                return undefined;
            }
            return this[0].getAttribute(key);
        },

        /**
         * @param {!string} key
         *
         * @return {!Luen} The invoked object.
         */
        removeAttribute: function(key) {
            luen.assertType(key, 'string');
            return this.each(function() {
                this.removeAttribute(key);
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!boolean}
         */
        hasClass: function(key) {
            luen.assertType(key, 'string');
            if (this[0] && this[0].nodeType === 1 && this[0].hasAttribute('class')) {
                var val = this[0].getAttribute('class');
                var val = ' ' + val + ' '.replace(luen.REGEX_NOT_WHITE, ' ');
                return val.indexOf(' ' + key.trim() + ' ') < 0 ? false : true;
            }
            return false;
        },

        /**
         * @param {!string} key
         *
         * @return {!Luen} The invoked object.
         */
        addClass: function(key) {
            luen.assertType(key, 'string');
            return this.each(function() {
                var elem = luen(this);
                if (!elem.hasAttribute('class')) {
                    elem.setAttribute('class', key.trim());
                } else if (!elem.hasClass(key)) {
                    var val = elem.getAttribute('class');
                    var val = ' ' + val + ' '.replace(luen.REGEX_NOT_WHITE, ' ');
                    elem.setAttribute('class', val.trim() + ' ' + key.trim());
                }
            });
        },

        /**
         * @param {!string} key
         *
         * @return {!Luen} The invoked object.
         */
        removeClass: function(key) {
            luen.assertType(key, 'string');
            return this.each(function() {
                var elem = luen(this);
                if (elem.hasClass(key)) {
                    var val = elem.getAttribute('class');
                    var val = ' ' + val + ' '.replace(luen.REGEX_NOT_WHITE, ' ');
                    var val = val.replace(' ' + key.trim() + ' ', ' ');
                    elem.removeAttribute('class');
                    elem.setAttribute('class', val.trim());
                }
            });
        },

        /**
         * @return {!Object}
         */
        getOffset: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return undefined;
            }
            return {
                top:    this[0].offsetTop,
                left:   this[0].offsetLeft,
                width:  this[0].offsetWidth,
                height: this[0].offsetHeight
            }
        },

        /**
         * @param {!string} query
         *
         * @return {!Luen}
         */
        insertBefore: function(query) {
            luen.assertType(query, 'string');
            var src = this[0];
            return luen(query).each(function() {
                if (src && this.parentNode) {
                    this.parentNode.insertBefore(src, this);
                }
            });
        },

        /**
         * @param {!string} query
         *
         * @return {!Luen}
         */
        insertAfter: function(query) {
            luen.assertType(query, 'string');
            var src = this[0];
            return luen(query).each(function() {
                if (src && this.parentNode) {
                    this.parentNode.insertBefore(src, this.nextSibling);
                }
            });
        },

        /**
         * @param {!string} query
         *
         * @return {!Luen}
         */
        prependTo: function(query) {
            luen.assertType(query, 'string');
            var src = this[0];
            return luen(query).each(function() {
                if (src) {
                    this.insertBefore(src, this.firstChild);
                }
            });
        },

        /**
         * @param {!string} query
         *
         * @return {!Luen}
         */
        appendTo: function(query) {
            luen.assertType(query, 'string');
            var src = this[0];
            return luen(query).each(function() {
                if (src) {
                    this.appendChild(src);
                }
            });
        },

        /**
         * @param {!string} place Options: beforebegin, afterbegin, beforeend, afterend.
         * @param {!string} value
         *
         * @return {!Luen} The invoked object.
         */
        insertHtml: function(place, value) {
            luen.assertType(value, 'string');
            luen.assertType(place, 'string');
            return this.each(function() {
                this.insertAdjacentHTML(place, value);
            });
        },

        /**
         * @param {!string} value
         *
         * @return {!Luen} The invoked object.
         */
        setHtml: function(value) {
            luen.assertType(value, 'string');
            return this.each(function() {
                this.innerHTML = value;
            });
        },

        /**
         * @param {!string} value
         *
         * @return {!Luen} The invoked object.
         */
        addHtml: function(value) {
            luen.assertType(value, 'string');
            return this.each(function() {
                this.innerHTML += value;
            });
        },

        /**
         * @return {!undefined|!string}
         */
        getHtml: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return undefined;
            }
            return this[0].innerHTML;
        },

        /**
         * @return {!Luen}
         */
        getParent: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return luen(null);
            }
            return luen(this[0].parentNode);
        },

        /**
         * @return {!Luen}
         */
        getChildren: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return luen(null);
            }
            return luen(this[0].childNodes);
        },

        /**
         * @return {!Luen}
         */
        getPrev: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return luen(null);
            }
            // Without text and comments.
            return luen(this[0].previousElementSibling);
        },

        /**
         * @return {!Luen}
         */
        getNext: function() {
            if (!this[0] || this[0].nodeType !== 1) {
                return luen(null);
            }
            // Without text and comments.
            return luen(this[0].nextElementSibling);
        },

        /**
         * @return {!Luen} The invoked object.
         */
        remove: function() {
            return this.each(function(index, value, elem) {
                this.parentNode.removeChild(this);
                elem[index] = undefined;
            });
        },

        /**
         * @param {!undefined|!string|!number|!Function} effect
         * @param {!undefined|!number|!Function}         milisec
         *
         * @return {!Luen} The invoked object.
         */
        show: function(effect, milisec) {
            luen.assertType(effect, 'undefined', 'string', 'number', 'function');
            luen.assertType(milisec, 'undefined', 'number', 'function');
            return this.each(function() {
                var elem = luen(this);
                elem.setAttribute('data-luen-toggle', 'show');
                if (typeof effect === 'number') {
                    luen.effects['fade'].show(elem, milisec);
                } else if (typeof effect === 'string') {
                    luen.effects[effect].show(elem, milisec);
                } else if (typeof effect === 'function') {
                    effect(elem, milisec);
                } else {
                    elem.setPropertyStyle('display', '');
                }
            });
        },

        /**
         * @param {!undefined|!string|!number|!Function} effect
         * @param {!undefined|!number|!Function}         milisec
         *
         * @return {!Luen} The invoked object.
         */
        hide: function(effect, milisec) {
            luen.assertType(effect, 'undefined', 'string', 'number', 'function');
            luen.assertType(milisec, 'undefined', 'number', 'function');
            return this.each(function() {
                var elem = luen(this);
                elem.setAttribute('data-luen-toggle', 'hide');
                if (typeof effect === 'number') {
                    luen.effects['fade'].hide(elem, milisec);
                } else if (typeof effect === 'string') {
                    luen.effects[effect].hide(elem, milisec);
                } else if (typeof effect === 'function') {
                    effect(elem, milisec);
                } else {
                    elem.setPropertyStyle('display', 'none');
                }
            });
        },

        /**
         * @param {!undefined|!string|!number|!Function} effect
         * @param {!undefined|!number|!Function}         milisec
         *
         * @return {!Luen} The invoked object.
         */
        toggle: function(effect, milisec) {
            luen.assertType(effect, 'undefined', 'string', 'number', 'function');
            luen.assertType(milisec, 'undefined', 'number', 'function');
            return this.each(function() {
                var elem = luen(this);
                if (!elem.hasAttribute('data-luen-toggle') || elem.getAttribute('data-luen-toggle') === 'show') {
                    elem.hide(effect, milisec);
                } else {
                    elem.show(effect, milisec);
                }
            });
        },

        /**
         * @return {!string}
         */
        serialize: function() {
            var arr = [];
            var attrToArr = function(key, value) {
                arr.push(
                    encodeURIComponent(key) + '=' + (
                        value === null ? '' : encodeURIComponent(value)
                    )
                );
            };
            this.find('*').each(function() {
                var elem = luen(this);
                if (!elem.is(':disabled')) {
                    if (
                        elem.is(':selected') &&
                        elem.getParent().hasAttribute('name') &&
                        elem.getParent().getName().toLowerCase() === 'select'
                    ) {
                        attrToArr(elem.getParent().getAttribute('name'), elem.getProperty('value'));
                    } else if (
                        elem.hasAttribute('name') && (
                            elem.is(':checked') ||
                            elem.getName().toLowerCase() === 'textarea' ||
                            elem.hasAttribute('type') &&
                            !elem.getAttribute('type').match(/^(radio|checkbox)$/i)
                        )
                    ) {
                        attrToArr(elem.getAttribute('name'), elem.getProperty('value'));
                    }
                }
            });
            return arr.join('&').replace(/%20/g, '+');
        },

        /**
         * @param {!string}                              url
         * @param {!undefined|!Object|!string|!Function} params
         * @param {!undefined|!Function}                 success
         *
         * @return {!Luen} The invoked object.
         */
        ajaxLoad: function(url, params, success) {
            luen.assertType(url, 'string');
            luen.assertType(params, 'undefined', 'object', 'string', 'function');
            luen.assertType(success, 'undefined', 'function');
            var self = this;
            var num = url.indexOf(' ');
            var extr = {
                url:   num > -1 ? url.slice(0, num)     : url,
                query: num > -1 ? url.slice(num).trim() : null
            };
            if (typeof params === 'string') {
                params = luen.parseParams(params);
            } else if (typeof params === 'function') {
                success = params;
                params = undefined;
            }
            luen.ajaxGet(extr.url, params, function(data, xhr, opt) {
                var value = extr.query ? luen(data).find(extr.query).getHtml() : data;
                var value = success    ? success(value, xhr, opt)              : value;
                self.each(function() {
                    luen(this).addHtml(value + '');
                });
            }, 'rawText');
            return this;
        }

    };

    /**
     * @param {!string} key
     *
     * @return {!string}
     */
    luen._styleToCase = function(key) {
        luen.assertType(key, 'string');
        return key.toLowerCase().replace(/-(.)/g, function(match, firstLetter) {
            return firstLetter.toUpperCase();
        });
    };

    /**
     * @param {!Object} obj1
     * @param {!Object} obj2
     *
     * @return {!Object}
     */
    luen.extend = function(obj1, obj2) {
        luen.assertType(obj1, 'object');
        luen.assertType(obj2, 'object');
        for (var property in obj2) {
            if (obj2.hasOwnProperty(property)) {
                obj1[property] = obj2[property];
            }
        }
        return obj1;
    };


    /**
     * @param {!Object}   obj
     * @param {!Function} callback
     *
     * @return {!Object}
     */
    luen.each = function(obj, callback) {
        luen.assertType(obj, 'object');
        luen.assertType(callback, 'function');
        if (obj instanceof Luen || Array.isArray(obj)) {
            var len = obj instanceof Luen ? obj.getLength() : Object.keys(obj).length;
            for (var i = 0; i < len; i++) {
                // Arguments: index (key), value (node), elem (luen).
                if (callback.call(obj[i], i, obj[i], obj) === false) {
                    break;
                }
            }
        } else {
            for (var i in obj) {
                // Arguments: index (key), value (node), elem (luen).
                if (callback.call(obj[i], i, obj[i], obj) === false) {
                    break;
                }
            }
        }
        return obj;
    };

    /**
     * @param {!string}            key
     * @param {!undefined|!string} params
     *
     * @return {!boolean}
     */
    luen.hasParam = function(key, params) {
        luen.assertType(key, 'string');
        luen.assertType(params, 'undefined', 'string');
        return luen.getParam(key, params) === undefined ? false : true;
    };

    /**
     * @param {!string}            key
     * @param {!undefined|!string} params
     *
     * @return {!undefined|!string}
     */
    luen.getParam = function(key, params) {
        luen.assertType(key, 'string');
        luen.assertType(params, 'undefined', 'string');
        var urlParams = params;
        if (typeof params === 'undefined') {
            var urlParams = window.location.search.substring(1);
        }
        var arr = urlParams.split('&');
        for (var i = 0, len = arr.length; i < len; i++) {
            var param = arr[i].split('=', 2);
            if (decodeURIComponent(param[0]) === key) {
                return decodeURIComponent(param[1]);
            }
        }
        return undefined;
    };

    /**
     * @param {!string}             query
     * @param {!undefined|!Object}  context
     * @param {!undefined|!boolean} internal
     *
     * @return {!Object}
     */
    luen.selector = function(query, context, internal) {
        luen.assertType(query, 'string');
        luen.assertType(context, 'undefined', 'object');
        luen.assertType(internal, 'undefined', 'boolean');
        // For XML/HTML namespaces: context.querySelector('[ns\\:attribute="value"]');
        var forNamespaces = function(query) {
            if (!query.match(/^[^:]+:.+$/)) {
                return query;
            }
            var arr = query.split(':', 2);
            return arr[0].split('\\').join('') + '\\:' + arr[1];
        };
        var ctx = (context ? context : document);
        try {
            if (query && query[0] === '#' && query.match(/^#[a-z]+[a-z0-9_-]*$/i)) {
                var obj = ctx.getElementById(query.split('#', 2)[1]);
                var obj = internal === true ? [obj] : obj;
            } else {
                var obj = ctx.querySelectorAll(forNamespaces(query));
            }
        } catch(e) {
            throw new SyntaxError(e.message +' @param query Invalid syntax: ' + query);
        }
        return obj;
    };

    /**
     * @param {!string} str
     * @param {!string} type
     *
     * @return {!Object}
     */
    luen.parse = function(str, type) {
        luen.assertType(str, 'string');
        luen.assertType(type, 'string');
        if (type.match('^(text|application)+/json$')) {
            try {
                var obj = JSON.parse(str);
            } catch(e) {
                throw new SyntaxError('@param str Invalid ' + type + ': ' + str);
            }
            return obj;
        } else if (type.match('^(text|application)+/(xml|html|xhtml)$')) {
            var docObj = (new window.DOMParser()).parseFromString(str, type);
            if (docObj.getElementsByTagName('parsererror')[0]) {
                throw new SyntaxError('@param str Invalid ' + type + ': ' + str);
            }
            return docObj;
        } else if (type === 'params') {
            var obj = {};
            if (str.trim() === '') {
                return obj;
            }
            var params = decodeURIComponent(str);
            var params = params.substring(0, 1) === '?' ? params.substring(1) : params;
            var params = params.split('&');
            for (var i = 0, len = params.length; i < len; i++) {
                var pairs = params[i].split('=');
                if (pairs.length !== 2) {
                    throw new SyntaxError('@param str Invalid ' + type + ': ' + str);
                }
                obj[pairs[0]] = pairs[1];
            }
            return obj;
        } else {
            throw new TypeError('@param type Invalid argument: ' + type);
        }
    };

    /**
     * @param {!string} str
     *
     * @return {!Object}
     */
    luen.parseXml = function(str) {
        luen.assertType(str, 'string');
        return luen.parse(str, 'text/xml');
    };

    /**
     * @param {!string} str
     *
     * @return {!Object}
     */
    luen.parseHtml = function(str) {
        luen.assertType(str, 'string');
        return luen.parse(str, 'text/html');
    };

    /**
     * @param {!string} str
     *
     * @return {!Object}
     */
    luen.parseJson = function(str) {
        luen.assertType(str, 'string');
        return luen.parse(str, 'text/json');
    };

    /**
     * @param {!string} str
     *
     * @return {!Object}
     */
    luen.parseParams = function(str) {
        luen.assertType(str, 'string');
        return luen.parse(str, 'params');
    };

    /**
     * @param {!string} str
     *
     * @return {!Object}
     */
    luen.parseDom = function(str) {
        luen.assertType(str, 'string');
        return luen.parseHtml(str);
    };

    /**
     * @param {!Object} obj
     *
     * @return {!string}
     */
    luen.jsonToString = function(obj) {
        luen.assertType(obj, 'object');
        try {
            var str = JSON.stringify(obj);
        } catch(e) {
            throw new SyntaxError('@param obj Invalid object. ' + e);
        }
        return str;
    };

    /** @type {!Object} */
    luen.effects = {

         /** @type {!Object} */
         fade: {

            /**
             * @param {!Luen}                        elem
             * @param {!undefined|!number|!Function} milisec
             *
             * @return {!Function}
             */
            show: function(elem, milisec) {
                luen.assertType(elem, Luen);
                luen.assertType(milisec, 'undefined', 'number', 'function');
                var ms = typeof milisec === 'number' ? milisec : 350;
                elem.setPropertyStyle('opacity', '0');
                elem.setPropertyStyle('display', '');
                for (var i = 1; i <= 100; i++) {
                    (function(j, elem, milisec) {
                        window.setTimeout(function(elem, milisec) {
                            elem.setPropertyStyle('opacity', '' + j / 100);
                        }, j * milisec / 100, elem, milisec);
                    })(i, elem, ms);
                }
                window.setTimeout(function(elem, milisec) {
                    if (typeof milisec === 'function') {
                        milisec(elem);
                    }
                }, ms, elem, milisec);
                return luen;
            },

            /**
             * @param {!Luen}                        elem
             * @param {!undefined|!number|!Function} milisec
             *
             * @return {!Function}
             */
            hide: function(elem, milisec) {
                luen.assertType(elem, Luen);
                luen.assertType(milisec, 'undefined', 'number', 'function');
                var ms = typeof milisec === 'number' ? milisec : 350;
                elem.setPropertyStyle('opacity', '1');
                for (var i = 1; i <= 100; i++) {
                    (function(j, elem, milisec) {
                        window.setTimeout(function(elem, milisec) {
                            elem.setPropertyStyle('opacity', '' + (100 - j) / 100);
                        }, j * milisec / 100, elem, milisec);
                    })(i, elem, ms);
                }
                window.setTimeout(function(elem, milisec) {
                    elem.setPropertyStyle('display', 'none');
                    if (typeof milisec === 'function') {
                        milisec(elem);
                    }
                }, ms, elem, milisec);
                return luen;
            }

        },

        /** @type {!Object} */
        fadeX: {

            /**
             * @param {!Object}                      elem
             * @param {!undefined|!number|!Function} milisec
             *
             * @return {!Function}
             */
            show: function(elem, milisec) {
                luen.assertType(elem, Luen);
                luen.assertType(milisec, 'undefined', 'number', 'function');
                var ms = typeof milisec === 'number' ? milisec : 350;
                elem.setPropertyStyle('position', '');
                elem.setPropertyStyle('transition', 'opacity ' + ms + 'ms');
                elem.setPropertyStyle('opacity', '1');
                elem.setPropertyStyle('height', 'auto');
                elem.setPropertyStyle('overflow', '');
                window.setTimeout(function(elem, milisec) {
                    if (typeof milisec === 'function') {
                        milisec(elem);
                    }
                }, ms, elem, milisec);
                return luen;
            },

            /**
             * @param {!Luen}                        elem
             * @param {!undefined|!number|!Function} milisec
             *
             * @return {!Function}
             */
            hide: function(elem, milisec) {
                luen.assertType(elem, Luen);
                luen.assertType(milisec, 'undefined', 'number', 'function');
                var ms = typeof milisec === 'number' ? milisec : 350;
                elem.setPropertyStyle('transition', 'opacity ' + ms + 'ms');
                elem.setPropertyStyle('opacity', '0');
                window.setTimeout(function(elem, milisec) {
                    elem.setPropertyStyle('overflow', 'hidden');
                    elem.setPropertyStyle('height', '0');
                    elem.setPropertyStyle('position', 'absolute');
                    if (typeof milisec === 'function') {
                        milisec(elem);
                    }
                }, ms, elem, milisec);
                return luen;
            }

        }

    };

    /**
     * @param {!string}            url
     * @param {!undefined|!Object} options
     *
     * @return {!Object}
     */
    luen.ajax = function(url, options) {
        luen.assertType(url, 'string');
        luen.assertType(options, 'undefined', 'object');
        if (typeof options === 'undefined') {
            options = {};
        }
        var opt = {
            params:   options.params   || {}, // or string
            type:     options.type     || 'rawText', // rawText, rawXml, xml, json, html, script
            method:   options.method   || 'GET',
            error:    options.error    || function() {},
            success:  options.success  || function() {},
            headers:  options.headers  || {},
            mime:     options.mime     || null,
            timeout:  options.timeout  || 0, // miliseconds
            username: options.username || null,
            password: options.password || null,
            cache:    'cache' in options && options.cache === false ? false : true,
            async:    true // always true
        };
        opt.url = url;
        var params = opt.params;
        if (typeof opt.params === 'object') {
            var params = [];
            for (var key in opt.params) {
                params.push(key + '=' + opt.params[key]);
            }
            var params = params.join('&');
        }
        if (opt.cache === false) {
            var ckey = '_' in luen.parseParams(params) ? '_-_=' : '_=';
            var stamp = ckey + Date.now();
            var params = params ? params + '&' + stamp : stamp;
        }
        var xhr = new XMLHttpRequest();
        xhr.open(
            opt.method,
            opt.method === 'POST' ? opt.url : opt.url + (params ? '?' + params : ''),
            opt.async,
            opt.username,
            opt.password
        );
        if (opt.method === 'POST') {
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
        }
        if (opt.mime) {
            xhr.overrideMimeType(opt.mime);
        }
        for (var key in opt.headers) {
            xhr.setRequestHeader(key, opt.headers[key]);
        }
        return {
            /**
             * @param {!undefined|!Function} success
             *
             * @return {!XMLHttpRequest}
             */
            done: function(success) {
                luen.assertType(success, 'undefined', 'function');
                if (typeof success === 'function') {
                    opt.success = success;
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            if (opt.type === 'rawXml') {
                                var data = xhr.responseXML;
                            } else if (opt.type === 'rawText') {
                                var data = xhr.responseText;
                            } else if (opt.type === 'xml') {
                                var data = luen.parseXml(xhr.responseText);
                            } else if (opt.type === 'json') {
                                var data = luen.parseJson(xhr.responseText);
                            } else if (opt.type === 'html') {
                                var data = luen.parseHtml(xhr.responseText);
                            } else if (opt.type === 'script') {
                                eval(xhr.responseText);
                            } else {
                                throw new Error('@param opt.type Invalid ajax type "' + opt.type + '".');
                            }
                            opt.success(data, xhr, opt);
                        } else {
                            opt.error(xhr, opt);
                            throw new Error(xhr.status + ' ' + xhr.statusText + ' (' + opt.url + ')');
                        }
                    }
                }
                var sender = function(xhr, opt, params) {
                    try {
                        xhr.send(opt.method === 'POST' ? params : null);
                    } catch(e) {
                        throw new Error(e);
                    }
                };
                if (opt.async && opt.timeout > 0) {
                    window.setTimeout(sender, opt.timeout, xhr, opt, params);
                } else {
                    sender(xhr, opt, params);
                }
                return xhr;
            }
        }
    };

    /**
     * @param {!string}                              url
     * @param {!undefined|!string|!Object|!Function} params
     * @param {!undefined|!string|!Function}         success
     * @param {!undefined|!string}                   type
     *
     * @return {!XMLHttpRequest}
     */
    luen.ajaxPost = function(url, params, success, type) {
        luen.assertType(url, 'string');
        luen.assertType(params, 'undefined', 'string', 'object', 'function');
        luen.assertType(success, 'undefined', 'string', 'function');
        luen.assertType(type, 'undefined', 'string');
        if (typeof params === 'function') {
            type = success;
            success = params;
            params = undefined;
        } else if (typeof params === 'string') {
            type = params;
            success = function() {};
            params = undefined;
        }
        return luen.ajax(url, {
            params: params,
            type:   type,
            method: 'POST'
        }).done(success);
    };

    /**
     * @param {!string}                              url
     * @param {!undefined|!string|!Object|!Function} params
     * @param {!undefined|!string|!Function}         success
     * @param {!undefined|!string}                   type
     *
     * @return {!XMLHttpRequest}
     */
    luen.ajaxGet = function(url, params, success, type) {
        luen.assertType(url, 'string');
        luen.assertType(params, 'undefined', 'string', 'object', 'function');
        luen.assertType(success, 'undefined', 'string', 'function');
        luen.assertType(type, 'undefined', 'string');
        if (typeof params === 'function') {
            type = success;
            success = params;
            params = undefined;
        } else if (typeof params === 'string') {
            type = params;
            success = function() {};
            params = undefined;
        }
        return luen.ajax(url, {
            params: params,
            type:   type,
            method: 'GET'
        }).done(success);
    };

    /**
     * @param {!string} key
     *
     * @return {!boolean}
     */
    luen.hasStorage = function(key) {
        luen.assertType(key, 'string');
        var storage = window.localStorage.getItem(key);
        var storage = storage === null ? window.sessionStorage.getItem(key) : storage;
        try {
            var json = luen.parseJson(storage);
        } catch(e) {
            return false;
        }
        if (
            typeof json === 'object' &&
            'key' in json            &&
            'engine' in json         &&
            json.engine === 'luen'   &&
            'expires' in json        &&
            'value' in json
        ) {
            var expires = json.expires + '';
            if (
                expires === 'never' ||
                expires === 'session' ||
                expires.match(/^[0-9]+$/) && parseFloat(Date.now()) < parseFloat(expires)
            ) {
                return true;
            }
        }
        luen.removeStorage(key);
        return false;
    };

    /**
     * @param {!string}                    key
     * @param {!string}                    value
     * @param {!undefined|!number|!string} expires
     *
     * @return {!Function}
     */
    luen.setStorage = function(key, value, expires) {
        luen.assertType(key, 'string');
        luen.assertType(value, 'string');
        luen.assertType(expires, 'undefined', 'number', 'string');
        if (typeof expires === 'undefined') {
            expires = 'never';
        } else if (expires !== 'session' && expires !== 'never') {
            expires = parseFloat(Date.now()) + parseFloat(expires);
        }
        var obj = luen.jsonToString({
            "key":     key,
            "engine":  "luen",
            "expires": expires,
            "value":   value
        });
        if (expires === 'session') {
            window.sessionStorage.setItem(key, obj);
        } else {
            window.localStorage.setItem(key, obj);
        }
        return luen;
    };

    /**
     * @param {!string} key
     *
     * @return {!undefined|!string}
     */
    luen.getStorage = function(key) {
        luen.assertType(key, 'string');
        if (!luen.hasStorage(key)) {
            return undefined;
        }
        var storage = window.localStorage.getItem(key);
        if (storage === null) {
            var storage = window.sessionStorage.getItem(key);
        }
        try {
            var value = luen.parseJson(storage).value;
        } catch(e) {
            return undefined;
        }
        return value + '';
    };

    /**
     * @param {!string} key
     *
     * @return {!Function}
     */
    luen.removeStorage = function(key) {
        luen.assertType(key, 'string');
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
        return luen;
    };

    /**
     * @param {!string} key
     *
     * @return {!boolean}
     */
    luen.hasCookie = function(key) {
        luen.assertType(key, 'string');
        return luen.getCookie(key) === undefined ? false : true;
    }

    /**
     * @param {!string}                    key
     * @param {!string}                    value
     * @param {!undefined|!number|!string} expires
     * @param {!undefined|!string}         path
     * @param {!undefined|!string}         domain
     * @param {!undefined|!boolean}        secure
     *
     * @return {!Function}
     */
    luen.setCookie = function(key, value, expires, path, domain, secure) {
        luen.assertType(key, 'string');
        luen.assertType(value, 'string');
        luen.assertType(expires, 'undefined', 'number', 'string');
        luen.assertType(path, 'undefined', 'string');
        luen.assertType(domain, 'undefined', 'string');
        luen.assertType(secure, 'undefined', 'boolean');
        if (expires) {
            var d = new Date();
            d.setTime(d.getTime() + (1000 * parseFloat(expires)));
            expires = d.toUTCString();
        }
        document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) +
            ((expires) ? '; expires=' + expires : '') +
            ((path) ? '; path=' + path : '') +
            ((domain) ? '; domain=' + domain : '') +
            ((secure) ? '; secure' : '');
        return luen;
    };

    /**
     * @param {!string} key
     *
     * @return {!undefined|!string}
     */
    luen.getCookie = function(key) {
        luen.assertType(key, 'string');
        key = encodeURIComponent(key) + '=';
        var parts = document.cookie.split(';');
        var len = parts.length;
        for (var i = 0; i < len; i++) {
            var part = parts[i];
            if (part.charAt(0) === ' ') {
                var part = part.substring(1);
            }
            if (part.indexOf(key) === 0) {
                return decodeURIComponent(part.split(key, 2)[1]);
            }
        }
        return undefined;
    };

    /**
     * @param {!string}            key
     * @param {!undefined|!string} path
     * @param {!undefined|!string} domain
     *
     * @return {!Function}
     */
    luen.removeCookie = function(key, path, domain) {
        luen.assertType(key, 'string');
        luen.assertType(path, 'undefined', 'string');
        luen.assertType(domain, 'undefined', 'string');
        document.cookie = encodeURIComponent(key) + '=' +
            ((path) ? '; path=' + path : '') +
            ((domain) ? '; domain=' + domain : '') +
            '; expires=Thu, 01-Jan-70 00:00:01 GMT';
        return luen;
    };

    /**
     * @param {*} Some arguments.
     *
     * @return {*}
     */
    luen.assertType = function() {
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
            throw new TypeError('Invalid type "' + typeof arg + '". Must be a "'+ args.join('" or "') + '".');
        }
        return arguments[0];
    };

})(window);

