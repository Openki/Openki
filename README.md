hmmm
====

Is a **Course-Organization-Platform** built with [Meteor.js](http://meteor.com)

- Concept: [news.schuel.ch](news.schuel.ch "our blog")
- Demo: [hmmm.schuel.ch](hmmm.schuel.ch "runing here")
- Contact: [schueldev[at]lists.xiala.net](mailto:schueldev[_at_]lists.xiala.net "write us")

### Features
- Voting-/polling-system, fix-a-date schedules
- Discussion-board
- Categories and sub-categories
- Fulltext-search with realtime-output
- Regions- and room-system
- Extendable participant roles

### Intended features
- Email notification
- Calendar
- Privat messages
- Privacy and Security
- File upload

### Installation
- [Download](https://github.com/schuel/hmmm/archive/master.zip) and unzip (or clone) Hmmm into /some/path
- `cd /some/path`
- To install Meteor, run:
    - ` curl https://install.meteor.com | sh`
    - (sudo)` apt-get install nodejs`  (mac: install from [nodejs.org](nodejs.org)
    - (sudo)` npm install -g meteorite`
    - ` mrt update`
- Run `meteor`
- Browse to http://localhost:3000/

### Compass or how to work on stylesheets
- install ruby
- `gem install compass`
- `gem install zurb-foundation`
- run `compass compile` in project root
- scss/sass files go into sass folder
- compiled css goes to client/css. never edit these files. they are just there for the convenience of the guys without compass :-)

### License
- Not clear yet. AGPL maybe. for the moment it is [WTFPL](http://www.wtfpl.net)
