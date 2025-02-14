


const Template = TemplateAny as TemplateStaticTyped<
  "languageSelectionWrap",
  { inNavbar?: boolean },
  {
    searchingLanguages: ReactiveVar<boolean>;
  }
>;

const template = Template.languageSelectionWrap;

template.onCreated(function () {
  const instance = this;
  instance.searchingLanguages = new ReactiveVar(false);
  instance.subscribe("Languages");
});

template.helpers({
  languageSelectionAttr() {
    const instance = Template.instance();
    return {
      inNavbar: instance.data.inNavbar,
      onClose: () => {
        const searchingLanguages = instance.searchingLanguages;
        if (searchingLanguages.get()) {
          searchingLanguages.set(false);
        }
      },
    };
  },
  languageDisplayAttr() {
    const instance = Template.instance();
    return {
      inNavbar: instance.data.inNavbar,
      onClick: () => {
        instance.searchingLanguages.set(true);
      },
    };
  },

  searchingLanguages() {
    return Template.instance().searchingLanguages.get();
  },
});

export function LanguageSelectionWrap(props: { inNavbar?: boolean }){
  {{#if searchingLanguages}}
 return <LanguageSelection languageSelectionAttr/>
{{else}}
 return <LanguageDisplay languageDisplayAttr/>
{{/if}}
}
