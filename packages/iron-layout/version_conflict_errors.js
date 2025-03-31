var errors = [];

if (Package['cmather:iron-layout']) {
  errors.push("\n\n\
    The cmather:iron-{x} packages were migrated to the new package system with the wrong name, and you have duplicate copies.\n\
    You can see which cmather:iron-{x} packages have been installed by using this command:\n\n\
    > meteor list\n\n\
    Can you remove any installed cmather:iron-{x} packages like this:\
    \n\n\
    > meteor remove cmather:iron-core\n\
    > meteor remove cmather:iron-router\n\
    > meteor remove cmather:iron-dynamic-template\n\
    > meteor remove cmather:iron-dynamic-layout\n\
    \n\
    The new packages are named iron:{x}. For example:\n\n\
    > meteor add iron:router\n\n\
    Sorry for the hassle, but thank you!\
    \n\n\
  ");
}

// If the user still has blaze-layout throw  an error. Let's get rid of that
// package so it's not lingering around with all its nastiness.
if (Package['cmather:blaze-layout']) {
  errors.push(
    "The blaze-layout package has been replaced by iron-layout. Please remove the package like this:\n> meteor remove cmather:blaze-layout\n"
  );
}

if (errors.length > 0) {
  throw new Error("Sorry! Looks like there's a few errors related to iron:layout\n\n" + errors.join("\n\n"));
}
