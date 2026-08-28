export type SneakerMarketAdminUpdate = {
  marketTrackingStatus?: "unmapped" | "mapped" | "backfilled" | "active" | "error";
  marketLastSuccessfulSyncAt?: string;
  kicksdbProductId?: string;
  marketNotes?: string;
};

export type WordPressSneakerRestRecord = {
  id: number;
  slug: string;
  acf: Record<string, unknown>;
};

export type WordPressMarketAdmin = {
  getSneaker(id: number): Promise<WordPressSneakerRestRecord>;
  updateSneakerMarketAdminFields(
    id: number,
    update: SneakerMarketAdminUpdate,
  ): Promise<WordPressSneakerRestRecord>;
};

type WordPressMarketAdminOptions = {
  wordpressUrl: string;
  username: string;
  applicationPassword: string;
  fetchImpl?: typeof fetch;
};

const marketFieldNames = {
  marketTrackingStatus: "market_tracking_status",
  marketLastSuccessfulSyncAt: "market_last_successful_sync",
  kicksdbProductId: "kicksdb_product_id",
  marketNotes: "market_notes",
} as const;

function formatAcfDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid market sync timestamp: ${value}`);
  }
  return date.toISOString().replace("T", " ").slice(0, 19);
}

export function createWordPressMarketAdmin({
  wordpressUrl,
  username,
  applicationPassword,
  fetchImpl = fetch,
}: WordPressMarketAdminOptions): WordPressMarketAdmin {
  const baseUrl = wordpressUrl.replace(/\/$/, "");
  const authorization = `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString("base64")}`;

  async function request(id: number, init?: RequestInit) {
    const response = await fetchImpl(`${baseUrl}/wp-json/wp/v2/sneaker/${id}?context=edit`, {
      ...init,
      headers: {
        Authorization: authorization,
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    const body = (await response.json().catch(() => null)) as WordPressSneakerRestRecord | { message?: string } | null;
    if (!response.ok) {
      const message = body && "message" in body ? body.message : null;
      throw new Error(
        `WordPress REST request failed (${response.status})${message ? `: ${message}` : ""}; response=${JSON.stringify(body)}`,
      );
    }
    if (!body || !("acf" in body)) {
      throw new Error("WordPress REST response did not include the ACF field group");
    }
    return body;
  }

  return {
    getSneaker(id) {
      return request(id);
    },

    async updateSneakerMarketAdminFields(id, update) {
      const current = await request(id);
      const model = current.acf.model;
      const colorway = current.acf.colorway;
      if (
        typeof model !== "string" ||
        !model.trim() ||
        typeof colorway !== "string" ||
        !colorway.trim()
      ) {
        throw new Error("WordPress ACF requires the existing sneaker model and colorway for partial updates");
      }
      const acf: Record<string, string> = {};
      // ACF validates the entire group schema and requires `model` even for a
      // partial REST update. Re-send only the unchanged required values.
      acf.model = model;
      acf.colorway = colorway;
      if (update.marketTrackingStatus !== undefined) {
        acf[marketFieldNames.marketTrackingStatus] = update.marketTrackingStatus;
      }
      if (update.marketLastSuccessfulSyncAt !== undefined) {
        acf[marketFieldNames.marketLastSuccessfulSyncAt] = formatAcfDateTime(
          update.marketLastSuccessfulSyncAt,
        );
      }
      if (update.kicksdbProductId !== undefined) {
        acf[marketFieldNames.kicksdbProductId] = update.kicksdbProductId.trim();
      }
      if (update.marketNotes !== undefined) {
        acf[marketFieldNames.marketNotes] = update.marketNotes;
      }
      if (Object.keys(acf).length === 2) {
        throw new Error("At least one sneaker market administration field is required");
      }
      return request(id, { method: "POST", body: JSON.stringify({ acf }) });
    },
  };
}
