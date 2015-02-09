window.AppModel = Backbone.Model.extend({

    staticThing: "STATIC THING",

    initialize: function() {
        this.hist = new Hist();
        this.user = new User();
    }

});
window.User = Backbone.Model.extend({
    property : "lol"
});


window.Hist = Backbone.Model.extend({
    history: []
});

