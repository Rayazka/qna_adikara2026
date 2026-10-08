// Uji hash voter deterministik sebelum implementasi ada.
import { expect, it } from "vitest";
import { hashVoter } from "../voteHash";

it("menghasilkan hash sama untuk IP+UA sama", async () => {
  const a = await hashVoter("1.1.1.1", "UA-test");
  const b = await hashVoter("1.1.1.1", "UA-test");
  expect(a).toBe(b);
  expect(a).toHaveLength(64);
});

it("menghasilkan hash beda untuk IP beda", async () => {
  const a = await hashVoter("1.1.1.1", "UA-test");
  const b = await hashVoter("2.2.2.2", "UA-test");
  expect(a).not.toBe(b);
});
