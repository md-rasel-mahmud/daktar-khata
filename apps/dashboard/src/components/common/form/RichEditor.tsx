"use client";

import React, { useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

function RichEditor({
  value,
  onChange,
  active = true, // track if tab is active
  ...props
}: {
  value: string;
  onChange?: (content: string) => void;
  active?: boolean;
}) {
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    if (active) {
      // ✅ simulate resize to fix toolbar rendering
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100); // let DOM paint first
    }
  }, [active]);

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={(content) => {
          if (onChange) onChange(content);
        }}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link"],
            ["clean"],
          ],
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "color",
          "background",
          "script",
          "list",
          "bullet",
          "indent",
          "align",
          "blockquote",
          "code-block",
          "link",
          "clean",
        ]}
        {...props}
        className="custom-quill"
      />
    </div>
  );
}

export default RichEditor;
