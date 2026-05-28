# i18n

The files in this folder are generated automatically.  
On every startup with `meteor npm run debug` the file `en.json` (English) is created/overwritten by `extract-translations`, based on all `t(...)`, `i18n(...)` and `{i18n ...}}` that occur in the code. More information in the official [i18next documentation](https://www.i18next.com/)).  
All texts in this `en.json` get pulled and translated into other languages on [weblate.org](https://hosted.weblate.org/projects/openki/openki/). Those translation get exported back into this folder trough automated merge requests by Weblate. (files `de.json`, `fr.json` etc.)

The exported strings in the code consist of a `key` and the `original English string`.  
For example, in html: `{{i18n 'venue.title.edit' 'Edit venue'}}`  
If the same string is used multiple times, you define it once and then use the key only in all other occurrences: `{{i18n 'venue.title.edit'}}`

Please see [Naming and Syntax Convention](https://gitlab.com/Openki/Openki/-/wikis/Naming%20and%20Syntax%20Convention) in our wiki.

If translations are not immediately changing after updating a file or after deployment, they could be still stored in the local storage of your browser. The preset storage time is 1 hour (backendOptions:expirationTime in imports/startup/both/i18next.ts). Clearing browser cache and cookies do not always remove local-storage.

Here is the [guide for our Translators](https://gitlab.com/Openki/Openki/-/wikis/i18n-howto)

## Namespaces

We have some translations split into separate namespaces, for example roles. The reason for using several smaller namespaces for translations is because this allows Openki instances to customize how their roles are translated, while using the default translations in most cases for the general UI. This reduces unnecessary duplication and makes instance-specific translations more focused.

## Roles

There are some role-specific translations. Read more about how [roles](https://gitlab.com/Openki/Openki/-/wikis/Roles) work and how to translate them in the wiki.
