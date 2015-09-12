/* jshint maxcomplexity: 16, maxstatements: 45, maxlen: 120 */

// View
// ---------

// The standard view. Includes view events, automatic rendering
// of Underscore templates, nested views, and more.
Marionette.View = Backbone.View.extend({

  // used as the prefix for child view events
  // that are forwarded through the layoutview
  childViewEventPrefix: 'childview',

  constructor: function(options) {
    _.bind(this.render, this);

    this.options = _.extend({}, _.result(this, 'options'), options);

    Marionette.MonitorDOMRefresh(this);

    this._initRegions();
    var behaviors = Marionette._getValue(this.getOption('behaviors'), this);
    this._behaviors = Marionette.Behaviors(this, behaviors);

    Backbone.View.call(this, this.options);

    this.delegateEntityEvents();
  },

  // Serialize the view's model *or* collection, if
  // it exists, for the template
  serializeData: function() {
    if (!this.model && !this.collection) {
      return {};
    }

    // If we have a model, we serialize that
    if (this.model) {
      return this.serializeModel();
    }

    // Otherwise, we serialize the collection,
    // making it available under the `items` property
    return {
      items: this.serializeCollection()
    };
  },

  // Serialize a collection by cloning each of
  // its model's attributes
  serializeCollection: function() {
    if (!this.collection) { return {}; }
    return _.pluck(this.collection.invoke('clone'), 'attributes');
  },

  // Render the view, defaulting to underscore.js templates.
  // You can override this in your view definition to provide
  // a very specific rendering for your view. In general, though,
  // you should override the `Marionette.Renderer` object to
  // change how Marionette renders views.
  // Subsequent renders after the first will re-render all nested
  // views.
  render: function() {
    this._ensureViewIsIntact();

    this.triggerMethod('before:render', this);

    // If this is not the first render call, then we need to
    // re-initialize the `el` for each region
    if (this.isRendered) {
      this._reInitRegions();
    }

    this._renderTemplate();
    this.isRendered = true;
    this.bindUIElements();

    this.triggerMethod('render', this);

    return this;
  },

  // Internal method to render the template with the serialized data
  // and template helpers via the `Marionette.Renderer` object.
  _renderTemplate: function() {
    var template = this.getTemplate();

    // Allow template-less item views
    if (template === false) {
      return;
    }

    // Add in entity data and template helpers
    var data = this.mixinTemplateHelpers(this.serializeData());

    // Render and add to el
    var html = Marionette.Renderer.render(template, data, this);
    this.attachElContent(html);

    return this;
  },

  // Attaches the content of a given view.
  // This method can be overridden to optimize rendering,
  // or to render in a non standard way.
  //
  // For example, using `innerHTML` instead of `$el.html`
  //
  // ```js
  // attachElContent: function(html) {
  //   this.el.innerHTML = html;
  //   return this;
  // }
  // ```
  attachElContent: function(html) {
    this.$el.html(html);

    return this;
  },

  // https://github.com/jashkenas/backbone/blob/1.2.3/backbone.js#L1235
  // Remove this view’s element from the document and all event
  // listeners attached to it. Exposed for subclasses using an
  // alternative DOM manipulation API.
  _removeElement: function() {
    this.$el.remove();
  },

  // Handle destroying regions, and then destroy the view itself.
  destroy: function() {
    if (this.isDestroyed) { return this; }

    var args = _.toArray(arguments);

    this.triggerMethod.apply(this, ['before:destroy'].concat(args));

    this._removeElement();

    this.isDestroyed = true;
    this.isRendered = false;

    this.unbindUIElements();
    this.removeRegions();

    this.triggerMethod.apply(this, ['destroy'].concat(args));

    this.stopListening();

    // Call destroy on each behavior after
    // destroying the view.
    // This unbinds event listeners
    // that behaviors have registered for.
    _.invoke(this._behaviors, 'destroy', args);

    return this;
  }

});

_.extend(Marionette.View.prototype, Marionette.ViewMixin);

_.extend(Marionette.View.prototype, Marionette.RegionsMixin);
