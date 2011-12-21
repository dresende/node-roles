var roles = require("./../lib/roles"),
    vows = require("vows"),
    assert = require("assert");

roles.addApplication("testapp", [ "read", "write" ]);

vows.describe("application").addBatch({
	"The test application": {
		topic: roles.testapp,
		"has 2 roles": function (topic) {
			assert.lengthOf(topic.roles, 2);
		},
		"has role 'read'": function (topic) {
			assert.equal(topic.roles[0], "read");
		},
		"has role 'write'": function (topic) {
			assert.equal(topic.roles[1], "write");
		}
	}
}).export(module);