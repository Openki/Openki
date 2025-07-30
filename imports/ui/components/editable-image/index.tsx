/* eslint-disable no-nested-ternary */
import React, { useState, DragEvent, ChangeEvent } from "react";
import ImageBlobReduce from "image-blob-reduce";
import { useTranslation } from "react-i18next";
import mimeDb from "mime-db";

import * as Alert from "/imports/api/alerts/alert";

import { ButtonCancel, ButtonSave, ButtonDelete } from "../buttons";

import "./styles.scss";

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
  const div = document.createElement("div");
  return "draggable" in div || ("ondragstart" in div && "ondrop" in div);
})();

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export interface UploadImage {
  lastModified: Date;
  name: string;
  size: number;
  mimeType: string;
  /** As BinaryString */
  content: string;
}

export interface Data {
  /** max allowed image size max*max */
  maxSize?: number | undefined;
  thumbnail?: { src?: string | undefined; maxSize?: number | undefined } | undefined;
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
        mimeType: string;
        content: string;
      }
    | undefined
  >(undefined);
  const [progress, setProgress] = useState("display");
  const [copyRights, setCopyRights] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const id = createId();

  async function onDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      Alert.error(t("editableImage.accept.error", "Only images are allowed."));
      return;
    }

    let rezisedFile: Blob;
    if (data.maxSize) {
      try {
        rezisedFile = await new ImageBlobReduce({
          pica: ImageBlobReduce.pica({ features: ["js", "wasm"] }),
        }).toBlob(file, { max: data.maxSize });
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.info(
          `Some browsers do not support this. It is okay to use the original. Errormessage: ${ex}`,
        );
        rezisedFile = file;
      }
    } else {
      rezisedFile = file;
    }

    {
      const reader = new FileReader();
      reader.onload = () => {
        let name = file.name;
        // handle if resizing changed file type
        const fileExtension = mimeDb[rezisedFile.type]?.extensions?.[0];
        if (fileExtension) {
          name = changeExt(name, fileExtension);
        }

        setDroppedFile({
          lastModified: new Date(file.lastModified),
          name,
          size: file.size,
          mimeType: file.type,
          content: reader.result as string,
        });

        setCopyRights(false);
        setProgress("ready");
      };
      reader.readAsDataURL(rezisedFile);
    }

    {
      const reader = new FileReader();
      reader.onload = function () {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(rezisedFile);
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
    return data.onDelete;
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

  function handleEditClick(event: any) {
    event.preventDefault();

    setProgress("edit");
  }

  return progress !== "display" ? (
    <>
      <form
        encType="multipart/form-data"
        noValidate
        className={`text-center editable-image${supportsDragndrop ? " supports-dragndrop" : ""}${
          dragover ? " is-dragover" : ""
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
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
              <i className="fa-regular fa-image fa-5x" aria-hidden="true"></i>
            )}
          </div>
          {dragover ? (
            <div className="editable-image-drop">
              {t("fileUpload.drop.text", "Drop it like it's hot!")}
            </div>
          ) : progress === "edit" ? (
            <>
              {" "}
              <span className="btn btn-secondary">
                {t("fileUpload.choose.text", "Choose a file")}
              </span>
              {supportsDragndrop && (
                <>
                  <br />
                  <span className="editable-image-dragndrop">
                    {t("fileUpload.drag.text", "or drag it here")}
                  </span>
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
          <div className="form-check text-start">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="editableImageCopyRights"
              checked={copyRights}
              onChange={(event) => {
                setCopyRights(event.currentTarget.checked);
              }}
            />
            <label className="form-check-label" htmlFor="editableImageCopyRights">
              {t("fileUpload.copyrights", "I have the copy rights to publish that file.")}
            </label>
          </div>
        )}
      </form>
      <div className="editable-image-controls">
        {progress === "ready" ? (
          <ButtonSave {...uploadButtonAttributes()} />
        ) : deleteAllowed() ? (
          <ButtonDelete onClick={onDelete} />
        ) : null}{" "}
        <ButtonCancel onClick={onCancel} />
      </div>
    </>
  ) : (
    <div>
      {data.thumbnail?.src ? (
        <img
          className="cursor-pointer img-thumbnail"
          {...thumbnailAttributes()}
          src={data.thumbnail.src}
          onClick={handleEditClick}
        />
      ) : (
        <i
          className="fa-regular fa-image fa-5x cursor-pointer"
          aria-hidden="true"
          onClick={handleEditClick}
        ></i>
      )}{" "}
      <span
        className="align-top fa-solid fa-pencil cursor-pointer"
        onClick={handleEditClick}
      ></span>
      {!!data.thumbnail?.src && (
        <>
          {" "}
          <span
            className="align-top fa-solid fa-eye cursor-pointer js-editable-image-show"
            data-bs-toggle="modal"
            data-bs-target={`#editable-image-${id}`}
          ></span>
          <div className="modal fade" id={`editable-image-${id}`} tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img className="mw-100" src={data.thumbnail.src} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
