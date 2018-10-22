/**
Logging to console or overlay or both, depending on availability (server call using node or client) and log level.
@module */
/* eslint no-console: 0 */
// temporary solution. todo: use a logging library or write more elegantly using enums or integers

/**
 * Logs the given messages with log level info
 * @param {string} s
 */
export function info(s) {
  if (
    (typeof config !== 'undefined' && config.logLevelDisplay === 'info') ||
    config.logLevelDisplay === 'debug' ||
    config.logLevelDisplay === 'trace'
  ) {
    alert(s);
  }
  if (
    !config ||
    config.logLevelConsole === 'info' ||
    config.logLevelConsole === 'debug' ||
    config.logLevelConsole === 'trace'
  ) {
    log(arguments);
  }
}

/**
 * Logs the given messages with log level info
 */
export function debug(s) {
  if (
    (typeof config !== 'undefined' && config.logLevelDisplay === 'debug') ||
    config.logLevelDisplay === 'trace'
  ) {
    alert(s);
  }
  if (
    typeof config === 'undefined' ||
    config.logLevelConsole === 'debug' ||
    config.logLevelConsole === 'trace'
  ) {
    log(arguments);
  }
}

/**
 * Logs the given messages with log level error
 * Errors are always shown both on console and display.
 */
export function error(s) {
  alert(s);
  log(arguments);
}

/**
 * Logs the given messages with log level warn
 */
export function warn(s) {
  if (typeof config !== 'undefined' && config.logLevelDisplay !== 'error') {
    alert(s);
  }
  if (typeof config === 'undefined' || config.logLevelConsole !== 'error') {
    log(arguments);
  }
}

/**
 * Logs the given messages with log level trace. Never displayed to the user.
 */
export function trace() {
  if (typeof config === 'undefined' || config.logLevelConsole !== 'trace') {
    return;
  }
  log(arguments);
}

/**
 * @param {Arguments<any>}
 */
function log(params) {
  const argumentsArray = [...params];
  argumentsArray.push(callSource());
  console.log(...argumentsArray);
}

/**
 * @return {string} string with caller function
 */
function callSource() {
  // https://stackoverflow.com/questions/1340872/how-to-get-javascript-caller-function-line-number-how-to-get-javascript-caller
  const e = new Error();
  // old browser
  if (!e.stack) {
    return '';
  }
  const stack = e.stack.toString().split(/\r\n|\n/);
  return `            [${stack[2].replace(/.*\//, '')}]`;
}
