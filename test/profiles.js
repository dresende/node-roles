var roles = require("./../lib/roles"),
    vows = require("vows"),
    assert = require("assert");

roles.addApplication("testapp", [ "read", "write" ]);

roles.addProfile("guest");
roles.addProfile("user", [ "testapp.read" ]);
roles.addProfile("admin", [ "testapp.*" ]);

vows.describe("profile").addBatch({
	"The guest profile": {
		topic: roles.guest,
		"has no roles": function (topic) {
			assert.lengthOf(topic.roles, 0);
		}
	},
	"The user profile": {
		topic: roles.user,
		"has one role": function (topic) {
			assert.lengthOf(topic.roles, 1);
		},
		"has role 'read' from testapp": function (topic) {
			assert.isTrue(topic.hasRoles("testapp.read"));
		},
		"hasn't role 'write' from testapp": function (topic) {
			assert.isFalse(topic.hasRoles("testapp.write"));
		},
		"has some role from testapp": function (topic) {
			assert.isTrue(topic.hasAnyRoles("testapp.*"));
		},
		"hasn't role 'read' from otherapp": function (topic) {
			assert.isFalse(topic.hasRoles("otherapp.read"));
		},
		"hasn't some role from otherapp": function (topic) {
			assert.isFalse(topic.hasAnyRoles("otherapp.*"));
		}
	},
	"The admin profile": {
		topic: roles.admin,
		"has two roles": function (topic) {
			assert.lengthOf(topic.roles, 2);
		},
		"has role 'read' from testapp": function (topic) {
			assert.isTrue(topic.hasRoles("testapp.read"));
		},
		"has role 'write' from testapp": function (topic) {
			assert.isTrue(topic.hasRoles("testapp.write"));
		},
		"has some role from testapp": function (topic) {
			assert.isTrue(topic.hasAnyRoles("testapp.*"));
		},
		"has all roles from testapp": function (topic) {
			assert.isTrue(topic.hasRoles("testapp.*"));
		},
		"hasn't role 'read' from otherapp": function (topic) {
			assert.isFalse(topic.hasRoles("otherapp.read"));
		},
		"hasn't some role from otherapp": function (topic) {
			assert.isFalse(topic.hasAnyRoles("otherapp.*"));
		}
	}
}).export(module);