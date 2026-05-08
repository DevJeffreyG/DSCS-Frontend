import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestChangesComponent } from './latest-changes.component';

describe('LatestChangesComponent', () => {
  let component: LatestChangesComponent;
  let fixture: ComponentFixture<LatestChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestChangesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
