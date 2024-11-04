import React from "react";

export function CompactPropose() {
  return (
    <div className={`row mx-0 align-items-start course-compact is-proposal`}>
      <div className="course-compact-content">
        <div className="course-compact-title mb-0">
          <div className="input-group input-group-lg p-2">
            <input type="text" className="form-control" placeholder="Dein Kurs" />
            <button className="btn btn-success" type="button">
              Vorschlagen
            </button>
          </div>
        </div>
        <div className="ps-2 pe-2">
          Starte deinen eigenen Kurs, egal ob als Mentor_in oder Teilnehmer_in. Du bestimmts, was du
          lernen willst.
        </div>
      </div>
    </div>
  );
}
