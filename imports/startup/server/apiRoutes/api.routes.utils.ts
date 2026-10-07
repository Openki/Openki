import { FieldOrdering } from "/imports/utils/field-ordering";
import { SortSpec } from "/imports/utils/sort-spec";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Api, ApiEvent } from "/imports/Api";

type HandlerType = "organizations" | "venues" | "events" | "groups";

export class NoActionError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export const orderedResults = async (params: any, handler: HandlerType): Promise<ApiEvent[]> => {
  if (!Object.prototype.hasOwnProperty.call(Api, handler)) {
    throw new NoActionError("Invalid action");
  }

  const { query } = params;

  const sortStr = query.sort;
  const sorting = sortStr ? SortSpec.fromString(sortStr) : SortSpec.unordered();

  const filter = { ...query };
  delete filter.sort;
  delete filter.limit;
  delete filter.skip;

  const selectedLimit = Number.parseInt(query.limit || "", 10) || 100; // If nothing is specified, 100 entities are returned.
  const limit = Math.max(0, Math.min(PrivateSettings.apiMaxLimit, selectedLimit));
  const skip = Number.parseInt(query.skip || "", 10) || 0;
  const results = await Api[handler](filter, limit, skip, sorting.spec());

  // Sort the results again so computed fields are sorted too
  // WARNING: In many cases this will be too late, because the limit
  // has already excluded results.
  return FieldOrdering(sorting).sorted(results as any) as unknown as ApiEvent[];
};
