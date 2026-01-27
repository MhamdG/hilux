import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
    selector: 'app-units-report',
    templateUrl: './units-report.component.html',
    styleUrls: ['./units-report.component.css']
})
export class UnitsReportComponent implements OnInit, AfterViewInit {
    @ViewChild('pivotContainer', { static: false }) pivotContainer: ElementRef;

    // Filter Models
    selectedProjects: any[] = [];
    selectedDeveloper: any;

    // Search Mock Data / Observables
    projects$: Observable<any[]>;
    projectsInput$ = new Subject<string>();
    projectsLoading = false;

    developers$: Observable<any[]>;
    developersInput$ = new Subject<string>();
    developersLoading = false;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadProjects();
        this.loadDevelopers();
    }

    ngAfterViewInit(): void {
        // Optionally load empty report or wait for user interaction
    }

    private loadProjects() {
        this.projects$ = concat(
            of([]), // default items
            this.projectsInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => this.projectsLoading = true),
                switchMap(term => this.getProjects(term).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.projectsLoading = false)
                ))
            )
        );
    }

    private loadDevelopers() {
        this.developers$ = concat(
            of([]), // default items
            this.developersInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => this.developersLoading = true),
                switchMap(term => this.getDevelopers(term).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.developersLoading = false)
                ))
            )
        );
    }

    getProjects(term: string = ''): Observable<any[]> {
        if (!term) return of([]);
        return this.http.get<any[]>(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/allProjects?term=${term}`).pipe(
            map(response => response.map(item => ({ id: item.key, nameAr: item.value.ar })))
        );
    }

    getDevelopers(term: string = ''): Observable<any[]> {
        if (!term) return of([]);
        return this.http.get<any[]>(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/developersAll?term=${term}`).pipe(
            map(response => response.map(item => ({ id: item.key, nameAr: item.value.ar })))
        );
    }

    reportData: any[] = [];

    getReport(): void {
        let params = [];

        if (this.selectedProjects && this.selectedProjects.length > 0) {
            const projectIds = this.selectedProjects.join(',');
            params.push(`projectId=${projectIds}`);
        }

        if (this.selectedDeveloper) {
            const devId = this.selectedDeveloper.id || this.selectedDeveloper;
            params.push(`developerId=${devId}`);
        }

        if (params.length === 0) {
            alert('Please select a Project or a Developer');
            return;
        }

        const queryString = params.join('&');
        const url = `${environment.apiHost}/AjmanLandProperty/index.php/reportsGenerator/unitsReport?${queryString}`;

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
                rendererName: "Table"
            });
        } else {
            console.warn('pivottable library not loaded or jquery not found.');
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
            reportName: 'UnitsReport',
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

        const url = `${environment.apiHost}/AjmanLandProperty/index.php/reportsGenerator/getConfig?reportName=UnitsReport`;
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
