
require("../jwiModule.js");

console.log("===============Tese Function Based Object=================");
jwiModule("Todo.Application", function(Application) {
	Application.fn.initialize = function(name) { console.log("Application["+name+"].fn.initialize...");};
	Application.fn.exec = function(name){ console.log(name + ".fn.exec"); };
	Application.fn.superCall=function(){console.log("Todo.Appliction.superCall");};
});

console.log("typeof Todo.Application: "+typeof Todo.Application);

var app = Todo.Application("abc");
app.exec("Todo.Application");

console.log("===============Tese Property Based Object=================");
jwiModule("Todo.Module.Thing", {
	initialize:function(name){
		console.log("Todo.Module.Thing["+name+"].initialize...");
	},
	call:function(){
		console.log("Todo.Module.Thing.call...");
	}
	
});
console.log("typeof Todo.Module.Thing: "+typeof Todo.Module.Thing);
var thing = Todo.Module.Thing("abcd");
thing.call();

console.log("===============Tese Wrapper Based Object=================");
jwiModule.wrapper("Model", function(namespace, callback){
  jwiModule(namespace, function(Model){
    Model.fn.initialize = function(attributes) {
      this.assign(attributes);
    };

    Model.fn.assign = function(attributes) {
      for (var name in attributes) {
        this[name] = attributes[name];
      }
    };

    callback(Model);
  });
});

Model("Todo.Task", function(Task){
  Task.fn.isPending = function() {
    return this.status === "pending";
  };
});

var task = Todo.Task({status: "pending"});
console.log("Todo.Task.isPending? "+task.isPending()); // true

console.log("===============Tese Mixin Object=================");
jwiModule.mixin(Todo.Task, Todo.Application, 'exec', 'superCall');
var mixedTask = Todo.Task({status:"exec..."});
mixedTask.exec('mixedTask');
mixedTask.superCall();

console.log("===============Tese Extend Object=================");
jwiModule.extend("Todo.ExtendObj", Todo.Task, {
	initialize:function(){
		console.log("Todo.ExtendObj.initialize...");
	},
	exec:function(){
		console.log("Todo.ExtendObj.exec...");
	}
});

console.log("typeof Todo.ExtendObj: "+typeof Todo.ExtendObj);
var extObj= Todo.ExtendObj();
extObj.exec();
extObj.superCall();



