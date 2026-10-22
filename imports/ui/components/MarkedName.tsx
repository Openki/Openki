import React from "react";

export interface Props {
  search: string;
  name: string;
}

export function MarkedName({ search, name }: Props) {
  if (search === "") {
    return <>{name}</>;
  }
  const match = name.match(new RegExp(search, "i"));

  if (match) {
    const term = match[0];
    const parts = name.split(term);
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i + 1 < parts.length && <span className="fw-bold">{term}</span>}
          </React.Fragment>
        ))}
      </>
    );
  }
  return <>{name}</>;
}
