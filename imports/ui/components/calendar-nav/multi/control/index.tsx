import React from "react";
import { useTranslation } from "react-i18next";
import { Arrow, Direction, Unit, units } from "../../Arrow";

export interface Props {
  unit: Unit;
  direction: Direction;
  onChangeDate: () => void;
  onChangeUnit: (value: Unit) => void;
}

export function Control({ unit: currentUnit, direction, onChangeDate, onChangeUnit }: Props) {
  const { t } = useTranslation();

  function text(unit: string, length: string) {
    return t(`calendar.${direction}.${unit}.${length}`);
  }

  return (
    <div className="calendar-nav-control">
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={(event) => {
            event.preventDefault();
            onChangeDate();
          }}
        >
          <Arrow direction={direction} />{" "}
          <span className="d-none d-md-inline-block">{text(currentUnit, "short")}</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          aria-expanded="false"
          aria-haspopup="true"
          data-bs-toggle="dropdown"
          data-bs-reference="parent"
        >
          <span className="fa-solid fa-list-ul fa-fw" aria-hidden="true"></span>
        </button>
        <ul className="dropdown-menu">
          {units.map((unit) => (
            <li key={unit}>
              <a
                className="dropdown-item"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onChangeUnit(unit);
                }}
              >
                {text(unit, "long")}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
