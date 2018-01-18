import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Conversations from '/imports/api/conversations/conversations.js';
import UserMessages from '/imports/api/user-messages/user-messages.js';

import ScssVars from '/imports/ui/lib/scss-vars.js';

import './messenger.html';

Template.messenger.onCreated(function() {
	// reset the user's inbox counter
	Meteor.call('user.resetInbox', true);

	// track the expanded conversation
	this.activeConversationId = new ReactiveVar(false);

	// attach the query to find and sort conversations to the instance
	this.cursorQuery = [
		{ 'participants.id': { $in: [Meteor.userId()] } },
		{ sort: { timeUpdated: -1 } }
	];

	// helper function to set first conversation as active
	this.selectFirstConversation = () => {
		if (Conversations.findOne()) {
			const cursor = Conversations.find(...this.cursorQuery);
			const firstConversation = cursor[Symbol.iterator]().next().value;
			this.activeConversationId.set(firstConversation._id);
		}
	};

	// subscribe to all the user's conversations
	this.subscribe('conversations', () => {
		// set first conversation as active on first page load
		this.selectFirstConversation();
	});

	// helper method for mobile to toggle between conversations and messages
	this.toggleSidebar = () => {
		this.$('.messenger-sidebar').toggle();
		this.$('.messenger-panel').toggle();
	};
});

Template.messenger.helpers({
	conversations() {
		return Conversations.find(...Template.instance().cursorQuery);
	},

	activeConversation() {
		return Conversations.findOne(Template.instance().activeConversationId.get());
	}
});

Template.sidebar_conversation.onCreated(function() {
	this.autorun(() => {
		this.subscribe('userMessages.latest', Template.currentData().latestMessage);
	});
});

Template.sidebar_conversation.helpers({
	stateClasses() {
		const parentInstance = Template.instance().parentInstance();
		if (this._id === parentInstance.activeConversationId.get()) {
			return 'active';
		}
	},

	unread() {
		return this.participants.find(p => p.id === Meteor.userId()).unread;
	},

	message() {
		return UserMessages.findOne({ _id: this.latestMessage} );
	},

	isADayAgo(timeCreated) {
		// const dayBefore = moment(new Date()).subtract(1, 'hour');
		// TODO: change back to
		const dayBefore = moment(new Date()).subtract(1, 'day');
		return moment(timeCreated).isBefore(dayBefore);
	}
});

Template.sidebar_conversation.events({
    // TODO choose better classname
	'click .js-show-conversation'(event, instance) {
		const parentInstance = instance.parentInstance();

		parentInstance.activeConversationId.set(this._id);
		Meteor.call('conversation.resetUnread', this._id);

		if (Session.get('viewportWidth') <= ScssVars.screenSM) {
			parentInstance.toggleSidebar();
		}
	}
});

Template.full_conversation.onCreated(function() {
	this.autorun(() => {
		this.subscribe('userMessages.fullConversation', Template.currentData()._id);
	});
});

Template.full_conversation.helpers({
	muted() {
		return this.isMutedByUser();
	},

	messages() {
		return UserMessages.find(
			{ conversation: this._id },
			{ sort: { timeCreated: 1 } }
		);
	}
});

Template.full_conversation.events({
	'click .js-show-sidebar'(event, instance) {
		instance.parentInstance().toggleSidebar();
	},

	'click .js-toggle-mute'(event, instance) {
		Meteor.call('conversation.mute', this._id, !this.isMutedByUser());
	},

	'click .js-mark-as-read'(event, instance) {
		Meteor.call('conversation.markAsRead', this._id);
	},

	'click .js-send-message'(event, instance) {
		const recipients = this.otherParticipants().map((p) => p.id);
		const content = instance.$('.js-message-content').val();

		Meteor.call('userMessage.add', recipients, content, (err) => {
			if (err) {
				console.error(err);
			} else {
				instance.$('.js-message-content').val('');
			}
		});
	}
});

Template.full_conversation.onRendered(function() {
	// TODO scroll to bottom
});

Template.full_conversation_message.onCreated(function() {
	// check if this message has already been read by the user
	this.unseen = new ReactiveVar(false);

	const message = Template.currentData();
	const conversation = Template.parentData();
	const user = conversation.participants.find((p) => p.id === Meteor.userId());

	this.unseen.set(moment(message.timeCreated).isAfter(user.readAt));
});

Template.full_conversation_message.helpers({
	stateClasses() {
		if (this.sentByOwnUser()) {
			return 'is-own-message';
		} else {
			const conversation = Template.parentData();
			const user = conversation.participants.find((p) => p.id === Meteor.userId());

			if (!user.readAt || moment(this.timeCreated).isAfter(user.readAt)) {
				return 'is-unseen';
			}
		}
	}
});
