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
        <p>This is the main content area.</p>
      </div>
    </CanvasLayout>
  );
};

