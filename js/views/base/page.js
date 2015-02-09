// Base Page from which all other pages should inherit
// Provides common page functionality
window.Page = Backbone.View.extend({


    // Fields
    page: null,
    pageName: "",

    // Backbone.View methods
    initialize: function() {
        // Classes that inherit from Page need to set this.name
        // this.name is used to identify pages and as a unique reference
        // template name is also set to name unless specified explicitely e.g.
        // this.templateName = "path/to/template";
        if (this.name) {
            if (!this.templateName) this.templateName = this.name;
            // console.log("Page::initialize name:" + this.name + ", template: " + this.templateName);
            this.template = _.template(tpl.get(this.templateName));
        } else {
            console.error("ERROR: name is not set in Page initialize");
        }
    },
    events: {
        'click .arrowleft': 'goback'
    },

    render: function(eventName) {
        // Template accepts JSON object as a paramater
        // We can use backbone's model.toJSON() for this if we want, like so:
        // $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).html(this.template({}));
        return this;
    },

    // public methods
    changePage: function(page, inClass, outClass) {

        var containerEl = $(this.el).find('.children');

        if (!inClass) inClass = 'pt-page-moveFromRight';
        if (!outClass) outClass = 'pt-page-moveToLeft pt-page-ontop';


        if (Backbone.history.fragment == this.model.hist.history[this.model.hist.history.length - 3]) {
            this.model.hist.history.pop();
            this.model.hist.history.pop();

            outClass = 'pt-page-moveToRight pt-page-ontop';
            inClass = 'pt-page-moveFromLeft';
            console.log('previous hassessment');
        }


       if (containerEl.length > 0) {
            this.transitionPage(page, containerEl, inClass, outClass);
        } else {
            console.log("Page::changePage ERROR: attempt to load sub view into " + this.name + " which has no <div id='children'> element");
        }
    },

    transitionPage: function(page, containerEl, inClass, outClass) {

        // if this.page is not set then this is our first page
        var isFirstPage = (this.page === null);

        // grab the new page element
        // call the new page's render() method to inject and render it's HTML
        // append the new page's element to the container div
        var pageEl = $(page.el);
        page.render();
        containerEl.append(pageEl);

        // TODO: refactor this transition logic out into transitions.js
        // TODO: paramaterise the transition types
        // TODO: add a reverse option
        var newPageEl = $(page.el);
        // add a class to the new page to make it visible and ready for animating
        // these are added to the top level view el div and do not affect any HTML in the templates
        newPageEl.addClass('pt-page pt-page-current');
        // If this isn't the first page we can animate the new page in
        if (!isFirstPage) {
            var self = this;
            var newPage = page;
            var oldPage = this.page;
            var oldPageEl = $(this.page.el);
            var animEndEventName = "webkitAnimationEnd";
            // set the animation classes based on the animation type
            // for now let's use right to left a different speeds
            // var outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
            // var inClass = 'pt-page-moveFromRight';
            // standard right to left
            // var outClass = 'pt-page-moveToLeft';
            // var inClass = 'pt-page-moveFromRight';
            // animate out the old page
            // remove the listener when it's complete and tidy up
            oldPageEl.addClass(outClass).on(animEndEventName, function() {
                oldPageEl.off(animEndEventName);
                //self.onEndAnimation( oldPage, newPage );
            });
            // animate in the new page
            // remove the listener when it's complete and tidy up
            newPageEl.addClass(inClass).on(animEndEventName, function() {
                newPageEl.off(animEndEventName);
                self.onEndAnimation(oldPage, newPage);
            });
        } else {
            // console.log("Page::First page in " + this.name);
            newPageEl.hide();
            newPageEl.fadeIn();
            this.page = page;
        }

        // cache the new page
        this.page = page;

    },

    // Event listener for when pages have finished animating out
    onEndAnimation: function(outpage, inpage) {
        $(outpage.el).attr('class', 'pt-page');
        $(inpage.el).attr('class', 'pt-page pt-page-current');
        outpage.resetPage();
        outpage.remove();
    },

    // resets the page
    resetPage: function() {

    },


    goback: function(event) {
        var that = this;
        console.log(this.model.hist.history);
        if ($(event.currentTarget).has('a').length) {

        } else {
            if (this.model.hist.history[this.model.hist.history.length - 2]) {
                window.location.hash = this.model.hist.history[this.model.hist.history.length - 2];
            } else {
                window.location.hash = 'home';
            }
        }
    },

    
    changeMenu: function(name) {
        $('#menu ul li').each(function() {
            if ($(this).attr('data-page') == name) {
                $(this).addClass('active');

            } else {
                $(this).removeClass('active');
            }
        });
    }




});