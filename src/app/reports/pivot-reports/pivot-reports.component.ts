import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var $: any;

@Component({
    selector: 'app-pivot-reports',
    templateUrl: './pivot-reports.component.html',
    styleUrls: ['./pivot-reports.component.css']
})
export class PivotReportsComponent implements OnInit, AfterViewInit {
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
        // Optionally load report on load, or wait for user input.
        // For now, let's load it on load to show something (or valid date period)
        this.getReport();
    }

    getReport(): void {
        if (!this.fromDate || !this.toDate) {
            alert('Please select both From and To dates');
            return;
        }

        const url = `http://wfe.ajre.gov.test/AjmanLandProperty/index.php/PropertiesOwnersReport?from=${this.fromDate}&to=${this.toDate}`;
        this.http.get<any[]>(url).subscribe(
            (data) => {
                if (Array.isArray(data)) {
                    this.initPivot(data);
                } else {
                    console.error('API response is not an array', data);
                    // Handle case where API might return { error: ... } or other format
                    // For now, try to pivot whatever we got if compatible, or alert
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
            // Clear existing if any
            $(this.pivotContainer.nativeElement).empty();

            $(this.pivotContainer.nativeElement).pivotUI(data, {
                // Let pivotUI auto-detect fields from the new data
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
