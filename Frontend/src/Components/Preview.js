import React from "react";
import EncodingBox from "./EncodingBox";

function Preview({
  capturedImage,
  encoding,
  isSubmitted,
  handleSubmit,
  handleUpdate,
  handleDelete,
  handleRetake,
}) {
  return (
    <div className="previewBox">
      <img src={capturedImage} alt="Captured" className="image" />
      <div className="buttonGroup">
        {!isSubmitted && (
          <button className="button" onClick={handleSubmit}>
            Submit
          </button>
        )}
        <button className="button" onClick={handleUpdate}>
          Update
        </button>
        <button className="button" onClick={handleDelete}>
          Delete
        </button>
        <button className="button" onClick={handleRetake}>
          Retake
        </button>
      </div>
      <EncodingBox encoding={encoding} />
    </div>
  );
}

export default Preview;
