#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const terminate = require('terminate');
const { fork } = require('child_process');
const chalk = require('chalk')
const debounce = require('lodash.debounce');

const processes = new Map();

// run the in a forked process
const start = function(src, inspect) {
  if (!fs.existsSync(src)) {
    throw new Error(`Cannot start process "${processName}": file "${src}" does not exists`);
  }

  fs.stat(src, (err, stats) => {
    if (err) {
      reject(src);
    }

    if (processes.has(src)) {
      stop(src);
    }

    const options = inspect ? { execArgv: ['--inspect'] } : {};
    const delay = inspect ? 100 : 0;

    // @important - the timeout only works because of the debounce
    // this is needed when restarting for the
    setTimeout(() => {
      const proc = fork(src, [], options);
      processes.set(src, proc);
    }, delay);
  });
}

// kill the forked process hosting the proc
const stop = function(src) {
  const proc = processes.get(src);
  let stopped = false;

  if (proc) {
    terminate(proc.pid);
    stopped = true;
  }

  processes.delete(src);
}

module.exports = function watchProcess(processName, inspect) {
  const processPath = path.join('.build', processName);

  const watcher = chokidar.watch(processPath, {
    ignoreInitial: true,
  });

  console.log(chalk.cyan(`> watching process\t ${processPath}`));
  // restart to principal target (processPath)
  watcher
    // .on('add', debounce(filename => start(processPath, inspect), 300)) // probably not really needed
    .on('change', debounce(filename => start(processPath, inspect), 500))
    // .on('unlink', filename => start(processPath));

  // as we ignore initial changes we can start the process now
  start(processPath, inspect);
}











