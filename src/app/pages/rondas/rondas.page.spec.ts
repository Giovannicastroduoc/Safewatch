import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RondasPage } from './rondas.page';

describe('RondasPage', () => {
  let component: RondasPage;
  let fixture: ComponentFixture<RondasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RondasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
