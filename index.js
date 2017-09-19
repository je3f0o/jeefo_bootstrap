/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-07-16
* Updated at  : 2017-09-17
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var zone             = require("jeefo/zone"),
	root             = { children : [], directives : [], change_detectors : [] },
	states           = require("states"),
	state_service    = require("jeefo/router/state_service"),
	compile_element  = require("jeefo/component/compiler/element"),
	original_timeout = zone.get_original("window", "setTimeout"),
	i = states.length, timeout_id,

_invoke_change_detector = function (instance) {
	if (instance.controller) {
		var i = 0, is_changed;

		for (; i < instance.change_detectors.length; ++i) {
			if (instance.change_detectors[i].is_changed()) {
				is_changed = true;
			}
		}

		if (instance.controller.on_digest) {
			instance.controller.on_digest();
		}
		if (is_changed && instance.controller.on_change) {
			instance.controller.on_change();
		}
	}
},

invoke_change_detector = function (component) {
	_invoke_change_detector(component);

	var i = 0;
	for (; i < component.directives.length; ++i) {
		_invoke_change_detector(component.directives[i]);
	}

	for (i = 0; i < component.children.length; ++i) {
		invoke_change_detector(component.children[i]);
	}
};

while (i--) {
	state_service.register(require(states[i]));
}

//zone.on_enter = function () { console.log("ENTER"); };

zone.on_error = function (e) {
	console.error(e);
};

zone.on_leave = function () {
	clearTimeout(timeout_id);

	timeout_id = original_timeout(function () {
		//console.log("LEAVE", timeout_id);
		invoke_change_detector(root);
	});
};

module.exports = function bootstrap (element) {
	window.addEventListener("load", function () {
		root.element = element;
		compile_element(element, root);

		zone.run(function () {
			//state.go("/app/zzz/tttt2/tttt3");
			state_service.go("/");
		});
	});
};
