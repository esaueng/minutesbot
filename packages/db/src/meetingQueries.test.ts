import { describe, expect, it } from "vitest";
import { listMeetings } from "./meetingQueries";

class QueryD1 {
  sql = "";

  prepare(sql: string) {
    this.sql = sql;
    return {
      async all<T>() {
        return { results: [] as T[] };
      }
    };
  }
}

describe("meeting queries", () => {
  it("lists all meetings without a hard result cap", async () => {
    const db = new QueryD1();

    await listMeetings(db as unknown as D1Database);

    expect(db.sql.toLowerCase()).not.toContain("limit");
  });
});
