var AppRouter = Backbone.Router.extend({

    page: null,
    pageName: "",
    routes: {
        "": "home",
        "home": "home",
        "about(/)": "about",
        "interactive(/)": "interactive",
        "web(/)": "web",
        "games(/)": "games",
        "etc(/)": "etc",
    },

    initialize: function() {
        $('.back').on('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
        this.appModel = new AppModel();

        // create nav and append
        this.nav = new NavPage({
            model: this.appModel
        });
        this.nav.render();
        $("body").append($(this.nav.el));

        this.history = this.appModel.hist.history;
    },

    home: function() {
        console.log("ROUTE HIT: home");
        this.changePage(new HomePage({
            model: this.appModel
        }));
        
        this.pageName = "home";
    },

    about: function(id) {
        console.log("ROUTE HIT: about");
        //var item = new Item({id:id});
        this.changePage(new AboutPage({}));
        this.pageName = "about";
    },

    interactive: function(id) {
        console.log("ROUTE HIT: interactive");
        //var item = new Item({id:id});
        //this.changePage(new InteractivePage({}),"pt-page-moveToLeft" , "pt-page-scaleUp");
        this.changePage(new InteractivePage({}),"pt-page-moveToLeftFade" , "pt-page-moveFromRightFade");
        this.pageName = "iteractive";
    },

    web: function(id) {
        console.log("ROUTE HIT: web");
        //var item = new Item({id:id});
        //this.changePage(new InteractivePage({}),"pt-page-moveToLeft" , "pt-page-scaleUp");
        this.changePage(new WebPage({}),"pt-page-moveToLeftFade" , "pt-page-moveFromRightFade");
        this.pageName = "web";
    },

    games: function(id) {
        console.log("ROUTE HIT: games");
        //var item = new Item({id:id});
        //this.changePage(new InteractivePage({}),"pt-page-moveToLeft" , "pt-page-scaleUp");
        this.changePage(new GamePage({}),"pt-page-moveToLeftFade" , "pt-page-moveFromRightFade");
        this.pageName = "games";
    },

    etc: function(id) {
        console.log("ROUTE HIT: etc");
        //var item = new Item({id:id});
        //this.changePage(new InteractivePage({}),"pt-page-moveToLeft" , "pt-page-scaleUp");
        this.changePage(new EtcPage({}),"pt-page-moveToLeftFade" , "pt-page-moveFromRightFade");
        this.pageName = "etc";
    },

    changePage: function(page, outClass, inClass) {

        //history
        outClass = (typeof outClass === "undefined") ? 'pt-page-moveToLeft pt-page-ontop' : outClass;
        inClass = (typeof inClass === "undefined") ? 'pt-page-moveFromRight' : inClass;

        if (this.history[this.history.length - 1] != Backbone.history.fragment) {

            if (Backbone.history.fragment == this.history[this.history.length - 2]) {
                this.history.pop();
                outClass = 'pt-page-moveToRightFade pt-page-ontop';
                inClass = 'pt-page-moveFromLeftFade';
                console.log('previous');
            } else {
                if (Backbone.history.fragment == '') Backbone.history.fragment = 'home';
                this.history.push(Backbone.history.fragment);
            }
        }

        page.changeMenu(Backbone.history.fragment);

        // if this.page is not set then this is our first page
        var isFirstPage = (this.page === null);

        // call the new page's render() method to inject and render it's HTML
        var pageEl = $(page.el);
        var containerEl = $("#wrapper");
        page.render();
        containerEl.append(pageEl);

        var newPageEl = $(page.el);
        // add a class to the new page to make it visible and ready for animating
        newPageEl.addClass('pt-page pt-page-current');

        // If this isn't the first page we can animate the new page in
        if (!isFirstPage) {
            var self = this;
            var newPage = page;
            var oldPage = this.page;
            var oldPageEl = $(this.page.el);
            var animEndEventName = "webkitAnimationEnd";
            // set the animation classes based on the animation type

            // animate out the old page
            oldPageEl.addClass(outClass).on(animEndEventName, function() {
                oldPageEl.off(animEndEventName);
            });

            // animate in the new page
            newPageEl.addClass(inClass).on(animEndEventName, function() {
                newPageEl.off(animEndEventName);
                self.onEndAnimation(oldPage, newPage);
            });
        } else {
            newPageEl.hide();
            newPageEl.fadeIn();
        }

        // cache the new page
        this.page = page;
    },

    // Event listener for when pages have finished animating out
    onEndAnimation: function(outpage, inpage) {
        // reset css
        $(outpage.el).attr('class', 'pt-page');
        $(inpage.el).attr('class', 'pt-page pt-page-current');

        // tell the old/out page to reset and remove it
        if (outpage.resetPage) outpage.resetPage();
        outpage.remove();
        // setup scrolling in the new page
    },

});




//cache//


var appCache = window.applicationCache;

function handleDownloading(e) {
    $('.splash p').html('Saving application for offline use...');
}

function handleCached(e) {
    //  alert('Application saved for offline use');
    $('.splash p').html('Done !');
    $('.splash .spin').removeClass('spin');
    location.reload();
    setTimeout(function() {
        $('.splash').fadeOut(300); //300
    }, 1000); //2500
}

function handleNoUpdate(e) {
    // alert('Application saved for offline use');
    $('.splash p').remove();

    setTimeout(function() {
        $('.splash .spin').removeClass('spin');
        $('.splash').fadeOut(300); //300
    }, 2500); //2500
}

function handleCacheError(e) {

    $('.splash p').html('Device not connected to internet.');

    setTimeout(function() {
        $('.splash p').remove();
        $('.splash .spin').removeClass('spin');
        $('.splash').fadeOut(300); //300
    }, 2500); //2500


    /*
    if (confirm('You are note connected to internet.\nContinue anyway ?')) {
        $('.splash p').remove();

        setTimeout(function() {
            $('.splash .spin').removeClass('spin');
            $('.splash').fadeOut(300); //300
        }, 2500); //2500
    } else {

    }
*/

}

if (appCache) {
    appCache.addEventListener('noupdate', handleNoUpdate, false);
    appCache.addEventListener('downloading', handleDownloading, false);
    appCache.addEventListener('cached', handleCached, false);
    appCache.addEventListener('error', handleCacheError, false);
}






$(document).ready(function() {

    // Disable mouse scrolling in the browser
    $('html body').bind('mousewheel DOMMouseScroll', function(e) {
       // e.preventDefault();
    });
    // load in html templates
    tpl.loadTemplates([
            'home',
            'about',
            'nav',
            'interactive',
            'etc',
            'games',
            'web',
        ],
        function() {
        	setTimeout(function() {
                app = new AppRouter();
                Backbone.history.start();
        	},500);
        });


});