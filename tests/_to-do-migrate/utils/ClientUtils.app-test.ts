import { DDP } from "meteor/ddp-client";
import { Meteor } from "meteor/meteor";
import { Promise } from "meteor/promise";
import { AssertionError, expect } from "chai";

/**
 * Returns a promise which resolves when all subscriptions are done.
 */
export function waitForSubscriptions(): Promise<void> {
  return new Promise((resolve) => {
    const poll = Meteor.setInterval(() => {
      if (DDP._allSubscriptionsReady()) {
        Meteor.clearInterval(poll);
        resolve();
      }
    }, 200);
  });
}

/**
 * Try an assertion in 100ms interval
 * @param assertion function that throws an AssertionError until its demands are met
 * @param timeout after this many milliseconds, the AssertionError is passed on
 * @returns Returns a promise that resolves with the last return value of
 * assertion() once the assertion holds. The promise is
 * rejected when the assertion throws something which is not an AssertionError
 * or when the timeout runs out without the assertion coming through.

 */
export function waitFor<T>(assertion: () => T, timeout = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let interval: false | NodeJS.Timer = false;

    const clearWatchers = () => {
      if (interval) {
        clearInterval(interval as any);
      }
    };

    const tryIt = () => {
      try {
        const result = assertion();
        clearWatchers();
        resolve(result);
        return true;
      } catch (e) {
        if (e instanceof AssertionError) {
          if (Date.now() - start < timeout) {
            return false;
          }
        }
        clearWatchers();
        reject(e);
      }
      return false;
    };

    if (tryIt()) {
      return;
    }
    interval = setInterval(tryIt, 100);
  });
}

export async function expectElement(selector: string, message?: string) {
  return await waitFor(() => {
    const elements = document.querySelectorAll(selector);
    expect(elements.length).to.be.equal(1, message);
    return elements[0];
  });
}

export async function expectNoneElement(selector: string, message?: string) {
  return await waitFor(() => {
    const elements = document.querySelectorAll(selector);
    expect(elements.length).not.to.be.above(0, message);
    return elements[0];
  });
}

export async function expectHtmlButton(selector: string, message?: string) {
  const element = await expectElement(selector, message);
  expect(element).to.be.instanceof(HTMLButtonElement);
  return element as HTMLButtonElement;
}

export async function expectText(selector: string, text: string, message?: string) {
  return await waitFor(() => {
    const elements = [...document.querySelectorAll(selector)].filter((element) =>
      element.textContent?.includes(text),
    );
    expect(elements.length).to.be.equal(1, message);
    return elements[0];
  });
}

export async function setInputValue(selector: string, value: string) {
  // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js/46012210#46012210
  const nativeValueSetter = (Object as any).getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  nativeValueSetter.call($(selector)[0], value);
  $(selector)[0].dispatchEvent(new Event("keyUp", { bubbles: true }));
  $(selector)[0].dispatchEvent(new Event("input", { bubbles: true }));
  $(selector)[0].dispatchEvent(new Event("change", { bubbles: true }));
}

export async function setTextAreaValue(element: Element, value: string) {
  // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js/46012210#46012210
  const nativeValueSetter = (Object as any).getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  ).set;
  nativeValueSetter.call(element, value);
  element.dispatchEvent(new Event("keyUp", { bubbles: true }));
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export async function setContent(element: Element, value: string) {
  const nativeValueSetter = (Object as any).getOwnPropertyDescriptor(
    window.Element.prototype,
    "innerHTML",
  ).set;
  nativeValueSetter.call(element, value);
  element.dispatchEvent(new Event("keyUp", { bubbles: true }));
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setSelectValue(selector: string, value: string) {
  // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js/46012210#46012210
  const nativeValueSetter = (Object as any).getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    "value",
  ).set;
  nativeValueSetter.call($(selector)[0], value);
  $(selector)[0].dispatchEvent(new Event("input", { bubbles: true }));
  $(selector)[0].dispatchEvent(new Event("change", { bubbles: true }));
}

export async function setChecked(selector: string, value: boolean) {
  $(selector)[0].setAttribute("type", "text");
  ($(selector)[0] as HTMLInputElement).checked = value;
  $(selector)[0].dispatchEvent(new Event("change", { bubbles: true }));
  $(selector)[0].setAttribute("type", "checkbox");
}
