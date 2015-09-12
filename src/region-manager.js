Marionette.RegionsMixin = {
  regionClass: Marionette.Region,

  // Internal method to initialize the regions that have been defined in a
  // `regions` attribute on this layoutView.
  _initRegions: function() {

    this.regions = this.regions || {};
    this._regions = {};

    this.addRegions(this.getOption('regions'));
  },

  // Internal method to re-initialize all of the regions by updating
  // the `el` that they point to
  _reInitRegions: function() {
    _.invoke(this._regions, 'reset');
  },

  // Add a single region, by name, to the layoutView
  addRegion: function(name, definition) {
    var regions = {};
    regions[name] = definition;
    return this.addRegions(regions)[name];
  },

  // Add multiple regions as a {name: definition, name2: def2} object literal or
  // a function that evaluates to such literal
  addRegions: function(regions) {

    // Enable regions to be a function
    regions = Marionette._getValue(regions, this, _.rest(arguments));

    // Normalize region selectors hash to allow
    // a user to use the @ui. syntax.
    regions = this.normalizeUIValues(regions, ['selector', 'el']);

    // Add the regions definitions to the regions property
    this.regions = _.extend({}, this.regions, regions);

    return this._buildRegions(regions);
  },

  // internal method to build regions
  _buildRegions: function(regionDefinitions) {
    regionDefinitions = Marionette._getValue(regionDefinitions, this, arguments);

    return _.reduce(regionDefinitions, function(regions, definition, name) {
      regions[name] = this._buildRegion(name, definition);
      return regions;
    }, {}, this);
  },

  // Add an individual region and return the region instance
  _buildRegion: function(name, definition, defaults) {
    if (definition instanceof Marionette.Region) {
      return definition;
    }

    var region = this._buildRegionFromDefinition(definition);

    this._addRegion(region, name);

    return region;
  },

  _buildRegionFromDefinition: function(definition) {
    if (_.isString(definition)) {
      definition = {selector: definition};
    }

    if (definition.selector) {
      return this._buildRegionFromObject(definition);
    }

    if (_.isFunction(definition)) {
      return this._buildRegionFromRegionClass(definition);
    }

    throw new Marionette.Error({
      message: 'Improper region configuration type.',
      url: 'marionette.region.html#region-configuration-types'
    });
  },

  _buildRegionFromObject: function(definition) {
    var RegionClass = definition.regionClass || this.getOption('regionClass');

    var options = _.omit(definition, 'regionClass');

    _.defaults(options, {
      el: definition.selector,
      parentEl: _.partial(_.result, this, 'el')
    });

    return new RegionClass(options);
  },

  // Build the region directly from a given `RegionClass`
  _buildRegionFromRegionClass: function(RegionClass) {
    return new RegionClass({
      parentEl: _.partial(_.result, this, 'el')
    });
  },

  _addRegion: function(region, name) {
    this.triggerMethod('before:add:region', name, region);

    this._regions[name] = region;

    this.triggerMethod('add:region', name, region);
  },

  // Remove a single region from the LayoutView, by name
  removeRegion: function(name) {
    var region = this._regions[name];

    this._removeRegion(region, name);

    return region;
  },

  removeRegions: function() {
    var regions = this.getRegions();

    _.each(this._regions, this._removeRegion, this);

    return regions;
  },

  _removeRegion: function(region, name) {
    this.triggerMethod('before:remove:region', name, region);

    region.empty();
    region.stopListening();

    delete this._regions[name];
    this.triggerMethod('remove:region', name, region);
  },

  // Empty all regions in the region manager, but
  // leave them attached
  emptyRegions: function() {
    var regions = this.getRegions();
    _.invoke(regions, 'empty');
    return regions;
  },

  // Checks to see if layout contains region
  // Accepts the region name
  // hasRegion('main')
  hasRegion: function(name) {
    return !!this.getRegion(name);
  },

  // Provides access to regions
  // Accepts the region name
  // getRegion('main')
  getRegion: function(name) {
    return this._regions[name];
  },

  // Get all regions
  getRegions: function() {
    return _.clone(this._regions);
  },

  showChildView: function(name, view, options) {
    var region = this.getRegion(name);
    return region.show.apply(region, _.rest(arguments));
  },

  getChildView: function(name) {
    return this.getRegion(name).currentView;
  },

  _getImmediateChildren: function() {
    return _.chain(this.getRegions())
      .pluck('currentView')
      .compact()
      .value();
  }

};
