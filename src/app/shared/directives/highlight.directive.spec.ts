import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightDirective } from './highlight.directive';
import { Component } from '@angular/core';

@Component({
    template: '<div [appHighlight]="color" [appHighlightDelay]="delay">Test</div>'
})
class TestComponent {
    color = 'yellow';
    delay = 0;
}

describe('HighlightDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HighlightDirective, TestComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
    });

    it('should apply highlight color', () => {
        component.color = 'red';
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        expect(element.style.backgroundColor).toBe('red');
    });
});