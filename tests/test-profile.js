describe('Profile', function () {
  it('does not allow setting duplicate email', function () {
    var response = server.call('login', {
      "user": {
        "username": "Seee"
      },
      "password": {
        "digest":"0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
        "algorithm":"sha-256"
      }
    });
    expect(response.token).to.be.a('string');

	expect(function() {
		server.call('update_userdata',
			"Seee",
			"greg@openki.example",
			false
		);
	}).to.throw(/emailExists/);
  });
});
