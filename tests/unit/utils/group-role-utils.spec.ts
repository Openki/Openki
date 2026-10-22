import { type GroupMember } from "/imports/api/groups/groups";

import { hasRole, hasRoleUser } from "/imports/api/groups/lib/hasRole";

describe("Role check", () => {
  const members: GroupMember[] = [
    {
      user: "user1",
      roles: [
        { id: "role1", type: "predefined" },
        { id: "role1000", type: "predefined" },
      ],
      comment: "",
    },
    {
      user: "user2",
      roles: [
        { id: "role2", type: "predefined" },
        { id: "role1000", type: "predefined" },
      ],
      comment: "",
    },
    { user: "user3", roles: [{ id: "role3", type: "predefined" }], comment: "" },
    { user: "nobody", roles: [], comment: "" },
  ];

  it("should see roles that exist", () => {
    expect(hasRole(members, { id: "role1", type: "predefined" })).to.be.true;
    expect(hasRole(members, { id: "role1000", type: "predefined" })).to.be.true;
  });

  it("should not see roles that don't exist", () => {
    expect(hasRole(members, { id: "role4000", type: "predefined" })).to.be.false;
    expect(hasRole(members, { id: "", type: "predefined" })).to.be.false;
    expect(hasRole(members, undefined)).to.be.false;
  });

  it("should see member as subscribed", () => {
    expect(hasRoleUser(members, { id: "role1", type: "predefined" }, "user1")).to.be.true;
    expect(hasRoleUser(members, { id: "role1000", type: "predefined" }, "user2")).to.be.true;
  });

  it("should not see user that are not subscribed", () => {
    expect(hasRoleUser(members, { id: "role1", type: "predefined" }, "userNotExists")).to.be.false;
    expect(hasRoleUser(members, { id: "role1000", type: "predefined" }, "")).to.be.false;
    expect(hasRoleUser(members, { id: "role1000", type: "predefined" }, undefined)).to.be.false;
  });

  it("should not see roles that don't exist", () => {
    expect(hasRoleUser(members, { id: "role1", type: "predefined" }, "user2")).to.be.false;
    expect(hasRoleUser(members, { id: "role1000", type: "predefined" }, "user3")).to.be.false;
    expect(hasRoleUser(members, { id: "", type: "predefined" }, "nobody")).to.be.false;
  });

  it("should not see roles when member list is empty", () => {
    expect(hasRole([], { id: "role4000", type: "predefined" })).to.be.false;
    expect(hasRole([], { id: "", type: "predefined" })).to.be.false;
    expect(hasRole([], undefined)).to.be.false;
    expect(hasRoleUser([], { id: "role1", type: "predefined" }, "user2")).to.be.false;
    expect(hasRoleUser([], { id: "role1000", type: "predefined" }, "user3")).to.be.false;
    expect(hasRoleUser([], { id: "", type: "predefined" }, "nobody")).to.be.false;
  });
});
