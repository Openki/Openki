# i18n

The files in this folder are generated automatically.  
On every startup with `meteor npm run dev` the file `en.json` (English) is created/overwritten by `extract-translations`, based on all `t(...)`, `i18n(...)` and `{i18n ...}}` that occur in the code. More info on [i18next](https://www.i18next.com/)).  
All textes in this `en.json` get pulled and translated on [weblate](https://hosted.weblate.org/projects/openki/openki/) into other languages. Those translation get exported back into this folder trough automated merge requests by weblate. (files `de.json`, `fr.json` etc.) 

The exported strings in the code consist of a `key` and the `original English string`.  
For example, in html: `{{i18n 'venue.title.edit' 'Edit venue'}}`  
If the same string is used multiple times, you define it and use only the key in all other occurences: `{{i18n 'venue.title.edit'}}`  
Please see [Naming and Syntax Convention](https://gitlab.com/Openki/Openki/-/wikis/Naming%20and%20Syntax%20Convention) in our wiki.
