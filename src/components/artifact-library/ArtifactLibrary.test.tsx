import { waitFor } from '@testing-library/react';
import { render, screen } from '../../unitTestUtils';
import { ArtifactLibrary } from './ArtifactLibrary';
import * as ArtifactLib from './ArtifactLibrary';

let fetchMock: jest.SpyInstance;

beforeEach(() => {
  fetchMock = jest.spyOn(ArtifactLib.artifactApi, 'fetchArtifacts').mockResolvedValue([]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ArtifactLibrary', () => {
  it('renders empty state heading', async () => {
    render(<ArtifactLibrary />);
    expect(
      await screen.findByRole('heading', {
        name: /start something extraordinary\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders empty state description', async () => {
    render(<ArtifactLibrary />);
    expect(
      await screen.findByText(
        /everything you create with genie — charts or others share with you will live here/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders primary CTA button', async () => {
    render(<ArtifactLibrary />);
    const primaryCta = await screen.findByRole('button', { name: /create a dashboard/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toBeEnabled();
  });

  it('renders secondary CTA button', async () => {
    render(<ArtifactLibrary />);
    const secondaryCta = await screen.findByRole('button', { name: /code a config file/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toBeEnabled();
  });

  it('renders empty state within the component', async () => {
    const { container } = render(<ArtifactLibrary />);
    await screen.findByRole('heading', { name: /start something extraordinary\./i });
    const emptyState = container.querySelector('.pf-v6-c-empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  it('uses EmptyState component with large variant', async () => {
    const { container } = render(<ArtifactLibrary />);
    await screen.findByRole('heading', { name: /start something extraordinary\./i });
    const emptyState = container.querySelector('.pf-v6-c-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('pf-m-lg');
  });

  it('renders CTAs with correct accessibility attributes', async () => {
    render(<ArtifactLibrary />);
    const primaryCta = await screen.findByRole('button', { name: /create a dashboard/i });
    const secondaryCta = await screen.findByRole('button', { name: /code a config file/i });

    expect(primaryCta).toHaveAccessibleName();
    expect(secondaryCta).toHaveAccessibleName();
  });
  it('renders error alert with heading and retry', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    render(<ArtifactLibrary />);
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /could not load artifacts\./i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/a problem occurred while retrieving your library artifacts\./i),
    ).toBeInTheDocument();
    const retry = await screen.findByRole('button', { name: /retry/i });
    expect(retry).toBeInTheDocument();
  });

  it('moves focus to the Retry button when error is visible', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    render(<ArtifactLibrary />);
    const retry = await screen.findByRole('button', { name: /retry/i });
    await waitFor(() => expect(retry).toHaveFocus());
  });
});
