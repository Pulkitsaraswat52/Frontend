import React from "react";

function EncodingBox({ encoding }) {
  if (!encoding) return null;

  return (
    <div className="encodingBox">
      <h4>Encoding (first 5 values):</h4>
      <p>
        {encoding
          .slice(0, 5)
          .map((v) => v.toFixed(4))
          .join(", ")}
      </p>
    </div>
  );
}

export default EncodingBox;
