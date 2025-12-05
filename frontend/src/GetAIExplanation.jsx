import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GetAIExplanation({ explanation, loading }) {
  return (
    <div className="explain--block bg-purple-700/40 backdrop-blur-md shadow-xl p-8 rounded-2xl mt-6 border border-purple-300/30">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        AI Explanation
      </h2>

      {loading ? (
        <p className="text-purple-100 text-center">Loading explanation...</p>
      ) : (
        <div className="prose prose-invert prose-headings:text-white prose-strong:text-white prose-li:text-purple-100 prose-p:text-purple-100 max-w-none text-purple-100 text-lg leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {explanation || "No explanation available."}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
