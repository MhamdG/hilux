import { Component, OnInit } from '@angular/core';
import { Observable, concat, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from '../../shared/fields.service';
import { pluck, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { LookupsService } from '../../shared/lookups.service';
import permissionList from '../../permission';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.css']
})
export class CompanyEditComponent implements OnInit {
  formData: any = {};
  searchData: any = {};
  profile$: Observable<any>;
  emiratesOptions: any;
  licenseTypeOptions: any;
  licenseIssuerOptions: any;
  ownerOptions: Observable<any>;
  companyNameOptions: Observable<any>;
  companyLicenseNumberOptions: Observable<any>;
  companyTypeOptions: any;
  minDate:any;
  dataOptionsLoading = false;
  searchInput$ = new Subject<string>();
  formErrors: any = {};
  companyNameOptionsLoading = false;
  companyLicenseNumberOptionsLoading = false;
  searchCompanyNameInput$ = new Subject<string>();
  searchCompanyLicenseNumberInput$ = new Subject<string>();
  searchby: any;
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
      var checkFlag = this.checkRole('company.edit');
      if (!checkFlag) {
        alert('sorry you don not have permission to see this page');
        this.router.navigate(['/']);
      }
      else {
        this.minDate = new Date();
        this.loadEmiratesOptions();
        this.loadLicenseTypeOptions();
        this.loadOwnerOptions();
        this.loadCompanyTypeOptions();
        this.loadLicenseIssuerOptions();
        this.loadCompanyNameOptions();
        this.loadCompanyLicenseNumberOptions();
    
        this.profile$ = this.route.data.pipe(pluck('profile'));
        this.profile$.subscribe((profile: any) => {
          if (profile && profile.id) {
            this.formData = profile as any;
          } else {
            this.formData = { owners: [{}] };
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

  saveData(formData: any) {
    let fd = new FormData();
    fd.append('company', JSON.stringify(formData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/companies/create`, fd)
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

  loadEmiratesOptions() {
    this.lookupsService.loadEmiratesOptions()
    .subscribe((data) => {
      this.emiratesOptions = data;
    })
  }

  loadLicenseTypeOptions() {
    this.lookupsService.loadLicenseTypeOptions()
    .subscribe((data) => {
      this.licenseTypeOptions = data;
    })
  }

  loadLicenseIssuerOptions() {
    this.lookupsService.loadLicenseIssuerOptions()
    .subscribe((data) => {
      this.licenseIssuerOptions = data;
    })
  }

  loadOwnerOptions() {
    this.ownerOptions = concat(
      of([]), // default items
      this.searchInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.dataOptionsLoading = true),
          switchMap(term => {
            return this.lookupsService.loadOwners({ term }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.dataOptionsLoading = false)
          )})
      )
    );
  }

  loadCompanyTypeOptions() {
    this.lookupsService.loadCompanyTypeOptions()
    .subscribe((data) => {
      this.companyTypeOptions = data;
    })
  }

  isNotGovernmentInstitute () {
    return this.formData.companyType && !(["3", "4", "5"].includes(this.formData.companyType) || [3, 4, 5].includes(this.formData.companyType))
  }

  isNotGovernmentAndIndividualInstitute () {
    return this.formData.companyType && !(["2", "3", "4", "5"].includes(this.formData.companyType) || [2, 3, 4, 5].includes(this.formData.companyType))
  }

  isGovernmentOrg () {
    return this.formData.companyType && (["3"].includes(this.formData.companyType) || [3].includes(this.formData.companyType))
  }

  formatDate(name: any) {
    this.formData[name] = this.fieldsService.formatDate(this.formData, name);
  }

  getOwnersData() {
    return this.formData.owners ? this.formData.owners : (this.formData.owners = [{}]);
  }

  addRow() {
    this.formData.owners.push({});
  }

  deleteRow(index) {
    _.remove(this.formData.owners, function(resource, i) {
        return index === i;
    });
  }

  getName(row: string, index: string) {
    return this.fieldsService.getFieldName('owner', row, index);
  }

  prepareEstablishmentContractFileField() {
    return {
      fieldID: "establishmentContractFile",
      fieldType: "fileupload",
      required: true,
      fieldName: {
        "ar": "establishmentContractFile",
        "en": "establishmentContractFile"
      },
      auxInfo: {
        multiple: true
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
      case 'licenseNumber':
        this.searchCompanyLicenseNumberInput$.next(null);
        break;
      case 'term':
        this.searchCompanyNameInput$.next(null);
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
    let value = !!data.term ? data.term : data.licenseNumber;
    this.router.navigate(['company/profile/', value, 'edit']);
  }

  loadCompanyNameOptions() {
    this.companyNameOptions = concat(
      of([]), // default items
      this.searchCompanyNameInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.companyNameOptionsLoading = true),
          switchMap(term => {
            return this.lookupsService.loadCompanies({ term }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.companyNameOptionsLoading = false)
          )})
      )
    );
  }

  loadCompanyLicenseNumberOptions() {
    this.companyLicenseNumberOptions = concat(
      of([]), // default items
      this.searchCompanyLicenseNumberInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.companyLicenseNumberOptionsLoading = true),
          switchMap(licenseNumber => {
            return this.lookupsService.loadCompanies({ licenseNumber }).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.companyLicenseNumberOptionsLoading = false)
          )})
      )
    );
  }

  isSearchFormValid() {
    return !this.searchData.term && !this.searchData.licenseNumber
  }

}
