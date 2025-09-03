import { PriorityPipe } from './priority.pipe';

describe('PriorityPipe', () => {
    let pipe: PriorityPipe;

    beforeEach(() => {
        pipe = new PriorityPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should translate low priority to "Faible"', () => {
        expect(pipe.transform('low')).toBe('Faible');
    });

    it('should translate medium priority to "Moyenne"', () => {
        expect(pipe.transform('medium')).toBe('Moyenne');
    });

    it('should translate high priority to "Haute"', () => {
        expect(pipe.transform('high')).toBe('Haute');
    });

    it('should return original value for unknown priority', () => {
        expect(pipe.transform('unknown')).toBe('unknown');
    });
});