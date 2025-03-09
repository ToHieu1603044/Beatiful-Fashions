import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DescriptionEditor = ({ product, setProduct }) => {
  return (
    <ReactQuill
      theme="snow"
      value={product.description}
      onChange={(value) => setProduct({ ...product, description: value })}
    />
  );
};

export default DescriptionEditor;
