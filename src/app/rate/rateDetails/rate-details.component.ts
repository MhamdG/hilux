import { Component, OnInit } from '@angular/core';
import { Observable, concat, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from 'src/app/shared/fields.service';
import { pluck, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { LookupsService } from '../../shared/lookups.service';

@Component({
  // selector: 'app-project-details',
  templateUrl: './rate-details.component.html',
  styleUrls: ['./rate-details.component.css']
})
export class RateDetailsComponent implements OnInit {
  formData: any;
  searchData: any = {};
  formErrors: any = {};
  profile$: Observable<any>;
  developerOptions: Observable<any>;
  landsoptions: any;
  projectsOptions: Observable<any>;
  projectsTypesOptions: any;
  projectsRegistrationTypesOptions: any;
  minDate: any;
  developerDataOptionsLoading = false;
  developerSearchInput$ = new Subject<string>();
  projectsSearchInput$ = new Subject<string>();
  projectDataOptionsLoading = false;
  landDataOptionsLoading = false;
  landSearchInput$ = new Subject<string>();
  isMainOptions: any;
  projectUsageTypesOptions: any;
  contractorsOptions: any;
  consultantsOptions: any;
  accountTrusteesOptions: any;
  projectStatusOptions: any;
  developerNameOptions: Observable<any>;
  projectNameOptions: Observable<any>;
  searchDeveloperNameInput$ = new Subject<string>();
  searchProjectNameInput$ = new Subject<string>();
  developerNameOptionsLoading = false;
  projectNameOptionsLoading = false;
  listOfDate: any;
  kpiObj: any;
  pageData: any;
  apartmentsNameOptions: any;
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
          this.minDate = new Date();
          this.loadDeveloperOptions();
          this.loadLandsoptions();
          this.loadProjectsOptions();
          this.loadProjectsTypesOptions();
          this.loadProjectsRegistrationTypesOptions();
          this.loadProjectUsageTypesOptions();
          this.loadContractorsOptions();
          this.loadConsultantsOptions();
          this.loadAccountTrusteesOptions();
          this.loadProjectStatusOptions();
          this.loadDeveloperNameOptions();
          this.loadProjectNameOptions();
          this.loadApartmentNameOptions();
          this.listOfDate = [
            {
              date: "2023-05-12",
              apartmentType: "Studio",
              unitsValuationTableEmployee: "Admin",
              Rating: "200000",
              servicesFees: "3500",
              status: "Active",
              numRoom: 1
            },
            {
              date: "2023-04-12",
              apartmentType: "Room",
              unitsValuationTableEmployee: "Admin",
              Rating: "500000",
              servicesFees: "1500",
              status: "Deactive",
              numRoom: 1
            },
            {
              date: "2023-01-12",
              apartmentType: "One Bed Room",
              unitsValuationTableEmployee: "Admin",
              Rating: "6000000",
              servicesFees: "4000",
              status: "Active",
              numRoom: 1
            },
            {
              date: "2022-01-12",
              apartmentType: "2 bed room",
              unitsValuationTableEmployee: "Admin",
              Rating: "1000000",
              servicesFees: "9000",
              status: "Active",
              numRoom: 2
            },
          ]

          this.isMainOptions = [{
            key: 1,
            value: { en: 'Master Project', ar: 'مشروع رئيسي' }
          },
          {
            key: 0,
            value: { en: 'Sub Project', ar: 'مشروع فرعي' }
          }];
          let projectId = this.route.snapshot.paramMap.get('profileId');
          let apartmentId = this.route.snapshot.paramMap.get('profileId2');
          console.log(projectId + " " + apartmentId);
          this.getData(projectId, apartmentId);
          this.profile$ = this.route.data.pipe(pluck('profile'));
          this.profile$.subscribe(async (profile: any) => {
            if (profile && profile.id) {
              await this.prepareProjectValueOptions(profile);
              await this.prepareDeveloperValueOptions(profile);
              await this.prepareLandValueOptions(profile);
              this.formData = profile as any;
            } else {
              this.formData = {};
            }
          });
        }
      });
  }
  getData(projectId: any, apartmentId: any) {
    console.log("getData fun " + projectId + " " + apartmentId);
    let fd = new FormData();
    let obj = {};
    if (apartmentId != "undefined") {
      obj = {
        projectId: projectId,
        unitTypeId: apartmentId
      }
    } else {
      obj = {
        projectId: projectId
      }
    }
    fd.append('data', JSON.stringify(obj));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Tathmeen/searchUnitsEvalutions`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          console.log(data.data);
          this.pageData = data.data;
          console.log(" api status success");
          console.log(this.pageData);
        } else {
          console.log(" api status fail");
        }
      }, (error) => {
        console.log("error api ")
      })
  }
  loadApartmentNameOptions() {
    this.lookupsService.loadApartments()
      .subscribe((data) => {
        this.apartmentsNameOptions = data;
      })
  }

  updateData(formData: any) {
    let fd = new FormData();
    fd.append('project', JSON.stringify(formData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/projects/update/${formData.id}`, fd)
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
    this.landsoptions = concat(
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

  loadProjectsTypesOptions() {
    this.lookupsService.loadProjectsTypesOptions()
      .subscribe((data) => {
        this.projectsTypesOptions = data;
      })
  }

  loadProjectStatusOptions() {
    this.lookupsService.loadProjectStatusOptions()
      .subscribe((data) => {
        this.projectStatusOptions = data;
      })
  }

  loadProjectsRegistrationTypesOptions() {
    this.lookupsService.loadProjectsRegistrationTypesOptions()
      .subscribe((data) => {
        this.projectsRegistrationTypesOptions = data;
      })
  }

  loadProjectUsageTypesOptions() {
    this.lookupsService.loadProjectUsageTypesOptions()
      .subscribe((data) => {
        this.projectUsageTypesOptions = data;
      })
  }

  loadContractorsOptions() {
    this.lookupsService.loadContractorsOptions()
      .subscribe((data) => {
        this.contractorsOptions = data;
      })
  }

  loadConsultantsOptions() {
    this.lookupsService.loadConsultantsOptions()
      .subscribe((data) => {
        this.consultantsOptions = data;
      })
  }

  loadAccountTrusteesOptions() {
    this.lookupsService.loadAccountTrusteesOptions()
      .subscribe((data) => {
        this.accountTrusteesOptions = data;
      })
  }

  getAttachments() {
    return this.formData.profileImage ? [this.formData.profileImage] : [];
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
      fieldType: "fileupload",
      required: false,
      fieldName: {
        "ar": "image",
        "en": "image"
      },
      auxInfo: {
        multiple: false
      }
    }
  }

  isOneOrOtherNameRequired(fieldName: string) {
    if (this.formData.isDead) {
      if (fieldName == 'nameAr') {
        return !this.formData.nameAr && !this.formData.nameEn
      } else {
        return !this.formData.nameEn && !this.formData.nameAr
      }
    } else {
      return true;
    }
  }

  isRequired() {
    return !this.formData.isDead;
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  isNotMain() {
    return ((this.formData.isMain == '0') || (this.formData.isMain == 0));
  }

  calculateJointSoldArea() {
    // should automatically calculated = Meter Total Sold Area - Meter Net Sold Area
    const meterTotalSoldArea = this.formData.meterTotalArea || null;
    const meterNetSoldArea = this.formData.meterNetArea || null
    this.formData.meterJointArea = _.toNumber(meterTotalSoldArea) - _.toNumber(meterNetSoldArea)
  }

  prepareProjectValueOptions(profile: any) {
    if (!!profile.mainProjectId) {
      this.lookupsService.loadProjects({ id: profile.mainProjectId })
        .subscribe((option) => {
          this.projectsSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareDeveloperValueOptions(profile: any) {
    if (!!profile.developerId) {
      this.lookupsService.loadDevelopers({ id: profile.developerId })
        .subscribe((option) => {
          this.developerSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  prepareLandValueOptions(profile: any) {
    if (!!profile.landId) {
      this.lookupsService.loadLands({ id: profile.landId })
        .subscribe((option) => {
          this.landSearchInput$.next(option.value && option.value.ar);
        })
    }
  }

  setProjectCompletionPercentage() {
    if (this.isProjectCompleted()) {
      this.formData.projectCompletionpercentage = '100';
    }
  }

  isProjectCompleted() {
    return this.formData.projectStatusId && (this.formData.projectStatusId.includes('9') || this.formData.projectStatusId.includes(9));
  }


  searchResourceData(data: any, searchApartmentId: any) {
    console.log(" searchResourceData fun ...");
    console.log(searchApartmentId.model)
    console.log(data);
    if (data.searchProjectId) {
      this.router.navigate(['rate/profile/' + data.searchProjectId + "/" + searchApartmentId.model + "/view"]);
      this.getData(data.searchProjectId, searchApartmentId.model);
      this.searchData.searchProjectId = null;
    }
  }

  loadDeveloperNameOptions() {
    this.developerNameOptions = concat(
      of([]), // default items
      this.searchDeveloperNameInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.developerNameOptionsLoading = true),
        switchMap(term => {
          return this.lookupsService.loadDevelopers({ term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.developerNameOptionsLoading = false)
          )
        })
      )
    );
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

  resetSearchProject() {
    this.searchData.searchProjectId = null;
  }

}
