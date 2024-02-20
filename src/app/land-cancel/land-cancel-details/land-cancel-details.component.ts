import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../../shared/fields.service';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, pluck, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LookupsService } from '../../shared/lookups.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-land-details',
  templateUrl: './land-cancel-details.component.html',
  styleUrls: ['./land-cancel-details.component.css']
})
export class LandCancelDetailsComponent implements OnInit {
  formData: any = { buildingDetails: {}, buildingFinishes: {} };
  searchData: any = {};
  formErrors: any = {};
  profile$: Observable<any>;
  sectorsOptions: any;
  sectionsOptions: any;
  streetsNamesOptions: any;
  streetsTypesOptions: any;
  mainUsageTypesOptions: any;
  subUsageTypesOptions: any;
  citiesOptions: any;
  dataOptionsLoading = false;
  propertyTypesOptions: any;
  searchInput$ = new Subject<string>();
  searchby: any;
  searchLandNameInput$ = new Subject<string>();
  landNameOptions: Observable<any>;
  landNameOptionsLoading = false;
  searchOldLandOptions: Observable<any>;
  searchOldLandIdInput$ = new Subject<string>();
  searchOldLandOptionsLoading = false;
  distructsTypesOptions: any;
  flagwithdrawData :any;
  sectiorVal :any;
  sectionVal :any;
  response:any;
  roles$: object;
  userRole: any;
  addBlockData: any = {};
  hideAttachmentsControl;
  currentlyOwnedPropertiesByOwner: any = [];
  flagUpload: any;





  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private fieldsService: FieldsService,
    private lookupsService: LookupsService,
    private ngxSmartModalService: NgxSmartModalService
  ) { }

  ngOnInit(): void {
    this.loadSectorsOptions();
    this.loadSectionsOptions();
    this.loadStreetNamesOptions();
    this.loadStreetTypesOptions();
    this.loadMainUsageTypesOptions();
    this.loadSubUsageTypesOptions();
    this.loadCitiesOptions();
    this.loadPropertyTypesOptions();
    this.loadLandNameOptions();
    this.loadSearchOldLandIdOptions();
    this.loadDistructsTypesOptions();
    this.flagwithdrawData =true;
    this.flagUpload = true;
    this.roles$ = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/getUserRights`)
    .subscribe((res) => {
      this.userRole = res;
    });


    this.profile$ = this.route.data.pipe(pluck('profile'));
    this.profile$.subscribe((profile: any) => {
      if (profile && profile.id) {
        this.formData = profile as any;
        this.searchDataFun(this.formData);
        if (!this.formData.buildingDetails) {
          this.formData.buildingDetails = {}
        }
        if (!this.formData.buildingFinishes) {
          this.formData.buildingFinishes = {}
        }
      } else {
        this.formData = { buildingDetails: {}, buildingFinishes: {} };
      }
    });
  }
  withdrawData() {
    this.flagwithdrawData =false;
    this.http.get(`${environment.apiHost}/AjmanLandProperty/index.php/lands/getLandDataFromAM/${this.formData.id}`)
    .subscribe((data: any) => {
        this.formData = data;
        this.toastr.success("", 'Success');
        this.flagwithdrawData =true;
        this.router.navigate(['land/profile/', this.formData.id, 'view'])
        .then(() => {
          window.location.reload();
        });
    }, (error) => {
      this.flagwithdrawData = true;
      this.toastr.error('Something went Wrong', 'Error');
      // this.router.navigate(['error']);
    });
  }
  loadDistructsTypesOptions() {
    this.lookupsService.loadSectionsOptions()
      .subscribe((data) => {
        this.distructsTypesOptions = data;
        for (let index = 0; index < data.length; index++) {
          if (data[index].key == this.formData.sectionId) {
            this.sectionVal = data[index].value.ar; 
          }
        }
      })
  }
  getCurrentOwnedLands(deeds: any) {
    console.log(".............");
    console.log(deeds);
    return this.filterLandsWithStatus(deeds, '1');
  }
 
  getRole(data: any, permission: string) {
    return Object.keys(data).includes(permission,);
  }
  getViewEngineeringBlocks(propertyId: any, resourceType: any = 'propertyId') {
    return `/engineering_blocks?${resourceType}=${propertyId}`;
  }
  getViewResourceUrl(resourceId: any, resourceType: any) {
    if (resourceType == "owner") {
      return `/${resourceType}/profile/${resourceId}/edit`;
    } else {
      return `/${resourceType}/profile/${resourceId}/view`;
    }
  }
  getViewLegalBlocks(propertyId: any, resourceType: any = 'propertyId') {
    return `/legal_blocks?${resourceType}=${propertyId}`;
  }
  getOwnerHeader(item: any) {
    return `نوع الملكية: ${this.getFieldNameorId(item.childDeed, 'ownershipType')}, Created At: ${item.deed?.createdAt}, طريقة انتقال الملكية: ${item.childDeed?.transferServiceNameAr}`
  }
  getFieldNameorId(item: any, field_name: any) {
    return item && (item[`${field_name}NameAr`] || item[`${field_name}Id`])
  }
  searchDataFun(formData :any) {
    console.log(formData);
    let obj = {
      'type':1,
      'landId':formData.id,
      'value':formData.id
    }
    let prepapedData = obj;
    let fd = new FormData();
    fd.append('data', JSON.stringify(prepapedData));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/properties/search`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          if (data.data.deeds.length > 0) {
            for (let index = 0; index < data.data.deeds.length; index++) {
             if (data.data.deeds[index].deed.status == 1) {
              this.response = data.data.deeds[index];
            break; 
            } 
            }
          }else{
            this.response = data.data.deeds[0];
          }
         
          console.log(" searchDataFun ... res");
          console.log(this.response);
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });
  }
  prepareEstablishmentContractFileField() {
    return {
      fieldID: "attachments",
      fieldType: "fileupload",
      required: this.flagUpload,
      fieldName: {
        "ar": "attachments",
        "en": "attachments"
      },
      auxInfo: {
        multiple: true
      }
    }
  }

  updateData(formData: any) {
    let fd = new FormData();
    fd.append('land', JSON.stringify(formData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/lands/update/${formData.id}`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.toastr.success(data.message, 'Success');
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error')
        this.router.navigate(['error'])
      })
  }
  editFun() {
    this.router.navigate(['land/profile/', this.formData.id, 'edit']);

  }

  loadSectorsOptions() {
    this.lookupsService.loadSectorsOptions()
      .subscribe((data) => {
        this.sectorsOptions = data;
        for (let index = 0; index < data.length; index++) {
          if (data[index].key == this.formData.sectorId) {
            this.sectiorVal = data[index].value.ar; 
          }
        }
      })
  }
  toggleControl(value?: boolean) {
    this.hideAttachmentsControl = (!!value ? value : !this.hideAttachmentsControl)
    return this.hideAttachmentsControl;
  }

  loadSectionsOptions() {
    this.lookupsService.loadSectionsOptions()
      .subscribe((data) => {
        this.sectionsOptions = data;
      })
  }
  getCurrentlyOwnedPropertiesFor(ownerId: any) {
    let fd = new FormData();
    fd.append('data', JSON.stringify({ "ownerId": ownerId }));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/properties/ownerActiveProperties`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.currentlyOwnedPropertiesByOwner = data.data;
        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error')
        this.router.navigate(['error'])
      })
  }

  loadStreetNamesOptions() {
    this.lookupsService.loadStreetNamesOptions()
      .subscribe((data) => {
        this.streetsNamesOptions = data;
      })
  }

  loadStreetTypesOptions() {
    this.lookupsService.loadStreetTypesOptions()
      .subscribe((data) => {
        this.streetsTypesOptions = data;
      })
  }

  loadMainUsageTypesOptions() {
    this.lookupsService.loadMainUsageTypesOptions()
      .subscribe((data) => {
        this.mainUsageTypesOptions = data;
      })
  }

  loadSubUsageTypesOptions() {
    this.lookupsService.loadSubUsageTypesOptions()
      .subscribe((data) => {
        this.subUsageTypesOptions = data;
      })
  }

  loadCitiesOptions() {
    this.lookupsService.loadCitiesOptions()
      .subscribe((data) => {
        this.citiesOptions = data;
      })
  }

  loadPropertyTypesOptions() {
    this.lookupsService.loadPropertyTypesOptions()
      .subscribe((data) => {
        this.propertyTypesOptions = data;
      })
  }

  isShoporShoppingMall() {
    return (this.formData.typeId == '12' || this.formData.typeId == 12) && this.isCompleted()
  }

  isNotVacantLand() {
    return (!['1', '2'].includes(this.formData.typeId))
  }

  isWarehouse() {
    return (this.formData.typeId == '16' || this.formData.typeId == 16) && this.isCompleted()
  }

  isLabourerHousing() {
    return (this.formData.typeId == '7' || this.formData.typeId == 7) && this.isCompleted()
  }

  isLeased() {
    return !!this.formData.buildingDetails && this.formData.buildingDetails.propertyLeased;
  }

  isCompleted() {
    return this.formData.buildingDetails && (this.formData.buildingDetails.completionRate == 100 || this.formData.buildingDetails.completionRate == '100')
  }

  prepareSectorImage() {
    return {
      fieldID: "sectorImageUrl",
      fieldType: "fileupload",
      required: false,
      fieldName: {
        "ar": "Sector Image",
        "en": "Sector Image"
      },
      auxInfo: {
        multiple: false
      }
    }
  }

  prepareDistrictImage() {
    return {
      fieldID: "districtImageUrl",
      fieldType: "fileupload",
      required: false,
      fieldName: {
        "ar": "District Image",
        "en": "District Image"
      },
      auxInfo: {
        multiple: false
      }
    }
  }

  prepareParcelImage() {
    return {
      fieldID: "parcelImageUrl",
      fieldType: "fileupload",
      required: false,
      fieldName: {
        "ar": "Parcel Image",
        "en": "Parcel Image"
      },
      auxInfo: {
        multiple: false
      }
    }
  }

  getImageAttachments(data: any, filed_name: any) {
    return data[filed_name] ? [data[filed_name]] : [];
  }

  setSearchType(field_name: any, event: any) {
    var val = event.target.value.trim();
    this.setSearchByandTypeValues(val, field_name)
  }

  setSearchByandTypeValues(val: any, field_name: any) {
    if (val != '') {
      this.searchby = field_name;
    } else {
      this.searchby = null;
      this.resetSearch(field_name);
    }
  }

  resetSearch(field_name: any) {
    switch (field_name) {
      case 'searchOldLandId':
        this.searchOldLandIdInput$.next(null);
        break;
      case 'term':
        this.searchLandNameInput$.next(null);
        break;
    }
  }

  isSearchBy(name: any) {
    return this.searchby == name;
  }

  checkTypeAndValues(field_name: string) {
    let val = this.searchData[field_name] && this.searchData[field_name].trim();
    val = (val == undefined ? '' : val);
    if (!this.isSearchBy(field_name) && (val == '')) {
      this.setSearchByandTypeValues(val, field_name);
    } else if (this.isSearchBy(field_name)) {
      if (this.isEmpty(field_name)) {
        this.setSearchByandTypeValues(val, null);
      }
    }
  }

  isEmpty(field_name: any) {
    return (this.searchData[field_name] == undefined)
  }

  searchResourceData(data: any) {
    let value = !!data.term ? data.term : data.searchOldLandId;
    this.router.navigate(['landCancel/profile/', value, 'view']).then(() => {
      window.location.reload();
    });
  }
  getOwnerClass(item: any) {
    return (item.deed.status == '1') ? 'bg-seagreen' : 'bg-light-red'
  }
  getType(param_name: string) {
    return this.getSearchByandTypeValues(param_name);
  }
  getSearchByandTypeValues(field_name: any) {
    let type = '3'
    if (['developerId', 'projectId', 'unitId'].includes(field_name)) {
      type = '2'
    } else if (['landId', 'oldLandId'].includes(field_name)) {
      type = '1'
    } else {
      type = '3'
    }
    return type;
  }
  getSearchLink(resourceId: any, name: any) {
    let type = this.getType(name);
    return `/search?type=${type}&${name}=${resourceId}`
  }

  async openAddBlockToOwnerPropertiesModal(ownerId: string) {
    this.addBlockData.ownerId = ownerId;
    this.toggleControl(false);
    await this.getCurrentlyOwnedPropertiesFor(ownerId);
    this.ngxSmartModalService.getModal('addBlockToOwnerPropertiesModal').open();
  }
  getPreviouslyOwnedLands(deeds: any) {
    return this.filterLandsWithStatus(deeds, '0');
  }
  filterLandsWithStatus(deeds: any, status: any) {
    return deeds && deeds.filter(d => d.land && d.deed?.status == status);
  }

  loadLandNameOptions() {
    this.landNameOptions = concat(
      of([]), // default items
      this.searchLandNameInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.landNameOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadLands({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.landNameOptionsLoading = false)
          )
        })
      )
    );
  }

  loadSearchOldLandIdOptions() {
    this.searchOldLandOptions = concat(
      of([]), // default items
      this.searchOldLandIdInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.searchOldLandOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadOldLands({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.searchOldLandOptionsLoading = false)
          )
        })
      )
    );
  }

  isSearchFormValid() {
    return !this.searchData.term && !this.searchData.searchOldLandId
  }

}
