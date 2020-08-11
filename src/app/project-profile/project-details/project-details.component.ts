import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FieldsService } from 'src/app/shared/fields.service';
import { pluck } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  formData: any;
  profile$: Observable<any>;
  developerOptions: any;
  landsoptions: any;
  projectsOptions: any;
  projectsTypesOptions: any;
  projectsRegistrationTypesOptions: any;
  minDate:any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private fieldsService: FieldsService
  ) { }

  ngOnInit(): void {
    this.minDate = new Date();
    this.loadDeveloperOptions();
    this.loadLandsoptions();
    this.loadProjectsOptions();
    this.loadProjectsTypesOptions();
    this.loadProjectsRegistrationTypesOptions();

    this.profile$ = this.route.data.pipe(pluck('profile'));
    this.profile$.subscribe((profile: any) => {
      if (profile && profile.id) {
        this.formData = profile as any;
      } else {
        this.formData = { };
      }
    });
  }

  updateData(formData: any) {
    let fd = new FormData();
    fd.append('project', JSON.stringify(formData));
    this.http.post(`https://wfe.ajm.re/AjmanLandProperty/index.php/projects/update/${formData.id}`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.toastr.success(data.message, 'Success');
        } else {
          this.toastr.error(JSON.stringify(data.message), 'Error')
        }
    }, (error) => {
      this.toastr.error('Something went Wrong', 'Error')
    })
  }

  loadDeveloperOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/developers`)
    .subscribe((data) => {
      this.developerOptions = data;
    })
  }

  loadProjectsOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/projects`)
    .subscribe((data) => {
      this.projectsOptions = data;
    })
  }

  loadLandsoptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/lands`)
    .subscribe((data) => {
      this.landsoptions = data;
    })
  }

  loadProjectsTypesOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/projectstypes`)
    .subscribe((data) => {
      this.projectsTypesOptions = data;
    })
  }

  loadProjectsRegistrationTypesOptions() {
    this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/lookups/projectsRegistrationTypes`)
    .subscribe((data) => {
      this.projectsRegistrationTypesOptions = data;
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
      fieldType: "image",
      required: false,
      fieldName: {
        "ar": "image",
        "en": "image"
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
    return this.formData.isMain == false || this.formData.isMain == "false";
  }

  calculateJointSoldArea() {
    // should automatically calculated = Meter Total Sold Area - Meter Net Sold Area
    this.formData.meterJointSoldArea = _.toInteger(this.formData.meterTotalSoldArea) - _.toInteger(this.formData.meterNetSoldArea)
  }
}