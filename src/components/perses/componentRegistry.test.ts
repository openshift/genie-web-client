import { isPersesComponent, getPersesComponent } from './componentRegistry';

describe('componentRegistry', () => {
  describe('isPersesComponent', () => {
    it('returns true for PersesTimeSeries', () => {
      expect(isPersesComponent('PersesTimeSeries')).toBe(true);
    });

    it('returns true for PersesPieChart', () => {
      expect(isPersesComponent('PersesPieChart')).toBe(true);
    });

    it('returns false for an unregistered component name', () => {
      expect(isPersesComponent('UnknownComponent')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isPersesComponent('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isPersesComponent(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isPersesComponent(undefined)).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isPersesComponent(123)).toBe(false);
    });

    it('returns false for an object', () => {
      expect(isPersesComponent({ name: 'PersesTimeSeries' })).toBe(false);
    });

    it('returns false for an array', () => {
      expect(isPersesComponent(['PersesTimeSeries'])).toBe(false);
    });
  });

  describe('getPersesComponent', () => {
    it('returns a lazy component for PersesTimeSeries', () => {
      const component = getPersesComponent('PersesTimeSeries');

      expect(component).toBeDefined();
      expect(typeof component).toBe('object');
    });

    it('returns a lazy component for PersesPieChart', () => {
      const component = getPersesComponent('PersesPieChart');

      expect(component).toBeDefined();
      expect(typeof component).toBe('object');
    });

    it('returns different components for different component names', () => {
      const timeSeries = getPersesComponent('PersesTimeSeries');
      const pieChart = getPersesComponent('PersesPieChart');

      expect(timeSeries).not.toBe(pieChart);
    });

    it('returns the same component instance for the same component name', () => {
      const firstCall = getPersesComponent('PersesTimeSeries');
      const secondCall = getPersesComponent('PersesTimeSeries');

      expect(firstCall).toBe(secondCall);
    });
  });
});
