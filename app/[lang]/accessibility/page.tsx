import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to making Cunslt accessible to all users",
}

export default function AccessibilityPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>
          At Cunslt, we are committed to ensuring digital accessibility for people with disabilities. We are continually
          improving the user experience for everyone, and applying the relevant accessibility standards.
        </p>

        <h2>Conformance status</h2>
        <p>
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve
          accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and
          Level AAA. Cunslt is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts
          of the content do not fully conform to the accessibility standard.
        </p>

        <h2>Accessibility features</h2>
        <p>Cunslt includes the following accessibility features:</p>
        <ul>
          <li>Keyboard navigation support</li>
          <li>Screen reader compatibility</li>
          <li>Text resizing without loss of functionality</li>
          <li>Color contrast that meets WCAG 2.1 AA standards</li>
          <li>Alternative text for images</li>
          <li>Descriptive link text</li>
          <li>Consistent navigation</li>
          <li>Form labels and error messages</li>
          <li>Skip to content link</li>
          <li>ARIA attributes where appropriate</li>
          <li>Responsive design for various devices and screen sizes</li>
        </ul>

        <h2>Customization options</h2>
        <p>We provide several customization options to enhance accessibility:</p>
        <ul>
          <li>Reduced motion: Minimize animations and transitions</li>
          <li>High contrast mode: Increase contrast for better visibility</li>
          <li>Larger text: Increase text size for better readability</li>
          <li>Screen reader optimization: Enhanced compatibility with screen readers</li>
        </ul>
        <p>These options can be accessed via the accessibility settings button in the site header.</p>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of Cunslt. Please let us know if you encounter accessibility
          barriers:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:accessibility@cunslt.com">accessibility@cunslt.com</a>
          </li>
          <li>Phone: +1 (555) 123-4567</li>
          <li>Feedback form: Available in the Help section</li>
        </ul>
        <p>We try to respond to feedback within 2 business days.</p>

        <h2>Compatibility with browsers and assistive technology</h2>
        <p>Cunslt is designed to be compatible with the following assistive technologies:</p>
        <ul>
          <li>Screen readers (including NVDA, JAWS, VoiceOver, and TalkBack)</li>
          <li>Speech recognition software</li>
          <li>Screen magnifiers</li>
          <li>Keyboard-only navigation</li>
        </ul>
        <p>Cunslt is compatible with recent versions of major browsers, including:</p>
        <ul>
          <li>Chrome and Chrome for Android</li>
          <li>Firefox</li>
          <li>Safari and iOS Safari</li>
          <li>Edge</li>
        </ul>

        <h2>Technical specifications</h2>
        <p>
          Accessibility of Cunslt relies on the following technologies to work with the particular combination of web
          browser and any assistive technologies or plugins installed on your computer:
        </p>
        <ul>
          <li>HTML</li>
          <li>WAI-ARIA</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>
        <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

        <h2>Assessment approach</h2>
        <p>Cunslt has assessed the accessibility of our platform by the following approaches:</p>
        <ul>
          <li>Self-evaluation</li>
          <li>External evaluation</li>
          <li>User testing with assistive technologies</li>
        </ul>

        <h2>Limitations and alternatives</h2>
        <p>
          Despite our best efforts to ensure accessibility of Cunslt, there may be some limitations. Below is a
          description of known limitations, and potential solutions. Please contact us if you observe an issue not
          listed below.
        </p>
        <ul>
          <li>
            <strong>Video content:</strong> Some older video content may not have captions or audio descriptions. We are
            working to add these features to all video content.
          </li>
          <li>
            <strong>Third-party content:</strong> Some third-party content may not be fully accessible. We are working
            with our partners to improve accessibility.
          </li>
        </ul>

        <h2>Continuous improvement</h2>
        <p>
          We are committed to continually improving the accessibility of our platform. We will be conducting regular
          audits to identify and resolve any new accessibility barriers that are identified.
        </p>
      </div>
    </div>
  )
}

