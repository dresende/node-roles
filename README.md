## NodeJS Roles

Manage application and profile roles in a simple manner. You can define your applications/modules and set
a couple of roles (permissions). Then you can define profiles and add application roles to it. You can
export the profiles and applications in JSON format to import later.

## Install

    npm install roles

## API

To use Roles, just include it in your code.

    var roles = require("roles");

### Creating an application

An application can be your entire application or an application module, it's your choice to split the
roles into several applications (modules) or have all roles in one big application. To create an
application you just have to define a name.

    var myApp = roles.addApplication("myapp");

You can then add and remove roles from it.

    myApp.addRoles("create")
         .addRoles("remove")
         .addRoles("view");
    // or add them all at once
    myApp.addRoles("create", "remove", "view", "list");
    // you can remove the same way
    myApp.removeRoles("list");

You could do this all in the application constructor:

    var myApp = roles.addApplication("myapp", [ "create", "remove", "view" ]);

### Creating a profile

A profile is a way of defining a set of permissions that someone or something (that has that profile
associated) can use to access somewhere or something. Confused?

    var guestProfile = roles.addProfile("guest"),
        managerProfile = roles.addProfile("manager");

    guestProfile.addRoles("myapp.view");
    managerProfile.addRoles("myapp.*"); // this is auto-updated if MyApp changes roles

Just like in the Application constructor, this could be defined with less calls:

    var guestProfile = roles.addProfile("guest", [ "myapp.view" ]),
        managerProfile = roles.addProfile("manager", "myapp.*");

### Testing roles

Now that you have your applications and profiles defined, it's simple to test roles. Imagine you have
a user that you assign the profile called "guest". You can test for a specific permission like this:

    // return true
    console.log("Guest has myapp.view role?", guestProfile.hasRoles("myapp.view"));

If you don't assign the profiles and applications to a variable, you can retrieve them using the `roles`.

    // return true
    console.log("Guest has myapp.view role?", roles.getProfile("guest").hasRoles("myapp.view"));

Just like adding roles, you can also test if a profile has more than one role.

    // return true
    console.log("Manager has myapp.view/create role?", managerProfile.hasRoles("myapp.view", "myapp.create"));

If any of the roles is not assigned to a profile, it woule return `false`. If you just want to check for
at least one role, you can use the alternative .hasAnyRoles.

    // return true
    console.log("Guest has myapp.view/create role?", guestProfile.hasAnyRoles("myapp.view", "myapp.create"));

### Export/import

To save your work, you can export all the applications and profiles.

    jsonData = roles.export(); // save the returned JSON to a file or database

Following the same pattern, you can import later.

    roles.import(jsonData); // everything will be reseted before importing

## License (MIT)

Copyright (C) 2011 by Diogo Resende

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
