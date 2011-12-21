var roles = require("../lib/roles");

roles.setSeparator("/");

roles.addApplication("myapp", [ "readonly", "readwrite" ]);
roles.addProfile("guest", [ "myapp/readonly" ]);
roles.addProfile("admin", [ "myapp/*" ]);

if (roles.getProfile("admin").hasRoles("myapp/readwrite")) {
	console.log("Administrator has readwrite to myapp");
}

if (!roles.getProfile("guest").hasRoles("myapp/readwrite")) {
	console.log("Guest does not have readwrite to myapp");
}