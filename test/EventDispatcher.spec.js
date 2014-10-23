var EventDispatcher = require("../src/EventDispatcher");

describe("EventDispatcher", function() {
	it("can dispatch events", function() {
		var d = new EventDispatcher();

		var l = jasmine.createSpy("listener");
		d.addEventListener("test", l);

		d.dispatchEvent("test");
		expect(l).toHaveBeenCalled();
	});

	it("can remove listeners", function() {
		var d = new EventDispatcher();

		var l = jasmine.createSpy("listener");
		d.addEventListener("test", l);
		d.dispatchEvent("test");
		d.removeEventListener("test", l);
		d.dispatchEvent("test");

		expect(l.calls.count()).toBe(1);
	});

	it("can trigger an event with an event object", function() {
		var d = new EventDispatcher();

		var l = jasmine.createSpy("listener");
		d.addEventListener("test", l);

		var ev = {
			type: "test",
			param: 5
		};

		d.dispatchEvent(ev);

		expect(l).toHaveBeenCalledWith(ev);
		expect(ev.target).toBe(d);
	});

	it("can trigger an event with a string and parameters", function() {
		var d = new EventDispatcher();
		var l = jasmine.createSpy();

		d.on("test",l);
		d.trigger("test",1,2,3);

		expect(l).toHaveBeenCalledWith(1,2,3);
	});

	it("has on/off aliases", function() {
		var d = new EventDispatcher();

		var l = jasmine.createSpy("listener");
		d.on("test", l);
		d.trigger("test");
		d.off("test", l);
		d.trigger("test");

		expect(l.calls.count()).toBe(1);
	});

	it("is tolerant if the same listener is added twice", function() {
		var d = new EventDispatcher();
		var spy = jasmine.createSpy();

		d.on("test", spy);
		d.on("test", spy);

		d.trigger("test");

		expect(spy.calls.count()).toBe(1);
	})
});