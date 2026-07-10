import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import { cx } from "/imports/utils/cx";

import { ButtonCancel, ButtonSave } from "../Buttons";

import "./styles.scss";

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
  const div = document.createElement("div");
  return "draggable" in div || ("ondragstart" in div && "ondrop" in div);
})();

export interface UploadFile {
  lastModified: Date;
  size: number;
  mimeType: string;
  /** As BinaryString */
  content: string;
}

export interface Props {
  accept: string;
  onUpload: (file: UploadFile) => void;
  onCancel: () => void;
}

export function FileUpload({ accept, onUpload, onCancel }: Props) {
  const { t } = useTranslation();
  const [droppedFile, setDroppedFile] = useState<File | undefined>(undefined);
  const [progress, setProgress] = useState<"start" | "ready" | "uploading" | "done">("start");
  const [dragover, setDragover] = useState(false);

  function fileName() {
    return droppedFile?.name;
  }

  return (
    <>
      <form
        encType="multipart/form-data"
        noValidate
        className={cx(
          "text-center file-upload",
          supportsDragndrop && "supports-dragndrop",
          dragover && "is-dragover",
        )}
        onDragOver={() => {
          setDragover(true);
        }}
        onDragEnter={() => {
          setDragover(true);
        }}
        onDragLeave={() => {
          setDragover(false);
        }}
        onDragEnd={() => {
          setDragover(false);
        }}
        onDrop={(event) => {
          setDragover(false);

          setDroppedFile(event.dataTransfer.files[0]);
          setProgress("ready");
        }}
      >
        <input
          type="file"
          accept={accept}
          className="d-none"
          id="file"
          onChange={(event) => {
            setDroppedFile(event.target?.files?.[0]);
            setProgress("ready");
          }}
        />
        <label htmlFor="file">
          <div className="mb-1">
            <i className="fa-regular fa-file-lines fa-5x" />
          </div>
          {dragover ? (
            <div className="file-upload-drop">
              {t("fileUpload.drop.text", "Drop it like it's hot!")}
            </div>
          ) : (
            <>
              {progress === "start" && (
                <>
                  <span className="fw-bold">{t("fileUpload.choose.text", "Choose a file")}</span>

                  {supportsDragndrop && t("fileUpload.drag.text", "or drag it here")}
                </>
              )}
              {progress === "uploading" && (
                <div className="file-upload-uploading">
                  {t("fileUpload.uploading.text", "Uploading…")}
                </div>
              )}
              {progress === "ready" && fileName}
            </>
          )}
        </label>
      </form>
      {progress === "ready" && (
        <div className="file-upload-controls">
          <ButtonSave
            id="file-upload-save"
            needsLogin
            onClick={async () => {
              if (!droppedFile) {
                throw new Error(`Unexpected undefined: file`);
              }

              setProgress("uploading");

              const reader = new FileReader();

              reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

                onUpload({
                  lastModified: new Date(droppedFile.lastModified),
                  size: droppedFile.size,
                  mimeType: droppedFile.type,
                  content: base64,
                });

                setProgress("done");
              };

              reader.readAsArrayBuffer(droppedFile);
            }}
          />
          <ButtonCancel id="file-upload-cancel" onClick={() => onCancel()} />
        </div>
      )}
    </>
  );
}
