import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrationComponent } from './narration.component';

describe('NarrationComponent', () => {
  let component: NarrationComponent;
  let fixture: ComponentFixture<NarrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NarrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
