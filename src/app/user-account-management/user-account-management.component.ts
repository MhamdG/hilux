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
import { HttpHeaders, HttpParams } from '@angular/common/http';

interface SearchParams {
  query?: string;
  filter?: string;
}

@Component({
  selector: 'app-legal-blocks',
  templateUrl: './user-account-management.component.html',
  styleUrls: ['./user-account-management.component.css']
})
export class UserAccountManagementComponent implements OnInit {
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
  response2: any;
  resError: any;
  blockageTypesOptions: any;
  blockageEntitiesOptions: Observable<any>;
  blockageEntitySearchInput$ = new Subject<string>();
  blockageEntityOptionsLoading = false;
  searchby: any;
  hideAttachmentsControl;
  showModal = false;
  showDeleteModal = false;
  userType = '';
  entityName = '';
  userTypeOptions: Observable<any>;
  entityNamesOptions: Observable<any>;
  userTypeSearchInput$ = new Subject<string>();
  entutyNameSearchInput$ = new Subject<string>();
  userTypeDataOptionsLoading = false;
  entutyNameDataOptionsLoading = false;
  resMsg: any;
  resUrl: any;
  attachments: any;
  remarksValue: any;
  // currectItem:any;
  currectItem: any = {}; // so it’s never undefined




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
    this.toggleControl(false);
    this.loadUnitsOptions();
    this.loadDeveloperOptions();
    this.loadProjectsOptions();
    this.loadLandsoptions();
    this.loadOldLandsoptions();
    this.loadBlockageEntities();
    this.loaduserTypesOptions();
    this.loadentityNameOptions();

