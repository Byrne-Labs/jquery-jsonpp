(function(jQuery)
{
    jQuery.ajaxTransport(
        "jsonpps",
        function(options)
        {
            var callback;

            return {
                send: function(headers, complete)
                {
                    var postOptions = jQuery.extend({}, options);
                    postOptions.type = "POST";
                    postOptions.async = false;
                    postOptions.jsonpp = undefined;
                    postOptions.jsonppCallback = undefined;
                    postOptions.jsonpp = undefined;
                    postOptions.jsonppCallback = undefined;
                    postOptions.dataTypes = undefined;
                    postOptions.dataType = "text";
                    postOptions.contentType = "text/plain";
                    postOptions.success = undefined;
                    postOptions.complete = undefined;
                    var callbackName = getCallbackName(options);
                    jQuery.post(postOptions)
                        .then(
                            function(data)
                            {
                                console.error(data);
                                var script = jQuery("<script>")
                                    .prop(
                                        {
                                            charset: options.scriptCharset,
                                            text: data
                                        })
                                    .on(
                                        "load error",
                                        callback = function(evt)
                                        {
                                            var appManifest = window[callbackName + "_Data"][0];
                                            script.remove();
                                            callback = null;
                                            if (evt)
                                            {
                                                options.success(appManifest);
                                                options.complete();
                                                complete(evt.type === "error" ? 404 : 200, evt.type);
                                            }
                                        }
                                    );
                                document.head.appendChild(script[0]);
                            });
                },
                abort: function()
                {
                    if (callback)
                    {
                        callback();
                    }
                }
            };
        });

    var _oldCallbacks = [];
    var _nonce = jQuery.now();

    jQuery.ajaxSetup(
        {
            jsonpp: "callback",
            jsonppCallback: function()
            {
                var callback = _oldCallbacks.pop() || (jQuery.expando + "_" + (_nonce++));
                this[callback] = true;
                return callback;
            }
        });

    jQuery.ajaxPrefilter(
        "jsonpp",
        function(s)
        {
            if (s.cache === undefined)
            {
                s.cache = false;
            }
        });

    function getCallbackName(settings)
    {
        return jQuery.isFunction(settings.jsonppCallback) ? settings.jsonppCallback() : settings.jsonppCallback;
    }

    jQuery.ajaxPrefilter(
        "json jsonpp",
        function(settings, originalSettings, jqXHR)
        {
            var callbackName, overwrittenCallback, overwrittenData, responseContainer;

            if (settings.dataTypes[0] === "jsonpp")
            {
                callbackName = settings.jsonppCallback = getCallbackName(settings);
                var dataName = callbackName + "_Data";

                settings.converters["jsonpps json"] = function()
                {
                    if (!responseContainer)
                    {
                        jQuery.error(callbackName + " was not called");
                    }
                    return responseContainer[0];
                };
                settings.dataTypes[0] = "json";

                overwrittenCallback = window[callbackName];
                overwrittenData = window[dataName];
                window[callbackName] = function()
                {
                    responseContainer = arguments;
                    window[dataName] = arguments;
                };

                jqXHR.always(
                    function()
                    {
                        if (overwrittenCallback === undefined)
                        {
                            jQuery(window).removeProp(callbackName);
                        }
                        else
                        {
                            window[callbackName] = overwrittenCallback;
                        }
                        if (overwrittenData === undefined)
                        {
                            jQuery(window).removeProp(dataName);
                        }
                        else
                        {
                            window[dataName] = overwrittenData;
                        }

                        if (settings[callbackName])
                        {
                            settings.jsonppCallback = originalSettings.jsonppCallback;
                            _oldCallbacks.push(callbackName);
                        }

                        if (responseContainer && jQuery.isFunction(overwrittenCallback))
                        {
                            overwrittenCallback(responseContainer[0]);
                        }

                        responseContainer = overwrittenCallback = undefined;
                    });
                return "jsonpps";
            }
        });
})(jQuery);
