function assertGoodHeaders(response: Cypress.Response<any>) {
  expect(response.status).to.eq(200);
  expect(response.headers['content-type']).to.include('application/json');
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
      throw new Error(
        `${message}. But the string '${current}' orders after '${lowerNext}'`
      );
    }
    current = lowerNext;
  };
}

describe('API', () => {
  const baseUrl = Cypress.env('API_BASE') || 'http://localhost:3000/api/0/json';

  describe('GroupApi', () => {
    it('should return JSON response', () => {
      cy.request(`${baseUrl}/groups`).then((response) => {
        assertGoodHeaders(response);
      });
    });
  });

  describe('EventApi', () => {
    it('returns JSON response', () => {
      cy.request(`${baseUrl}/events`).then((response) => {
        assertGoodHeaders(response);
        expect(response.body.data).to.not.be.empty;
      });
    });

    it('returns future events sorted ascending by default', () => {
      cy.request(`${baseUrl}/events?after=now`).then((response) => {
        assertGoodHeaders(response);
        const starts = response.body.data.map((d: any) =>
          new Date(d.start).valueOf()
        );
        starts.forEach(
          assertAscending(
            new Date(),
            'events should be sorted ascending by default'
          )
        );
      });
    });

    it('sorts by start-date ascending', () => {
      cy.request(`${baseUrl}/events?after=now&sort=start`).then((response) => {
        assertGoodHeaders(response);
        const starts = response.body.data.map((d: any) =>
          new Date(d.start).valueOf()
        );
        starts.forEach(
          assertAscending(
            new Date(),
            'ascending ordering of start-dates was requested'
          )
        );
      });
    });

    it('sorts by title descending', () => {
      cy.request(`${baseUrl}/events?after=now&sort=-title`).then((response) => {
        assertGoodHeaders(response);
        const titles = response.body.data.map((e: any) => e.title);
        titles.reverse();
        titles.forEach(
          assertAscendingString('', 'descending ordering of titles was requested')
        );
      });
    });

    it('returns past events sorted descending by default', () => {
      cy.request(`${baseUrl}/events?before=now`).then((response) => {
        assertGoodHeaders(response);
        const starts = response.body.data.map((d: any) =>
          new Date(d.start).valueOf()
        );
        starts.forEach(
          assertDescending(
            new Date(),
            'past events should be sorted newest-first by default'
          )
        );
      });
    });

    it.skip('filters events by group', () => {
      const groupId = '43df1efc02';
      cy.request(`${baseUrl}/events?group=${groupId}`).then((response) => {
        assertGoodHeaders(response);
        const { data } = response.body;
        expect(data).to.not.be.empty;
        data.forEach((event: any) => {
          expect(event.groups).to.include(groupId);
        });
      });
    });
  });

  describe('VenueApi', () => {
    it('should return JSON response', () => {
      cy.request(`${baseUrl}/venues`).then((response) => {
        assertGoodHeaders(response);
      });
    });

    it('filters by region', () => {
      const testistan = '9JyFCoKWkxnf8LWPh';
      cy.request(`${baseUrl}/venues?region=${testistan}`).then((response) => {
        assertGoodHeaders(response);
        const { data } = response.body;
        expect(data).to.not.be.empty;
        data.forEach((v: any) => {
          expect(v.region).to.eq(testistan);
        });
      });
    });

    it.skip('handles percent in query', () => {
      cy.request(`${baseUrl}/venues?%`).then((response) => {
        assertGoodHeaders(response);
      });
    });

    it('handles unicode query parameter', () => {
      cy.request(`${baseUrl}/venues?region=💩`).then((response) => {
        assertGoodHeaders(response);
      });
    });
  });
});
