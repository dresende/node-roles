/**
 * Role Management (ACL) for NodeJS
 *
 * User -> Profile -> Roles <- Application
 **/

// CONSTANTS
var APP_ROLE_SEPARATOR = ".";

// INCLUDES
var util = require("util"),
    events = require("events");

// VARIABLES
var applications = {},
    profiles = {},
    users = {},
    monitor;

function Monitor() {
	events.EventEmitter.call(this);
}
util.inherits(Monitor, events.EventEmitter);

function Application(name, roles) {
	this.name = name;
	this.roles = [];

	if (roles && roles.length) {
		this.addRoles.apply(this, roles);
	}
}
util.inherits(Application, events.EventEmitter);

Application.prototype.addRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		if (this.roles.indexOf(arguments[i]) == -1) {
			this.roles.push(arguments[i]);

			this.emit("role.add", arguments[i]);
			monitor.emit("app.addrole", this.name, arguments[i]);
		}
	}
	return this;
};
Application.prototype.removeRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		if (this.roles.indexOf(arguments[i]) != -1) {
			this.roles.splice(this.roles.indexOf(arguments[i]), 1);

			this.emit("role.del", arguments[i]);
			monitor.emit("app.delrole", this.name, arguments[i]);
		}
	}
	return this;
};

function Profile(name, roles) {
	this.name = name;
	this.roles = [];
	this.applications = [];

	if (roles && roles.length) {
		this.addRoles.apply(this, roles);
	}
}
Profile.prototype.addRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		var role = arguments[i];

		if (role.indexOf(APP_ROLE_SEPARATOR) <= 0) {
			throw new Error("A role must have an associated application");
		}

		role = role.split(APP_ROLE_SEPARATOR, 2);

		if (!applications.hasOwnProperty(role[0])) {
			throw new Error("Application not found");
		}

		if (role[1] == "*") {
			for (var j = 0; j < applications[role[0]].roles.length; j++) {
				this.__addRole(role[0], applications[role[0]].roles[j]);
			}

			if (this.applications.indexOf(role[0]) == -1) {
				applications[role[0]].on("role.add", this.__watchNewRoles(this, role[0]));
				applications[role[0]].on("role.del", this.__watchRemoveRoles(this, role[0]));

				this.applications.push(role[0]);
			}
		} else {
			if (applications[role[0]].roles.indexOf(role[1]) == -1) {
				if (monitor.listeners("role.invalid").length == 0) {
					throw new Error("Application " + role[0] + " does not have " + role[1] + " role");
				} else {
					monitor.emit("role.invalid", role[0], role[1]);
				}
			}

			this.__addRole(role[0], role[1]);
		}
	}
	return this;
};
Profile.prototype.removeRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		var role = arguments[i];

		if (role.indexOf(APP_ROLE_SEPARATOR) <= 0) {
			throw new Error("A role must have an associated application");
		}

		role = role.split(APP_ROLE_SEPARATOR, 2);

		if (!applications.hasOwnProperty(role[0])) {
			throw new Error("Application not found");
		}

		if (role[1] == "*") {
			for (var j = 0; j < applications[role[0]].roles.length; j++) {
				this.__removeRole(role[0], applications[role[0]].roles[j]);
			}

			if (this.applications.indexOf(role[0]) != -1) {
				applications[role[0]].removeListener("role.add", this.__watchNewRoles(this, role[0]));
				applications[role[0]].removeListener("role.del", this.__watchRemoveRoles(this, role[0]));

				this.applications.splice(this.applications.indexOf(role[0]), 1);
			}
		} else {
			if (applications[role[0]].roles.indexOf(role[1]) == -1) {
				if (monitor.listeners("role.invalid").length == 0) {
					throw new Error("Application " + role[0] + " does not have " + role[1] + " role");
				} else {
					monitor.emit("role.invalid", role[0], role[1]);
				}
			}

			this.__removeRole(role[0], role[1]);
		}
	}

	return this;
};
Profile.prototype.hasRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		var role = arguments[i];

		if (role.indexOf(APP_ROLE_SEPARATOR) <= 0) return false;

		role = role.split(APP_ROLE_SEPARATOR, 2);

		if (!applications.hasOwnProperty(role[0])) return false;

		if (role[1] == "*") {
			for (var j = 0; j < applications[role[0]].roles.length; j++) {
				if (this.roles.indexOf(role[0] + APP_ROLE_SEPARATOR + applications[role[0]].roles[j]) == -1) return false;
			}
		} else {
			if (applications[role[0]].roles.indexOf(role[1]) == -1) {
				if (monitor.listeners("role.invalid").length == 0) {
					throw new Error("Application " + role[0] + " does not have " + role[1] + " role");
				} else {
					monitor.emit("role.invalid", role[0], role[1]);
				}
			}
			if (this.roles.indexOf(role.join(APP_ROLE_SEPARATOR)) == -1) return false;
		}
	}

	return true;
};
Profile.prototype.hasAnyRoles = function () {
	for (var i = 0; i < arguments.length; i++) {
		var role = arguments[i];

		if (role.indexOf(APP_ROLE_SEPARATOR) <= 0) continue;

		role = role.split(APP_ROLE_SEPARATOR, 2);

		if (!applications.hasOwnProperty(role[0])) continue;

		if (role[1] == "*") {
			for (var j = 0; j < applications[role[0]].roles.length; j++) {
				if (this.roles.indexOf(role[0] + APP_ROLE_SEPARATOR + applications[role[0]].roles[j]) != -1) return true;
			}
		} else {
			if (applications[role[0]].roles.indexOf(role[1]) == -1) {
				if (monitor.listeners("role.invalid").length == 0) {
					throw new Error("Application " + role[0] + " does not have " + role[1] + " role");
				} else {
					monitor.emit("role.invalid", role[0], role[1]);
				}
			}
			if (this.roles.indexOf(role.join(APP_ROLE_SEPARATOR)) != -1) return true;
		}
	}

	return false;
};
Profile.prototype.__addRole = function (app, role) {
	var app_role = app + APP_ROLE_SEPARATOR + role;

	if (this.roles.indexOf(app_role) == -1) {
		this.roles.push(app_role);
		monitor.emit("profile.addrole", this.name, app, role);
	}
};
Profile.prototype.__removeRole = function (app, role) {
	var app_role = app + APP_ROLE_SEPARATOR + role;

	if (this.roles.indexOf(app_role) != -1) {
		this.roles.splice(this.roles.indexOf(app_role), 1);
		monitor.emit("profile.delrole", this.name, app, role);
	}
};
Profile.prototype.__watchNewRoles = function (profile, app) {
	return function (role) {
		var app_role = app + APP_ROLE_SEPARATOR + role;
		if (profile.roles.indexOf(app_role) == -1) {
			profile.roles.push(app_role);
		}
	};
};
Profile.prototype.__watchRemoveRoles = function (profile, app) {
	return function (role) {
		var app_role = app + APP_ROLE_SEPARATOR + role;
		if (profile.roles.indexOf(app_role) != -1) {
			profile.roles.splice(profile.roles.indexOf(app_role), 1);
		}
	};
};

