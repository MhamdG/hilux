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

  reportData: any[] = [];

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
          this.reportData = data;
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
        rendererName: "Table",
        rows: [
          "رقم قيد المشروع",
          "اسم المطور العقاري",
          "مطور رئيسي / فرعي",
          "اسم مشروع التطوير العقاري باللغة العربية",
          "اسم مشروع التطوير العقاري باللغة الانجليزية",
          "مشروع رئيسي / فرعي",
          "المشروع الرئيسي",
          "الحي",
          "تاريخ تسجيل المشروع",
          "تاريخ انتهاء شهادة القيد",
          "رقم الأرض",
          "القطاع",
          "نوع المشروع",
          "حالة المشروع",
          "تاريخ بداية الجدول الزمني المعتمد",
          "تاريخ انتهاء الجدول الزمني المعتمد",
          "خط الطول",
          "خط العرض",
          "عدد الوحدات"
        ]
      });
    } else {
      console.warn('pivottable library not loaded or jquery not found.');
      alert('Pivottable library not loaded');
    }
  }

  saveConfig(): void {
    if (typeof $ === 'undefined') return;

    const config = $(this.pivotContainer.nativeElement).data("pivotUIOptions");
    // Deep copy to avoid modifying the active config
    const config_copy = JSON.parse(JSON.stringify(config));

    // delete properties that cannot be serialized
    delete config_copy["aggregators"];
    delete config_copy["renderers"];

    const body = {
      reportName: 'ProjectsReport',
      config: config_copy
    };

    const url = `${environment.apiHost}/AjmanLandProperty/index.php/reportsGenerator/saveConfig`;
    this.http.post<any>(url, body).subscribe(
      (res) => {
        if (res.status === 'success') {
          alert('Configuration Saved!');
        } else {
          alert('Failed to save config: ' + res.message);
        }
      },
      (err) => {
        console.error(err);
        alert('Error saving configuration.');
      }
    );
  }

  restoreConfig(): void {
    if (typeof $ === 'undefined') return;

    const url = `${environment.apiHost}/AjmanLandProperty/index.php/reportsGenerator/getConfig?reportName=ProjectsReport`;
    this.http.get<any>(url).subscribe(
      (res) => {
        if (res.status === 'success' && res.config && this.reportData && this.reportData.length > 0) {
          const config = res.config;
          $(this.pivotContainer.nativeElement).pivotUI(this.reportData, config, true);
        } else if (res.status === 'success' && !res.config) {
          alert('No saved configuration found.');
        } else {
          alert('Error loading configuration or no data available.');
        }
      },
      (err) => {
        console.error(err);
        alert('Error loading configuration.');
      }
    );
  }
}
