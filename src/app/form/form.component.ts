import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { PageResponse } from '../fields/page_response';
import { RowField } from '../fields/field_order';
import { FieldsService } from '../shared/fields.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { isArray } from 'util';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnChanges {
  formData: any = {};
  formErrors: any;

  @Input() response: PageResponse;

  constructor(
    private fieldsService: FieldsService,
    private changeDetector: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['response'] && changes['response'].currentValue) {
      this.formData = {};
      this.formErrors = null;
      this.rearrangeFieldOrder();
    }
  }

  ngOnInit(): void {
  }

  getClass(classname: string, field: RowField) {
    return classname + this.fieldsService.getFieldWidth(field.fieldWidth)
  }

  getFormDatafor(row: any, index?: any) {
    if (row.allowMultiple) {
      this.formData[row.row] ? this.formData[row.row] : (this.formData[row.row] = [{}])
    } else {
      this.formData[row.row] ? this.formData[row.row] : (this.formData[row.row] = {})
    }
    return this.formData[row.row];
  }

  addRow(row, index) {
    this.formData[row.row].push({});
  }

  getrowId(row: any) {
    return `${row.row}`;
  }

  deleteRow(row, index) {
    _.remove(this.formData[row.row], function(resource, i) {
        return index === i;
    });
    this.emitRowsChanged();
  }

  ngAfterViewInit () {
    this.changeDetector.detectChanges();
  }

  saveData(formData : any) {
    let form = new FormData();
    form.append('data', JSON.stringify(Object.assign({stepID: this.response.stepID, dataIn: this.prepareJson(formData)})));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/applications/completeStep`, form)
      .subscribe((data: any)=> {
        if (data.status == 'success') {
          this.toastr.success(data.message, 'Success')
          if (!!data.data.stepID) {
            this.router.navigate(['notifications', data.data.stepID]);
          } else {
            this.router.navigate(['my_tasks']);
          }
        } else {
          this.toastr.error(data.message, 'Error')
          this.formErrors = data.data;
        }
      })
    // this.authenticationService.signin();
  }
  backStepFun() {
    let form = new FormData();
    form.append('data', JSON.stringify(Object.assign({backStepID: this.response.backStepID})));
    this.http.post(`${environment.apiHost}/AjmanLandProperty/index.php/applications/backStep`, form)
      .subscribe((data: any)=> {
        if (data.status == 'success') {
          this.toastr.success(data.message, 'Success')
          if (!!data.data.stepID) {
            this.router.navigate(['notifications', data.data.stepID]);
          } else {
            this.router.navigate(['my_tasks']);
          }
        } else {
          this.toastr.error(data.message, 'Error')
          this.formErrors = data.data;
        }
      })
    // this.authenticationService.signin();
  }

  private prepareJson(formData: any) {
    let preparedData = {}
    const rows = Object.values(formData);
    for(let row of rows) {
      if (this.isEnumerator(row)) {
        const rowData = this.prepareArrayObject(row);
        preparedData = Object.assign({}, preparedData, rowData);
      } else {
        preparedData = Object.assign({}, preparedData, row);
      }
    }
    return preparedData
  }

  isEnumerator(data: any) { 
    return isArray(data);
  }

  private prepareArrayObject(row: any) {
    let nestedObj = {};
    const keys = _.uniq(_.flatMap(row, (o) => _.keys(o)));

    for(let key of keys) {
      nestedObj[key] = _.map(row, (o) => (o[key] || ''));
    }

    return nestedObj
  }

  backToMytask() {
    this.router.navigate(['my_tasks']);
  }

  rearrangeFieldOrder() {
    this.unshiftResource('editStepRow');
    this.unshiftResource('hiddenRow');
  }

  emitRowsChanged() {
    this.fieldsService.fieldValueChanged$.emit();
  }

  unshiftResource(rowkey: any) {
    let orders = this.response.stepDetails.dataIn.fieldOrder;
    const index = _.findIndex(orders, function(o) { return o.row == rowkey; });
    let deletedResource = undefined;
    if (index != -1) {
      _.remove(orders, function(resource, i) {
        if (index === i) {
          deletedResource = resource
        }
        return index === i;
      });

      orders.unshift(deletedResource);
    }

    this.response.stepDetails.dataIn.fieldOrder = orders;
  }
}
