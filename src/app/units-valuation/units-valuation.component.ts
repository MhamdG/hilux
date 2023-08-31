import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FieldsService } from '../shared/fields.service';
import * as _ from 'lodash';
import { LookupsService } from '../shared/lookups.service';

interface SearchParams {
  query?: string;
  filter?: string;
}

@Component({
  selector: 'app-units-valuation',
  templateUrl: './units-valuation.component.html',
  styleUrls: ['./units-valuation.component.css']
})
export class UnitsValuationComponent implements OnInit {
  formData: any = {};
  addValuationData: any = {};
  updateValuationData: any = {};
  removeBlockData: any = {};
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
  unitsOptions: any;
  unitTypesOptions: any;
  ownersOptions: Observable<any>;
  response: any;
  searchby: any;
  minDate: any;
  activeValuationRow: any;
  modalProjectsOptions: Observable<any>;
  modalDeveloperOptions: Observable<any>;
  modalDeveloperSearchInput$ = new Subject<string>();
  modalProjectsSearchInput$ = new Subject<string>();
  modalProjectDataOptionsLoading = false;
  modalDeveloperDataOptionsLoading = false;
  roles$: object;
  userRole: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldsService: FieldsService,
    private http: HttpClient,
    private toastr: ToastrService,
    private ngxSmartModalService: NgxSmartModalService,
    private lookupsService: LookupsService
  ) { }

  ngOnInit(): void {
    this.roles$ = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/getUserRights`)
    .subscribe((res) => {
      this.userRole = res;
      console.log(this.userRole);
      if ( ! Object.keys(this.userRole).includes("Admin") && ! Object.keys(this.userRole).includes("ADMIN")) {
        this.router.navigate(['/']);
      } else {
        this.minDate = new Date();
        this.loadUnitsOptions(this.formData);
        this.loadDeveloperOptions();
        this.loadProjectsOptions();
        this.loadUnitTypesOptions();
        this.loadModalDeveloperOptions();
        this.loadModalProjectsOptions();
      }
    });

    // this.route.queryParams.subscribe(async (params) => {
    //   if (!_.isEqual(params, {})) {
    //     this.formData.propertyId = params.propertyId;
    //     await this.searchData(this.formData);
    //   }
    // });
  }

  searchData(formData: any) {
    let fd = new FormData();
    let preparedData = this.prepareformData(formData)
    fd.append('data', JSON.stringify(preparedData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/ApiGetUnitsPrices`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.response = data.data;
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });
  }

  loadUnitsOptions(data?: any) {
    data = data || this.formData;
    this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/units`, { projectId: data.projectId })
      .subscribe((data) => {
        this.unitsOptions = data;
      })
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

  loadModalDeveloperOptions() {
    this.modalDeveloperOptions = concat(
      of([]), // default items
      this.modalDeveloperSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.modalDeveloperDataOptionsLoading = true),
        switchMap(term => {
          return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developers`, { term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.modalDeveloperDataOptionsLoading = false)
          )
        })
      )
    );
  }

  loadModalProjectsOptions() {
    this.modalProjectsOptions = concat(
      of([]), // default items
      this.modalProjectsSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.modalProjectDataOptionsLoading = true),
        switchMap(term => {
          return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projects`, { term, developerId: this.addValuationData.developerId }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.modalProjectDataOptionsLoading = false)
          )
        })
      )
    );
  }

  isLandResponse() {
    return this.response && (this.response.type == 1 || this.response.type == '1')
  }

  isNotSearchBy(field_name: string) {
    return !!this.searchby && (this.searchby != field_name);
  }

  resetProjectAndUnit() {
    this.formData.projectId = null;
    this.resetUnit();
  }

  resetProjectAndUnitAddModal() {
    this.addValuationData.projectId = null;
    this.resetUnitAddModal();
  }

  resetProjectAndUnitUpdateModal() {
    this.updateValuationData.projectId = null;
    this.resetUnitUpdateModal();
  }

  resetUnit() {
    this.formData.unitId = null;
  }

  resetUnitAddModal() {
    this.addValuationData.unitId = null;
  }

  resetUnitUpdateModal() {
    this.updateValuationData.unitId = null;
  }

  getOwnerClass(item: any) {
    return (item.deed.status == '1') ? 'bg-seagreen' : 'bg-light-red'
  }

  getFirstResponse(response: any) {
    return response.length > 0 ? response[0] : {}
  }

  getFieldNameorId(item: any, field_name: any) {
    return item && (item[`${field_name}NameAr`] || item[`${field_name}Id`])
  }

  resetSearch(field_name: any) {
    switch (field_name) {
      case 'projectId':
        this.projectsSearchInput$.next(null);
        break;
      case 'developerId':
        this.developerSearchInput$.next(null);
        break;
    }
  }

  async editValuation(valuation: any) {
    await this.openUpdateValuationModal(valuation);
  }

  getProjectName(response: any) {
    const firstResponse = this.getFirstResponse(response);
    return !!firstResponse && firstResponse?.unit?.projectNameAr;
  }

  getDeveloperName(response: any) {
    const firstResponse = this.getFirstResponse(response);
    return !!firstResponse && firstResponse?.unit?.developerNameAr;
  }

  prepareProjectValueOptions(params: any) {
    if(!!params.projectId) {
      this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projects`, { id: params.projectId })
      .subscribe((option)=> {
        this.projectsSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareDeveloperValueOptions(params: any) {
    if(!!params.developerId) {
      this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developers`, { id: params.developerId })
      .subscribe((option)=> {
        this.developerSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareModalProjectValueOptions(params: any) {
    if(!!params.projectId) {
      this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projects`, { id: params.projectId })
      .subscribe((option)=> {
        this.modalProjectsSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareModalDeveloperValueOptions(params: any) {
    if(!!params.developerId) {
      this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developers`, { id: params.developerId })
      .subscribe((option)=> {
        this.modalDeveloperSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  openAddValuationModal() {
    this.ngxSmartModalService.getModal('addValuationModal').open();
  }

  async openUpdateValuationModal(valuation: any) {
    this.getValuation(valuation.id)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          this.updateValuationData = data.data;
          await this.prepareModalDeveloperValueOptions(this.updateValuationData);
          await this.prepareModalProjectValueOptions(this.updateValuationData);
          await this.loadUnitsOptions(this.updateValuationData);
          this.ngxSmartModalService.getModal('updateValuationModal').open();
        } else {
          this.updateValuationData = valuation
          await this.prepareModalDeveloperValueOptions(this.updateValuationData);
          await this.prepareModalProjectValueOptions(this.updateValuationData);
          await this.loadUnitsOptions(this.updateValuationData);
          this.ngxSmartModalService.getModal('updateValuationModal').open();
          // this.formErrors = data.data;
          // this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  addNewValuation(valuationData: any) {
    let fd = new FormData();
    let preparedData = this.prepareformData(valuationData)
    preparedData = Object.assign({}, { query: _.omitBy(preparedData, _.isEmpty) }, _.pick(_.omitBy(valuationData, _.isEmpty), ['tathmeenPrice']))
    fd.append('data', JSON.stringify(preparedData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/ApiUpdateUnitsPrices`, fd)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          this.ngxSmartModalService.closeLatestModal();
          this.searchData(valuationData);
          this.formData.developerId = valuationData.developerId;
          await this.prepareDeveloperValueOptions(valuationData);
          this.formData.projectId = valuationData.projectId;
          await this.prepareProjectValueOptions(valuationData);
          this.formData.unitId = valuationData.unitId;
          this.formData.unitTypeId = valuationData.unitTypeId;
          this.formData.roomsCount = valuationData.roomsCount;
          this.addValuationData = {};
          this.toastr.success(JSON.stringify(data.data), 'Success')
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  resetAddValuationModal() {
    this.addValuationData = {};
  }

  resetUpdateValuationModal() {
    this.updateValuationData = {};
  }

  updateValuation(formData: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify(formData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/ApiUpdateUnitPrice`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.ngxSmartModalService.closeLatestModal();
          this.searchData(formData);
          this.addValuationData = {};
          this.updateValuationData = {};
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  getValuation(valuationId: any) {
    return this.fieldsService.postData(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/ApiGetUnitPrice`, { id: valuationId });
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  getPreviousTehmeenClass(valuation) {
    return (this.activeValuationRow == valuation.id) ? `show collapse bg-light-red` : 'collapse bg-light-red'
  }

  toggleActiveValuation(valuation: any) {
    this.activeValuationRow = (this.activeValuationRow != valuation.id) ? valuation.id : undefined
  }

  getActiveTehmeenRowIconClass(valuation: any) {
    return (this.activeValuationRow == valuation.id) ? 'fas fa-angle-up' : 'fas fa-angle-down'
  }

  showRoomsCount(valuation: any) {
    return ['1', '2', '4', '26'].includes(valuation.unitTypeId) || [1, 2, 4, 26].includes(valuation.unitTypeId)
  }

  isRoomsCountMandatory(valuation: any) {
    return ['1', '4'].includes(valuation.unitTypeId) || [1, 4].includes(valuation.unitTypeId)
  }

  prepareformData(data: any) {
    return {
      equal: _.pick(_.omitBy(data, _.isEmpty), ['projectId', 'unitId', 'unitTypeId', 'roomsCount']),
      less: _.pick(_.omitBy(data, _.isEmpty), ['endDate']),
      greater: _.pick(_.omitBy(data, _.isEmpty), ['startDate'])
    }
  }

}
