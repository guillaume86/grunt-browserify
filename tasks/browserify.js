/*
 * grunt-browserify
 * https://github.com/pix/grunt-browserify
 *
 * Copyright (c) 2012 Camille Moncelier
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';
  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/wiki/Creating-tasks
  // ==========================================================================
  // TASKS
  // ==========================================================================
  grunt.registerMultiTask('browserify', 'Your task description goes here.', function () {

    var helpers = require('grunt-lib-legacyhelpers').init(grunt);

    var browserify = require('browserify'),
        fs = require('fs'),
        path = require('path'),
        b = browserify(),
        options = this.options();

    if (this.data.beforeHook) {
      this.data.beforeHook.call(this, b);
    }

    (this.data.ignore || []).forEach(function (filepath) {
      grunt.verbose.writeln('Ignoring "' + filepath + '"');
      b.ignore(filepath);
    });

    (this.data.externals || []).forEach(function (req) {
      grunt.verbose.writeln('Adding "' + req + '" to the external module list');
      b.external(req);
    });

    (this.data.requires || []).forEach(function (req) {
      var splits = req.split(':');
      var req = splits[0];
      var id = splits.length > 1 ? splits[1] : req;
      grunt.verbose.writeln('Adding "' + req + '" to the required module list');
      var opts = { expose: id };
      if(options.basedir) {
        opts.basedir = path.resolve(options.basedir);
      }
      b.require(path.resolve(req), opts);
    });

    grunt.file.expand({filter: 'isFile'}, this.data.src || []).forEach(function (filepath) {
      grunt.verbose.writeln('Adding "' + filepath + '" to the entry file list');
      var opts = { entry: true };
      if(options.basedir) {
        opts.basedir = path.resolve(options.basedir);
      }
      b.require(path.resolve(filepath), opts);
    });

    (this.data.aliases || []).forEach(function (alias) {
      grunt.verbose.writeln('Adding "' + alias + '" to the aliases list');

      b.alias.apply(b, alias.split(":"));
    });

    if (this.data.hook) {
      this.data.hook.call(this, b);
    }

    var done = this.async();
    var dest = path.resolve(this.data.dest || this.target);
    var bundle = b.bundle(options || {});

    bundle.pipe(fs.createWriteStream(dest));

    bundle.on('error', function(err) {
      done(err);
    });

    bundle.on('close', function(err) {
      done();
    });

  });

};
