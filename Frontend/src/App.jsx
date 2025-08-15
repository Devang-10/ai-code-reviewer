import { useState } from "react";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js";
import axios from "axios";
import "highlight.js/styles/github-dark.css";
import "./App.css";

// Icons for the UI
import {
  Sparkles,
  Clipboard,
  Check,
  AlertTriangle,
  XCircle,
  Info,
  Wand2,
} from "lucide-react";

// A component to render severity icons
const SeverityIcon = ({ severity }) => {
  if (severity === "critical")
    return <XCircle className="issue-icon critical" size={20} />;
  if (severity === "warning")
    return <AlertTriangle className="issue-icon warning" size={20} />;
  return <Info className="issue-icon info" size={20} />;
};

function App() {
  const [code, setCode] = useState(
    `// Paste your code here to get an AI review`
  );
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Renamed state for clarity and added one for the refactored code
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isRefactoredCopied, setIsRefactoredCopied] = useState(false);

  // Modified handler to copy different texts and manage separate states
  const handleCopy = (textToCopy, type) => {
    navigator.clipboard.writeText(textToCopy);
    if (type === "input") {
      setIsInputCopied(true);
      setTimeout(() => setIsInputCopied(false), 2000);
    } else {
      setIsRefactoredCopied(true);
      setTimeout(() => setIsRefactoredCopied(false), 2000);
    }
  };

  async function reviewCode() {
    if (!code.trim()) {
      setReview({
        summary: "Please enter some code to review.",
        issues: [],
        refactoredCode: "",
      });
      return;
    }
    setLoading(true);
    setReview(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/get-review`, {
        code,
      });
      setReview(response.data);
    } catch (error) {
      setReview({
        summary: "Error while fetching review. Please try again later.",
        issues: [
          {
            severity: "critical",
            title: "API Error",
            description: "Could not connect to the review service.",
          },
        ],
        refactoredCode: "",
      });
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
            <button
              onClick={() => handleCopy(code, "input")}
              className="copy-btn"
              title="Copy code"
            >
              {isInputCopied ? (
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

        {loading && (
          <div className="panel skeleton-panel">
            <div className="skeleton-line large"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line medium"></div>
          </div>
        )}

        {review && !loading && (
          <div className="review-results">
            {review.summary && (
              <div className="review-summary">
                <Info size={20} /> <p>{review.summary}</p>
              </div>
            )}

            {review.issues && review.issues.length > 0 && (
              <div className="issues-section">
                <h3>Identified Issues</h3>
                {review.issues.map((issue, index) => (
                  <div key={index} className={`issue-card ${issue.severity}`}>
                    <SeverityIcon severity={issue.severity} />
                    <div className="issue-details">
                      <h4 className="issue-title">{issue.title}</h4>
                      <p className="issue-description">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {review.refactoredCode && (
              <div className="panel refactored-code-container">
                <div className="panel-header">
                  <h3>
                    <Wand2 size={16} style={{ marginRight: "8px" }} />{" "}
                    Recommended Fix
                  </h3>
                  {/* The new copy button for the recommended fix */}
                  <button
                    onClick={() =>
                      handleCopy(review.refactoredCode, "refactored")
                    }
                    className="copy-btn"
                    title="Copy refactored code"
                  >
                    {isRefactoredCopied ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <Clipboard size={16} />
                    )}
                  </button>
                </div>
                <Editor
                  value={review.refactoredCode}
                  onValueChange={() => {}}
                  highlight={(code) => hljs.highlightAuto(code).value}
                  padding={16}
                  readOnly
                  className="code-editor"
                  style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: 16,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
