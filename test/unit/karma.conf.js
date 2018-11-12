var karma = require('karma');

module.exports = function(config) {
    config.set({
        basePath: '../../',
        frameworks: ['browserify', 'jasmine'],
        files: [
            'test/unit/**/*spec.js'
        ],
        preprocessors: {
            'test/**/*.js': ['browserify'],
            'test/**/*.es6': ['browserify']
        },
        browserify: {
            debug: true,
            configure: function(bundle) {
                bundle.on('prebundle', function() {
                    bundle.transform('babelify', { presets: ['env'] })
                });
            }
        },
        exclude: [],
        reporters: ['progress', 'coverage', 'junit'],
        port: 9876,
        runnerPort: 9100,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        captureTimeout: 60000,
        singleRun: true,
        junitReporter: {
            outputFile: "test-results.xml",
            useBrowserName: false
        }
    });
};
