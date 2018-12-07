/*
 * Copyright 2018 Dyne.org foundation, Amsterdam
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '@babel/polyfill';
import C from '../dist/lib/zenroom';

/* istanbul ignore next */
const zenroomExec = (zencode, conf = null, keys = null, data = null, verbosity = 1) => {
  C.ccall(
    'zenroom_exec',
    'number',
    ['string', 'string', 'string', 'string', 'number'],
    [zencode, conf, keys, data, verbosity],
  );
};


const zenroom = (function () {
  let self = {};
  self.options = {};

  const __debug = function () {
    return self;
  };

  /**
   * Set the zencode script to run
   * 
   * The syntax of the zencode scripts are extensively available at
   * https://zenroom.dyne.org/api/tutorials/Syntax.html
   * You may want also to look at some example in a live executable environment here https://zenroom.dyne.org/demo/
   * 
   * @example <caption>Example usage of `zencode()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")'
   * zenroom.zencode(script).exec().reset()
   * 
   * @param {string} zencode tha script to be set
   * @returns {zenroom} the zenroom module
   */
  const zencode = function (zencode) {
    self.zencode = zencode;
    return this;
  };

  /**
   * Set the keys JSON for you zenroom execution
   * 
   * the keys will be available in zencode as the `KEYS` variable
   * 
   * @example <caption>Example usage of `keys()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = `
   *                  keys = JSON.decode(KEYS)
   *                  print(keys)
   * `
   * 
   * const keys = {a: 1, b: 2}
   * zenroom.zencode(script).keys(keys).exec().reset()
   * 
   * @param {object} keys the keys to be set as an object
   * @returns {object} the zenroom module
   */
  const keys = function (keys) {
    self.keys = keys ? JSON.stringify(keys) : null;
    return this;
  };

  /**
   * Set the conf before your zenroom execution
   * 
   * by now the only conf available is the string `umm` that sets the minimal memory manager (64KiB max) 
   *
   * @example <caption>Example usage of `conf()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")'
   * const conf = 'umm'
   * zenroom.zencode(script).conf(conf).exec()
   * 
   * @param {string} conf the string of configuration to be set
   * @returns {object} the zenroom module
   */
  const conf = function (conf) {
    self.conf = conf;
    return this;
  };

  /**
   * Set the data for your zenroom execution
   * 
   * The data will be available in zencode as the `DATA` variable
   * 
   * @example <caption>Example usage of `data()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = `
   *                  data = JSON.decode(DATA)
   *                  print(data)
   * `
   * 
   * const data = {a: 1, b: 2}
   * zenroom.zencode(script).data(data).exec()
   * 
   * @param {string} data 
   * @returns {object} the zenroom module
   */
  const data = function (data) {
    self.data = data;
    return this;
  };

  /**
   * Set the print callback to customize
   * the behaviour of the print calls made to stdout 
   * by default it prints to the console.log
   * 
   * @example <caption>Example usage of `print()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const savedLines = []
   * const printFunction = (text) => { savedLines.push(text) }
   * const script = 'print("hello")'
   * zenroom.print(printFunction).zencode(script).exec()
   * 
   * @callback print
   * @returns {object} the zenroom module
   */
  const print = function (printFunction) {
    self.print = printFunction;
    C.print = text => self.print(text);
    return this;
  };

  
   /**
   * Set the success callback that is executed after a successful execution of zenroom
   * 
   * @example <caption>Example usage of `success()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")'
   * zenroom.zencode(script).success(()=>{ 
   *    pleaseRunSomeOtherMethodAfter()
   * }).exec()
   * 
   * @callback success
   * @returns {object} the zenroom module
   */
  const success = function (success_callback) {
    self.success = success_callback
    C.exec_ok = success_callback;
    return this;
  };

  /**
   * Set the error callback that is executed after an unsuccessful execution of zenroom
   * 
   * @example <caption>Example usage of `error()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")';
   * zenroom.zencode(script).error(()=>{ 
   *    pleaseRunSomeOtherMethodAfterError()
   * }).exec()
   * 
   * @callback error
   * @returns {object} the zenroom module
   */
  const error = function (error_callback) {
    self.error = error_callback
    C.exec_error = error_callback;
    return this;
  }

  /**
   * Set the verbosity of the stderr messages outputted by the zenroom virtual machine
   * 
   * As per now the set of accepted value:
   * 
   * <ul>
   * <li>1 = INFO</li>
   * <li>2 = DEBUG</li>
   * </ul>
   * 
   * @example <caption>Example usage of `success`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")'
   * zenroom.zencode(script).success(()=>{ 
   *    pleaseRunSomeOtherMethodAfter();
   * }).exec()
   * 
   * @param {number} verbosity
   * @returns {object} the zenroom module
   */  
  const verbosity = function (verbosity) {
    self.verbosity = verbosity;
    return this;
  };

  /**
   * Execute the zenroom vm (using the previously setted options)
   * 
   * It is usually the last method of the chain, but like the other methods returns
   * the zenroom module itself, so can be used for other calls if you need to make more 
   * executions in a row
   * 
   * @example <caption>Example usage of `exec()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")';
   * zenroom.zencode(script).exec()
   * 
   * @returns {object} the zenroom module
   */
  const exec = function () {
    zenroomExec(self.zencode, self.conf, self.keys, self.data, self.verbosity);
    return this;
  };

  /**
   * This method allows the configuration of your call by passing one
   * configuration option object. You can use the chain methods after this anyway.
   * 
   * If some attribute is already set, those will be overwritten by the new options
   * 
   * The following options are available:
   * <ul>
   *   <li><strong>zencode</strong></li>
   *   <li><strong>keys</strong></li>
   *   <li><strong>conf</strong></li>
   *   <li><strong>data</strong></li>
   *   <li><strong>print</strong></li>
   *   <li><strong>success</strong></li>
   *   <li><strong>error</strong></li>
   *   <li><strong>verbosity</strong></li>
   * </ul>
   * 
   * @example <caption>Example usage of `init()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const encrypt_secret_to_many = {
   *  zencode: `keyring = ECDH.new()
   *            secret = str(DATA)
   *            keys = JSON.decode(KEYS)
   *            keyring:private( base64(keys.keyring.secret) )
   *            res = {}
   *            for name,pubkey in pairs(keys.recipients) do
   *              pub = base64(pubkey)
   *              enc = ECDH.encrypt(keyring,pub,secret,keyring:public())
   *              res[name] = str( MSG.pack( map(enc,base64) ) ):base64()
   *            end
   *            print(JSON.encode(res))`,
   * 
   *  keys: {
   *      keyring : {
   *        public : "BHMjcDM/aljpi8pNxFQ436R6F3J+kaB/Xk1kAVFPmkoLVyeFltDZPgiIYRquh+m2IfvPioBfet7YCd5vVXYoRTk=",
   *        secret : "ChW5qi5y//ISDIHKx5Fvxl+XY8IyDGVBHUfELp3PqJQ="
   *      },
   *      recipients : {
   *        paulus : "BBUw6Nr3A30cN65maERvAk1cEv2Ji6Vs80kSlpodOC0SCtM8ucaS7e+s158uVMSr3BsvIXVspBeafiL8Qb3kcgc=",
   *        mayo : "BHqBoQ2WJ3/FGVNTXzdIc+K/HzNx05bWzEhn8m58FvSsaqWVdH52jI6fQWdkdjnbqVKCJGmbjA/OCJ+IKHbiySI=",
   *        mark : "BFgkjrRMvN+wkJ6qA4UvMaNlYBvl37C9cNYGkqOE4w43AUzkEzcyIIdE6BrgOEUEVefhOOnO6SCBQMgXHXJUUPY=",
   *        francesca : "BCo102mVybieKMyhex8tnVtFM5+Wo1oP02k8JVwKF9OLIjw7w0LmofItbuAcfWl9rcoe++XLI3sySZnqljIfeyU=",
   *        jim : "BEs1jeqL0nVwFi7OmG4YdtlWuKADyOvZR4XHpLAEswg8ONPXQHvwJ8+PkHkphoORfSjk2045bMdYkwboU4FdG2Y=",
   *        jaromil : "BBZYJtHvFg0vGCxPROAWrThcGZ+vFZJj86k+uncjvbm4DysIg7cWS3J6GrcJKCY55Uf40m2KfBwfaT+T7TTO1e8="
   *      }
   *  },
   * 
   *  data: 'This is a secret message.'
   * }
   * 
   * 
   * zenroom.init(encrypt_secret_to_many).exec()
   * 
   * @returns {object} the zenroom module
   */
  const init = function (options) {
    /* istanbul ignore next */
    self.options = Object.assign(self.options, options) || {};

    zencode(self.options.zencode || '');
    keys(self.options.keys || null);
    conf(self.options.conf || null);
    data(self.options.data || null);
    print(self.options.print || (text => console.log(text)));
    success(self.options.success || new Function);
    error(self.options.error || new Function);
    verbosity(self.options.verbosity || 1);

    return this;
  };

  const __setup = function () {
    print(self.print || (text => console.log(text)));
    success(self.success || (() => {}));
    error(self.error || (() => {}));
  };

 /**
   * Reset the setted options already provided and cleans up the zenroom module
   * 
   * It is usually the last method of the chain, but like the other methods returns
   * the zenroom module itself, so can be used for other calls if you need to make more 
   * executions in a row
   * 
   * @example <caption>Example usage of `reset()`</caption>
   * // returns zenroom
   * import zenroom from 'zenroom'
   * 
   * const script = 'print("hello")';
   * zenroomd.zencode(script)
   *         .exec()    // This runs the script
   *         .reset()
   *         .exec()    // This does not run the script anymore
   * 
   * @returns {object} the zenroom module
   */  
  const reset = function () {
    self = {};
    self.options = {};
    __setup();
    return this;
  };

  __setup();

  return {
    zencode,
    keys,
    conf,
    data,
    print,
    success,
    verbosity,
    exec,
    error,
    init,
    reset,
    __debug,
  };
})();

export default zenroom;
