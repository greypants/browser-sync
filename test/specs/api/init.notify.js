"use strict";

var browserSync = require("../../../lib/index");

var assert      = require("chai").assert;
var sinon       = require("sinon");

describe("Public Notify Method", function () {

    var emitterStub;
    before(function(){
        emitterStub = sinon.stub(browserSync.emitter, "emit");
    });
    afterEach(function () {
        emitterStub.reset();
    });
    after(function () {
        emitterStub.restore();
    });

    it("should emit the browser:notify event", function () {
        browserSync.notify("HI");
        sinon.assert.calledWithExactly(emitterStub, "browser:notify", {message: "HI"});
    });
    it("should emit the browser:notify event (2)", function () {
        browserSync.notify("HI There");
        sinon.assert.calledWithExactly(emitterStub, "browser:notify", {message: "HI There"});
    });
    it("should NOT emit the browser:notify event if a message was not provided", function () {
        browserSync.notify();
        sinon.assert.notCalled(emitterStub);
    });
});