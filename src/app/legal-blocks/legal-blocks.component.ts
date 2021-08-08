import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FieldsService } from '../shared/fields.service';
import * as _ from 'lodash';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { LookupsService } from '../shared/lookups.service';
import permissionList from '../permission';
interface SearchParams {
  query?: string;
  filter?: string;
}

@Component({
  selector: 'app-legal-blocks',
  templateUrl: './legal-blocks.component.html',
  styleUrls: ['./legal-blocks.component.css']
})
export class LegalBlocksComponent implements OnInit {
  formData: any = {};
  addBlockData: any = {};
  updateBlockData: any = {};
  removeBlockData: any = {};
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
  blockageTypesOptions: any;
  blockageEntitiesOptions: Observable<any>;
  blockageEntitySearchInput$ = new Subject<string>();
  blockageEntityOptionsLoading = false;
  searchby: any;
  hideAttachmentsControl;
  userRole: any;
  roles$: object;

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
      var checkFlag = this.checkRole('LegalReservations.view');
      if (!checkFlag) {
        alert('sorry you don not have permission to see this page');
        this.router.navigate(['/']);
      }
      else {
        this.toggleControl(false);
        this.loadUnitsOptions();
        this.loadDeveloperOptions();
        this.loadProjectsOptions();
        this.loadLandsoptions();
        this.loadOldLandsoptions();
        this.loadBlockageEntities();
    
        this.route.queryParams.subscribe(async (params) => {
          if (!_.isEqual(params, {})) {
            this.formData.propertyId = params.propertyId;
            await this.searchData(this.formData);
          }
        });
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
    this.http.get(`${environment.apiHost}/AjmanLandProperty/index.php/blockages/getByPropertyId/${this.getPropertyId(formData)}`)
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
          return this.lookupsService.loadProjects({ term, developerId: this.formData.developerId }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.projectDataOptionsLoading = false)
          )
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
    return !!this.formData.type && (['1'].includes(this.formData.type) || [1].includes(this.formData.type))
  }

  isNotSearchTypeLand() {
    return !!this.formData.type && (['2'].includes(this.formData.type) || [2].includes(this.formData.type))
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
      if (this.isEmpty('developerId') && this.isEmpty('projectId') && this.isEmpty('unitId')) {
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

  getCurrentOwnedBlocks(blockages: any) {
    return this.filterBlocksWithStatus(blockages, '1');
  }

  getPreviouslyOwnedBlocks(blockages: any) {
    return this.filterBlocksWithStatus(blockages, '0');
  }

  getCurrentOwnedUnits(blockages: any) {
    return this.filterUnitsWithStatus(blockages, '1');
  }

  getPreviouslyOwnedUnits(blockages: any) {
    return this.filterUnitsWithStatus(blockages, '0');
  }

  filterBlocksWithStatus(blockages: any, status: any) {
    return blockages.filter(d => d.status == status);
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

  async deleteBlockage(blockage: any) {
    await this.openRemoveBlockModal(blockage);
  }

  async editBlockage(blockage: any) {
    await this.openUpdateBlockModal(blockage);
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
      this.lookupsService.loadProjects({ id: params.projectId })
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

  prepareBlockagesEntitiesValueOptions(params: any) {
    if(!!params.blockEntityId) {
      this.lookupsService.loadBlockageEntities({ id: params.blockEntityId })
      .subscribe((option)=> {
        this.blockageEntitySearchInput$.next(option.value && option.value.ar);
      })
    }
  }

  prepareBlockageTypesValueOptions(params: any) {
    if(!!params.typeId) {
      this.loadBlockageTypesOptions();
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

  isLandBlockage(response: any) {
    const firstLand = this.getfirstLand(response);
    return  !!firstLand && !!firstLand.landId;
  }

  openAddBlockModal() {
    this.toggleControl(false);
    this.setPropertyId(this.addBlockData);
    this.ngxSmartModalService.getModal('addBlockModal').open();
  }

  async openUpdateBlockModal(blockage: any) {
    this.toggleControl(false);
    this.getBlockage(blockage.id)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          this.updateBlockData = data.data
          this.updateBlockData.attachments = undefined;
          await this.prepareBlockageTypesValueOptions(this.updateBlockData);
          await this.prepareBlockagesEntitiesValueOptions(this.updateBlockData);
          this.ngxSmartModalService.getModal('updateBlockModal').open();
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  async openRemoveBlockModal(blockage: any) {
    this.toggleControl(false);
    this.getBlockage(blockage.id)
      .subscribe(async (data: any) => {
        if (data.status == 'success') {
          this.removeBlockData = data.data
          this.removeBlockData.attachments = undefined;
          await this.prepareBlockageTypesValueOptions(this.removeBlockData);
          await this.prepareBlockagesEntitiesValueOptions(this.removeBlockData);
          this.ngxSmartModalService.getModal('removeBlockModal').open();
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  addNewBlock(formData: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify(formData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/blockages/create`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.ngxSmartModalService.closeLatestModal();
          this.searchData(formData);
          this.addBlockData = {};
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  prepareAttachments() {
    return {
      fieldID: "attachments",
      fieldType: "fileupload",
      required: true,
      fieldName: {
        "ar": "attachments",
        "en": "attachments"
      },
      auxInfo: {
        multiple: true
      }
    }
  }

  prepareUpdateAttachments() {
    return {
      fieldID: "attachments",
      fieldType: "fileupload",
      required: false,
      fieldName: {
        "ar": "attachments",
        "en": "attachments"
      },
      auxInfo: {
        multiple: true
      }
    }
  }

  loadBlockageTypesOptions() {
    this.lookupsService.loadBlockageTypesOptions()
      .subscribe((data) => {
        this.blockageTypesOptions = data;
      })
  }

  loadBlockageEntities() {
    this.blockageEntitiesOptions = concat(
      of([]), // default items
      this.blockageEntitySearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.blockageEntityOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadBlockageEntities({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.blockageEntityOptionsLoading = false)
          )
        })
      )
    );
  }

  setPropertyId(data: any) {
    const firstResponse = this.getFirstResponse(this.response);
    data.propertyId = firstResponse && (firstResponse.propertyId || (firstResponse.land && firstResponse.land.propertyId) || this.getPropertyId(this.formData));
  }

  resetAddBlockModal() {
    this.addBlockData = {};
    this.toggleControl(true);
  }

  resetUpdateBlockModal() {
    this.updateBlockData = {};
    this.toggleControl(true);
  }

  resetRemoveBlockModal() {
    this.removeBlockData = {};
    this.toggleControl(true);
  }

  updateBlock(formData: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify(formData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/blockages/update/${formData.id}`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.ngxSmartModalService.closeLatestModal();
          this.searchData(formData);
          this.addBlockData = {};
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  removeBlock(formData: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify(formData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/blockages/deactivate/${formData.id}`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.ngxSmartModalService.closeLatestModal();
          this.searchData(formData);
          this.addBlockData = {};
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  getBlockage(blockageId: any) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/blockages/get/${blockageId}`);
  }

  toggleControl(value?: boolean) {
    this.hideAttachmentsControl = (!!value ? value : !this.hideAttachmentsControl)
    return this.hideAttachmentsControl;
  }
}
