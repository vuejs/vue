// NOTE: We emulate trusted types behaviour such that the tests
// are deterministic. These tests needs to be updated if the trusted
// types API changes.
// 
// You can find trusted types repository here:
// https://github.com/WICG/trusted-types
// 
// TODO: replace testing setup with polyfill, once it exports
// enforcing API.

import Vue from 'vue'

// we don't differentiate between different types of trusted values
const createTrustedValue = (value) => `TRUSTED${value}`;
const isTrustedValue = (value) => value.startsWith('TRUSTED');
const unwrapTrustedValue = (value) => value.substr('TRUSTED'.length);

const unsafeHtml = '<img src=x onerror="alert(0)">';
const unsafeScript = 'alert(0)';

describe('rendering with trusted types enforced', () => {
  let descriptorEntries = [];
  let setAttributeDescriptor;
  let policy;
  // NOTE: trusted type error is not propagated from v-html directive and application will not
  // render the dangerous html, but will continue rendering other components. If the error is 
  // thrown by unsafe setAttribute call (e.g. srcdoc in iframe) the rendering fails completely.
  // We log the errors, before throwing so we can be sure that trusted types work.
  let errorLog;

  function emulateSetAttribute() {
    // enforce trusted values only on properties in this array
    const unsafeAttributeList = ['srcdoc', 'onclick'];
    setAttributeDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'setAttribute');
    Object.defineProperty(Element.prototype, 'setAttribute', {
      value: function(name, value) {
        let args = [name, value];
        unsafeAttributeList.forEach((attr) => {
          if (attr === name) {
            if (isTrustedValue(value)) {
              args = [name, unwrapTrustedValue(value)];
            } else {
              errorLog.push(createTTErrorMessage(attr, value));
              throw new Error(value);
            }
          }
        });
        setAttributeDescriptor.value.apply(this, args);
      }
    });
  }

  function emulateTrustedTypesOnProperty(object, prop) {
    const desc = Object.getOwnPropertyDescriptor(object, prop);
    descriptorEntries.push({object, prop, desc});
    Object.defineProperty(object, prop, {
      set: function(value) {
        if (isTrustedValue(value)) {
          desc.set.apply(this, [unwrapTrustedValue(value)]);
        } else {
          errorLog.push(createTTErrorMessage(prop, value));
          throw new Error(value);
        }
      },
    });
  }

  function removeAllTrustedTypesEmulation() {
    descriptorEntries.forEach(({object, prop, desc}) => {
      Object.defineProperty(object, prop, desc);
    });
    descriptorEntries = [];

    Object.defineProperty(
        Element.prototype, 'setAttribute', setAttributeDescriptor);
  }

  function createTTErrorMessage(name, value) {
    return `TT ERROR: ${name} ${value}`;
  }

  beforeEach(() => {
    window.trustedTypes = {
      createPolicy: () => {
        return {
          createHTML: createTrustedValue,
          createScript: createTrustedValue,
          createScriptURL: createTrustedValue,
        };
      },
      isHTML: (v) => isTrustedValue(v),
      isScript: (v) => isTrustedValue(v),
      isScriptURL: (v) => isTrustedValue(v),
    };

    emulateTrustedTypesOnProperty(Element.prototype, 'innerHTML');
    emulateTrustedTypesOnProperty(HTMLIFrameElement.prototype, 'srcdoc');
    emulateSetAttribute();

    // TODO: this needs to be changed once we use trusted types polyfill
    policy = window.trustedTypes.createPolicy();

    errorLog = [];
  });

  afterEach(() => {
    removeAllTrustedTypesEmulation();
    delete window.trustedTypes;
  });

  it('Trusted types emulation works', () => {
    const el = document.createElement('div');
    expect(el.innerHTML).toBe('');
    el.innerHTML = policy.createHTML('<span>val</span>');
    expect(el.innerHTML, '<span>val</span>');

    expect(() => {
      el.innerHTML = '<span>val</span>';
    }).toThrow();
  });

  // html interpolation is safe because it's put into DOM as text node
  it('interpolation is trusted', () => {
    const vm = new Vue({
      data: {
        unsafeHtml,
      },
      template: '<div>{{unsafeHtml}}</div>'
    })

    vm.$mount();
    expect(vm.$el.textContent).toBe(document.createTextNode(unsafeHtml).textContent);
  });

  describe('throws on untrusted values', () => {
    it('v-html directive', () => {
      const vm = new Vue({
        data: {
          unsafeHtml,
        },
        template: '<div v-html="unsafeHtml"></div>'
      })

      vm.$mount();
      expect(errorLog).toEqual([createTTErrorMessage('innerHTML', unsafeHtml)]);
    });

    it('attribute interpolation', () => {
      const vm = new Vue({
        data: {
          unsafeHtml,
        },
        template: '<iframe :srcdoc="unsafeHtml"></iframe>'
      })
      
      expect(() => {
        vm.$mount();
      }).toThrow();
      expect(errorLog).toEqual([createTTErrorMessage('srcdoc', unsafeHtml)]);
    });

    it('on* events', () => {
      const vm = new Vue({
        data: {
          unsafeScript,
        },
        template: '<button :onclick="unsafeScript">unsafe btn</button>'
      })

      expect(() => {
        vm.$mount();
      }).toThrow();
      expect(errorLog).toEqual([createTTErrorMessage('onclick', unsafeScript)]);
    });
  });

  describe('runs without error on trusted values', () => {
    it('v-html directive', () => {
      const vm = new Vue({
        data: {
          safeHtml: policy.createHTML('safeHtmlValue'),
        },
        template: '<div v-html="safeHtml"></div>'
      })

      vm.$mount();
      expect(vm.$el.innerHTML).toBe('safeHtmlValue');
      expect(errorLog).toEqual([]);
    });

    it('attribute interpolation', () => {
      const vm = new Vue({
        data: {
          safeScript: policy.createScript('safeScriptValue'),
        },
        template: '<iframe :srcdoc="safeScript"></iframe>'
      })

      vm.$mount();
      expect(vm.$el.srcdoc).toBe('safeScriptValue');
      expect(errorLog).toEqual([]);
    });

    it('on* events', () => {
      const vm = new Vue({
        data: {
          safeScript: policy.createScript('safeScriptValue'),
        },
        template: '<button :onclick="safeScript">unsafe btn</button>'
      })

      vm.$mount();
      const onClickFn = vm.$el.onclick.toString();
      const onClickBody = onClickFn.substring(onClickFn.indexOf("{") + 1, onClickFn.lastIndexOf("}"));
      expect(onClickBody.trim()).toBe('safeScriptValue');
      expect(errorLog).toEqual([]);
    });
  });
});
