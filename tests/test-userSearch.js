describe('User search @watch', function () {
  it('finds none for nonexisting name', function () {
		// HACK I don't really know how to access the subscription result so I'm just gonna rely on server._original
		var found = false;
		server._original.observe('users').added = function(userId) {
			found = true;
		}
		server.subscribeSync('userSearch', ['Uichi6Va doo5aeWi faiNee1b AhfueNg5 Eethaoy4 Kei9OhNg epehohJ0 qui8ohYu']);

		assert.isFalse(found, "no result found");
  });

  it('finds greg', function () {
		// HACK I don't really know how to access the subscription result so I'm just gonna rely on server._original
		var foundGreg = false;
		server._original.observe('users').added = function(userId) {
			if (server._original.collections.users[userId].username === 'greg') foundGreg = true;
		}
		server.subscribe('userSearch', ['greg']);

		assert.isTrue(foundGreg);
  });

  it('finds Seee for s', function () {
		// HACK I don't really know how to access the subscription result so I'm just gonna rely on server._original
		var foundSeee = false;
		server._original.observe('users').added = function(userId) {
			var user = server._original.collections.users[userId];
			if (user.username === 'Seee') {
				foundSeee = true;
				assert.isUndefined(user.lastLogin, "lastLogin field must not be exported");
			}
		}
		server.subscribeSync('userSearch', ['S']);

		assert.isTrue(foundSeee);
  });
});
