import { CanvasLayout } from './CanvasLayout';
import { CanvasToolbar } from './CanvasToolbar';

/**
 * CanvasPreview – Demo of the layout-only Canvas toolbar (GIE-77).
 * Slot content (toggle, artifact switcher, time controls, etc.) is implemented in
 * GIE-78, GIE-340, GIE-342, GIE-344, GIE-346.
 */
export const CanvasPreview: React.FC = () => {
  return (
    <CanvasLayout
      toolbar={
        <CanvasToolbar
          left={<span className="pf-v6-u-font-weight-bold">Left slot</span>}
          center={<span>Center slot</span>}
          right={<span>Right slot</span>}
        />
      }
      footer={
        <div className="pf-v6-u-p-md pf-v6-u-text-align-center">
          <span>Canvas Footer (sticky)</span>
        </div>
      }
    >
      <div className="pf-v6-u-p-lg">
        <h2 className="pf-v6-u-mb-md">Canvas content</h2>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} className="pf-v6-u-mb-md">
            Content paragraph {i + 1} – Scroll to test sticky toolbar behavior.
          </p>
        ))}
      </div>
    </CanvasLayout>
  );
};
