/**
 * Plugin to preload the locales the app has specified
 */

define(["module", "require", "./common"], function (module, require, common) {

	var config = module.config();

	var jsonElements = [ "currencies", "numbers", "ca-gregorian" ];

	// Compute list of locales to pre-load, based on app's configuration settings for this module
	var preLoadList = [ "root", common.DefaultLocale() ];
	if (typeof config === "string") {
		if (config === "allAvailable") {	// TODO: get rid of this?  It's redundant with the /.*/ regexp.
			common.availableLocalesList.forEach(function (locale) {
				if (preLoadList.indexOf(locale) === -1) {
					preLoadList.push(locale);
				}
			});
		} else {
			var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, config);
			if (bestFitPreload && preLoadList.indexOf(bestFitPreload) === -1) {
				preLoadList.push(bestFitPreload);
			}
		}
	} else if (config instanceof Array) {
		config.forEach(function (locale) {
			var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, locale);
			if (bestFitPreload && preLoadList.indexOf(bestFitPreload) === -1) {
				preLoadList.push(bestFitPreload);
			}
		});
	} else if (config instanceof RegExp) {
		common.availableLocalesList.forEach(function (locale) {
			if (config.test(locale) && preLoadList.indexOf(locale) === -1) {
				preLoadList.push(locale);
			}
		});
	}

	// Compute dependencies to require() before this plugin resolves:
	// For every locale, load "currencies", "numbers", and "ca-gregorian".
	var dependencies = [];
	preLoadList.forEach(function (locale) {
		jsonElements.forEach(function (element) {
			dependencies.push("requirejs-text/text!./cldr/" + locale + "/" + element + ".json");
		});
	});


	return {
		load: function (path, require, onload) {

			require(dependencies, function () {
				var deps = Array(arguments);

				// Return value from this plugin.
				var locales = {
				};

				// Now that we've loaded everything all the JSON files we need,
				// stick the results into the locales hash.
				preLoadList.forEach(function (locale) {
					var l = locales[locale] = {};
					jsonElements.forEach(function (element) {
						l[element] = JSON.parse(deps.shift());
					});
				});

				onload(locales);
			});
		}
	};
});
