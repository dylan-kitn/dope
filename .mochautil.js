const Mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');

const { interfaces, Suite } = Mocha;
const { bdd } = interfaces;
const { EVENT_FILE_PRE_REQUIRE } = Suite.constants;

Object.defineProperty(interfaces, 'bdd+', {
  writable: false,
  value: suite => {
    bdd(suite);

    suite.on(EVENT_FILE_PRE_REQUIRE, function (context, file, mocha) {
      context.expect = chai.expect;
      context.sinon = sinon;
    });
  }
});
