import { useState } from 'react';
import { CanvasLayout } from './CanvasLayout';
import { CanvasToolbar, ArtifactOption } from './CanvasToolbar';

/**
 * CanvasPreview - Demo component showing how to use the reusable CanvasToolbar
 * with different artifact types (Dashboard in this example).
 */
export const CanvasPreview: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ArtifactOption[]>([
    { id: '1', name: 'OpenShift Cluster Health & Utilization Monitor' },
    { id: '2', name: 'Node Performance Dashboard' },
    { id: '3', name: 'Application Metrics Overview' },
  ]);

  const [selectedArtifactId, setSelectedArtifactId] = useState('1');
  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId);
  const [title, setTitle] = useState(
    selectedArtifact?.name || 'OpenShift Cluster Health & Utilization Monitor',
  );
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(true);

  // update title when artifact is selected
  const handleArtifactSelect = (artifactId: string) => {
    setSelectedArtifactId(artifactId);
    const artifact = artifacts.find((a) => a.id === artifactId);
    if (artifact) {
      setTitle(artifact.name);
    }
  };

  // update artifact name when title is renamed
  const handleArtifactRename = (artifactId: string, newName: string) => {
    setArtifacts((prev) =>
      prev.map((artifact) =>
        artifact.id === artifactId ? { ...artifact, name: newName } : artifact,
      ),
    );
    setTitle(newName);
  };

  return (
    <CanvasLayout
      toolbar={
        <CanvasToolbar
          title={title}
          onTitleChange={setTitle}
          onAction={(action) => {
            if (action === 'TOGGLE_CANVAS') {
              setIsCanvasExpanded((prev) => !prev);
            }
            console.log('Canvas action:', action);
          }}
          isCanvasExpanded={isCanvasExpanded}
          artifacts={artifacts}
          selectedArtifactId={selectedArtifactId}
          onArtifactSelect={handleArtifactSelect}
          onArtifactRename={handleArtifactRename}
          collapseAt={600}
        />
      }
      footer={
        <div className="pf-v6-u-p-md pf-v6-u-text-align-center">
          <span>Canvas Footer (sticky)</span>
        </div>
      }
    >
      <div className="pf-v6-u-p-lg">
        <h2 className="pf-v6-u-mb-md">Dashboard: {title}</h2>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} className="pf-v6-u-mb-md">
            Content paragraph {i + 1} - Scroll to test sticky toolbar behavior.
          </p>
        ))}
      </div>
    </CanvasLayout>
  );
};
