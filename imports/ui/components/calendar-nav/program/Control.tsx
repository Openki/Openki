import { useTranslation } from "react-i18next";
import { Arrow, Direction } from "../Arrow";

export interface Props {
  direction: Direction;
  onChangeDate: () => void;
}

export function Control({ direction, onChangeDate }: Props) {
  const { t } = useTranslation();

  function text(length: string) {
    // @ts-expect-error Disable type checking since we don't know the key at compile time
    return t(`calendar.${direction}.week.${length}`) as string;
  }

  return (
    <div className="col-auto px-4">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={(event) => {
          event.preventDefault();
          onChangeDate();
        }}
      >
        <Arrow direction={direction} />{" "}
        <span className="d-none d-md-inline-block">{text("short")}</span>
      </button>
    </div>
  );
}
