import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FieldsService } from '../shared/fields.service';
import * as _ from 'lodash';
import { LookupsService } from '../shared/lookups.service';

interface SearchParams {
  query?: string;
  filter?: string;
}

@Component({
  selector: 'app-application-search',
  templateUrl: './application-search.component.html',
  styleUrls: ['./application-search.component.css']
})
export class ApplicationSearchComponent implements OnInit {
  formData: any = {};
  formErrors: any = {};
  currentSearchParams: SearchParams = {};
  paramsSubscription = new Subscription();
  results = [];
  developerOptions: Observable<any>;
  projectsOptions: Observable<any>;
  landsOptions: Observable<any>;
  oldLandsOptions: Observable<any>;
  developerDataOptionsLoading = false;
  developerSearchInput$ = new Subject<string>();
  projectsSearchInput$ = new Subject<string>();
  projectDataOptionsLoading = false;
  landDataOptionsLoading = false;
  landSearchInput$ = new Subject<string>();
  oldLandDataOptionsLoading = false;
  oldLandSearchInput$ = new Subject<string>();
  ownersSearchInput$ = new Subject<string>();
  ownersOptionsLoading = false;
  unitsOptions: any;
  ownersOptions: Observable<any>;
  response: any;
  searchby: any;
  minDate:any;
  applicationSourceOptions: any;
  serviceNameOptions: any;
  flagCallTasks :any;
  dtOptions = {};


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldsService: FieldsService,
    private http: HttpClient,
    private toastr: ToastrService,
    private lookupsService: LookupsService
  ) { }

  ngOnInit(): void {
    this.flagCallTasks =false;
    this.minDate = new Date();
    this.loadUnitsOptions();
    this.loadDeveloperOptions();
    this.loadProjectsOptions();
    this.loadLandsoptions();
    this.loadOldLandsoptions();
    this.loadOwnersOptions();
    this.loadServiceNamesOptionsByUser()
    this.tableOption();

    this.applicationSourceOptions = [
      {
        key: "hilux",
        value: { en: 'Hilux', ar: 'النظام الداخلي' }
      },
      {
        key: "eserviceportal",
        value: { en: 'Web', ar: 'البوابة الاكترونية' }
      },
      {
        key: "mobile",
        value: { en: 'mobile', ar: 'موبايل' }
      }
    ]
  }
  tableOption (){
  this.dtOptions = {
    language: {
      sEmptyTable: 'ليست هناك بيانات متاحة في الجدل',
      sLoadingRecords: 'جارٍ التحميل...',
      sProcessing: 'جارٍ التحميل...',
      sLengthMenu: 'أظهر _MENU_ مدخلات',
      sZeroRecords: 'لم يعثر على أية سجلات',
      sInfo: 'إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل',
      sInfoEmpty: 'يعرض 0 إلى 0 من أصل 0 سجل',
      sInfoFiltered: '(منتقاة من مجموع _MAX_ مُدخل)',
      sInfoPostFix: '',
      sSearch: 'ابحث:',
      sUrl: '',
      oPaginate: {
        sFirst: 'الأول',
        sPrevious: 'السابق',
        sNext: 'التالي',
        sLast: 'الأخير'
      },
      oAria: {
        sSortAscending: ': تفعيل لترتيب العمود تصاعدياً',
        sSortDescending: ': تفعيل لترتيب العمود تنازلياً'
      }
    }
  };
}
  searchData(formData: any) { 
    this.flagCallTasks =true;
    let fd = new FormData();
    fd.append('data', JSON.stringify(formData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Applications/applicationSearch`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.response = data.data;
            this.flagCallTasks =false;
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });
  }

  loadUnitsOptions() {
    this.lookupsService.loadUnitsOptions({ projectId: this.formData.projectId })
      .subscribe((data) => {
        this.unitsOptions = data;
      })
  }

  loadDeveloperOptions() {
    this.developerOptions = concat(
      of([]), // default items
      this.developerSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.developerDataOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadDevelopers({ term }).pipe(
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
          if(this.formData.developerId)
          {
            return this.lookupsService.loadAllProjects({ term, developerId: this.formData.developerId }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.projectDataOptionsLoading = false)
            )
          }
          else
          {
            return this.lookupsService.loadAllProjects({ term}).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.projectDataOptionsLoading = false)
            )
          }

        })
      )
    );
  }

  loadLandsoptions() {
    this.landsOptions = concat(
      of([]), // default items
      this.landSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.landDataOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadLands({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.landDataOptionsLoading = false)
          )
        })
      )
    );
  }

  loadOldLandsoptions() {
    this.oldLandsOptions = concat(
      of([]), // default items
      this.oldLandSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.oldLandDataOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadOldLands({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.oldLandDataOptionsLoading = false)
          )
        })
      )
    );
  }

  loadOwnersOptions() {
    this.ownersOptions = concat(
      of([]), // default items
      this.ownersSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.ownersOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadOwners({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.ownersOptionsLoading = false)
          )
        })
      )
    );
  }

  loadServiceNamesOptionsByUser() {
    this.lookupsService.loadServiceNamesOptionsByUser()
      .subscribe((data) => {
        this.serviceNameOptions = data;
      })
  }

  isLandResponse() {
    return this.response && (this.response.type == 1 || this.response.type == '1')
  }

  isUnitResponse() {
    return this.response && (this.response.type == 2 || this.response.type == '2')
  }

  isSearchByUnit() {
    return (this.formData.type == '2')
  }

  isNotSearchTypeUnit() {
    return !!this.formData.type && (['1', '3'].includes(this.formData.type) || [1, 3].includes(this.formData.type))
  }

  isNotSearchTypeLand() {
    return !!this.formData.type && (['2', '3'].includes(this.formData.type) || [2, 3].includes(this.formData.type))
  }

  isSearchTypeApplication() {
    return !!this.formData.type && (['3'].includes(this.formData.type) || [3].includes(this.formData.type))
  }

  setSearchType(field_name: string, event: any) {
    var val = event.target.value.trim();
    this.setSearchByandTypeValues(val, field_name)
  }

  setSearchByandTypeValues(val: any, field_name: any) {
    if (val != '') {
      this.searchby = field_name;
      if (['developerId', 'projectId', 'unitId'].includes(field_name)) {
        this.formData.type = '2'
      } else if (['landId', 'oldLandId'].includes(field_name)) {
        this.formData.type = '1'
      } else {
        this.formData.type = '3'
      }
    } else {
      this.formData.type = null;
      this.searchby = null;
      this.resetSearch(field_name);
    }
  }

  isNotSearchBy(field_name: string) {
    return !!this.searchby && (this.searchby != field_name);
  }

  prepareFormData(formData: any) {
    switch (this.searchby) {
      case 'unitId':
      case 'projectId':
      case 'developerId':
        this.formData.value = this.formData.unitId
        break;
      case 'landId':
        this.formData.value = this.formData.landId
        break;
      case 'oldLandId':
        this.formData.value = this.formData.oldLandId
        break;
      default:
        this.formData.value = null;
    }

    return formData
  }

  checkTypeAndValues(field_name: string) {
    let val = this.formData[field_name] && this.formData[field_name].trim();
    val = (val == undefined ? '' : val);
    if (!this.isSearchByUnit() && (val == '')) {
      this.setSearchByandTypeValues(val, field_name);
    } else if (this.isSearchByUnit()) {
      //check all are empty then reset types
      if ( this.isEmpty('projectId') && this.isEmpty('unitId')) {
        this.setSearchByandTypeValues(val, null);
      }
    }
  }

  resetProjectAndUnit() {
    this.formData.projectId = null;
    this.resetUnit();
  }

  resetUnit() {
    this.formData.unitId = null;
  }

  isEmpty(field_name: string) {
    return this.isSearchByUnit() && (this.formData[field_name] == undefined)
  }

  getOwnerClass(item: any) {
    return (item.deed.status == '1') ? 'bg-seagreen' : 'bg-light-red'
  }

  getfirstLand(response: any) {
    return response.length > 0 ? response[0].land : {}
  }

  getFirstResponse(response: any) {
    return response.length > 0 ? response[0] : {}
  }

  getfirstUnit(deeds: any) {
    return deeds.length > 0 ? deeds[0].unitData : {}
  }

  getfirst(deeds: any) {
    return deeds.length > 0 ? deeds[0].deedDetails[0] : {}
  }

  getCurrentOwnedUnits(blockages: any) {
    return this.filterUnitsWithStatus(blockages, '1');
  }

  getPreviouslyOwnedUnits(blockages: any) {
    return this.filterUnitsWithStatus(blockages, '0');
  }

  filterUnitsWithStatus(deeds: any, status: any) {
    return deeds.filter(d => d.unitData && d.deed?.status == status);
  }

  getFieldNameorId(item: any, field_name: any) {
    return item && (item[`${field_name}NameAr`] || item[`${field_name}Id`])
  }

  getNationalityName(item: any, field_name: any) {
    return item && (item[`${field_name}NameAr`] || item[`${field_name}`])
  }

  getAttachments(attachments: any[]) {
    return !!attachments && attachments.map((a, i) => ({
      name: `attachment ${i + 1}`,
      link: a
    }))
  }

  getCreatesAtModifiedAt(block: any) {
    return `${block.createdAt} \n ${block.modifiedAt}`
  }

  getCreatesByModifiedBy(block: any) {
    return `${block.createdByNameAr} \n ${block.modifiedByNameAr}`
  }

  resetSearch(field_name: any) {
    switch (field_name) {
      case 'projectId':
        this.projectsSearchInput$.next(null);
        break;
      case 'developerId':
        this.developerSearchInput$.next(null);
        break;
      case 'landId':
        this.landSearchInput$.next(null);
        break;
      case 'oldLandId':
        this.oldLandSearchInput$.next(null);
        break;
    }
  }

  getProjectName(response: any) {
    const firstResponse = this.getFirstResponse(response);
    return !!firstResponse && firstResponse?.unit?.projectNameAr;
  }

  getUnitNumber(response: any) {
    const firstResponse = this.getFirstResponse(response);
    return !!firstResponse && firstResponse?.unit?.unitNumber;
  }

  getDeveloperName(response: any) {
    const firstResponse = this.getFirstResponse(response);
    return !!firstResponse && firstResponse?.unit?.developerNameAr;
  }

  prepareProjectValueOptions(params: any) {
    if(!!params.projectId) {
      this.lookupsService.loadAllProjects({ id: params.projectId })
      .subscribe((option)=> {
        this.projectsSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareDeveloperValueOptions(params: any) {
    if(!!params.developerId) {
      this.lookupsService.loadDevelopers({ id: params.developerId })
      .subscribe((option)=> {
        this.developerSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareLandValueOptions(params: any) {
    if(!!params.landId) {
      this.lookupsService.loadLands({ id: params.landId })
      .subscribe((option)=> {
        this.landSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareOldLandValueOptions(params: any) {
    if(!!params.oldLandId) {
      this.lookupsService.loadOldLands({ id: params.oldLandId })
      .subscribe((option)=> {
        this.oldLandSearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareUnitValueOptions(params: any) {
    if(!!params.unitId) {
      this.lookupsService.loadUnitsOptions({ id: params.unitId })
      .subscribe((option)=> {
      })
    }
  }

  getPropertyId(formData: any) {
    if (formData.type == '1') {
      return formData.landId || formData.oldLandId;
    } else if (formData.type == '2') {
      return formData.unitId;
    } else {
      return formData.propertyId;
    }
  }

  setPropertyId(data: any) {
    const firstResponse = this.getFirstResponse(this.response);
    data.propertyId = firstResponse && (firstResponse.propertyId || (firstResponse.land && firstResponse.land.propertyId) || this.getPropertyId(this.formData));
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  getIconClass(channel: string) {
    switch (channel) {
      case 'mobile':
        return 'fas fa-mobile-alt';
      case 'hilux':
        return 'fas fa-user-tie';
      default:
        return 'fas fa-globe';
    }
  }

  getStatusClass(item: any) {
    switch (item.toLowerCase()) {
      case 'in progress':
        return 'fas fa-circle info-yellow';
      case 'completed':
        return 'fas fa-circle success-green';
      case 'rejected':
        return 'fas fa-circle red';
      default:
        return 'fas fa-circle';
    }
  }

  isFormInValid(form_invalid: boolean, formData: any) {
    
    if (form_invalid) {
      return form_invalid && (
        (!formData.owner) &&
        (!formData.ownerId) &&
        (!formData.contractId || !formData.receiptID)
      )
    } else {
      return form_invalid
    }
  }

  getInvoiceStatusClass(item: any) {
    switch (item.invoiceStatus.toLowerCase()) {
      case 'notpaid':
        return 'badge-danger';
      case 'paid':
        return 'badge-success';
      default:
        return 'text-info';
    }
  }
  getInvoiceStatusText(item: any) {
    switch (item.invoiceStatus.toLowerCase()) {
      case 'notpaid':
        return 'غير مدفوع';
      case 'paid':
        return 'مدفوع';
      default:
        return '';
    }
  }

  goToApplicationPage(item_detail) {
    window.open(`/application_search/${item_detail.applicationID}`, '_blank');
  }
}
