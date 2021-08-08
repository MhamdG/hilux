import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { FieldsService } from '../shared/fields.service';
import { LookupsService } from '../shared/lookups.service';
import * as _ from 'lodash';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import permissionList from '../permission';

interface SearchParams {
  query?: string;
  filter?: string;
}

@Component({
  selector: 'app-units-excel-upload',
  templateUrl: './units-excel-upload.component.html',
  styleUrls: ['./units-excel-upload.component.css']
})
export class UnitsExcelUploadComponent implements OnInit {
  formData: any = {};
  uploadData:any = {};
  filterData: any = { meterTotalSoldArea: '', registrationStatus: 'All', unitNumber: ''};
  formErrors: any = {};
  currentSearchParams: SearchParams = {};
  paramsSubscription = new Subscription();
  results = [];
  developerOptions: Observable<any>;
  projectsOptions: Observable<any>;
  developerDataOptionsLoading = false;
  developerSearchInput$ = new Subject<string>();
  projectsSearchInput$ = new Subject<string>();
  projectDataOptionsLoading = false;
  landDataOptionsLoading = false;
  landSearchInput$ = new Subject<string>();
  unitsOptions: Observable<any>;
  unitsDataOptionsLoading = false;
  unitsSearchInput$ = new Subject<string>();

  response: any;
  minDate:any;
  uploadedFile: any;
  registrationTypeOptions: any;
  unitNumberOptions: any;
  meterTotalSoldAreaOptions: any;
  unitTypesOptions: any;
  userRole: any;
  roles$: object;

  @ViewChild('controlLabel') controlLabel: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldsService: FieldsService,
    private http: HttpClient,
    private toastr: ToastrService,
    private lookupsService: LookupsService
  ) { }

  ngOnInit(): void {
    this.roles$ = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/getUserRights`)
    .subscribe((res) => {
      this.userRole = res;
      var checkFlag = this.checkRole('RealEstateUnitsScreen.view');
      if (!checkFlag) {
        alert('sorry you don not have permission to see this page');
        this.router.navigate(['/']);
      }
      else { 
        this.loadUnitsOptions();
        this.loadRegistrationTypes();
        this.loadDeveloperOptions();
        this.loadProjectsOptions();
        this.loadUnitTypesOptions()
      }
    });
  }
  checkRole(permission: string) {
    var pList = permissionList[permission];
    var d = Object.values(this.userRole)[0].toString().toLowerCase()
    if (!pList) return false;
    else if (pList.includes(d)) return true;
    else return false;
  }

  searchData(formData: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify(_.omit(formData, 'developerId')));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/projects/unitsProject`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.response = data.data;
          this.prepareUnitNumberOptions(this.response);
          this.prepareMeterTotalSoldAreaOptions(this.response);
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });
  }

  uploadExcel(uploadData: any) {
    let fd = new FormData();
    fd.append('zipFile', this.uploadedFile);

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/excel/createUnitsByZip`, fd)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          this.resetUploadControl();
          this.toastr.success(JSON.stringify(data.data), 'Success')
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });
  }

  async updateControlLabel(event: any) {
    const files = Array.from(event.target.files);
    this.controlLabel.nativeElement.innerText = files.map((t:any) => t.name).join(', ').slice(0, 75);
    this.uploadedFile = files[0];
  }

  resetUploadControl() {
    this.uploadData = {};
    this.formData = {};
    this.response = undefined;
    this.formErrors = {}
    this.controlLabel.nativeElement.innerText = 'choose file';
  }

  loadRegistrationTypes() {
    let options  = [{
      key: "All",
      value: { en: 'All', ar: 'All' }
    }]

    this.lookupsService.loadRegistrationTypes()
      .subscribe((data) => {
        this.registrationTypeOptions = _.union(options, data);
      })
  }

  prepareUnitNumberOptions(response: any) {
    let options  = [{
      key: "",
      value: { en: 'All', ar: 'All' }
    }]

    let preparedOptions = this.prepareOptions(response, 'unitNumber')

    this.unitNumberOptions = _.union(options, preparedOptions);
  }

  prepareMeterTotalSoldAreaOptions(response: any) {
    let options  = [{
      key: "",
      value: { en: 'All', ar: 'All' }
    }]

    let preparedOptions = this.prepareOptions(response, 'meterTotalSoldArea')
    this.meterTotalSoldAreaOptions = _.union(options, preparedOptions);
  }

  filterResponse() {
    let results = this.response;

    if (this.filterData.meterTotalSoldArea != '') {
      results = results.filter( r => r.meterTotalSoldArea == this.filterData.meterTotalSoldArea )
    }

    if (this.filterData.unitNumber != '') {
      results = results.filter( r => r.unitNumber == this.filterData.unitNumber )
    }

    if (this.filterData.registrationStatus != 'All') {
      results = results.filter( r => r.registrationStatus == this.filterData.registrationStatus )
    }

    return results;
  }

  prepareOptions(iteratee: any[], fieldName: string) {
    let options = []
    iteratee.forEach((item)=> {
      options.push({
        key: item[fieldName],
        value: { en: item[fieldName], ar: item[fieldName] }
      })
    })

    return options;
  }

  resetProjectAndUnit() {
    this.formData.projectId = null;
    this.resetUnit();
  }

  resetUnit() {
    this.formData.unitId = null;
  }

  loadUnitTypesOptions() {
    this.lookupsService.loadUnitsTypesOptions()
      .subscribe((data) => {
        this.unitTypesOptions = data;
      })
  }

  loadDeveloperOptions() {
    this.developerOptions = concat(
      of([]), // default items
      this.developerSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.developerDataOptionsLoading = true),
        switchMap(term => {
          return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developers`, { term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.developerDataOptionsLoading = false)
          )
        })
      )
    );
  }

  loadProjectsOptions() {
    this.projectsOptions = concat(
      of([]), // default items
      this.projectsSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.projectDataOptionsLoading = true),
        switchMap(term => {
          return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projects`, { term, developerId: this.formData.developerId }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.projectDataOptionsLoading = false)
          )
        })
      )
    );
  }

  loadUnitsOptions() {
    this.unitsOptions = concat(
      of([]), // default items
      this.unitsSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.unitsDataOptionsLoading = true),
        switchMap(term => {
          return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/unitsWithUnitId/projectId/this.formData.projectId/term/${term}`).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.unitsDataOptionsLoading = false)
          )
        })
      )
    );
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  getOwnersName(owners: any) {
    return _.join(owners, ', ');
  }

  getExcelLink() {
    return `${environment.apiHost}/units.xlsx`;
  }
}
