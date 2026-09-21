import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../src/db/client.js", () => ({
  db: mockDb,
}));

import tags from "../src/routes/tags.js";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Tag 正常系", () => {
  const tag = {
    id: 1,
    user_id: 1,
    name: "勉強",
    created_at: new Date("2026-09-21T00:00:00.000Z"),
    updated_at: new Date("2026-09-21T00:00:00.000Z"),
  };

  const expectedTag = {
    ...tag,
    created_at: "2026-09-21T00:00:00.000Z",
    updated_at: "2026-09-21T00:00:00.000Z",
  };

  it("GET /tags でTag一覧を取得できる", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockResolvedValue([tag]),
    });

    const res = await tags.request("/");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([expectedTag]);
  });

  it("GET /tags/:id でTagを取得できる", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([tag]),
      }),
    });

    const res = await tags.request("/1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expectedTag);
  });

  it("POST /tags でTagを作成できる", async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([tag]),
      }),
    });

    const res = await tags.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        name: "勉強",
      }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(expectedTag);
  });

  it("PATCH /tags/:id でTagを更新できる", async () => {
    const updatedTag = {
      ...tag,
      name: "仕事",
    };

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedTag]),
        }),
      }),
    });

    const res = await tags.request("/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "仕事",
      }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ...expectedTag,
      name: "仕事",
    });
  });

  it("DELETE /tags/:id でTagを削除できる", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([tag]),
      }),
    });

    const res = await tags.request("/1", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });
});

describe("Tag 404", () => {
  it("GET /tags/:id でTagが存在しない場合は404になる", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await tags.request("/999");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Tag not found",
    });
  });

  it("PATCH /tags/:id でTagが存在しない場合は404になる", async () => {
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await tags.request("/999", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "更新後のタグ",
      }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Tag not found",
    });
  });

  it("DELETE /tags/:id でTagが存在しない場合は404になる", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await tags.request("/999", {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Tag not found",
    });
  });
});

describe("POST /tags", () => {
  /* 異常系 */
  it("nameが空白スペースのみの場合はValidation Errorになる", async () => {
    const res = await tags.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        name: " ",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("user_idが小数の場合はValidation Errorになる", async () => {
    const res = await tags.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1.5,
        name: "勉強",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("user_idが0の場合はValidation Errorになる", async () => {
    const res = await tags.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 0,
        name: "勉強",
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /tags/:id", () => {
  it("nameが空白スペースのみの場合はValidation Errorになる", async () => {
    const res = await tags.request("/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: " ",
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /tags/:id", () => {
  it("idが整数でない場合はValidation Errorになる", async () => {
    const res = await tags.request("/abc");

    expect(res.status).toBe(400);
  });

  it("idが0の場合はValidation Errorになる", async () => {
    const res = await tags.request("/0");

    expect(res.status).toBe(400);
  });
});