    // this.route.queryParams.subscribe(async (params) => {
    //   if (!_.isEqual(params, {})) {
    //     this.formData.propertyId = params.propertyId;
    //     await this.searchData(this.formData);
    //   }
    // });
  }
  openModal() {
    this.showModal = true;
  }
  openDeleteModal(item: any) {
    this.showDeleteModal = true;
    this.currectItem = item;
  }

  closeModal() {
    this.showModal = false;
    this.userType = "";
    this.entityName = "";
    this.remarksValue = "";
    this.addBlockData.attachments = [];
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userType = "";
    this.entityName = "";
    this.remarksValue = "";
    this.addBlockData.attachments = [];
  }
  //   handleFileInput(event: Event, fileInput: HTMLInputElement): void {
  //     this.resMsg = null;
  //     this.resUrl = null;
  //     const input = event.target as HTMLInputElement;

  //     if (input.files && input.files.length > 0) {
  //       const file = input.files[0];
  //       this.uploadFile(file, fileInput);
  //     } else {
  //       console.error('No file selected!');
  //     }
  //   }
  //   uploadFile(file: File, fileInput: HTMLInputElement): void {
  //     const formData = new FormData();
  //     formData.append('attachments', file);

  //   const headers = new HttpHeaders({
  //   'Authorization': 'Bearer ' + environment.token,
  //   // 'Cookie': 'your_cookie_value_here' // only if backend really requires it
  // });

  // this.http.post<any>(
  //   `${environment.apiHost}/ajaxupload.php`,
  //   formData,
  //   { headers }   // ✅ attach headers here
  // ).subscribe({
  //   next: (response) => {
  //     if (response && response.status === "error") {
  //       this.resMsg = "حدث خطأ يرجى تحميل الملف لمعرفة التفاصيل";
  //       this.resUrl = response.message;
  //     } else if (response && response.status === "success") {
  //       this.resMsg = "تم تحميل الملف بنجاح";
  //       fileInput.value = '';
  //       this.attachment = response;
  //     } else {
  //       this.resMsg = "حدث خطأ ما من فضلك حاول لاحقاً";
  //       fileInput.value = '';
  //     }
  //     console.log('File uploaded successfully:', response);
  //   },
  //   error: (err) => {
  //     console.error('File upload failed:', err);
  //   }
  // });

  //   }

  submitForm() {
    // const uploadedUrl = this.addBlockData['attachments'];
    // const uploadedUrl = this.addBlockData?.attachments; // ✅ safe access
    let attachments = this?.addBlockData?.attachments?.[0];


    // 👉 here you can send values to API
    let obj = {
      userId: this.response.userId,
      profileId: this.userType,
      ownerId: this.entityName,
      remarks: this.remarksValue,
      attachments: attachments
    }
    const body = new URLSearchParams();
    body.set('data', JSON.stringify(obj));
    this.http.post(
      `${environment.apiHost}/AjmanLandProperty/index.php/UsersProfiles/ApiAddUserProfile`,
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).subscribe((data: any) => {
      console.log(".................");
      console.log(data.data);
      if (data.status === 'success') {
        this.response2 = data.data;
        this.searchData(this.formData);
        this.userType = "";
        this.entityName = "";
        this.remarksValue = "";
        attachments = "";
        this.addBlockData.attachments = [];
      } else {
        this.toastr.error(JSON.stringify(data.message), 'Error')
      }
    });
    this.closeModal();
  }
  submitDeleteForm() {
    // const uploadedUrl = this.addBlockData['attachments'];
    // const uploadedUrl = this.addBlockData?.attachments; // ✅ safe access
    // console.log('Uploaded URL:', this.addBlockData.attachments[0]);
    // let attachments = this?.addBlockData?.attachments?[0];
    let attachments = this?.addBlockData?.attachments?.[0];


    // 👉 here you can send values to API
    let obj = {
      userId: this.response.userId,
      profileId: this.currectItem.profileId,
      // ownerId: this.entityName,
      remarks: this.remarksValue,
      attachments: attachments
    }
    const body = new URLSearchParams();
    body.set('data', JSON.stringify(obj));
    this.http.post(
      `${environment.apiHost}/AjmanLandProperty/index.php/UsersProfiles/ApiDeleteUserProfile`,
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).subscribe((data: any) => {
      console.log(".................");
      console.log(data.data);
      if (data.status === 'success') {
        this.response2 = data.data;
        this.searchData(this.formData);
        this.userType = "";
        this.entityName = "";
        this.remarksValue = "";
        attachments = "";
        this.addBlockData.attachments = [];
      } else {
        this.toastr.error(JSON.stringify(data.message), 'Error')
      }
    });
    this.closeDeleteModal();
  }

  searchData(formData: any) {
    let obj: any = {};

    if (formData.email) {
      obj.email = formData.email;
    } else if (formData.customerId) {
      obj.customerId = formData.customerId;
    }
    if (formData.emiratesId) {
      obj.emiratesId = formData.emiratesId;
    }

    const body = new URLSearchParams();
    body.set('data', JSON.stringify(obj));

    this.http.post(
      `${environment.apiHost}/AjmanLandProperty/index.php/UsersProfiles/Search`,
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).subscribe((data: any) => {
      console.log(".................");
      console.log(data.data);
      if (data.status === 'success') {
        this.response = data.data;
        this.resError = null;
      }
      else if (data.status == "error") {
        this.resError = data;
        this.response = null;
      }
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
          return this.lookupsService.loadusersname({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.developerDataOptionsLoading = false)
          )
        })
      )
    );
  }
  // loaduserTypesOptions() {
  //   this.userTypeOptions = concat(
  //     of([]), // default items
  //     this.userTypeSearchInput$.pipe(
  //       distinctUntilChanged(),
  //       tap(() => this.userTypeDataOptionsLoading = true),
  //       switchMap(term => {
  //         return this.lookupsService.loaduserTypes({ term }).pipe(
  //           catchError(() => of([])), // empty list on error
  //           tap(() => this.userTypeDataOptionsLoading = false)
  //         )
  //       })
  //     )
  //   );
  // }
  loaduserTypesOptions() {
    this.userTypeDataOptionsLoading = true;

    this.lookupsService.loaduserTypes({ term: '' }).pipe(
      catchError(() => of([])),
      tap(() => this.userTypeDataOptionsLoading = false)
    ).subscribe(data => {
      this.userTypeOptions = data;
    });
  }

  loadentityNameOptions() {
    this.entityNamesOptions = concat(
      of([]), // default items
      this.entutyNameSearchInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.entutyNameDataOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadEntityName({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.entutyNameDataOptionsLoading = false)
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
          return this.lookupsService.loadAllProjects({ term, developerId: this.formData.developerId }).pipe(
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
  // Helper to check if any search field has value
  hasAnySearchValue(): boolean {
    return !!(
      this.formData.customerId ||
      this.formData.email ||
      this.formData.emiratesId
    );
  }

  // Helper: disable all fields except the current one
  isDisabled(field: string): boolean {
    if (!this.hasAnySearchValue()) return false; // if no values, all enabled

    // if another field has value, disable this one
    return Object.entries(this.formData).some(
      ([key, value]) => key !== field && !!value
    );
  }
  onUsernameTyping(term: string) {
    // temporarily assign search term so disable logic works
    this.formData.customerId = term?.trim() || null;
  }
  onUserTypeTyping(term: string) {
    // temporarily assign search term so disable logic works
    this.userType = term?.trim() || null;
  }
  onEntityNameTyping(term: string) {
    // temporarily assign search term so disable logic works
    this.entityName = term?.trim() || null;
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
      if (['email', 'emiratesId', 'customerId'].includes(field_name)) {
        this.formData.type = '2'
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
    if (!!params.projectId) {
      this.lookupsService.loadAllProjects({ id: params.projectId })
        .subscribe((option) => {
          this.projectsSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareDeveloperValueOptions(params: any) {
    if (!!params.developerId) {
      this.lookupsService.loadDevelopers({ id: params.developerId })
        .subscribe((option) => {
          this.developerSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareLandValueOptions(params: any) {
    if (!!params.landId) {
      this.lookupsService.loadLands({ id: params.landId })
        .subscribe((option) => {
          this.landSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareOldLandValueOptions(params: any) {
    if (!!params.oldLandId) {
      this.lookupsService.loadOldLands({ id: params.oldLandId })
        .subscribe((option) => {
          this.oldLandSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareUnitValueOptions(params: any) {
    if (!!params.unitId) {
      this.lookupsService.loadUnitsOptions({ id: params.unitId })
        .subscribe((option) => {
        })
    }
  }

  prepareBlockagesEntitiesValueOptions(params: any) {
    if (!!params.blockEntityId) {
      this.lookupsService.loadBlockageEntities({ id: params.blockEntityId })
        .subscribe((option) => {
          this.blockageEntitySearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareBlockageTypesValueOptions(params: any) {
    if (!!params.typeId) {
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
    return !!firstLand && !!firstLand.landId;
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
          // this.searchData(formData);
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
          // this.searchData(formData);
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
          // this.searchData(formData);
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
