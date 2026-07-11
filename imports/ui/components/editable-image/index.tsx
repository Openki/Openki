import imageBlobReduce, { pica } from "image-blob-reduce";
import { extension } from "mime-types";
import React, { ChangeEvent, DragEvent, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { cx } from "/imports/utils/cx";

import * as Alert from "/imports/api/alerts/alert";

import { ButtonDelete, ButtonCancel, ButtonSave } from "../Buttons";
import { FormCheck } from "/imports/ui/components/FormCheck";

import "./styles.scss";

const SupportedMimeList = ["image/bmp", "image/png", "image/gif", "image/jpeg"] as const;

type SupportedMime = (typeof SupportedMimeList)[number];

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
  const div = document.createElement("div");
  return "draggable" in div || ("ondragstart" in div && "ondrop" in div);
})();

export interface UploadImage {
  lastModified: Date;
  name: string;
  size: number;
  mimeType: SupportedMime;
  /** As BinaryString */
  content: string;
}

export interface Data {
  /** max allowed image size max*max */
  maxSize?: number | undefined;
  thumbnail?: { src?: string | undefined; maxSize?: number | undefined } | undefined;
  fullImage?: { src?: string | undefined; maxSize?: number | undefined } | undefined;
  onUpload: (file: UploadImage) => void;
  onDelete?: (() => void) | undefined;
}

function changeExt(fileName: string, newExt: string) {
  const pos = fileName.includes(".") ? fileName.lastIndexOf(".") : fileName.length;
  const fileRoot = fileName.substring(0, pos);
  return `${fileRoot}.${newExt}`;
}

