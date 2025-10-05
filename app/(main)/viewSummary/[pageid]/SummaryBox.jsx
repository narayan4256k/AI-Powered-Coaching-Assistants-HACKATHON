import React from "react";
import Markdown from "react-markdown";

function SummaryBox({ summary }) {
  return (
    <div className="text-base/relaxed overflow-y-auto h-[65vh]">
      <Markdown >{summary}</Markdown>
    </div>
  );
}

export default SummaryBox;
