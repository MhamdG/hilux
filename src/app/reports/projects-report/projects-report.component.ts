import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-projects-report',
  templateUrl: './projects-report.component.html',
  styleUrls: ['./projects-report.component.css']
})
export class ProjectsReportComponent implements OnInit, AfterViewInit {
  @ViewChild('pivotContainer', { static: false }) pivotContainer: ElementRef;

  fromDate: string;
  toDate: string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Set default dates: To = Today, From = Last Month (same day)
    const today = new Date();
    this.toDate = today.toISOString().split('T')[0];

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    this.fromDate = lastMonth.toISOString().split('T')[0];
  }

  ngAfterViewInit(): void {
    this.getReport();
  }

  getReport(): void {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both From and To dates');
      return;
    }

    // Updated URL for Projects Report
    const url = `${environment.apiHost}/AjmanLandProperty/index.php/reportsGenerator/projectsReport?from=${this.fromDate}&to=${this.toDate}`;
    this.http.get<any[]>(url).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.initPivot(data);
        } else {
          console.error('API response is not an array', data);
          alert('Failed to load valid report data.');
        }
      },
      (error) => {
        console.error('Error fetching report:', error);
        alert('Error fetching report data. See console.');
      }
    );
  }

  initPivot(data: any[]): void {
    if (typeof $ !== 'undefined' && $.fn.pivotUI) {
      $(this.pivotContainer.nativeElement).empty();

      $(this.pivotContainer.nativeElement).pivotUI(data, {
        renderers: $.extend(
          $.pivotUtilities.renderers,
          $.pivotUtilities.c3_renderers,
          $.pivotUtilities.export_renderers
        ),
        rendererName: "Table"
      });
    } else {
      console.warn('pivottable library not loaded or jquery not found.');
    }
  }
}
