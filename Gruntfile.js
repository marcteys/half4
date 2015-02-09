module.exports = function(grunt) {

    grunt.initConfig({
        manifest: {
            generate: {
                options: {
                    basePath: '.',
                    preferOnline: true,
                    verbose: true,
                    timestamp: true,
                    hash: true,
                    master: ['index.html']
                },
                src: [
                    'startup.png',
                    'css/*.css',
                    'css/fonts/*.ttf',
                    'css/fonts/*.css',
                    'img/**/*.png',
                    'lib/**/*.js',
                    'js/**/*.js',
                    'tpl/**/*.html'
                ],
                dest: 'manifest.appcache'
            }
        }
    });

    grunt.loadNpmTasks('grunt-manifest');

    // Default task(s).
    grunt.registerTask('default', ['manifest']);

};