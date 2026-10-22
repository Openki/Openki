function assertGoodHeaders(response: Cypress.Response<any>) {
  expect(response.status).to.eq(200);
  expect(response.headers["content-type"]).to.include("application/json");
}

function assertAscending(base: Date, message?: string) {
  let current = base.valueOf();
  return (next: number) => {
    expect(next, message).to.be.at.least(current);
    current = next;
  };
}

function assertDescending(base: Date, message?: string) {
  let current = base.valueOf();
  return (next: number) => {
    expect(next, message).to.be.at.most(current);
    current = next;
  };
}

function assertAscendingString(base: string, message: string) {
  let current = base.toLowerCase();
  return (next: string) => {
    const lowerNext = next.toLowerCase();
    const side = current.localeCompare(lowerNext);
    if (side > 0) {
      throw new Error(`${message}. But the string '${current}' orders after '${lowerNext}'`);
    }
    current = lowerNext;
  };
}

describe("API", () => {
  describe("OrganizationApi", () => {
    it("should return JSON response", () => {
      cy.request(`/api/0/json/organizations`).should(assertGoodHeaders);
    });
  });

  describe("EventApi", () => {
    it("returns JSON response", () => {
      cy.request(`/api/0/json/events`)
        .should(assertGoodHeaders)
        .its("body.data")
        .should("not.be.empty");
    });

    it("returns future events sorted ascending by default", () => {
      cy.request(`/api/0/json/events?after=now`)
        .should(assertGoodHeaders)
        .its("body.data")
        .should("not.be.empty")
        .then((data) => {
          const starts = data.map((d: any) => new Date(d.start).valueOf());
          starts.forEach(
            assertAscending(new Date(), "events should be sorted ascending by default"),
          );
        });
    });

    it("sorts by start-date ascending", () => {
      cy.request(`/api/0/json/events?after=now&sort=start`)
        .should(assertGoodHeaders)
        .its("body.data")
        .then((data) => {
          const starts = data.map((d: any) => new Date(d.start).valueOf());
          starts.forEach(
            assertAscending(new Date(), "ascending ordering of start-dates was requested"),
          );
        });
    });

    it("sorts by title descending", () => {
      cy.request(`/api/0/json/events?after=now&sort=-title`)
        .should(assertGoodHeaders)
        .its("body.data")
        .then((data) => {
          const titles = data.map((e: any) => e.title).toReversed();
          titles.forEach(assertAscendingString("", "descending ordering of titles was requested"));
        });
    });

    it("returns past events sorted descending by default", () => {
      cy.request(`/api/0/json/events?before=now`)
        .should(assertGoodHeaders)
        .its("body.data")
        .should("not.be.empty")
        .then((data) => {
          const starts = data.map((d: any) => new Date(d.start).valueOf());
          starts.forEach(
            assertDescending(new Date(), "past events should be sorted newest-first by default"),
          );
        });
    });

    it("filters events by organization", () => {
      const organizationId = "573edec5d6";
      cy.request(`/api/0/json/events?organization=${organizationId}`)
        .should(assertGoodHeaders)
        .its("body.data")
        .should("not.be.empty")
        .each((event: any) => {
          const organizationIds = event.organizations.map((g: any) => g.id);
          expect(organizationIds).to.include(organizationId);
        });
    });
  });

  describe("VenueApi", () => {
    it("should return JSON response", () => {
      cy.request(`/api/0/json/venues`).should(assertGoodHeaders);
    });

    it("filters by region", () => {
      const testistan = "9JyFCoKWkxnf8LWPh";
      cy.request(`/api/0/json/venues?region=${testistan}`)
        .should(assertGoodHeaders)
        .its("body.data")
        .should("not.be.empty")
        .each((v: any) => {
          expect(v.region).to.eq(testistan);
        });
    });

    it.skip("handles percent in query", () => {
      cy.request(`/api/0/json/venues?%`).should(assertGoodHeaders);
    });

    it("handles unicode query parameter", () => {
      cy.request(`/api/0/json/venues?region=💩`).should(assertGoodHeaders);
    });
  });
});
