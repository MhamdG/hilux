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
  myDialog :any; 
  resMsg :any;
  resErrors :any;
  flagUpload :any;
  flagRes :any;
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
    this.loadUnitsOptions();
    this.loadRegistrationTypes();
    this.loadDeveloperOptions();
    this.loadProjectsOptions();
    this.loadUnitTypesOptions()
    this.flagRes =false;
    this.myDialog = document.querySelector('#my-dialog');
    this.flagUpload = false;
    // this.resErrors =[
    //   {
    //     unitNumber :12,
    //   errors :[
    //     "error 1",
    //     "error 2",
    //     "error 3",
    //     "error 4",
    //   ]
    //   },
    //   {
    //     unitNumber :15,
    //   errors :[
    //     "error 1",
    //     "error 2",
    //     "error 3",
    //     "error 4",
    //   ]
    //   }
    // ]
  }

  searchData(formData: any) {
    this.flagRes =true;
    let fd = new FormData();
    fd.append('data', JSON.stringify(_.omit(formData, 'developerId')));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/projects/unitsProject`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.response = data.data;
          this.prepareUnitNumberOptions(this.response);
          this.prepareMeterTotalSoldAreaOptions(this.response);
          this.flagRes = false;
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
    this.resErrors= null;
    this.flagUpload =true;
    let fd = new FormData();
    fd.append("projectId",uploadData.projectId)
    fd.append('units', this.uploadedFile);
    console.log(fd);
 
//    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/excel/createUnitsByZip`, fd)
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/DMS/editUnitsSubmit`, fd)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          // this.resetUploadControl();
          this.toastr.success(JSON.stringify(data.data), 'Success');
          this.resMsg = data.message;
          if (data.errors != null) {
            this.resErrors =data.errors;
          }
          this.myDialog.showModal();
          this.flagUpload =false;
          this.formData.projectId =null;
          this.formData.developerId =null;
          this.developerOptions =null;
          this.loadDeveloperOptions();
          this.projectsOptions =null;
          this.loadProjectsOptions();
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
          this.resMsg = data.message;
          if (data.errors != null) {
            this.resErrors =data.errors;
          }
          this.myDialog.showModal();
          this.flagUpload =false;

       
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        // this.router.navigate(['error']);
      });
  }
   closeDialog (){
    this.myDialog.close();
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
    return _.join(owners, '\n , \n ');
  }

  getExcelLink() {
    return `${environment.apiHost}/units.xlsx`;
  }
  getLookupUnitsLink() {
    return `${environment.apiHost}/unit-types-and-uses.xlsx`;
  }
}
