"use client";

import { useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = async () => {
      setLoading(true);

      const base64 = (reader.result as string).split(",")[1];

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: file.name,
          password,
        }),
      });

      const data = await res.json();

      if (data.url) {
        setUrl(data.url);
      } else {
        alert(data.error);
      }

      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>GitPix</h1>

      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      <br /><br />

      {loading && <p>Uploading...</p>}

      {url && (
        <div>
          <p>URL:</p>
          <a href={url} target="_blank">{url}</a>
          <br />
          <button onClick={() => navigator.clipboard.writeText(url)}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}