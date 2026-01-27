import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsReportComponent } from './projects-report.component';

describe('ProjectsReportComponent', () => {
  let component: ProjectsReportComponent;
  let fixture: ComponentFixture<ProjectsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
