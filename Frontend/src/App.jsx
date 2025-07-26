import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import hljs from "highlight.js";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [code, setCode] = useState(``);

  const [review, setReview] = useState(``);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/get-review`, {
        code,
      });
      setReview(response.data);
    } catch (error) {
      setReview("❌ Error while fetching review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main>
        <div className="left">
          <div
            className="header"
            style={{
              backgroundColor: "#0c0c0c",
              textAlign: "center",
              fontSize: "1.2rem",
              padding: "1rem",
            }}
          >
            <i>Your code goes here </i>
          </div>
          {
            <div className="code-scroll-wrapper">
              <div className="code">
                <Editor
                  value={code}
                  onValueChange={(code) => setCode(code)}
                  highlight={(code) => {
                    const result = hljs.highlightAuto(code);
                    return result.value;
                  }}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 18,
                    minHeight: "100%",
                    width: "100%",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                />
              </div>
            </div>
          }
          <div onClick={reviewCode} className="review">
            Review
          </div>
        </div>
        <div onClick={!loading ? reviewCode : undefined} className="review">
          {loading ? (
            <span>
              <span className="spinner"></span>Loading...
            </span>
          ) : (
            ""
          )}
        </div>

        <div className="right">
          <div
            className="header"
            style={{
              backgroundColor: "#343434",
              textAlign: "center",
              fontSize: "1.2rem",
              padding: "0.2rem",
            }}
          >
            <i>AI Review</i>
          </div>
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </main>
    </>
  );
}

export default App;
