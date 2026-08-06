import { Meteor } from "meteor/meteor";
import { assert } from "chai";
import { Promise } from "meteor/promise";
import { MeteorAsync } from "/imports/utils/promisify";
import { userSearchPrefix } from "/imports/utils/user-search-prefix";
import { Users } from "/imports/api/users/users";
import * as usersMethods from "/imports/api/users/methods";
import { updateUsername } from "/imports/api/users/methods";

const createDummy = function () {
  return `test${Date.now()}${Math.random()}`;
};

if (Meteor.isClient) {
  describe("Profile", function () {
    this.timeout(30000);

    it("accepts login", async () => {
      await Meteor.loginWithPasswordAsync("Seee", "greg");
    });

    describe("User modification", function () {
      this.timeout(30000);
      const oldDummy = createDummy();
      const newDummy = createDummy();
      it("changes the username", async () => {
        await Accounts.createUserAsync({
          username: oldDummy,
          email: `${oldDummy}@openki.example`,
          password: "hunter2",
        });
        Meteor.loginWithPasswordAsync(oldDummy, "hunter2")
          .then(
            () =>
              new Promise<void>((resolve) => {
                updateUsername(newDummy)
                  .then(async () => {
                    await Users.find({ username: newDummy }).observeAsync({
                      added: () => {
                        resolve();
                      },
                    });
                  })
                  .catch((err) => {
                    assert.isNotOk(err, "not expecting username-change errors");
                  });
              }),
          )
          .then(async () => {
            // check if username has changed to the correct string
            const user = await Meteor.userAsync();
            assert.strictEqual(newDummy, user?.username, "username was changed successfully");
          });
      });

      it("does not allow setting duplicate email on update", async () => {
        let hasFailed = false;
        let expectedMessage = false;
        try {
          await usersMethods.updateEmail("greg@openki.example");
        } catch (err) {
          if (err) {
            hasFailed = true;
            if (err instanceof Meteor.Error && err.reason === "Email already exists.") {
              expectedMessage = true;
            }
          }
        }
        assert.isTrue(hasFailed, "user.updateEmail throws on duplicate email");
        assert.isTrue(expectedMessage, "user.updateEmail throws 'Email already exists.'");
      });

      it("does not allow setting duplicate name on creation", async () => {
        let hasFailed = false;
        let expectedMessage = false;
        try {
          await Accounts.createUserAsync({
            username: "Seee",
            password: "greg",
            email: "seee@openki.example",
          });
        } catch (err) {
          if (err) {
            hasFailed = true;
            if (err instanceof Meteor.Error && err.reason === "Username already exists.") {
              expectedMessage = true;
            }
          }
        }
        assert.isTrue(hasFailed, "Accounts.createUser throws on duplicate name");
        assert.isTrue(expectedMessage, "Accounts.createUser throws 'Username already exists.'");
      });
    });
  });

  describe("User search", () => {
    it("finds none for nonexisting name", async () => {
      // How could I check whether nothing was found
      // for a non-existing user? I'm going to watch the Users
      // collection for additions between the subscription for a
      // non-existing user and the conclusion of this subscription.
      let added: boolean;

      // This will track addition of users
      const cursor = Users.find();
      await cursor.observeAsync({
        added: () => {
          added = true;
        },
      });

      // Reset the flag before starting the subscription
      added = false;

      const sub = await MeteorAsync.subscribe("userSearch", "SOMEUSERTHATDOESNOTEXIST");
      sub.stop();
      assert.isFalse(added);
    });

    it("finds some user", async () => {
      const someUser = "gregen";

      const sub = await MeteorAsync.subscribe("userSearch", someUser);
      sub.stop();

      const cursor = userSearchPrefix(someUser);
      assert(cursor.count() > 0);
    });

    it('finds Chnöde when searching for "Chn"', async () => {
      const sub = await MeteorAsync.subscribe("userSearch", "Chn");
      sub.stop();

      const cursor = userSearchPrefix("Chnöde", {});
      assert(cursor.count() > 0);
    });
  });
}
