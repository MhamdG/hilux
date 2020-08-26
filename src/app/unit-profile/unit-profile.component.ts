import { Component, OnInit } from '@angular/core';
import { Observable, concat, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../shared/fields.service';
import { pluck, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-unit-profile',
  templateUrl: './unit-profile.component.html',
  styleUrls: ['./unit-profile.component.css']
})
export class UnitProfileComponent implements OnInit {
  formData: any = {};
  profile$: Observable<any>;
  developerOptions: Observable<any>;
  projectsOptions: Observable<any>;
  landsoptions: any;
  unitsTypesOptions: any;
  unitsUsageTypesOptions: any;
  minDate:any;
  developerDataOptionsLoading = false;
  developerSearchInput$ = new Subject<string>();
  projectsSearchInput$ = new Subject<string>();
  projectDataOptionsLoading = false;
  landDataOptionsLoading = false;
  landSearchInput$ = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private fieldsService: FieldsService
  ) { }

  ngOnInit(): void {
    this.minDate = new Date();
    this.loadDeveloperOptions();
    this.loadProjectsOptions();
    this.loadLandsoptions();
    this.loadUnitsTypesOptions();
    this.loadunitsUsageTypesOptions();

    this.profile$ = this.route.data.pipe(pluck('profile'));
    this.profile$.subscribe((profile: any) => {
      if (profile && profile.id) {
        this.formData = profile as any;
      } else {
        this.formData = { };
      }
    });
  }

  saveData(formData: any) {
    let fd = new FormData();
    fd.append('unit', JSON.stringify(formData));
    this.http.post('https://wfe.ajm.re/AjmanLandProperty/index.php/units/create', fd)
      .subscribe((data: any) => {
       if (data.status == 'success') {
        this.toastr.success(data.message, 'Success');
        if (data.data.id)
          this.router.navigate(['unit/profile', data.data.id, 'edit']);
      } else {
        this.toastr.error(JSON.stringify(data.message), 'Error')
      }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  loadDeveloperOptions() {
    this.developerOptions = concat(
      of([]), // default items
      this.developerSearchInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.developerDataOptionsLoading = true),
          switchMap(term => {
            return this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/developers`, { term } ).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.developerDataOptionsLoading = false)
          )})
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
            return this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/projects`, { term, developerId: this.formData.developerId } ).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.projectDataOptionsLoading = false)
          )})
      )
    );
  }

  loadLandsoptions() {
    this.landsoptions = concat(
      of([]), // default items
      this.landSearchInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.landDataOptionsLoading = true),
          switchMap(term => {
            return this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/lands`, { term } ).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.landDataOptionsLoading = false)
          )})
      )
    );
  }

  loadUnitsTypesOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/unitsTypes`)
    .subscribe((data) => {
      this.unitsTypesOptions = data;
    })
  }

  loadunitsUsageTypesOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/unitsUsageTypes`)
    .subscribe((data) => {
      this.unitsUsageTypesOptions = data;
    })
  }

  getAttachments() {
    return this.formData.sitePlan || [];
  }

  isCustomerDisabled() {
    return this.formData.customerCategoryId && (this.formData.customerCategoryId.includes('1') || this.formData.customerCategoryId.includes(1));
  }

  isValid() {
    return (this.formData.isDead ? true : (!!this.formData.emiratesId || !!this.formData.passportNumber || !!this.formData.otherId))
  }

  getSignatureAttachments() {
    return this.formData.signature ? [this.formData.signature] : [];
  }

  prepareImageField() {
    return {
      fieldID: "image",
      fieldType: "image",
      required: false,
      fieldName: {
        "ar": "image",
        "en": "image"
      }
    }
  }

  prepareSitePlanField() {
    return {
      fieldID: "sitePlan",
      fieldType: "image",
      required: false,
      fieldName: {
        "ar": "site Plan",
        "en": "site Plan"
      }
    }
  }

  isRequired() {
    return !this.formData.isDead;
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  isUnitVilla() {
    return this.formData.unitTypeId && (!this.formData.unitTypeId.includes('2') || !this.formData.unitTypeId.includes(2))
  }

  calculateJointActualArea() {
    // should automatically calculated = Meter Total Actual Area - Meter Net Actual Area
    const meterTotalActualArea = this.formData.meterTotalActualArea || null;
    const meterNetActualArea = this.formData.meterNetActualArea || null;
    this.formData.meterJointActualArea = _.toNumber(meterTotalActualArea) - _.toNumber(meterNetActualArea);
  }

  calculateJointSoldArea() {
    // should automatically calculated = Meter Total Sold Area - Meter Net Sold Area
    const meterTotalSoldArea = this.formData.meterTotalSoldArea || null;
    const meterNetSoldArea = this.formData.meterNetSoldArea || null;
    this.formData.meterJointSoldArea = _.toNumber(meterTotalSoldArea) - _.toNumber(meterNetSoldArea)
  }
}
