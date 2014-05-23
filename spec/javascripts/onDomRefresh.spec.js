describe('onDomRefresh', function() {
  beforeEach(global.setup);
  afterEach(global.teardown);

  var View, view;

  beforeEach(function() {
    View = Backbone.Marionette.ItemView.extend({
      onDomRefresh: function() {}
    });

    this.sinon.spy(View.prototype, 'onDomRefresh');
    view = new View();
    view.trigger('show');
    view.trigger('render');
  });

  afterEach(function() {
    view.remove();
  });

  describe('when the view is not in the DOM', function() {
    it('should never trigger onDomRefresh', function() {
      expect(View.prototype.onDomRefresh).not.to.have.been.called;
    });
  });

  describe('when the view is in the DOM', function() {
    beforeEach(function() {
      $('body').append(view.$el);
      view.trigger('show');
      view.trigger('render');
    });

    it('should trigger onDomRefresh if "show" and "render" have both been triggered on the view', function() {
      expect(View.prototype.onDomRefresh).to.have.been.called;
    });
  });
});
