"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MdxProps {
  content: string
}

export function Mdx({ content }: MdxProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mt-8 mb-4 text-2xl font-bold" {...props} />,
        h3: ({ node, ...props }) => <h3 className="mt-6 mb-4 text-xl font-bold" {...props} />,
        h4: ({ node, ...props }) => <h4 className="mt-6 mb-4 text-lg font-bold" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
        ul: ({ node, ...props }) => <ul className="mb-4 ml-6 list-disc" {...props} />,
        ol: ({ node, ...props }) => <ol className="mb-4 ml-6 list-decimal" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="mb-4 border-l-4 border-primary pl-4 italic" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="mb-4 rounded-md"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="rounded-md bg-muted px-1 py-0.5 font-mono text-sm" {...props}>
              {children}
            </code>
          )
        },
        table: ({ node, ...props }) => (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border border-muted bg-muted px-4 py-2 text-left font-bold" {...props} />
        ),
        td: ({ node, ...props }) => <td className="border border-muted px-4 py-2" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-6 border-muted" {...props} />,
        img: ({ node, ...props }) => <img className="mb-4 max-w-full rounded-md" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

