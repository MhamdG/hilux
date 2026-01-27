import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsReportComponent } from './units-report.component';

describe('UnitsReportComponent', () => {
  let component: UnitsReportComponent;
  let fixture: ComponentFixture<UnitsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