function getApplication(name) {
	if (applications.hasOwnProperty(name)) {
		return applications[name];
	}
	return null;
}
function getProfile(name) {
	if (profiles.hasOwnProperty(name)) {
		return profiles[name];
	}
	return null;
}
function addApplication(name, roles) {
	var app = getApplication(name);

	if (app === null) {
		applications[name] = new Application(name, roles);
	} else if (roles && roles.length) {
		applications[name].addRoles(roles);
	}

	if (!module.exports.hasOwnProperty(name)) {
		module.exports[name] = applications[name];
	}

	return applications[name];
}
function addProfile(name, roles) {
	var profile = getProfile(name);

	if (profile === null) {
		profiles[name] = new Profile(name, roles);
	} else if (roles && roles.length) {
		profiles[name].addRoles(roles);
	}

	if (!module.exports.hasOwnProperty(name)) {
		module.exports[name] = profiles[name];
	}

	return profiles[name];
}
function exportRoles() {
	var a = {}, p = {};

	for (app in applications) {
		if (applications.hasOwnProperty(app)) {
			a[app] = [];

			for (var i = 0; i < applications[app].roles.length; i++) {
				a[app].push(applications[app].roles[i]);
			}
		}
	}
	for (prof in profiles) {
		if (profiles.hasOwnProperty(prof)) {
			p[prof] = [];

			for (var i = 0; i < profiles[prof].roles.length; i++) {
				p[prof].push(profiles[prof].roles[i]);
			}
		}
	}
	return {
		applications: a,
		profiles: p
	};
}
function importRoles(data) {
	applications = {};
	profiles = {};

	for (app in data.applications) {
		if (data.applications.hasOwnProperty(app)) {
			applications[app] = new Application(app);
			applications[app].addRoles.apply(applications[app], data.applications[app]);
		}
	}
	for (prof in data.profiles) {
		if (data.profiles.hasOwnProperty(prof)) {
			profiles[prof] = new Profile(prof);
			profiles[prof].addRoles.apply(profiles[prof], data.profiles[prof]);
		}
	}
}

monitor = new Monitor();

module.exports = {
	addApplication: addApplication,
	    addProfile: addProfile,
	getApplication: getApplication,
	    getProfile: getProfile,
	        import: importRoles,
	        export: exportRoles,
	    getMonitor: function () { return monitor; },
	  setSeparator: function (sep) { APP_ROLE_SEPARATOR = sep; return this; }
};