declare const OAuth: any;

declare module "meteor/accounts-base" {
  namespace Accounts {
    const oauth: any;
    function registerClientLoginFunction(name: any, handler: any): void;
    function applyLoginFunction(name: any, args: any);
    function addAutopublishFields(opts: any);
  }
}
