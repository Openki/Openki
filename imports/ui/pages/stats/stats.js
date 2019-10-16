import { Router } from 'meteor/iron:router';

import '/imports/api/stats/stats';

import './stats.html';


const getRegionFromQuery = () => {
    const region = Router.current().params.query.region;
    if (region) {
        return region;
    }
    return 'all_regions';
}

Template.stats.onCreated(function() {
    
    const region = getRegionFromQuery();
    this.count = new ReactiveVar(false);
    Meteor.call('stats.hello', region, (err, count) => {
        this.count.set(count);
    });
});

Template.stats.helpers({
    count() {
        return Template.instance().count.get();
    }
});

function abc(blaa) {
    return blaa;
}

(blaa) => {
    return blaa;
}
