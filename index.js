/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-07-16
* Updated at  : 2017-08-30
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

invoke_change_detector = function (component) {
	var i = component.change_detectors.length, is_changed;
	while (i--) {
		if (component.change_detectors[i].is_changed()) {
			is_changed = true;
		}
	}

	if (component.controller) {
		if (component.controller.on_digest) {
			component.controller.on_digest();
		} else if (is_changed && component.controller.on_change) {
			component.controller.on_change();
		}
	}

	i = component.directives.length;
	while (i--) {
		if (component.directives[i].controller) {
			if (component.directives[i].controller.on_digest) {
				component.directives[i].controller.on_digest();
			} else if (is_changed && component.directives[i].controller.on_change) {
				component.directives[i].controller.on_change();
			}
		}
	}

	if (component.children) {
		i = component.children.length;
		while (i--) {
			invoke_change_detector(component.children[i]);
		}
	}
};

while (i--) {
	state_service.register(states[i]);
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
