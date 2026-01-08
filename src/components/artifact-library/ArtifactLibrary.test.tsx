import { render, screen } from '../../unitTestUtils';
import { ArtifactLibrary } from './ArtifactLibrary';

describe('ArtifactLibrary', () => {
  it('renders empty state heading', () => {
    render(<ArtifactLibrary />);
    expect(
      screen.getByRole('heading', {
        name: /start something extraordinary\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders empty state description', () => {
    render(<ArtifactLibrary />);
    expect(
      screen.getByText(
        /everything you create with genie — charts or others share with you will live here/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders primary CTA button', () => {
    render(<ArtifactLibrary />);
    const primaryCta = screen.getByRole('button', { name: /create a dashboard/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toBeEnabled();
  });

  it('renders secondary CTA button', () => {
    render(<ArtifactLibrary />);
    const secondaryCta = screen.getByRole('button', { name: /code a config file/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toBeEnabled();
  });

  it('renders empty state within the component', () => {
    const { container } = render(<ArtifactLibrary />);
    const emptyState = container.querySelector('.pf-v6-c-empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  it('uses EmptyState component with large variant', () => {
    const { container } = render(<ArtifactLibrary />);
    const emptyState = container.querySelector('.pf-v6-c-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('pf-m-lg');
  });

  it('renders CTAs with correct accessibility attributes', () => {
    render(<ArtifactLibrary />);
    const primaryCta = screen.getByRole('button', { name: /create a dashboard/i });
    const secondaryCta = screen.getByRole('button', { name: /code a config file/i });

    expect(primaryCta).toHaveAccessibleName();
    expect(secondaryCta).toHaveAccessibleName();
  });
});
