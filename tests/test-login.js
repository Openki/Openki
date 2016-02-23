describe('Login', function () {
  it('should work with good credentials', function () {
    var response = server.call('login', {
      "user": {
        "username": "greg"
      },
      "password": {
        "digest":"0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
        "algorithm":"sha-256"
      }
    });
    expect(response.token).to.be.a('string');
  });

  it('should fail with bad username', function () {
    var fn = function() {
      server.call('login', {
        "user": {
          "username": "bogus username"
        },
        "password": {
          "digest":"0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
          "algorithm":"sha-256"
        }
      });
    };

    expect(fn).to.throw(/User not found \[403\]/);
  });

  it('should fail with bad password', function () {
    var fn = function() {
      server.call('login', {
        "user": {
          "username": "greg"
        },
        "password": {
          "digest":"2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
          "algorithm":"sha-256"
        }
      });
    };

    expect(fn).to.throw(/Incorrect password \[403\]/);
  });
});
