//
// Shim for native vs. ecma402 package implementation of the Intl object.
//
var dependencies = [];
if (Intl === undefined || Intl.NumberFormat === undefined || Intl.DateTimeFormat === undefined) {
	dependencies.push("./Intl");
}
define(dependencies, function (ecma402Intl) {
	if (Intl === undefined || Intl.NumberFormat === undefined || Intl.DateTimeFormat === undefined) {
		return ecma402Intl;
	}
	return Intl;
});
