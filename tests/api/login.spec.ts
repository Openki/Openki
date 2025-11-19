const gregsDigestedPassword = {
  digest: "0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
  algorithm: "sha-256",
};

const invalidDigestedPassword = {
  digest: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
  algorithm: "sha-256",
};

describe("Login", () => {
  it("should work with good credentials", () => {
    cy.callMethod("login", {
      user: { username: "greg" },
      password: gregsDigestedPassword,
    }).then((response: { token: string }) => {
      expect(response.token).to.be.a("string");
    });
  });

  it("should fail with bad username", () => {
    cy.expectCallMethodThrowsError("login", {
      user: { username: "bogus username" },
      password: gregsDigestedPassword,
    }).then((err: Meteor.Error) => {
      expect(err).to.be.an("object");
      expect(err.error).to.equal(403);
    });
  });

  it("should fail with bad password", () => {
    cy.expectCallMethodThrowsError("login", {
      user: { username: "greg" },
      password: invalidDigestedPassword,
    }).then((err: Meteor.Error) => {
      expect(err).to.be.an("object");
      expect(err.error).to.equal(403);
    });
  });
});
