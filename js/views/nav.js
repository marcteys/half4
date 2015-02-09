window.NavPage = Backbone.View.extend({

    events: {
    },

    initialize: function() {
        this.template = _.template(tpl.get('nav'));
        console.log('Nav init');
        $(window).bind('hashchange',this.displayNav);

    },

    displayNav : function (event){
        if( (window.location.hash == "#home") || (window.location.hash == "#") || (window.location.hash == "")) {
            $("nav").addClass("out");
        } else {
          $("nav").removeClass("out");
        }
    },

    render: function(eventName) {
        var that = this;

        this.$el.append(this.template({}));
        setTimeout(that.displayNav,100);

        return this;
    }

});