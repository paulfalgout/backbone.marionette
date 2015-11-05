var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiJq = require('chai-jq');
var requireHelper = require('./require-helper');

import Marionette from '../../src/backbone-marionette';

chai.use(sinonChai);
chai.use(chaiJq);

global.chai = chai;
global.sinon = sinon;

if (!global.document || !global.window) {
  var jsdom = require('jsdom').jsdom;

  global.document = jsdom('<html><head><script></script></head><body></body></html>', {
    FetchExternalResources   : ['script'],
    ProcessExternalResources : ['script']
  });

  global.window = document.defaultView;
  global.navigator = global.window.navigator;

}

require('babel-core/register');
require('./setup')();

global.$ = require('jquery')(global.window);
global._ = require('underscore');
global.Backbone = require('backbone');
global.Backbone.$ = global.$;
global.Marionette = Backbone.Marionette = Marionette;

requireHelper('features');

require('backbone.babysitter');
require('backbone.radio');
