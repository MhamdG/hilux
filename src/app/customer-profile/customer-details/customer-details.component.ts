import { Component, OnInit } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../../shared/fields.service';
import { catchError, distinctUntilChanged, pluck, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as _ from 'lodash';
import { LookupsService } from '../../shared/lookups.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent implements OnInit {
  formData: any;
  searchData: any = {};
  profile$: Observable<any>;
  contactPerferencesOptions: any;
  timeToContactOptions: any;
  nationalitiesOptions: any;
  customerCategoryOptions: any;
  customerTypesOptions: any;
  emiratesOptions: any;
  otherIdTypesOptions: any;
  disabilityTypesOptions: any;
  booleanOptions: any;
  genderOptions: any;
  minDate:any;
  formErrors:any = {};
  searchby: any;
  searchOwnerNameInput$ = new Subject<string>();
  searchOwnerUniqueIdInput$ = new Subject<string>();
  ownerUniqueIdOptions: Observable<any>;
  ownerNameOptions: Observable<any>;
  ownerNameOptionsLoading = false;
  ownerUniqueIdOptionsLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private fieldsService: FieldsService,
    private lookupsService: LookupsService
  ) { }

  ngOnInit(): void {
    this.minDate = new Date();
    this.loadContactPerferencesOptions();
    this.loadTimeToContactOptions();
    this.loadNationalitiesOptions();
    this.loadCustomerCategoryOptions();
    this.loadCustomerTypesOptions();
    this.loadEmiratesOptions();
    this.loadOtherIdTypesOptions();
    this.loadDisablilityTypesOptions();
    this.loadOwnerNameOptions();
    this.loadOwnerUniqueIdOptions();

    this.booleanOptions = [{
      key: 1,
      value: { en: 'Yes', ar: 'نعم' }
    },
    {
      key: 0,
      value: { en: 'No', ar: 'لا' }
    }]

    this.genderOptions = [{
      key: 'M',
      value: { en: 'Male', ar: 'ذكر' }
    },
    {
      key: 'F',
      value: { en: 'Female', ar: 'أنثى' }
    }]

    this.profile$ = this.route.data.pipe(pluck('profile'));
    this.profile$.subscribe((profile: any) => {
      if (profile && profile.id) {
        this.formData = this.prepareProfile(profile) as any;
      } else {
        this.formData = { hasTrx: 0 };
      }
    });
  }
  prepareEstablishmentContractFileField() {
    return {
      fieldID: "profileImage",
      fieldType: "fileupload",
      required: true,
      fieldName: {
        "ar": "profileImage",
        "en": "profileImage"
      },
      auxInfo: {
        multiple: true
      }
    }
  }
  clearChanges(){
    window.location.reload();
  }
  updateData(formData: any) {
    let fd = new FormData();
    fd.append('customer', JSON.stringify(formData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/customers/update/${formData.id}`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.formData = this.prepareProfile(data.data);
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

  loadContactPerferencesOptions() {
    this.lookupsService.loadContactPerferencesOptions()
    .subscribe((data) => {
      this.contactPerferencesOptions = data;
    })
  }

  loadTimeToContactOptions() {
    this.lookupsService.loadTimeToContactOptions()
    .subscribe((data) => {
      this.timeToContactOptions = data;
    })
  }

  loadNationalitiesOptions() {
    this.lookupsService.loadNationalitiesOptions()
    .subscribe((data) => {
      this.nationalitiesOptions = data;
    })
  }

  loadCustomerCategoryOptions() {
    this.lookupsService.loadCustomerCategoryOptions()
    .subscribe((data) => {
      this.customerCategoryOptions = data;
    })
  }

  loadCustomerTypesOptions() {
    this.lookupsService.loadCustomerTypesOptions()
    .subscribe((data) => {
      this.customerTypesOptions = data;
    })
  }

  loadEmiratesOptions() {
    this.lookupsService.loadEmiratesOptions()
    .subscribe((data) => {
      this.emiratesOptions = data;
    })
  }
  

  loadOtherIdTypesOptions() {
    this.lookupsService.loadOtherIdTypesOptions()
    .subscribe((data) => {
      this.otherIdTypesOptions = data;
    })
  }

  loadDisablilityTypesOptions() {
    this.lookupsService.loadDisablilityTypesOptions()
    .subscribe((data) => {
      this.disabilityTypesOptions = data;
    })
  }
  getAttachments() {
    return this.formData.profileImage ? [this.formData.profileImage] : [];
  }

  isCustomerDisabled() {
    return (this.formData.customerCategoryId == '1' || this.formData.customerCategoryId == 1);
  }

  isValid() {
    return (this.formData.isDead ? true : (!!this.formData.emiratesId || !!this.formData.passportNumber || !!this.formData.otherId))
  }

  getSignatureAttachments() {
    return this.formData.signature ? [this.formData.signature] : [];
  }

  hasTaxNumber() {
    return (this.formData.hasTrx == 1 || this.formData.hasTrx == '1');
  }

  isRequired() {
    return !this.formData.isDead;
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

  prepareProfile(profile) {
    profile.hasTrx = _.toInteger(profile.hasTrx);
    return profile
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
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
      case 'uniqueId':
        this.searchOwnerUniqueIdInput$.next(null);
        break;
      case 'term':
        this.searchOwnerNameInput$.next(null);
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
    let value = !!data.term ? data.term : data.uniqueId;
    this.router.navigate(['customer/profile/', value, 'edit'])
    .then(() => {
      window.location.reload();
    });
    this.searchData.term =null;
  }

  loadOwnerNameOptions() {
    this.ownerNameOptions = concat(
      of([]), // default items
      this.searchOwnerNameInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.ownerNameOptionsLoading = true),
          switchMap(term => {
            return this.lookupsService.loadOwners({ term }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.ownerNameOptionsLoading = false)
          )})
      )
    );
  }

  loadOwnerUniqueIdOptions() {
    this.ownerUniqueIdOptions = concat(
      of([]), // default items
      this.searchOwnerUniqueIdInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.ownerUniqueIdOptionsLoading = true),
          switchMap(uniqueId => {
            return this.lookupsService.loadOwners({ uniqueId }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.ownerUniqueIdOptionsLoading = false)
          )})
      )
    );
  }

  isSearchFormValid() {
    return !this.searchData.term 
  }


}
