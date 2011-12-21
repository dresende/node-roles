var roles = require("../lib/roles");

roles.addApplication("myapp", [ "readonly", "readwrite" ]);
roles.addProfile("guest", [ "myapp.readonly" ]);
roles.addProfile("admin", [ "myapp.*" ]);

if (roles.admin.hasRoles("myapp.readwrite")) {
	console.log("Administrator has readwrite to myapp");
}

if (!roles.guest.hasRoles("myapp.readwrite")) {
	console.log("Guest does not have readwrite to myapp");
}

// you could do the same to access applications, like this:
//
// roles.myapp.method()