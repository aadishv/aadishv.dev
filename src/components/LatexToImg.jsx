import React, { useState, useEffect, useRef } from "react";
import katex from "katex";

export default function LatexToImageApp() {
  const [latex, setLatex] = useState("\\text{Your equation here}");
  const [imageUrl, setImageUrl] = useState("");
  const [format, setFormat] = useState("svg"); // Default to SVG
  const previewRef = useRef(null);

  // Update the image URL and render LaTeX preview
  useEffect(() => {
    if (!previewRef.current) return;

    // Generate URL with selected format
    const value =
      latex.trim().length === 0 ? "\\text{Your equation here}" : latex;
    const url = `https://latex.codecogs.com/${format}.image?${encodeURIComponent(value)}`;
    setImageUrl(url);

    // Clear previous content before rendering
    previewRef.current.innerHTML = "";

    // Render KaTeX with only MathML output
    try {
      katex.render(value, previewRef.current, {
        displayMode: true,
        throwOnError: false,
        output: "mathml", // Specify MathML as the only output format
      });
    } catch (e) {
      previewRef.current.textContent = e.message;
    }
  }, [latex, format]);

  // Copy functions
  const copyImageUrl = async () => {
    await navigator.clipboard.writeText(imageUrl);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(`![LaTeX image](${imageUrl})`);
  };

  return (
    <div className="m-8">
      <div className="rounded-lg border-2 border-header p-6">
        <h1 className="mb-4 font-lora text-3xl text-header">LaTeX to Image</h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="Type LaTeX here"
            className="w-full border-b-2 border-header p-2 font-mono text-xl focus:border-header focus:outline-none"
          />

          <div className="flex items-center gap-4">
            <span className="font-lora text-lg">Format:</span>
            <div className="inline-flex rounded-md border-2 border-header font-mono">
              {["svg", "png", "gif"].map((formatOption) => (
                <button
                  key={formatOption}
                  className={`px-4 py-2 text-center uppercase ${
                    format === formatOption
                      ? "bg-header text-white"
                      : "bg-white hover:bg-gray-100"
                  } ${formatOption === "svg" ? "rounded-l" : ""} ${formatOption === "gif" ? "rounded-r" : ""}`}
                  onClick={() => setFormat(formatOption)}
                  style={{
                    borderRight:
                      formatOption !== "gif" ? "2px solid #CBD5E0" : "none",
                  }}
                >
                  {formatOption}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <a
              href={imageUrl}
              className="block break-all font-mono text-header underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {imageUrl}
            </a>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={copyImageUrl}
              className="border-b-2 border-header2 p-2 font-lora text-xl hover:border-header"
            >
              Copy image URL
            </button>
            <button
              onClick={copyMarkdown}
              className="border-b-2 border-header2 p-2 font-lora text-xl hover:border-header"
            >
              Copy image Markdown
            </button>
          </div>

          <div className="mt-4 overflow-auto rounded-lg border-2 border-header p-4 text-xl">
            <div ref={previewRef} className="flex items-center overflow-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
