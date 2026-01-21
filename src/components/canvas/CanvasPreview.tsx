import { CanvasLayout } from './CanvasLayout';

export const CanvasPreview: React.FC = () => {
  return (
    <CanvasLayout
      toolbar={
        <div className="pf-v6-u-p-md">
          <span className="pf-v6-u-font-weight-bold">Canvas Toolbar (sticky)</span>
        </div>
      }
      footer={
        <div className="pf-v6-u-p-md pf-v6-u-text-align-center">
          <span>Canvas Footer (sticky)</span>
        </div>
      }
    >
      <div className="pf-v6-u-p-lg">
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} className="pf-v6-u-mb-md">
            Content paragraph {i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Scroll to test sticky behavior.
          </p>
        ))}
      </div>
    </CanvasLayout>
  );
};

