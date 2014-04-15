/**
 * Plugin to pre-load the locales the app has specified via require.config()
 */

define(["module", "require", "./common"], function (module, require, common) {


	// Compute locales to pre-load, and start building data structure this plugin will return
	// (a hash with a key for each pre-load locale).
	var localeData = {
		root: {}
	};
	localeData[common.DefaultLocale()] = {};

	// Add each locale specified in this module's configuration.
	var config = module.config();
	if (config) {
		if (typeof config === "string") {
			config = [ config ];
		} else if (config instanceof RegExp) {
			config = common.availableLocalesList.filter(function (locale) {
				return config.test(locale);
			});
		}
		config.forEach(function (locale) {
			var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, locale);
			if (bestFitPreload) {
				localeData[bestFitPreload] = {};
			}
		});
	}

	// Array of pre-load locales
	var locales = Object.keys(localeData);

	// Compute dependencies to require() before this plugin resolves:
	// For every locale, load "currencies", "numbers", and "ca-gregorian".
	var jsonElements = [ "currencies", "numbers", "ca-gregorian" ];
	var dependencies = [];
	locales.forEach(function (locale) {
		jsonElements.forEach(function (element) {
			dependencies.push("requirejs-text/text!./cldr/" + locale + "/" + element + ".json");
		});
	});

	return {
		load: function (path, require, onload) {
			require(dependencies, function () {
				var deps = Array(arguments);

				// Now that we've loaded all the JSON files we need, stick the results into the localeData hash.
				locales.forEach(function (locale) {
					var l = localeData[locale];
					jsonElements.forEach(function (element) {
						l[element] = JSON.parse(deps.shift());
					});
				});

				onload(localeData);
			});
		}
	};
});
