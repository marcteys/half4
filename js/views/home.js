window.HomePage = Page.extend({

	events: {
      
     },

    initialize:function () {
        // name is used to identify pages and as a unique reference
        this.name = "home";
        // template name is name unless specified e.g.
        // this.templateName = "about";
        // MUST call super initialize to setup the template
        Page.prototype.initialize.apply(this);
    },

    render : function(eventName) {
    	$(this.el).html(this.template({}));

    	return this;
    }


});