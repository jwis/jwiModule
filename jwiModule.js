(function(context) {
  //'use strict';
  if(typeof context==='undefined'){
	  context = this;
  }
  // Create a new module.
  // Define the namespace and runs the specified callback.
  // By default, the last namespace component will be defined as
  // as function. You can create a regular object by setting the
  // third argument to anything you want.
  //
  //     jwiModule("Todo.Application", function(Application) {
  //       Application.fn.initialize = function() {};
  //     });
  //
  // The jwiModule's prototype will be defined as a shortcut called `jwiModule#fn`.
  // Any initialization must be performed on the `jwiModule#initialize()` function.
  function jwiModule(namespace, callback, object) {
    var components = namespace.split(/[.:]+/);
    var scope = context;
    var component, last;

    if (typeof callback !== 'function') {
      object = object||build(callback);
      callback = null;
    }

    object = object || build(callback);

    // Process all components but the last, which will store the
    // specified object attribute.
    for (var i = 0, count = components.length; i < count; i++) {
      last = (i == count - 1);
	  scope[components[i]] = (last ? object : scope[components[i]] || {});
      scope = scope[components[i]];
    }

    if (callback) {
	  callback.call(scope, scope, scope.prototype);
    }

    return scope;
  }

  // Retrieve a module by its namespace. Return null if not defined.
  jwiModule.fetch = function(namespace) {
    var components = namespace.split('.');
    var scope = context;

    for (var i = 0, count = components.length; i < count; i++) {
      scope = scope[components[i]];

      if (!scope) {
        break;
      }
    }

    return scope;
  };

  // Run the specified module and return the instance.
  jwiModule.run = function(namespace, args) {
    var module = jwiModule.fetch(namespace);

    if (typeof module === 'function') {
      return module.apply(null, args || []);
    }
  };

  // Build a new module with the correct attributes and methods.
  function build(prop) {
    var Constructor, Instance;

    Constructor = function() {
      // Initialize a new instance, which won't do nothing but
      // inheriting the prototype.
      var instance = new Instance();

      // Apply the initializer on the given instance.
      instance.initialize.apply(instance, arguments);

      return instance;
    };
	
	
	// Define the function that will be used to
    // initialize the instance.
    Instance = function() {};
    Instance.prototype = Constructor.prototype;

    // Save some typing and make an alias to the prototype.
    try {
      Object.defineProperty(Constructor, 'fn', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: Constructor.prototype
      });
    } catch (error) {
      Constructor.fn = Constructor.prototype;
    }

	// Copy the properties over onto the new prototype
    if(typeof prop=='object'){
		for (var name in prop) {
			Constructor.prototype[name]=prop[name];
		}
	}
	
    // Define a noop initializer.
    if(typeof Constructor.fn.initialize==='undefined'){
		Constructor.fn.initialize = function() {};
	}
	
	// The dummy class constructor
    function Constructor() {
      // All construction is actually done in the init method
      if ( this.initialize )
        this.initialize.apply(this, arguments);
    }
	
	Constructor.prototype.constructor = Constructor;
	
    return Constructor;
  }

  // Sometimes you want to define your own wrapper, with custom initialization.
  // In this case, you can use the `jwiModule.wrapper` function.
  //
  //     jwiModule.wrapper("MyApp.Model", function(namespace, callback) {
  //       jwiModule(namespace, function(Model) {
  //         $.extend(Model, Validations);
  //         $.extend(Model, MassAssignment);
  //
  //         Model.fn.initialize = function(attributes) {
  //           this.assignAttributes(attributes);
  //         };
  //       });
  //     });
  //
  //     MyApp.Model("MyApp.User", function(User) {
  //       User.validates("name", {presence: true});
  //     });
  //
  //     var user = MyApp.User();
  //
  jwiModule.wrapper = function(namespace, initializer) {
    return jwiModule(namespace, function(Definition) {
      Definition.fn.initialize = function(namespace, callback) {
        initializer.apply(Definition, arguments);
      };

      return Definition;
    });
  };
  
  jwiModule.mixin = function (receivingClass, givingClass) { 
		if(arguments[2]) { // Only give certain methods. 
			for(var i = 2, len = arguments.length; i < len; i++) { 
				receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]]; 
			} 
		} 
		else { // Give all methods.
			for(methodName in givingClass.prototype) { 
				if(!receivingClass.prototype[methodName]) { 
					receivingClass.prototype[methodName] = givingClass.prototype[methodName]; 
				} 
			} 
		} 
	};

  jwiModule.extend = function(namespace, source, prop) {
	    return jwiModule(namespace, function(Definition){
			var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
			
			var _super = source.prototype;

			// Copy the methods from parents
			//for(methodName in source.prototype) { 
			//	if(!Definition.fn[methodName]) { 
			//		Definition.fn[methodName] = source.prototype[methodName]; 
			//	} 
			//}
			Definition.fn.__proto__ = _super;
			
			// Copy the properties over onto the new prototype
			for(var name in prop) {
				// Check if we're overwriting an existing function
				Definition.fn[name] = typeof prop[name] == "function" &&
					typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				(function(name, fn){
				  return function() {
					var tmp = this._super;
				   
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);        
					//var ret = fn.apply(source, arguments);        
					this._super = tmp;
				   
					return ret;
				  };
				})(name, prop[name]) :
				prop[name];
			}

		});
	};


  // Expose the module function.
  context.jwiModule=jwiModule;
  return jwiModule;
})();
