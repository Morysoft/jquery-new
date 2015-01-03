(function ($) {
    $.api = function (action, options) {
        function centerLoader(loader) {
            var loaderBackgroundHeight = loader.innerHeight();
            var loaderBackgroundWidth = loader.innerWidth();

            var loaderHeight = loader.children(':last').innerHeight();
            var loaderWidth = loader.children(':last').innerWidth();

            var top = (loaderBackgroundHeight + loaderHeight) / 2;
            var left = (loaderBackgroundWidth - loaderWidth) / 2;

            loader.children(':last').css({ 'top': -top + 'px', 'left': left + 'px' });
        }

        function addErrorDialog(errorDialog, loader) {
            var position = target.css('position');

            target.css('position', 'relative');
            errorDialog.appendTo(target);

            centerLoader(errorDialog);

            errorDialog.find('.t-link').click(function () {
                removeLoader(target, errorDialog, position);
            });

            errorDialog.find('.p-ajax-retry-button').click(function () {
                removeLoader(target, errorDialog, position);
                if (target) {
                    position = addLoader(target, loader);
                }
                $.ajax(options);
            });

            return position;
        }

        function addLoader(target, loader) {
            var position = target.css('position');

            target.css('position', 'relative');
            loader.appendTo(target);

            centerLoader(loader);

            return position;
        }

        function removeLoader(target, loader, position) {
            target.css('position', position);
            loader.remove();
        }

        options = options || {};

        var target;
        var errorDialog;
        var errorMessage;
        var loader;
        var position = '';
        var feedback = false;
        var callback = false;

        if ('feedback' in options) {
            feedback = options.feedback;
            delete options.feedback;
        }

        if (typeof options.callback == 'function') {
            callback = options.callback;
            delete options.callback;
        }

        if ('target' in options) {
            target = options.target;
            delete options.target;
        } else {
            target = $('body');
        }

        loader = $('<div class="p-ajax-container">' +
                        '<div class="p-ajax-background"></div>' +
                        '<div class="ajaxLoader"></div>' +
                    '</div>');

        position = addLoader(target, loader);


        if ('errorMessage' in options) {
            errorMessage = options.errorMessage;
            delete options.errorMessage;
        }

        errorDialog = function () {
            return $('<div class="p-ajax-container">' +
                            '<div class="p-ajax-background"></div>' +
                            '<div class="t-widget t-window p-ajax-error-dialog">' +
                                '<div class="t-window-titlebar t-header">' +
                                    '<span class="t-window-title">Error</span>' +
                                    '<div class="t-window-actions t-header">' +
                                        '<div class="t-link" href="#">' +
                                            '<span class="t-icon t-close">Close</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<label class="p-ajax-error-message">' + errorMessage + '</label>' +
                                '<button class="p-ajax-retry-button">Retry</button>' +
                            '</div>' +
                        '</div>');
        }

        options.url = '/api/';
        options.type = 'POST';

        options.complete = function (jqXHR, status) {
            removeLoader(target, loader, position);

            if (status == 'error' && target) {
                if (!errorMessage) {
                    errorMessage = 'Connection or internal server error.';
                }
                position = addErrorDialog(errorDialog(), loader);
            }
        };

        options.success = function (data) {
            if (data == null) {
                $.feedback('Հարցումը հաջողվել է, բայց պատասխան չի ստացվել։');
            } else if (typeof data == 'string') {
                $.feedback(data);
            } else if ((typeof data == 'object') && 'error' in data) {
                $.feedback(data.error);
            } else {
                if (callback)
                    callback(data);

                if (feedback)
                    if (typeof feedback == 'function')
                        $.feedback(feedback(data));
                    else
                        $.feedback(feedback);

                if (!callback && !feedback)
                    $.feedback('Սերվերն անհասկանալի պատասխան է վերադարձրել։');
            }
        };


        if (typeof options.data != 'object') {
            options.data = {};
        }

        options.data.action = action;

        return $.ajax(options);
    };

    $.fn.addLoader = function () {
        return $.addLoader(this);
    }

    $.addLoader = function (target) {
        if (typeof target == 'undefined') {
            target = $('body');
        }

        if (target.children('.p-ajax-container').length != 0) return;

        loader = $('<div class="p-ajax-container">' +
                        '<div class="p-ajax-background"></div>' +
                        '<div class="ajaxLoader"></div>' +
                    '</div>');

        var position = target.css('position');

        target.css('position', 'relative');
        loader.appendTo(target);

        centerLoader(loader);

        //target.data('loader', loader);

        function centerLoader(loader) {
            var loaderBackgroundHeight = loader.innerHeight();
            var loaderBackgroundWidth = loader.innerWidth();

            var loaderHeight = loader.children(':last').innerHeight();
            var loaderWidth = loader.children(':last').innerWidth();

            var top = (loaderBackgroundHeight + loaderHeight) / 2;
            var left = (loaderBackgroundWidth - loaderWidth) / 2;

            loader.children(':last').css({ 'top': -top + 'px', 'left': left + 'px' });
        };

        return loader;
    };

    $.fn.removeLoader = function () {
        return $.removeLoader(this);
    }

    $.removeLoader = function (target) {
        if (typeof target == 'undefined') {
            target = $('body');
        }

        //target.data('loader').remove();
        return target.children('.p-ajax-container').remove();
    };

    $.fn.feedback = function (timeOut) {
        return $.feedback(this, timeOut);
    }

    $.feedback = function (message, timeOut) {
        function updatepositions() {
            var lastBarTop = 79;

            $('.feedback-bar').each(function () {
                if ($(this).attr('hiding'))
                    return;

                //$(this).css('top', lastBarTop);

                $(this).stop(true).animate({ top: lastBarTop, opacity: 0.9 }, 300);

                lastBarTop += $(this).height() + 15;
            });
        }

        if (!message)
            return;

        var element = {};

        if (typeof (message) == 'string') //($(element).length > 0)
            element = $('<div>' + message + '</div>');
        else
            element = $('<div>').append(message);

        element.addClass('feedback-bar');


        element.css('opacity', 0);

        element.appendTo($('body'));

        //element.fadeIn(300);

        updatepositions();


        //Returning element

        element = element[0];

        element.hide = function () {
            $(element).stop(true, true).attr('hiding', true).fadeOut(300, function () {
                $(this).remove();
                updatepositions();
            });
        };

        if (timeOut != 0)
            setTimeout(element.hide, (timeOut || 5) * 1000);

        return element;
    };

    $.feedback.removeAll = function () {
        $('.feedback-bar').remove();
    }

    $.download = function (url) {
        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            iframe.setAttribute('target', '_blank');

            iframe.onerror = function (e) { alert('onerror'); };
            iframe.onabort = function (e) { alert('onabort'); };
            iframe.onloadstarted = function (e) { alert('onloadstarted'); };
            iframe.onwaiting = function (e) { alert('onwaiting'); };
            iframe.onloadeddata = function (e) { alert('onloadeddata'); };
            iframe.onloadedmetadata = function (e) { alert('onloadedmetadata'); };
            iframe.onsuspend = function (e) { alert('onsuspend'); };
            iframe.onended = function (e) { alert('onended'); };

            document.body.appendChild(iframe);
        }

        iframe.src = url;
    };

    $.alert = function (message, params) {
        if (typeof message == 'string') {
            message = message.htmlDecode();
            if (typeof params == 'object' && params != null) {
                for (var key in params) {
                    message = message.replace('{' + key + '}', params[key]);
                }
            }
            return alert(message);
        }
        throw '';
    }

    $.fn.table = function (options) {
        return $.table(this, options);
    };

    $.table = function (page, options) {
        var o = options;
        var name = o.name;
        var id = 'table-' + o.name;
        var cls = 'p-table-' + o.name;

        var grid = page.new().div({
            attr: { 'id': id },
            cls: ['p-grid', o.name],
            data: options
        });

        var oldGrid = $('#' + id);

        if (oldGrid.length != 0) {
            oldGrid.replaceWith(grid);
        }

        var header = grid.new().div({ cls: 'p-grid-header' });

        var title = header.new().h3({ cls: 'p-grid-title', text: options.title || options.name || options.action || 'No title' });

        options.actions = $.extend({
            refresh: true,
            minimize: true,
            close: false
        }, options.actions || {});

        var actions = header.new().div({ cls: 'p-grid-actions' });

        options.onInitActions && options.onInitActions(actions);

        options.actions.refresh && actions.new().button({ title: 'Թարմացնել', cls: 'p-grid-action-refresh' }).click(function () {
            $.table(page, options);
        }).new().img('images/actions/refresh-16.png', { css: { display: 'block' } });

        options.actions.minimize && actions.new().button({ title: 'Փոքրացնել/Մեծացնել', cls: 'p-grid-action-minimize' }).click(function () {
            if (table.is(':visible')) {
                table.hide();
                footer.hide();
            } else {
                table.show();
                footer.show();
            }
        }).new().img('images/actions/minimize-16.png', { css: { display: 'block' } });

        options.actions.close && actions.new().button({ title: 'Փակել', cls: 'p-grid-action-close' }).click(function () {
            grid.remove();
            delete this;
        }).new().img('images/actions/close-16.png', { css: { display: 'block' } });

        var table = grid.new().table({ cls: 'p-table' });
        var thead = table.new().thead();
        var tbody = table.new().tbody();
        var tfoot = table.new().tfoot();

        var footer = grid.new().div({ cls: 'p-grid-footer' });
        var paging = footer.new().div({ cls: 'p-grid-paging' });
        var count = footer.new().div({ cls: 'p-grid-count' });


        var tr = thead.new().tr();
        $.each(o.headers || o.columns, function (i, col) {
            $('<th>').appendTo(tr).attr(col.attr || {}).addClass(col.class || '').text(col.text || col.name || i).css(col.css || {});
        });

        options.data = $.extend({}, options.data || {});

        $.api(o.action, {
            data: options.data,
            callback: function (data) {
                if (('list' in data) && ('count' in data) && data.list.length > 0) {
                    if (data.paged !== false) {
                        paging.text('Էջ ' + (data.page + 1) + ' — ' + data.pages + '-ից');
                        count.text('Ցուցադրված է ' + data.paged + ' հատ, ' + data.from + '-ից ' + data.to + '-ը ' + data.count + ' հատից');

                        paging.new().span({ css: { margin: 'auto 10px' } });

                        var pages = {};

                        var add = function (i) {
                            if (i >= 0 && i < data.pages) {
                                pages[i] = null;
                            }
                        }

                        for (var i = 0; i < 5; i++) {
                            add(i);
                            add(data.pages - i);
                            add(data.page - 2 + i);
                        }

                        var lastPage = 0;
                        for (var i in pages) {
                            (function (i) {
                                if (i - lastPage > 1) {
                                    paging.new('span', ' ... ');
                                }

                                lastPage = i;

                                paging.new().button({
                                    text: i + 1,
                                    data: { page: i },
                                    cls: ['p-grid-page-button', (data.page == i ? 'p-grid-page-button-current' : '')],
                                    attr: data.page == i ? { disabled: 'disabled' } : {}
                                }).click(function (e) {
                                    options.data.page = i;
                                    $.table(page, options);
                                });
                            })(parseInt(i));
                        }
                    } else {
                        count.text('Ցուցադրված է ' + data.count + ' հատ');
                    }

                    var k = 1;

                    $.each(data.list, function (index, item) {
                        tr = tbody.new().tr({ data: { item: item } });

                        $.each(o.columns, function (i, col) {
                            var td = $('<td>').appendTo(tr);

                            if ('align' in col) {
                                switch (col.align) {
                                    case 'left':
                                    case 'right':
                                    case 'center':
                                        td.addClass('p-table-col-' + col.align);
                                }
                            }

                            if ('name' in col) {
                                td.addClass(cls + '-col-' + col.name);
                            }

                            switch (typeof col.bind) {
                                case 'string':
                                    td.text((col.bind in item) ? item[col.bind] : k);
                                    break;
                                case 'function':
                                    var val = col.bind(td, item);
                                    switch (typeof val) {
                                        case 'string':
                                            td.text(val);
                                            break;
                                        case 'number':
                                            td.text(val);
                                            break;
                                    }
                                    break;
                            }

                            if ('format' in col) {
                                td.format(col.format);
                            }

                            if ('css' in col) {
                                td.css(col.css);
                            }
                        });

                        k++;
                    });

                    for (var i = k; i <= data.paged; i++) {
                        tr = $('<tr>').appendTo(tbody);
                        $.each(o.columns, function (i, col) {
                            var td = $('<td>').appendTo(tr);
                        });
                    }
                }
            }
        });

        return grid;
    };

    ($.__advanced_controls || ($.__advanced_controls = {})).class_template = (function () {
        function __class(__p, __o) {
            var __me = this;

            __me.page = __p;
            __me.options = __o;

            __me.name = __me.options.name;
            __me.id = 'inline-datepicker-' + __me.options.name;
            __me.cls = 'p-inline-datepicker-' + __me.options.name;

            var __class_options = {
                attr: { 'id': __me.id },
                cls: ['p-inline-datepicker', __me.cls],
                data: __me.options
            };

            if (__me.page instanceof __class) {
                __me.page.control().replaceWith(__me.control = $.new().div(__class_options));
            } else {
                __me.control = __me.page.new().div(__class_options);
            }

            //actions.new().button({ text: __me.title }).attr(__me.options.data.group == key ? { disabled: 'disabled' } : {}).click(function () {

            //});

            return this;
        }

        __class.prototype = {
            destroy: function () { delete this; },
            refresh: function (__o) {
                new __class(this, __o || this.options);
                this.destroy();
            }
        };

        return __class;
    })();

    ($.__advanced_controls || ($.__advanced_controls = {})).frame = (function () {
        function __class(__p, __o) {
            var __me = this;

            __me.page = __p;
            __me.options = __o;

            __me.name = __me.options.name;
            __me.id = 'frame-' + __me.options.name;
            __me.cls = 'p-frame-' + __me.options.name;

            var __class_options = {
                attr: { 'id': __me.id },
                cls: ['p-frame', __me.cls],
                data: __me.options
            };

            if (__me.page instanceof __class) {
                __me.page.control.replaceWith(__p.control = __me.control = $.new().div(__class_options));
            } else {
                __me.control = __me.page.new().div(__class_options);
            }

            __me.header = __me.control.new().div({ cls: 'p-frame-header' });

            __me.title = __me.header.new().h3({ cls: 'p-frame-title', text: __me.options.title || __me.options.name || __me.options.action || 'No title' });

            __me.options.actions = $.extend({
                refresh: true,
                minimize: true,
                close: false
            }, __me.options.actions || {});

            __me.actions = __me.header.new().div({ cls: 'p-frame-actions' });

            __me.options.onInitActions && __me.options.onInitActions(__me.actions, __me.options);

            __me.options.actions.refresh && __me.actions.new().button({ title: 'Թարմացնել', cls: 'p-frame-action-refresh' }).click(function () {
                __me.refresh();
            }).new().img('images/actions/refresh-16.png', { css: { display: 'block' } });

            __me.options.actions.minimize && __me.actions.new().button({ title: 'Փոքրացնել/Մեծացնել', cls: 'p-frame-action-minimize' }).click(function () {
                __me.toggle();
            }).new().img('images/actions/minimize-16.png', { css: { display: 'block' } });

            __me.options.actions.close && __me.actions.new().button({ title: 'Փակել', cls: 'p-frame-action-close' }).click(function () {
                __me.control.remove();
                __me.destroy();
            }).new().img('images/actions/close-16.png', { css: { display: 'block' } });

            __me.content = __me.control.new().div({ cls: 'p-frame-content' });
            __me.footer = __me.control.new().div({ cls: 'p-frame-footer' });

            __me.options.content && __me.options.content(this);

            if (__me.options.minimized) {
                __me.hide();
                $('*', __me.control).stop(true, true);
            }

            return this;
        };

        __class.prototype = {
            destroy: function () { delete this; },
            toggle: function (state) {
                if (typeof state === 'undefined') {
                    state = !this.content.is(':visible');
                }

                if (!state) {
                    this.content.slideUp('fast');
                    this.footer.hide();
                } else {
                    this.content.slideDown('fast');
                    this.footer.show();
                }

                return this;
            },
            show: function () { return this.toggle(true); },
            hide: function () { return this.toggle(false); },
            refresh: function (__o) {
                new __class(this, __o || this.options);
                this.destroy();
            }
        };

        return __class;
    })();

    ($.__advanced_controls || ($.__advanced_controls = {})).inlineDatepicker = (function () {
        function __class(__p, __o) {
            var __me = this;

            __me.page = __p;
            __me.options = __o;

            __me.name = __me.options.name;
            __me.id = 'inline-datepicker-' + __me.options.name;
            __me.cls = 'p-inline-datepicker-' + __me.options.name;

            var __class_options = {
                attr: { 'id': __me.id },
                cls: ['p-inline-datepicker', __me.cls],
                data: __me.options
            };

            if (__me.page instanceof __class) {
                __me.page.control().replaceWith(__me.control = $.new().div(__class_options));
            } else {
                __me.control = __me.page.new().div(__class_options);
            }

            //actions.new().button({ text: __me.title }).attr(__me.options.data.group == key ? { disabled: 'disabled' } : {}).click(function () {

            //});

            var value = __me.options.value || new MyDate();
            var onclick = function (e) {


                __me.options.onchange || __me.options.onchange();
            };

            switch (value.level()) {
                case 'year':
                    var min, max;

                    for (var i = value.y - 2; i <= value.y + 2; i++) {
                        __me.page.new().button({ text: i }).attr(value.y == i ? { disabled: 'disabled' } : {}).click(onclick);
                    }
                    break;
                case 'month':
                    break;
                case 'week':
                    break;
                case 'day':
                    __me.page.new().button({ text: value.y }).click(onclick);
                    __me.page.new().button({ text: monthNameShort(value.m) }).click(onclick);

                    for (var i = Math.max(1, value.d - 3) ; i <= Math.min(value.d + 3, daysInMonth(value.y, value.m)) ; i++) {
                        __me.page.new().button({ text: i }).attr(value.d == i ? { disabled: 'disabled' } : {}).click(onclick);
                    }
                    break;
                default:
                    throw 'Invalid value';
            }

            return this;
        }

        __class.prototype = {
            destroy: function () { delete this; },
            refresh: function (__o) {
                new __class(this, __o || this.options);
                this.destroy();
            }
        };

        return __class;
    });

    $.fn.normal = function () {
        if (this.length > 0) {
            return this[0];
        }
    }

    $.fn.new = function (tag, options) {
        return $.new(tag, options, this);
    };

    $.new = function (tag, options, parent) {
        if (typeof tag === 'string') {
            var element = $('<' + tag + '>');

            if (parent) {
                element.prevObject = parent;
                element.appendTo(parent);
            }

            if (options) {
                switch (typeof options) {
                    case 'object':
                        "options" in options && $.each(options.options, function (value, text) { element.new().option({ value: value, text: text }) });
                        "attr" in options && element.attr(options.attr);
                        "prop" in options && element.prop(options.prop);
                        "data" in options && element.data(options.data);
                        "css" in options && element.css(options.css);
                        "text" in options && element.text(options.text);
                        "html" in options && element.html(options.html);
                        "id" in options && element.attr("id", options.id);
                        "step" in options && element.attr("step", options.step);
                        "name" in options && element.attr("name", options.name);
                        "min" in options && element.attr("min", options.min);
                        "max" in options && element.attr("max", options.max);
                        "value" in options && element.attr("value", options.value);
                        "val" in options && element.val(options.val);
                        "title" in options && element.attr("title", options.title);
                        "cls" in options && (typeof options.cls === 'string' && (options.cls = [options.cls]) || true) && $.each(options.cls, function (n, t) { element.addClass(t) });
                        break;
                    case 'string':
                        element.text(options);
                        break;
                    case 'number':
                        element.text(options).format();
                        break;
                }
            }

            return element;
        } else {
            return {
                img: function (url, options) {
                    if (typeof options != 'object' || options === null) {
                        options = {};
                    }

                    if (!('attr' in options)) {
                        options.attr = {};
                    }

                    options.attr.src = url;

                    return $.new('img', options, parent);
                },
                div: function (options) { return $.new('div', options, parent); },
                span: function (options) { return $.new('span', options, parent); },
                a: function (options) { return $.new('a', options, parent); },
                b: function (options) { return $.new('b', options, parent); },
                i: function (options) { return $.new('i', options, parent); },
                u: function (options) { return $.new('u', options, parent); },
                s: function (options) { return $.new('s', options, parent); },
                a: function (options) { return $.new('a', options, parent); },
                p: function (options) { return $.new('p', options, parent); },
                br: function (options) { return $.new('br', options, parent); },
                hr: function (options) { return $.new('hr', options, parent); },
                table: function (options) { return $.new('table cellspacing="0" border="0"', options, parent); },
                thead: function (options) { return $.new('thead', options, parent); },
                tfoot: function (options) { return $.new('tfoot', options, parent); },
                tbody: function (options) { return $.new('tbody', options, parent); },
                tr: function (options) { return $.new('tr', options, parent); },
                th: function (options) { return $.new('th', options, parent); },
                td: function (options) { return $.new('td', options, parent); },
                button: function (options) { return $.new('button', options, parent); },
                h1: function (options) { return $.new('h1', options, parent); },
                h2: function (options) { return $.new('h2', options, parent); },
                h3: function (options) { return $.new('h3', options, parent); },
                h4: function (options) { return $.new('h4', options, parent); },
                h5: function (options) { return $.new('h5', options, parent); },
                h6: function (options) { return $.new('h6', options, parent); },
                label: function (options) { return $.new('label', options, parent); },
                sup: function (options) { return $.new('sup', options, parent); },
                sub: function (options) { return $.new('sub', options, parent); },
                fieldset: function (legend, options) {
                    var fieldset = $.new('fieldset', options, parent);
                    fieldset.new('legend', legend);
                    return fieldset;
                },
                ul: function (options) { return $.new('ul', options, parent); },
                ol: function (options) { return $.new('ol', options, parent); },
                li: function (options) { return $.new('li', options, parent); },

                hidden: function (options) { return $.new('input type="hidden"', options, parent); },
                text: function (options) { return $.new('input type="text"', options, parent); },
                number: function (options) { return $.new('input type="number"', options, parent); },
                radio: function (options) { return $.new('input type="radio"', options, parent); },
                select: function (options) { return $.new('select', options, parent); },
                option: function (options) { return $.new('option', options, parent); },
                textarea: function (options) {
                    var textarea = $.new('textarea', options, parent);
                    textarea.val(options.value);
                    return textarea;
                },

                /* Advanced controls */
                frame: function (options) { return new $.__advanced_controls.frame(parent, options); },
                inlineDatepicker: function (options) { return new $.__advanced_controls.inlineDatepicker(parent, options); }
            }
        }
    };
})(jQuery);
