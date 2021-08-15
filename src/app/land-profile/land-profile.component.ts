import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../shared/fields.service';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, pluck, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LookupsService } from '../shared/lookups.service';
import permissionList from '../permission';

@Component({
  selector: 'app-land-profile',
  templateUrl: './land-profile.component.html',
  styleUrls: ['./land-profile.component.css']
})
export class LandProfileComponent implements OnInit {
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
  userRole: any;
  roles$: object;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private fieldsService: FieldsService,
    private lookupsService: LookupsService
  ) { }

  ngOnInit(): void {
    this.roles$ = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/getUserRights`)
    .subscribe((res) => {
      this.userRole = res;
      var checkFlag = this.checkRole('land.new');
      if (!checkFlag) {
        alert('sorry you don not have permission to see this page');
        this.router.navigate(['/']);
      }
      else {
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
        
        this.profile$ = this.route.data.pipe(pluck('profile'));
        this.profile$.subscribe((profile: any) => {
          if (profile && profile.id) {
            this.formData = profile as any;
          } else {
            this.formData = { buildingDetails: {}, buildingFinishes: {} };
          }
        });
      }
    });
  }
  checkRole (permission: string) {
    var pList = permissionList[permission];
    if (!pList) return false;
    else{
      var objSize = 0;
      console.log(this.userRole);
      for (const [key, value] of Object.entries(this.userRole)) {
        console.log(`${key}: ${value}`);
        // if (this.userRole.hasOwnProperty(key)) {
          objSize++;
          if (pList.includes(value.toString().toLowerCase())) {
            return true;
          }
        //}
       // else return false;
        if ((objSize) == Object.keys(this.userRole).length) return false;
        
      } 
    }



    // var pList = permissionList[permission];
    // var d = Object.values(this.userRole)[0].toString().toLowerCase()
    // if (!pList) return false;
    // else if (pList.includes(d)) return true;
    // else return false;
  }

  saveData(formData: any) {
    let fd = new FormData();
    fd.append('land', JSON.stringify(formData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/lands/create`, fd)
      .subscribe((data: any) => {
       if (data.status == 'success') {
        this.toastr.success(data.message, 'Success');
        if (data.data.id)
          this.router.navigate(['company/profile', data.data.id, 'edit']);
      } else {
        this.formErrors = data.data;
        this.toastr.error(JSON.stringify(data.message), 'Error')
      }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
      this.router.navigate(['error'])
    })
  }

  loadSectorsOptions() {
    this.lookupsService.loadSectorsOptions()
    .subscribe((data) => {
      this.sectorsOptions = data;
    })
  }

  loadSectionsOptions() {
    this.lookupsService.loadSectionsOptions()
    .subscribe((data) => {
      this.sectionsOptions = data;
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
    this.router.navigate(['land/profile/', value, 'edit']);
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
          )})
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
          )})
      )
    );
  }

  isSearchFormValid() {
    return !this.searchData.term && !this.searchData.searchOldLandId
  }

}
