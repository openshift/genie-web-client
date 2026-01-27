import { CanvasLayout } from './CanvasLayout';
import { CanvasToolbar } from './CanvasToolbar';

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
