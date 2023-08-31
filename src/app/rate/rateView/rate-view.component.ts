import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../../shared/fields.service';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, pluck, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LookupsService } from '../../shared/lookups.service';

@Component({
  // selector: 'app-land-profile',
  templateUrl: './rate-view.component.html',
  styleUrls: ['./rate-view.component.css']
})
export class RateViewComponent implements OnInit {
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
  projectNameOptions: Observable<any>;
  apartmentsNameOptions: any;
  projectNameOptionsLoading = false;
  apartmentNameOptionsLoading = false;
  searchProjectNameInput$ = new Subject<string>();
  searchApartmentNameInput$ = new Subject<string>();
  kpiObj: any;
  roles$: object;
  userRole: any;


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
        console.log(this.userRole);
        if (!Object.keys(this.userRole).includes("Admin") && !Object.keys(this.userRole).includes("Tathmeen")) {
          this.router.navigate(['/']);
        } else {
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
          this.loadProjectNameOptions();
          this.loadApartmentNameOptions();
          this.getKpiFun();

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
  getKpiFun() {
    // let fd = new FormData();
    // fd.append('land', JSON.stringify(formData));
    this.http.get(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/unitsEvaluationKpi`)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.kpiObj = data;
          console.log("kpi api status success");
          console.log(this.kpiObj);
        } else {
          console.log("kpi api status fail");
        }
      }, (error) => {
        console.log("error api kpi")
      })
  }
  loadProjectNameOptions() {
    this.projectNameOptions = concat(
      of([]), // default items
      this.searchProjectNameInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.projectNameOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadProjects({ term, developerId: this.searchData.searchDeveloperId }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.projectNameOptionsLoading = false)
          )
        })
      )
    );
  }
  loadApartmentNameOptions() {
    // this.apartmentsNameOptions = concat(
    //   of([]), // default items
    //   this.searchApartmentNameInput$.pipe(
    //     distinctUntilChanged(),
    //     tap(() => this.apartmentNameOptionsLoading = true),
    //     switchMap(term => {
    //       return this.lookupsService.loadApartments({ term, developerId: this.searchData.searchDeveloperId }).pipe(
    //         catchError(() => of([])), // empty list on error
    //         tap(() => this.projectNameOptionsLoading = false)
    //       )
    //     })
    //   )
    // );
    this.lookupsService.loadApartments()
      .subscribe((data) => {
        this.apartmentsNameOptions = data;
      })
  }

  loadSectorsOptions() {
    this.lookupsService.loadSectorsOptions()
      .subscribe((data) => {
        this.sectorsOptions = data;
      })
  }
  addNewFun() {
    this.router.navigate(['rate/new']);
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

  searchResourceData(data: any, searchApartmentId: any) {
    console.log(" searchResourceData fun ...");
    console.log(searchApartmentId.model)
    console.log(data);
    if (data.searchProjectId) {
      this.router.navigate(['rate/profile/' + data.searchProjectId + "/" + searchApartmentId.model + "/view"]);
    }
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
