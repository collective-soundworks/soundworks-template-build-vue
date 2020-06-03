#!/usr/bin/env node
const babel = require('@babel/core');
const chalk = require('chalk')
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');

const alias = require('@rollup/plugin-alias');
const commonjs = require('rollup-plugin-commonjs');
const rollupBabel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const sourcemaps = require('rollup-plugin-sourcemaps');
const vue = require('rollup-plugin-vue');
// const css = require('rollup-plugin-css-only');
const JSON5 = require('json5');

const cwd = process.cwd();

const watchers = {
  node: [],
  browser: [],
};

function closeWatchers() {
  watchers.node.forEach(watcher => {
    watcher.on('ready', () => {
      watcher.close();
    });
  });

  watchers.browser.forEach(watcher => {
    watcher.on('event', e => {
      if (e.code === 'END') {
        watcher.close();
      }
    });
  });
}

function createNodeProcessWatcher(inputFolder, outputFolder) {
  function compileOrCopy(pathname) {
    if (fs.lstatSync(pathname).isDirectory()) {
      return;
    }

    const inputFilename = pathname;
    const outputFilename = inputFilename.replace(inputFolder, outputFolder);
    fs.ensureFileSync(outputFilename);

    if (/(\.js|\.mjs)$/.test(inputFilename)) {
      babel.transformFile(inputFilename, {
        inputSourceMap: true,
        sourceMap: "inline",
        plugins: [
          ['@babel/plugin-transform-modules-commonjs'],
          ['@babel/plugin-transform-arrow-functions'],
          ['@babel/plugin-proposal-class-properties', { loose : true }]
        ]
      }, function (err, result) {
        if (err) {
          return console.log(err.message);
        }

        fs.writeFileSync(outputFilename, result.code);
        console.log(chalk.green(`> transpiled\t ${inputFilename}`));
      }
    );
    } else {
      fs.copyFileSync(inputFilename, outputFilename);
      console.log(chalk.green(`> copied\t ${inputFilename}`));
    }
  }

  const watcher = chokidar.watch(inputFolder);

  watcher.on('add', pathname => {
    compileOrCopy(pathname);
  });

  watcher.on('change', pathname => {
    compileOrCopy(pathname);
  });

  watcher.on('unlink', pathname => {
    const outputFilename = pathname.replace(inputFolder, outputFolder);
    fs.unlinkSync(outputFilename);
  });

  watchers.node.push(watcher);
}

function createBrowserWatcher(inputFile, outputFile) {
  const watcher = rollup.watch({
    input: inputFile,
    plugins: [
      commonjs(),
      rollupBabel({
        sourceMaps: true,
        inputSourceMap: true,
        sourceMap: "inline",
        presets: [
          ["@babel/preset-env",
            {
              targets: 'ios >= 9, not ie 11, not op_mini all'
            }
          ]
        ],
        plugins: [
          // ['@babel/plugin-transform-modules-commonjs'],
          ['@babel/plugin-transform-arrow-functions'],
          ['@babel/plugin-proposal-class-properties', { loose : true }]
        ]
      }),
      resolve({
        mainFields: ['browser', 'module', 'main'],
        preferBuiltins: false,
      }),
      json(),
      nodeBuiltins(),
      globals({
        buffer: false,
        dirname: false,
        filename: false,
      }),
      vue({
        needMap: false, // put this somewhere else ?
      }),
      alias({
        entries: [
          { find: '~', replacement: path.join(cwd, 'src') },
        ],
      }),
      // css(),
      sourcemaps(),
    ],
    output: [
      {
        file: outputFile,
        format: 'iife',
        sourcemap: 'inline',
        onwarn(warning, warn) {
          // skip certain warnings
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          // throw on others
          if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);
          // Use default for everything else
          warn(warning);
        }
      },
    ],
    watch: {
      chokidar: true,
      clearScreen: false,
    }
  });

  watcher.on('event', (e) => {
    if (e.code === 'BUNDLE_END') {
      console.log(chalk.green(`> bundled\t ${outputFile.replace(cwd, '')}`));
    } else if (e.code === 'ERROR') {
      console.log(chalk.red(e.error.message));
      console.log(e.error.frame);
    } else if (e.code === 'FATAL') {
      console.log(chalk.red(e.error.message));
      console.log(e.error.frame);
      closeWatchers();
    }
  });

  watchers.browser.push(watcher);
}


module.exports = function buildApplication(watch = false) {
  // -----------------------------------------
  // server files
  // -----------------------------------------
  {
    const configSrc = path.join('src', 'server');
    const configDist = path.join('.build', 'server');
    createNodeProcessWatcher(configSrc, configDist);
  }

  // -----------------------------------------
  // clients files
  // -----------------------------------------
  {
    // utility function
    function getClientTarget(name) {
      try {
        const data = fs.readFileSync(path.join(cwd, 'config', 'application.json'));
        const config = JSON5.parse(data);
        const clientsConfig = config.clients

        if (clientsConfig[name] && clientsConfig[name].target) {
          return clientsConfig[name].target;
        } else {
          return null;
        };
      } catch(err) {
        console.log(chalk.red('> Invalid `config/application.json` file'));
        process.exit(0);
      }
    }

    // real process
    const clientsSrc = path.join('src', 'clients');
    const filenames = fs.readdirSync(clientsSrc);
    const clients = filenames.filter(filename => {
      const relPath = path.join(clientsSrc, filename);
      const isDir = fs.lstatSync(relPath).isDirectory();
      return isDir;
    });

    clients.forEach(clientName => {
      const target = getClientTarget(clientName);
      console.log(chalk.yellow(`+ building client "${clientName}" for ${target || 'undefined'} target`));
      // thing clients or any shared/utils file
      if (target !== 'browser') {
        const inputFolder = path.join('src', 'clients', clientName);
        const outputFolder = path.join('.build', clientName);
        createNodeProcessWatcher(inputFolder, outputFolder);
      } else {
        const inputFile = path.join(cwd, 'src', 'clients', clientName, 'index.js');
        const outputFile = path.join(cwd, '.build', 'public', `${clientName}.js`);
        createBrowserWatcher(inputFile, outputFile);
      }
    });
  }

  // if not watch, close all watchers
  if (watch === false) {
    closeWatchers();
  }
}


