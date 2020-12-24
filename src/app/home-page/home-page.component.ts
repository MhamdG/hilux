import { Component, OnInit } from '@angular/core';
import { Subscription, concat, of, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FieldsService } from '../shared/fields.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})


export class HomePageComponent implements OnInit {
  dashboardItems$: Observable<any>;
  formData: any = {};
  formErrors: any = {};
  response: any;


  ownersOptions: Observable<any>;
  ownersSearchInput$ = new Subject<string>();
  ownersOptionsLoading = false;


  //Testing
  people$: Observable<any[]>;
  selectedPeople = [];

  users$: Observable<any[]>;
  selectedUsers = [];

  listOfServices$: Observable<any[]>;
  selectedlistOfServices = [];

  listOfServiceCategories$: Observable<any[]>;
  selectedListOfServiceCategories = [];

  listOfDepartments$: Observable<any[]>;
  selectedListOfDepartments = [];

  dateRange = "";
  dateFrom = "";
  dateTo = "";

  applicationSource = [
    { id: 'hilux', name: 'النظام الداخلي' },
    { id: 'mobile', name: 'موقع الخدمات الإلكترونية' },
    { id: 'web', name: 'تطبيقات الهواتف الذكية' }
  ];
  selectedApplicationSource = [];

  data = {
    userID: this.selectedUsers,
    departmentID: this.selectedListOfDepartments,
    serviceID: this.selectedlistOfServices,
    serviceCategoryID: this.selectedListOfServiceCategories,
    dateFrom: this.dateFrom,
    dateTo: this.dateTo,
    applicationSource: this.selectedApplicationSource
  };






  constructor(
    private fieldsService: FieldsService,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.people$ = this.fieldsService.getUrl(`https://jsonplaceholder.typicode.com/users`);
    this.listOfServices$ = this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/ServiceCategories/listOfServices`);
    this.users$ = this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/ServiceCategories/listOfHiluxUsers`);
    this.listOfServiceCategories$ = this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/ServiceCategories/listOfServiceCategories`);
    this.listOfDepartments$ = this.fieldsService.getUrl(`https://wfe.ajm.re/AjmanLandProperty/index.php/ServiceCategories/listOfDepartments`);
    this.getDashboard(this.data);

  }

  onSubmit() {
    this.setDateRange(this.dateRange);
    this.data.userID = this.selectedUsers;
    this.data.departmentID = this.selectedListOfDepartments;
    this.data.serviceID = this.selectedlistOfServices;
    this.data.serviceCategoryID = this.selectedListOfServiceCategories;
    this.data.dateFrom = this.dateFrom;
    this.data.dateTo = this.dateTo;
    this.data.applicationSource = this.selectedApplicationSource;
    this.getDashboard(this.data);
  }

  getDashboard(fiteredData: any) {
    console.log(fiteredData);

    let fd = new FormData();
    console.log('fs',fd);
    
    fd.append('data', JSON.stringify(fiteredData));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/Applications/dashboard`, fd)
      .subscribe((data: any) => {
        if (data.status == 'success') {
          this.response = data.data;
          console.log(data.data);

        } else {
          this.formErrors = data.data;
          this.toastr.error(JSON.stringify(data.message), 'Error');
        }
      }, (error) => {
        this.toastr.error('Something went Wrong', 'Error');
        this.router.navigate(['error']);
      });

  }

  setDateRange(name: any) {
    this.dateFrom = this.datePipe.transform(name[0], "yyyy-MM-dd hh:mm:ss")
    this.dateTo = this.datePipe.transform(name[1], "yyyy-MM-dd hh:mm:ss")
  }


}
