import { useState } from "react";
import Editor from "react-simple-code-editor";
import Markdown from "react-markdown";
import hljs from "highlight.js";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";

// Import styles
import "highlight.js/styles/github-dark.css";
import "./App.css";

// Import icons: Clipboard for copy, Check for success
import { Sparkles, Clipboard, Check } from "lucide-react";

function App() {
  const [code, setCode] = useState(
    `// Paste your code here to get an AI review`
  );
  const [review, setReview] = useState(``);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // New state for copy button

  // New function to handle copying code
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  async function reviewCode() {
    if (!code.trim()) {
      setReview("Please enter some code to review.");
      return;
    }
    setLoading(true);
    setReview("");
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/get-review`, {
        code,
      });
      setReview(response.data);
    } catch (error) {
      setReview("❌ Error while fetching review. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Code Reviewer</h1>
        <p>
          Get instant feedback on your code quality, style, and performance.
        </p>
      </header>

      <main className="main-content">
        <div className="panel editor-container">
          <div className="panel-header">
            <h3>Your Code</h3>
            {/* New Copy Button */}
            <button onClick={handleCopy} className="copy-btn" title="Copy code">
              {isCopied ? (
                <>
                  <Check size={16} /> Copied!
                </>
              ) : (
                <Clipboard size={16} />
              )}
            </button>
          </div>
          <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => hljs.highlightAuto(code).value}
            padding={16}
            className="code-editor"
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 16,
              outline: 0,
            }}
          />
        </div>

        <button onClick={reviewCode} className="review-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Analyze Code</span>
            </>
          )}
        </button>

        {(review || loading) && (
          <div className="panel review-container">
            <div className="panel-header">
              <h3>AI Review</h3>
            </div>
            <div className="review-content">
              {loading && !review ? (
                <div className="skeleton-loader">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              ) : (
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
