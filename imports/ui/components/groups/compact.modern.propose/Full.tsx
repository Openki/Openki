import React from "react";

import { Edit } from "/imports/ui/components/groups/edit";

export function Full({ organization }: { organization: string | undefined }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="p-4">
          {organization ? (
            <Edit organization={organization} showCancelButton />
          ) : (
            <Edit showCancelButton />
          )}
        </div>
      </div>
    </div>
  );
}
