import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { Field } from '../fields';
import { FieldsService } from 'src/app/shared/fields.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-ajax-button',
  templateUrl: './ajax-button-url.component.html',
  styleUrls: ['./ajax-button-url.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AjaxButtonUrlComponent implements OnInit {

  ajaxData: any;

  @Input() field: Field;

  @Input() customClass: string;

  @Input() formData: any;

  @Input() index: any = 0;

  @Input() row: any;

  @Input() fullFormData: any;

  @Input() formErrors: any;

  @Input() defaultValues: any;
  isLoading:any;

  constructor(private service: FieldsService) { }

  ngOnInit(): void {
    this.getDefaultValue(this.field.fieldID);
    this.isLoading =false;
  }

  loadData() {
    console.log(this.field.auxInfo.sourceDetails);
    window.open(this.field.auxInfo.sourceDetails, '_blank');
    // this.isLoading =true;
    // this.service.getFieldData(this.field, this.fullFormData).subscribe((data) => {
    //   this.ajaxData = data;
    //   this.formData[this.field.fieldID] = data;
    //   this.isLoading =false;
    // })
  }

  getName(field_name) {
    return `${this.row}_${field_name}_${this.index}`
  }

  getText(field: any, key: string) {
    return this.service.getText(field, key);
  }

  getAjaxData() {
    return this.ajaxData;
  }

  showErrors(field_name: any) {
    return this.service.showErrors(field_name, this.formErrors);
  }

  getErrors(field_name: any) {
    return this.service.getErrors(field_name, this.formErrors);
  }

  getDefaultValue(field_name: any) {
    this.formData[this.field.fieldID] = this.service.getDefaultValue(field_name, this.defaultValues, this.index);
  }

  isRequired() {
    return this.service.isRequired(this.field.required, this.field.fieldID);
  }

  isActiveEditStep() {
    return this.service.isEditStep && (this.service.editStepField != this.field.fieldID);
  }

  isActiveRejectStep() {
    return this.service.isRejectStep && (this.service.rejectReasonField != this.field.fieldID);
  }
}