export function EditableImage(data: Data) {
  const { t } = useTranslation();
  const [droppedFile, setDroppedFile] = useState<
    | {
        lastModified: Date;
        name: string;
        size: number;
        mimeType: SupportedMime;
        content: string;
      }
    | undefined
  >(undefined);
  const [progress, setProgress] = useState("display");
  const [copyRights, setCopyRights] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const id = useId();

  async function onDrop(file: File) {
    if (!SupportedMimeList.some((type) => type === file.type.toLowerCase())) {
      Alert.error(
        t("editableImage.accept.error", `Only images ({SUPPORTEDMIME}) are allowed.`, {
          SUPPORTEDMIME: SupportedMimeList.join(", "),
        }),
      );
      return;
    }

    let resizedFile: Blob;
    if (data.maxSize) {
      try {
        resizedFile = await imageBlobReduce({
          pica: pica({ features: ["js", "wasm"] }),
        }).toBlob(file, { max: data.maxSize });
      } catch (ex) {
        console.info(
          `Some browsers do not support this. It is okay to use the original. Errormessage: ${ex}`,
        );
        resizedFile = file;
      }
    } else {
      resizedFile = file;
    }

    {
      const reader = new FileReader();
      reader.onload = () => {
        let name = file.name;
        // handle if resizing changed file type
        const fileExtension = extension(resizedFile.type);
        if (fileExtension) {
          name = changeExt(name, fileExtension);
        }

        setDroppedFile({
          lastModified: new Date(file.lastModified),
          name,
          size: file.size,
          mimeType: file.type as SupportedMime,
          content: reader.result as string,
        });

        setCopyRights(false);
        setProgress("ready");
      };
      reader.readAsDataURL(resizedFile);
    }

    {
      const reader = new FileReader();
      reader.onload = function () {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);
    }
  }

  async function onUpload() {
    if (!droppedFile) {
      throw new Error(`Unexpected undefined: file`);
    }

    setProgress("uploading");

    data.onUpload(droppedFile);

    setDroppedFile(undefined);
    setPreview(undefined);
    setProgress("display");
  }

  async function onDelete() {
    if (data.onDelete) {
      data.onDelete();
    }
    setDroppedFile(undefined);
    setPreview(undefined);
    setProgress("display");
  }

  function onCancel() {
    setDroppedFile(undefined);
    setPreview(undefined);
    setProgress("display");
  }

  function thumbnailAttributes() {
    if (!data.thumbnail?.maxSize) {
      return {};
    }

    return {
      style: { maxWidth: `${data.thumbnail.maxSize}px`, maxHeight: `${data.thumbnail.maxSize}px` },
    };
  }
  function uploadButtonAttributes() {
    const attributes: {
      onClick: () => Promise<void>;
      disabled?: boolean;
    } = {
      onClick: onUpload,
    };

    if (!copyRights) {
      attributes.disabled = true;
    }

    return attributes;
  }
  function fileName() {
    return droppedFile?.name;
  }

  function deleteAllowed() {
    return !!data.onDelete;
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragover(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragover(false);
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragover(false);

    const file = event.dataTransfer.files[0];
    onDrop(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    onDrop(file);
  }

  function handleEditClick<T>(event: React.MouseEvent<T, MouseEvent>) {
    event.preventDefault();

    setProgress("edit");
  }

  return progress !== "display" ? (
    <>
      <form
        encType="multipart/form-data"
        noValidate
        className={cx(
          "text-center editable-image",
          supportsDragndrop && "supports-dragndrop",
          dragover && "is-dragover",
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={SupportedMimeList.join(", ")}
          className="d-none"
          id="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file">
          <div className="mb-1">
            {preview ? (
              <img {...thumbnailAttributes()} src={preview} />
            ) : data.thumbnail?.src ? (
              <img {...thumbnailAttributes()} src={data.thumbnail.src} />
            ) : (
              <i className="fa-regular fa-image fa-5x" />
            )}
          </div>
          {dragover ? (
            <div className="editable-image-drop">
              {t("fileUpload.drop.text", "Drop it like it's hot!")}
            </div>
          ) : progress === "edit" ? (
            <>
              <div className="editable-image-actions">
                <span className="btn btn-secondary">
                  {deleteAllowed()
                    ? t("fileUpload.change.text", "Replace file")
                    : t("fileUpload.choose.text", "Choose a file")}
                </span>
                {deleteAllowed() && <ButtonDelete id="editable-image-delete" onClick={onDelete} />}
              </div>
              {supportsDragndrop && (
                <>
                  <br />
                  {t("fileUpload.drag.text", "or drag it here")}
                </>
              )}
            </>
          ) : progress === "uploading" ? (
            <div className="editable-image-uploading">
              {t("fileUpload.uploading.text", "Uploading…")}
            </div>
          ) : progress === "ready" ? (
            fileName()
          ) : (
            ""
          )}
        </label>

        {progress === "ready" && (
          <div className="text-start">
            <FormCheck
              id="editable-image-copyrights"
              type="box"
              label={t("fileUpload.copyrights", "I have the copyrights to publish this file.")}
              checked={copyRights}
              onChange={(checked) => setCopyRights(checked)}
            />
          </div>
        )}
      </form>
      <div className="editable-image-controls">
        {progress === "ready" && (
          <ButtonSave needsLogin id="editable-image-save" {...uploadButtonAttributes()} />
        )}{" "}
        <ButtonCancel id="editable-image-cancel" onClick={onCancel} />
      </div>
    </>
  ) : (
    <div className="d-flex align-items-start gap-1">
      {data.thumbnail?.src ? (
        <img
          className="cursor-pointer img-thumbnail"
          {...thumbnailAttributes()}
          src={data.thumbnail.src}
          onClick={handleEditClick}
        />
      ) : (
        <i className="fa-regular fa-image fa-5x cursor-pointer" onClick={handleEditClick} />
      )}{" "}
      <div className="d-flex flex-column gap-1">
        {!!data.fullImage?.src && (
          <>
            {" "}
            <button
              className="btn btn-light btn-sm"
              data-bs-toggle="modal"
              data-bs-target={`#editable-image-${id}`}
            >
              <span className="fa-solid fa-eye cursor-pointer js-editable-image-show fa-xl"></span>
            </button>
            <div
              className="modal fade"
              id={`editable-image-${id}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label={t("_button.close")}
                    ></button>
                  </div>
                  <div className="modal-body text-center">
                    <img className="mw-100" src={data.fullImage.src} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <button onClick={handleEditClick} className="btn btn-light btn-sm">
          <span className="fa-solid fa-pencil cursor-pointer fa-xl"></span>
        </button>
        {deleteAllowed() && (
          <button onClick={onDelete} className="btn btn-light btn-sm">
            <span className="fa-solid fa-trash-can cursor-pointer fa-xl"></span>
          </button>
        )}
      </div>
    </div>
  );
}
