luen
====
**This is development (master) version.<br> For production version (relase) see
<https://github.com/lokolab/luen/tree/v0.0.1>**
- Version: 0.0.1-dev
- Technologies:
  - JavaScript
- Compatibility:
  - Chrome 45+
  - Firefox 36+
  - Internet Explorer 10+ (?)
  - Opera 35+
- Dependencies:
  - Development (optional):
    - utestjs (0.0.1)
    - jQuery (2.2.4)
- Copyright / Authors:
  - Krystian Pietruszka <kpietru@lokolab.net>
- Licenses:
  - MIT <http://opensource.org/licenses/MIT>
- Download: <https://github.com/lokolab/luen/releases>
- Homepage: <http://www.lokolab.net>

Luen JavaScript library with a friendly API.
Inspirations jQuery JavaScript Library (v2.2.4)
and Cookie Functions -- "Night of the Living Cookie" (25-Jul-96)
written by: Bill Dortch.
____________________________________________

Example usage
-------------

    <!doctype html>
    <html>
        <head>
            <title>Luen example usage</title>
            <script src="luen-0.0.1.js"></script>
        </head>
        <body>
            <p id="my_p">Hello world!</p>
            <script>
                luen(document).ready(function() {
                    luen('#my_p').setCss('color', 'green');
                });
            </script>
        </body>
    </html>

Example basic plugin
--------------------

    luen.fn.colorify = function() {
        this.setCss('color', 'green');
    };

    luen('p').colorify();

Example advanced plugin
-----------------------

    (function($) {
        $.fn.extend({
            colorify: function(options) {
                $.assertType(options, 'undefined', 'object');
                var defaults = {
                    color: 'red'
                };
                var settings = $.extend(
                    defaults,
                    typeof options === 'undefined' ? {} : options
                );
                return this.setCss('color', settings.color);
            }
        });
    })(luen);

    luen(document).ready(function() {
        luen('p').colorify({
            'color': 'green'
        });
    });

API
---

- luen ( *: __query__ ): self
  - find ( *: __query__ ): self
  - extend ( object: __obj__ ): self
  - ready ( function: __callback__ ): self
  - on ( string: __event__, function: __callback__ ): self
  - off ( string: __event__, function: __callback__ ): self
  - each ( function: __callback__ ): self
  - getQuery (): string
  - getContext (): object
  - getLength (): number
  - getName (): undefined|string
  - is ( string: __action__ ): boolean
  - hasProperty ( string: __key__ ): boolean
  - setProperty ( string: __key__, string|boolean|number: __value__ ): self
  - getProperty ( string: __key__ ): undefined|string|boolean|number
  - removeProperty ( string: __key__ ): self
  - hasPropertyStyle ( string: __key__ ): boolean
  - setPropertyStyle ( string: __key__, string: __value__ ): self
  - getPropertyStyle ( string: __key__ ): undefined|string
  - hasComputedStyle ( string: __key__, undefined|string: __pseudo__ ): boolean
  - getComputedStyle ( string: __key__, undefined|string: __pseudo__ ): undefined|string
  - hasCss ( string: __key__, undefined|string: __pseudo__ ): boolean
  - setCss ( string|object: __key__, undefined|string: __value__ ): self
  - getCss ( string: __key__, undefined|string: __pseudo__ ): undefined|string
  - hasAttribute ( string: __key__ ): boolean
  - setAttribute ( string: __key__, string: __value__ ): self
  - getAttribute ( string: __key__ ): undefined|string
  - removeAttribute ( string: __key__ ): self
  - hasClass ( string: __key__ ): boolean
  - addClass ( string: __key__ ): self
  - removeClass ( string: __key__ ): self
  - getOffset (): object
  - insertBefore ( string: __query__ ): luen
  - insertAfter ( string: __query__ ): luen
  - prependTo ( string: __query__ ): luen
  - appendTo ( string: __query__ ): luen
  - insertHtml ( string: __place__, string: __value__ ): self
  - setHtml ( string: __value__ ): self
  - addHtml ( string: __value__ ): self
  - getHtml (): undefined|string
  - getParent(): luen
  - getChildren (): luen
  - getPrev (): luen
  - getNext (): luen
  - remove (): self
  - show ( undefined|string|number|function: __effect__, undefined|number|function: __milisec__ ): self
  - hide ( undefined|string|number|function: __effect__, undefined|number|function: __milisec__ ): self
  - toggle ( undefined|string|number|function: __effect__, undefined|number|function: __milisec__ ): self
  - serialize (): string
  - ajaxLoad ( string: __url__, undefined|object|string|function: __params__, undefined|function: __success__ ): self
- luen.VERSION: string
- luen.REGEX_NOT_WHITE: object
- luen.fn: object
- luen.selector ( string: __query__, undefined|object: __context__, undefined|boolean: __internal__ ): object
- luen.extend ( object: __obj1__, object: __obj2__ ): object
- luen.each ( object: __obj__, function: __callback__ ): object
- luen.hasParam ( string: __key__, undefined|string: __params__ ): boolean
- luen.getParam ( string: __key__, undefined|string: __params__ ): undefined|string
- luen.parse ( string: __str__, string: __type__ ): object
- luen.parseXml ( string: __str__ ): object
- luen.parseHtml ( string: __str__ ): object
- luen.parseJson ( string: __str__ ): object
- luen.parseParams ( string: __str__ ): object
- luen.parseDom ( string: __str__ ): object
- luen.jsonToString ( object: __obj__ ): string
- luen.ajax ( string: __url__, undefined|object: __options__ ): object
  - done ( undefined|function: __success__ ): XMLHttpRequest
- luen.ajaxPost ( string: __url__, undefined|string|object|function: __params__, undefined|string|function: __success__, undefined|string: __type__ ): XMLHttpRequest
- luen.ajaxGet ( string: __url__, undefined|string|object|function: __params__, undefined|string|function: __success__, undefined|string: __type__ ): XMLHttpRequest
- luen.hasStorage ( string: __key__ ): boolean
- luen.setStorage ( string: __key__, string: __value__, undefined|number|string: __expires__ ): luen
- luen.getStorage ( string: __key__ ): undefined|string
- luen.removeStorage ( string: __key__ ): luen
- luen.hasCookie ( string: __key__ ): boolean
- luen.setCookie ( string: __key__, string: __value__, undefined|number|string: __expires__, undefined|string: __path__, undefined|string: __domain__, undefined|boolean: __secure__ ): luen
- luen.getCookie ( string: __key__ ): undefined|string
- luen.removeCookie ( string: __key__, undefined|string: __path__, undefined|string: __domain__ ): luen
- luen.effects: object
  - fade: object
    - show ( object: __elem__, undefined|number|function: __milisec__ ): luen
    - hide ( object: __elem__, undefined|number|function: __milisec__ ): luen
- luen.assertType ( *, *, ... ): *

References
----------

1. [Google JavaScript Style Guide][1]
2. [The HTML DOM Element Object][2]
3. [Ajax z Access-Control-Allow-Origin][3]
4. [Browser screenshots][4]
5. [Browser shots][5]

[1]: http://google.github.io/styleguide/javascriptguide.xml
[2]: http://www.w3schools.com/jsref/dom_obj_all.asp
[3]: http://www.yarpo.pl/2011/05/06/ajax-z-access-control-allow-origin/
[4]: http://developer.microsoft.com/en-us/microsoft-edge/tools/screenshots/
[5]: http://browsershots.org
