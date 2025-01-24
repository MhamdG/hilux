import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../../shared/fields.service';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, pluck, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LookupsService } from '../../shared/lookups.service';


@Component({
  // selector: 'app-land-profile',
  templateUrl: './rateLand-view.component.html',
  styleUrls: ['./rateLand-view.component.css']
})
export class RateLandViewComponent implements OnInit {
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
  landInfo: any;
  activeTathmeen: any;
  previousTathmeens: any;
  valuationTranasctions: any;
  transferTransactions: any;
  resData: any;
  isSectionExpanded = false;
  isPopupOpenAddNew = false;
  isPopupOpenAddNewByExcel = false;
  isPopupOpenMyPrevRaiting = false;
  resMsg: any;
  resUrl: any;
  file: any;
  fileInput: any;
  visibleItems = 6;
  MyPrevRaitingData: any;



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
        if (!Object.keys(this.userRole).includes("Admin") && !Object.keys(this.userRole).includes("Tathmeen")) {
          this.router.navigate(['/']);
        } else {
          this.previousTathmeens = [];
          this.valuationTranasctions = [];
          this.transferTransactions = [];
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

  toggleItems() {
    this.visibleItems =
      this.visibleItems < this.kpiObj.tathmeenBySection.length
        ? this.kpiObj.tathmeenBySection.length
        : 6;
  }
  getData(formData: any) {
    this.landInfo = {};
    this.activeTathmeen = {};
    this.previousTathmeens = [];
    this.valuationTranasctions = [];
    this.transferTransactions = [];
    let fd = new FormData();
    let obj = {
      propertyId: formData.key
    }
    fd.append('data', JSON.stringify(obj));

    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/getTathmeenByLandId`, fd)
      .subscribe((data: any) => {
        console.log(data);
        if (data.status == 'success') {
          this.toastr.success(data.message, 'Success');
          this.resData = data.data;
          if (data.data && data.data.landInfo) {
            this.landInfo = data.data.landInfo;
          }
          if (data.data && data.data.activeTathmeen) {
            this.activeTathmeen = data.data.activeTathmeen;
          }
          if (data.data && data.data.previousTathmeens) {
            this.previousTathmeens = data.data.previousTathmeens;
          }
          if (data.data && data.data.valuationTranasctions) {
            this.valuationTranasctions = data.data.valuationTranasctions;
          }
          if (data.data && data.data.transferTransactions) {
            this.transferTransactions = data.data.transferTransactions;
          }

        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error')
        this.router.navigate(['error'])
      })
  }
  unitPricingFun() {
    this.router.navigate(['pricingUnit']);
  }
  toggleSection() {
    this.isSectionExpanded = !this.isSectionExpanded;
  }
  getKpiFun() {
    // let fd = new FormData();
    // fd.append('land', JSON.stringify(formData));
    this.http.get(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/getStatistics`)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.kpiObj = data.data;
        } else {
        }
      }, (error) => {
      })
  }
  getMyPrevraitingFun() {
    let fd = new FormData();
    let obj = { data: { count: "10" } }

    fd.append('data', JSON.stringify(obj));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/getMyTathmeenHistory`, fd)
      .subscribe((data: any) => {
        console.log(data);
        this.MyPrevRaitingData =data.data;

      }, (error) => {
      })


  }
  allowNumberOnly(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow numbers (0–9), Backspace, Delete, Arrow keys, and Tab
    if (
      (charCode >= 48 && charCode <= 57) || // Numbers (0–9)
      charCode === 8 || // Backspace
      charCode === 46 || // Delete
      charCode === 37 || // Left Arrow
      charCode === 39 || // Right Arrow
      charCode === 9 // Tab
    ) {
      return; // Allow input
    }

    // Prevent all other inputs
    event.preventDefault();
  }

  allowPasteNumberOnly(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text');

    // Allow paste if the content is numeric
    if (pastedData && !/^\d+$/.test(pastedData)) {
      event.preventDefault();
    }
  }

  loadProjectNameOptions() {
    this.projectNameOptions = concat(
      of([]), // default items
      this.searchProjectNameInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.projectNameOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadAllProjects({ term, developerId: this.searchData.searchDeveloperId }).pipe(
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
    // this.router.navigate(['addRateLand']);
    this.isPopupOpenAddNew = true;
  }
  addRatelandExcel() {
    // this.router.navigate(['AddRateLandExcel']);
    this.isPopupOpenAddNewByExcel = true;
  }
  MyprrevRaiting() {
    this.isPopupOpenMyPrevRaiting = true;
    this.getMyPrevraitingFun();
  }
  closePopup() {
    this.isPopupOpenAddNew = false;
    this.isPopupOpenAddNewByExcel = false;
    this.isPopupOpenMyPrevRaiting =false;
    this.resMsg = null;
    this.resUrl = null;
    this.getKpiFun();
  }
  downloadTempleteFun() {
    this.http.get(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/getExcelFile`)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          if (data.data.file) {
            window.open(data.data.file, "_blank");
          }
        } else {
        }
      }, (error) => {
      })
  }
  handleFileInput(event: Event, fileInput: HTMLInputElement): void {
    this.resMsg = null;
    this.resUrl = null;
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.fileInput = fileInput;
      // this.uploadFile(file,fileInput);
    } else {
      console.error('No file selected!');
    }
  }
  //  uploadFile(file: File,fileInput: HTMLInputElement): void {
  uploadFile(): void {
    if (this.file && this.fileInput) {
      const formData = new FormData();
      formData.append('excelFile', this.file);

      const headers = new HttpHeaders({
        Cookie: 'your_cookie_value_here' // Replace with actual cookie if needed
      });

      // const uploadUrl = '${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/AddTathmeenByExcel';

      this.http.post<any>(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/AddTathmeenByExcel`, formData).subscribe({
        next: (response) => {
          if (response && response.status == "error") {
            this.resMsg = "حدث خطا يرجي تحميل الملف لمعرفة التفاصيل ";
            this.resUrl = response.message;
          } else if (response && response.status == "success") {
            this.resMsg = "تم تحميل الملف بنجاح ";
            this.fileInput.value = '';
          } else {
            this.resMsg = "حدث خطا ما من غضلك حاول لاحقا";
            this.fileInput.value = '';
          }
          console.log('File uploaded successfully:', response);
        },
        error: (err) => {
          console.error('File upload failed:', err);
        }
      });
    }
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
    // if (data.searchProjectId) {
    //   this.router.navigate(['rate/profile/' + data.searchProjectId + "/view"]);
    // }
  }
  saveData(formData: any) {
    if (formData.key && formData.rating) {
      let fd = new FormData();
      let obj = {
        propertyId: formData.key,
        amount: formData.rating
      }
      fd.append('data', JSON.stringify(obj));
      this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/tathmeenLands/addSingleTathmeen`, fd)
        .subscribe((data: any) => {
          if (data.status == 'success') {
            this.toastr.success(data.message, 'Success');
            this.searchData.term = null;
            this.searchData.rating = null;



          } else {
            this.formErrors = data.data;
            this.toastr.error(JSON.stringify(data.message), 'Error')
          }
        }, (error) => {
          this.toastr.error('Something went Wrong', 'Error')
          this.router.navigate(['error'])
        })
    }
    else return;
  }
  // saveData(formData: any) {
  //   if (formData.term && formData.rating ) {
  //     let fd = new FormData();
  //     let obj = {
  //       propertyId: formData.term,
  //       amount: formData.rating
  //     }
  //     fd.append('data', JSON.stringify(obj));
  //     this.http.post(`http://192.168.18.129/AjmanLandProperty/index.php/tathmeenLands/addSingleTathmeen`, fd)
  //       .subscribe((data: any) => {
  //         if (data.status == 'success') {
  //           this.toastr.success(data.message, 'Success');
  //           this.searchData.term = null;
  //           this.searchData.rating = null;
  //         } else {
  //           this.formErrors = data.data;
  //           this.toastr.error(JSON.stringify(data.message), 'Error')
  //         }
  //       }, (error) => {
  //         this.toastr.error('Something went Wrong', 'Error')
  //         this.router.navigate(['error'])
  //       })
  //   }
  //   else return;
  // }

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
