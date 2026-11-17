Package.describe({
  name: 'server-publish',
  summary: 'Helpers to use Meteor publications with Blaze and React',
  version: '1.0.0',
  documentation: 'README.md',
  git: 'https://gitlab.com/Openki/Openki'
})

Package.onUse(function(api) {
  api.use('ecmascript')
  api.use('typescript')
  api.use('mongo');
  api.use('react-meteor-data')

  api.use('lib/ServerPublishUtils.ts')
  api.use('lib/ServerPublishBlaze.ts')
  api.use('lib/ServerPublishReact.ts')
  api.mainModule('lib/ServerPublish.ts', ['client', 'server'], { lazy: true })

  api.types('dist-types/index.d.ts')
});
