/* global Package */

Package.describe({
  name: 'react-meteor-data',
  summary: 'React hook for reactively tracking Meteor data',
  version: '4.0.1',
  documentation: 'README.md',
  git: 'https://github.com/meteor/react-packages'
})

Npm.depends({
  'fast-equals': '6.4.1'
})

Package.onUse((api) => {
  api.versionsFrom(['3.6'])
  api.use('tracker')
  api.use('ecmascript')
  api.use('typescript')

  api.mainModule('index.ts', ['client', 'server'])
  api.types('index.ts', {
    modules: {
      suspense: './suspense/index.ts'
    }
  })
})

Package.onTest((api) => {
  api.use(['ecmascript', 'typescript', 'reactive-dict', 'reactive-var', 'tracker', 'tinytest', 'mongo'])
  api.use('test-helpers')
  api.use('react-meteor-data')
  api.use('jquery@3.0.0', 'client');

  api.mainModule('tests.js');
})
